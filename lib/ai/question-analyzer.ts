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

export type QuestionAnalysisResult = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
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

  const parsed = JSON.parse(jsonStr) as QuestionAnalysisResult;

  if (!QUESTION_TYPES.includes(parsed.questionType)) {
    parsed.questionType = "subjective";
  }
  parsed.questionTypeLabel =
    QUESTION_TYPE_LABELS[parsed.questionType] || "主观题";

  if (!parsed.catalogRecommendation) {
    parsed.catalogRecommendation = {
      topicId: existingTopics[0]?.id ?? "",
      topicName: existingTopics[0]?.name ?? "",
      matchScore: existingTopics.length > 0 ? 50 : 0,
    };
  }

  if (!parsed.catalogRecommendation.matchScore) {
    parsed.catalogRecommendation.matchScore = 50;
  }

  if (existingTopics.length === 0) {
    parsed.catalogRecommendation.topicId = "";
    parsed.catalogRecommendation.topicName = "";
    parsed.catalogRecommendation.matchScore = 0;
  }

  return parsed;
}
