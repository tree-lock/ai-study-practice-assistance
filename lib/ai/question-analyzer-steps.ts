import { MINIMAX_MODEL, minimax } from "./minimax";
import { buildQuestionStepCatalogPrompt } from "./prompts/question-step-catalog";
import { buildQuestionStepCountPrompt } from "./prompts/question-step-count";
import { buildQuestionStepFormatPrompt } from "./prompts/question-step-format";
import { buildQuestionStepNoticePrompt } from "./prompts/question-step-notice";
import { buildQuestionStepSplitPrompt } from "./prompts/question-step-split";
import { buildQuestionStepTypePrompt } from "./prompts/question-step-type";
import type { QuestionType } from "./question-analyzer";
import {
  type CatalogRecommendation,
  type ExistingTopic,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from "./question-analyzer";

async function callMinimax(
  systemPrompt: string,
  userText: string,
): Promise<string> {
  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [{ type: "text" as const, text: userText }],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 未返回有效的文本响应");
  }

  return textBlock.text.trim();
}

function extractJson<T>(responseText: string): T {
  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  return JSON.parse(jsonStr) as T;
}

export async function analyzeStepNotice(
  questionRaw: string,
): Promise<{ notice?: string }> {
  const systemPrompt = buildQuestionStepNoticePrompt();
  const responseText = await callMinimax(
    systemPrompt,
    `请判断以下题目内容是否需要向用户发出警告：\n\n${questionRaw}`,
  );
  const raw = extractJson<{ notice?: string }>(responseText);
  return { notice: raw.notice };
}

export async function analyzeStepCount(
  rawContent: string,
  notice?: string,
): Promise<{ count: number }> {
  const systemPrompt = buildQuestionStepCountPrompt();
  const context = notice ? `[前一步警告：${notice}]\n\n` : "";
  const responseText = await callMinimax(
    systemPrompt,
    `${context}请统计以下内容包含的独立题目数量：\n\n${rawContent}`,
  );
  const raw = extractJson<{ count?: number }>(responseText);
  const count = typeof raw.count === "number" && raw.count >= 1 ? raw.count : 1;
  return { count };
}

export async function analyzeStepSplit(
  rawContent: string,
  count: number,
): Promise<{ parts: string[] }> {
  const systemPrompt = buildQuestionStepSplitPrompt(count);
  const responseText = await callMinimax(
    systemPrompt,
    `请将以下内容拆分为 ${count} 道独立题目：\n\n${rawContent}`,
  );
  const raw = extractJson<{ parts?: string[] }>(responseText);
  const parts = Array.isArray(raw.parts)
    ? raw.parts.filter(
        (p): p is string => typeof p === "string" && p.trim().length > 0,
      )
    : [rawContent];
  if (parts.length === 0) {
    return { parts: [rawContent] };
  }
  return { parts };
}

export async function analyzeStepType(
  questionRaw: string,
  notice?: string,
): Promise<{ questionType: QuestionType; questionTypeLabel: string }> {
  const systemPrompt = buildQuestionStepTypePrompt();
  const context = notice ? `[前一步警告：${notice}]\n\n` : "";
  const responseText = await callMinimax(
    systemPrompt,
    `${context}请识别以下题目的题型：\n\n${questionRaw}`,
  );
  const raw = extractJson<{
    questionType?: string;
    questionTypeLabel?: string;
  }>(responseText);
  const questionType = QUESTION_TYPES.includes(raw.questionType as QuestionType)
    ? (raw.questionType as QuestionType)
    : "subjective";
  const questionTypeLabel =
    raw.questionTypeLabel ?? QUESTION_TYPE_LABELS[questionType] ?? "主观题";
  return { questionType, questionTypeLabel };
}

export async function analyzeStepFormat(
  questionRaw: string,
  questionType: string,
): Promise<{ formattedContent: string }> {
  const systemPrompt = buildQuestionStepFormatPrompt(questionType);
  const responseText = await callMinimax(
    systemPrompt,
    `请格式化以下题目（题型：${questionType}）：\n\n${questionRaw}`,
  );
  const raw = extractJson<{ formattedContent?: string }>(responseText);
  return {
    formattedContent:
      typeof raw.formattedContent === "string"
        ? raw.formattedContent.trim()
        : "",
  };
}

export async function analyzeStepCatalog(
  questionRaw: string,
  existingTopics: ExistingTopic[],
): Promise<{ catalogRecommendation: CatalogRecommendation }> {
  const systemPrompt = buildQuestionStepCatalogPrompt(existingTopics);
  const responseText = await callMinimax(
    systemPrompt,
    `请为以下题目推荐存放题库：\n\n${questionRaw}`,
  );
  const raw = extractJson<{
    catalogRecommendation?: Partial<CatalogRecommendation>;
  }>(responseText);

  const cr = raw.catalogRecommendation ?? {};
  const catalogRecommendation: CatalogRecommendation = {
    topicId:
      existingTopics.length > 0 ? (cr.topicId ?? existingTopics[0].id) : "",
    topicName:
      existingTopics.length > 0 ? (cr.topicName ?? existingTopics[0].name) : "",
    matchScore:
      typeof cr.matchScore === "number"
        ? cr.matchScore
        : existingTopics.length > 0
          ? 50
          : 0,
    suggestedTopicName: cr.suggestedTopicName,
  };

  if (existingTopics.length === 0) {
    catalogRecommendation.topicId = "";
    catalogRecommendation.topicName = "";
    catalogRecommendation.matchScore = 0;
  }

  return { catalogRecommendation };
}
