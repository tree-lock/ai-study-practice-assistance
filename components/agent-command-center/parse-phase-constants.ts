export type QuestionPanelParsePhase =
  | "uploading"
  | "parsing"
  | "notice-count"
  | "splitting"
  | "type-catalog"
  | "format"
  | null;

export const PARSE_PHASE_LABELS: Record<
  NonNullable<QuestionPanelParsePhase>,
  string
> = {
  uploading: "正在上传文档...",
  parsing: "正在解析文档...",
  "notice-count": "AI 正在检查并统计题目...",
  splitting: "AI 正在拆分题目...",
  "type-catalog": "AI 正在识别类型并推荐题库...",
  format: "AI 正在格式化题目...",
};

const PHASE_PROGRESS_MAP: Record<
  NonNullable<QuestionPanelParsePhase>,
  number
> = {
  uploading: 10,
  parsing: 15,
  "notice-count": 25,
  splitting: 35,
  "type-catalog": 45,
  format: 100,
};

export function getPhaseProgress(phase: QuestionPanelParsePhase): number {
  if (phase === null) return 0;
  return PHASE_PROGRESS_MAP[phase] ?? 0;
}
