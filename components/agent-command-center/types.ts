export type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

export type GenerateStatus = "idle" | "generating" | "done" | "stopped";

export type CatalogActionType = "save-existing" | "create-new";

export type TopicOption = {
  id: string;
  name: string;
};

export type CatalogActionOption = {
  id: string;
  type: CatalogActionType;
  optionLabel: string;
  suggestion: string;
  topicId?: string;
};

export type QuestionType =
  | "choice"
  | "blank"
  | "subjective"
  | "application"
  | "proof"
  | "comprehensive";

export type CatalogRecommendation = {
  action: "use-existing" | "create-new";
  topicId?: string;
  topicName: string;
  reason: string;
};

export type AnalysisResult = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
  knowledgePoints: string[];
  catalogRecommendation: CatalogRecommendation;
};
