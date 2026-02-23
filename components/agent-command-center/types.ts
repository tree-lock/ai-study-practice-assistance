import type { QuestionType } from "@/lib/ai/types";

export type ImageRotationDegrees = 0 | 90 | 180 | 270;

export type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
  /** 图片旋转角度，仅对图片类型有效；提交识别时通过 Canvas 应用旋转后上传 */
  rotationDegrees: ImageRotationDegrees;
};

export type GenerateStatus = "idle" | "generating" | "done" | "stopped";

export type TopicOption = {
  id: string;
  name: string;
};

export type { QuestionType };

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
