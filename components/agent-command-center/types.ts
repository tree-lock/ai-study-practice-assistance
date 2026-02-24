import type { QuestionType } from "@/lib/ai/types";
import type { QuestionPanelParsePhase } from "./parse-phase-constants";

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

export type SingleQuestionItem = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
};

export type AnalysisResult = {
  questions: SingleQuestionItem[];
  catalogRecommendation: CatalogRecommendation;
  notice?: string;
};

/** 单题独立面板数据，每道题拥有独立的 notice、类型、内容、推荐目录 */
export type QuestionPanelItem = {
  id: string;
  /** 该题原始文本，供重新识别使用；历史数据可能无此字段 */
  questionRaw?: string;
  notice?: string;
  questionType: string;
  questionTypeLabel: string;
  formattedContent: string;
  catalogRecommendation: CatalogRecommendation;
  selectedTopicId: string | null;
  /** 题目级别状态，未传则视为 "done" 以兼容历史数据 */
  status?: "pending" | "processing" | "done";
  /** 当前处理阶段，用于进度条、高亮 */
  currentPhase?: QuestionPanelParsePhase;
};
