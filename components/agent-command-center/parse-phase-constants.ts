export type QuestionPanelParsePhase =
  | "uploading"
  | "parsing"
  | "notice"
  | "count"
  | "splitting"
  | "type"
  | "format"
  | "catalog"
  | null;

export const PARSE_PHASE_LABELS: Record<
  NonNullable<QuestionPanelParsePhase>,
  string
> = {
  uploading: "正在上传文档...",
  parsing: "正在解析文档...",
  notice: "AI 正在检查题目...",
  count: "AI 正在统计题目数量...",
  splitting: "AI 正在拆分题目...",
  type: "AI 正在识别题目类型...",
  format: "AI 正在格式化题目...",
  catalog: "AI 正在推荐题库...",
};

const PHASE_PROGRESS_MAP: Record<
  NonNullable<QuestionPanelParsePhase>,
  number
> = {
  uploading: 10,
  parsing: 15,
  notice: 20,
  count: 25,
  splitting: 30,
  type: 33,
  format: 66,
  catalog: 100,
};

export function getPhaseProgress(phase: QuestionPanelParsePhase): number {
  if (phase === null) return 0;
  return PHASE_PROGRESS_MAP[phase] ?? 0;
}
