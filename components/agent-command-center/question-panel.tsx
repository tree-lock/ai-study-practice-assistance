"use client";

import { Check, Pencil, TriangleAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { CatalogPanel } from "./catalog-panel";
import { QuestionMarkdownContent } from "./question-markdown-content";
import type { CatalogRecommendation, TopicOption } from "./types";

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

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

type QuestionPanelProps = {
  questionIndex: number;
  totalQuestions: number;
  generateStatus: GenerateStatus;
  parsePhase: QuestionPanelParsePhase | null;
  isActivePanel: boolean;
  notice?: string;
  questionTypeLabel: string;
  formattedContent: string;
  catalogRecommendation: CatalogRecommendation;
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
  isSaving: boolean;
};

const PARSE_PHASE_LABELS: Record<
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

export function QuestionPanel({
  questionIndex,
  totalQuestions,
  generateStatus,
  parsePhase,
  isActivePanel,
  notice,
  questionTypeLabel,
  formattedContent,
  catalogRecommendation,
  existingCatalogCandidates,
  selectedTopicId,
  isEditing,
  draftValue,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSelectTopic,
  onConfirm,
  isSaving,
}: QuestionPanelProps) {
  const title =
    totalQuestions > 1
      ? `题目 ${questionIndex + 1}（共 ${totalQuestions} 道）`
      : "题目";
  const showGenerating = generateStatus === "generating" && isActivePanel;
  const hasContent = formattedContent.trim().length > 0;

  return (
    <div className="flex flex-col gap-2 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{title}</span>
      </div>

      {showGenerating ? (
        <p className="text-sm text-muted-foreground">
          {parsePhase ? PARSE_PHASE_LABELS[parsePhase] : "AI 正在分析题目..."}
        </p>
      ) : null}

      {generateStatus === "stopped" && isActivePanel ? (
        <p className="text-sm text-muted-foreground">
          已停止生成。你可以再次点击按钮重新分析。
        </p>
      ) : null}

      {(generateStatus === "done" || hasContent) && !showGenerating ? (
        <div className="flex flex-col gap-3">
          {notice ? (
            <Callout
              variant="amber"
              icon={<TriangleAlert className="size-4" />}
            >
              {notice}
            </Callout>
          ) : null}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="text-xs">
                {questionTypeLabel}
              </Badge>
              {generateStatus === "done" ? (
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onCancelEdit}
                        aria-label="取消编辑题目"
                        className="size-[26px] border-gray-300 bg-white hover:bg-gray-50"
                      >
                        <X className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={onSaveEdit}
                        aria-label="保存题目编辑"
                        className="size-[26px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <Check className="size-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={onStartEdit}
                      aria-label="编辑题目"
                      className="size-[26px] border-gray-300 bg-white hover:bg-gray-50"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>
              ) : null}
            </div>
            {isEditing ? (
              <textarea
                value={draftValue}
                onChange={(e) => onDraftChange(e.target.value)}
                className="min-h-[120px] w-full resize-y rounded-lg border border-[#dbe1ea] px-2.5 py-2 font-inherit leading-relaxed"
              />
            ) : (
              <QuestionMarkdownContent questionMarkdown={formattedContent} />
            )}
          </div>

          {!isEditing ? (
            <CatalogPanel
              existingCatalogCandidates={existingCatalogCandidates}
              selectedTopicId={selectedTopicId}
              matchScore={catalogRecommendation.matchScore ?? 0}
              suggestedTopicName={catalogRecommendation.suggestedTopicName}
              isSaving={isSaving}
              onSelectTopic={onSelectTopic}
              onConfirm={onConfirm}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
