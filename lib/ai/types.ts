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

export type ExistingTopic = {
  id: string;
  name: string;
};

export type CatalogRecommendation = {
  action: "use-existing" | "create-new";
  topicId?: string;
  topicName: string;
  suggestedTopicName?: string;
  reason: string;
  matchScore?: number;
};

export type QuestionAnalysisResult = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
  knowledgePoints: string[];
  catalogRecommendation: CatalogRecommendation;
};

export type SolutionGenerationResult = {
  answer: string;
  explanation: string;
  matchedKnowledgePointIds: string[];
  suggestions: string[];
};
