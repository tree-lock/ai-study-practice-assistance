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
  topicId?: string; // 当 type 为 save-existing 时，存储题库 ID
};
