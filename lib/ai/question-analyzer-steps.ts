import { MINIMAX_MODEL, minimax } from "./minimax";
import { buildQuestionStepCatalogPrompt } from "./prompts/question-step-catalog";
import { buildQuestionStepCountPrompt } from "./prompts/question-step-count";
import {
  buildQuestionStepFormatPrompt,
  buildQuestionStepFormatStreamPrompt,
} from "./prompts/question-step-format";
import { buildQuestionStepNoticePrompt } from "./prompts/question-step-notice";
import { buildQuestionStepNoticeCountPrompt } from "./prompts/question-step-notice-count";
import {
  buildQuestionStepSplitPrompt,
  buildQuestionStepSplitTypeCatalogPrompt,
  type ExistingTopicForPrompt,
} from "./prompts/question-step-split";
import { buildQuestionStepTypePrompt } from "./prompts/question-step-type";
import type { QuestionType } from "./question-analyzer";
import {
  type CatalogRecommendation,
  type ExistingTopic,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
} from "./question-analyzer";

const INVALID_TEXT_ERROR = "AI 未返回有效的文本响应";
const MAX_RETRIES = 2;

async function callMinimax(
  systemPrompt: string,
  userText: string,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
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
        throw new Error(INVALID_TEXT_ERROR);
      }

      return textBlock.text.trim();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      const isInvalidText =
        lastError.message === INVALID_TEXT_ERROR && attempt < MAX_RETRIES;
      if (!isInvalidText) {
        throw lastError;
      }
    }
  }

  throw lastError ?? new Error(INVALID_TEXT_ERROR);
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

export async function analyzeStepNoticeCount(
  rawContent: string,
): Promise<{ notice?: string; count: number }> {
  const systemPrompt = buildQuestionStepNoticeCountPrompt();
  const responseText = await callMinimax(
    systemPrompt,
    `请分析以下内容：\n\n${rawContent}`,
  );
  const raw = extractJson<{ notice?: string; count?: number }>(responseText);
  const count = typeof raw.count === "number" && raw.count >= 1 ? raw.count : 1;
  return { notice: raw.notice, count };
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

export async function analyzeStepSplitTypeCatalog(
  rawContent: string,
  count: number,
  existingTopics: ExistingTopic[],
): Promise<{
  parts: Array<{
    content: string;
    questionType: QuestionType;
    questionTypeLabel: string;
    catalogRecommendation: CatalogRecommendation;
  }>;
}> {
  const topicsForPrompt: ExistingTopicForPrompt[] = existingTopics.map((t) => ({
    id: t.id,
    name: t.name,
  }));
  const systemPrompt = buildQuestionStepSplitTypeCatalogPrompt(
    count,
    topicsForPrompt,
  );
  const responseText = await callMinimax(
    systemPrompt,
    `请将以下内容拆分并分析：\n\n${rawContent}`,
  );
  const raw = extractJson<{
    parts?: Array<{
      content?: string;
      questionType?: string;
      questionTypeLabel?: string;
      catalogRecommendation?: Partial<CatalogRecommendation>;
    }>;
  }>(responseText);

  const rawParts = Array.isArray(raw.parts) ? raw.parts : [];

  const cleanedParts = rawParts
    .map((part) => {
      const content =
        typeof part.content === "string" ? part.content.trim() : "";
      if (!content) {
        return null;
      }

      const questionType = QUESTION_TYPES.includes(
        part.questionType as QuestionType,
      )
        ? (part.questionType as QuestionType)
        : "subjective";
      const questionTypeLabel =
        part.questionTypeLabel ??
        QUESTION_TYPE_LABELS[questionType] ??
        "主观题";

      const cr = part.catalogRecommendation ?? {};
      const baseTopic = existingTopics[0];
      const catalogRecommendation: CatalogRecommendation = {
        topicId: baseTopic ? (cr.topicId ?? baseTopic.id) : "",
        topicName: baseTopic ? (cr.topicName ?? baseTopic.name) : "",
        matchScore:
          typeof cr.matchScore === "number"
            ? cr.matchScore
            : baseTopic
              ? 50
              : 0,
        suggestedTopicName: cr.suggestedTopicName,
      };

      if (!baseTopic) {
        catalogRecommendation.topicId = "";
        catalogRecommendation.topicName = "";
        catalogRecommendation.matchScore = 0;
      }

      return {
        content,
        questionType,
        questionTypeLabel,
        catalogRecommendation,
      };
    })
    .filter(
      (
        part,
      ): part is {
        content: string;
        questionType: QuestionType;
        questionTypeLabel: string;
        catalogRecommendation: CatalogRecommendation;
      } => part !== null,
    );

  if (cleanedParts.length === 0) {
    const fallbackQuestionType: QuestionType = "subjective";
    const baseTopic = existingTopics[0];
    const catalogRecommendation: CatalogRecommendation = {
      topicId: baseTopic?.id ?? "",
      topicName: baseTopic?.name ?? "",
      matchScore: baseTopic ? 50 : 0,
    };

    if (!baseTopic) {
      catalogRecommendation.topicId = "";
      catalogRecommendation.topicName = "";
      catalogRecommendation.matchScore = 0;
    }

    return {
      parts: [
        {
          content: rawContent,
          questionType: fallbackQuestionType,
          questionTypeLabel:
            QUESTION_TYPE_LABELS[fallbackQuestionType] ?? "主观题",
          catalogRecommendation,
        },
      ],
    };
  }

  return { parts: cleanedParts };
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
    `请检查以下题目是否符合格式要求，如不符合，请按规则进行最小必要修改后输出（题型：${questionType}）：\n\n${questionRaw}`,
  );
  return {
    formattedContent: responseText.trim(),
  };
}

export async function* analyzeStepFormatStream(
  questionRaw: string,
  questionType: string,
): AsyncGenerator<string, void, undefined> {
  const systemPrompt = buildQuestionStepFormatStreamPrompt(questionType);
  const stream = minimax.messages.stream({
    model: MINIMAX_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `请检查以下题目是否符合格式要求，如不符合，请按规则进行最小必要修改后输出（题型：${questionType}）：\n\n${questionRaw}`,
      },
    ],
  });

  const queue: string[] = [];
  let resolveWait: (() => void) | null = null;
  let streamEnded = false;
  let streamError: Error | null = null;

  stream.on("text", (textDelta: string) => {
    if (textDelta) {
      queue.push(textDelta);
      resolveWait?.();
    }
  });
  stream.on("end", () => {
    streamEnded = true;
    resolveWait?.();
  });
  stream.on("error", (err: Error) => {
    streamError = err;
    streamEnded = true;
    resolveWait?.();
  });

  void stream.finalText().catch(() => {});

  while (!streamEnded || queue.length > 0) {
    if (queue.length > 0) {
      const chunk = queue.shift();
      if (chunk) yield chunk;
      continue;
    }
    if (streamEnded) break;
    await new Promise<void>((r) => {
      resolveWait = r;
    });
  }

  if (streamError) {
    throw streamError;
  }
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
