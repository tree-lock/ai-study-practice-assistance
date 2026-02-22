export type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

export type GenerateStatus = "idle" | "generating" | "done" | "stopped";

export type TopicOption = {
  id: string;
  name: string;
};

export type QuestionType =
  | "choice"
  | "blank"
  | "subjective"
  | "application"
  | "proof"
  | "comprehensive";

export type CatalogRecommendation = {
  topicId: string;
  topicName: string;
  matchScore: number;
  suggestedTopicName?: string;
};

export type AnalysisResult = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
  catalogRecommendation: CatalogRecommendation;
  notice?: string;
};
