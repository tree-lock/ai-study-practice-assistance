import { MINIMAX_MODEL, minimax } from "./minimax";
import { buildQuestionImportPrompt } from "./prompts/question-import";

export const QUESTION_TYPES = [
  "choice",
  "blank",
  "subjective",
  "application",
  "proof",
  "comprehensive",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
  application: "应用题",
  proof: "证明题",
  comprehensive: "综合题",
};

export type CatalogRecommendation = {
  topicId: string;
  topicName: string;
  matchScore: number;
  suggestedTopicName?: string;
};

export type SingleQuestionItem = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
};

export type QuestionAnalysisResult = {
  questions: SingleQuestionItem[];
  catalogRecommendation: CatalogRecommendation;
  notice?: string;
};

export type ExistingTopic = {
  id: string;
  name: string;
};

export async function analyzeQuestion(
  rawContent: string,
  existingTopics: ExistingTopic[],
): Promise<QuestionAnalysisResult> {
  const systemPrompt = buildQuestionImportPrompt(existingTopics);

  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请分析以下题目：\n\n${rawContent}`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 未返回有效的文本响应");
  }

  const responseText = textBlock.text.trim();

  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const raw = JSON.parse(jsonStr) as {
    questions?: SingleQuestionItem[];
    formattedContent?: string;
    questionType?: QuestionType;
    questionTypeLabel?: string;
    catalogRecommendation?: CatalogRecommendation;
    notice?: string;
  };

  // 兼容旧格式：顶层为单题
  const questionsRaw = raw.questions;
  const questions: SingleQuestionItem[] =
    questionsRaw && questionsRaw.length > 0
      ? questionsRaw
      : raw.formattedContent
        ? [
            {
              formattedContent: raw.formattedContent,
              questionType: raw.questionType ?? "subjective",
              questionTypeLabel: raw.questionTypeLabel ?? "主观题",
            },
          ]
        : [];

  for (const q of questions) {
    if (!QUESTION_TYPES.includes(q.questionType)) {
      q.questionType = "subjective";
    }
    q.questionTypeLabel = QUESTION_TYPE_LABELS[q.questionType] || "主观题";
  }

  const catalogRecommendation = raw.catalogRecommendation ?? {
    topicId: existingTopics[0]?.id ?? "",
    topicName: existingTopics[0]?.name ?? "",
    matchScore: existingTopics.length > 0 ? 50 : 0,
  };

  if (!catalogRecommendation.matchScore) {
    catalogRecommendation.matchScore = 50;
  }

  if (existingTopics.length === 0) {
    catalogRecommendation.topicId = "";
    catalogRecommendation.topicName = "";
    catalogRecommendation.matchScore = 0;
  }

  return {
    questions:
      questions.length > 0
        ? questions
        : [
            {
              formattedContent: "",
              questionType: "subjective",
              questionTypeLabel: "主观题",
            },
          ],
    catalogRecommendation,
    notice: raw.notice,
  };
}
