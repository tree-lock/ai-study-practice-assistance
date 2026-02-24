"use client";

import { Check, Info, Pencil, RefreshCw, TriangleAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QUESTION_TYPE_LABELS } from "@/lib/ai/types";
import { CatalogPanel } from "./catalog-panel";
import {
  PARSE_PHASE_LABELS,
  type QuestionPanelParsePhase,
} from "./parse-phase-constants";
import { QuestionMarkdownContent } from "./question-markdown-content";
import { QuestionPanelProgress } from "./question-panel-progress";
import { QuestionTypeSelector } from "./question-type-selector";
import { textToMarkdown } from "./text-to-markdown";
import type { CatalogRecommendation, TopicOption } from "./types";

export type { QuestionPanelParsePhase };

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type QuestionPanelProps = {
  questionIndex: number;
  totalQuestions: number;
  generateStatus: GenerateStatus;
  parsePhase: QuestionPanelParsePhase | null;
  isActivePanel: boolean;
  notice?: string;
  questionType: string;
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
  /** 用于决定是否显示重新识别按钮；历史数据可能无此字段 */
  questionRaw?: string;
  onQuestionTypeChange?: (type: string, label: string) => void;
  onReRecognize?: () => void;
  isReRecognizing?: boolean;
  /** 题目级状态，未传则视为 done（兼容历史） */
  panelStatus?: "pending" | "processing" | "done";
  /** 当前处理阶段，用于进度条 */
  panelCurrentPhase?: QuestionPanelParsePhase | null;
};

export function QuestionPanel({
  questionIndex,
  totalQuestions,
  generateStatus,
  parsePhase,
  isActivePanel,
  notice,
  questionType,
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
  questionRaw,
  onQuestionTypeChange,
  onReRecognize,
  isReRecognizing = false,
  panelStatus,
  panelCurrentPhase,
}: QuestionPanelProps) {
  const title =
    totalQuestions > 1
      ? `题目 ${questionIndex + 1}（共 ${totalQuestions} 道）`
      : "题目";
  const isPanelComplete = panelStatus === undefined || panelStatus === "done";
  const showLegacyGenerating =
    generateStatus === "generating" &&
    isActivePanel &&
    panelStatus === undefined;
  const hasContent = formattedContent.trim().length > 0;
  const showContentBlock =
    panelStatus !== undefined
      ? true
      : (generateStatus === "done" || hasContent) && !showLegacyGenerating;
  const hasValidCatalog =
    (catalogRecommendation.topicId ?? "").trim() !== "" ||
    (catalogRecommendation.topicName ?? "").trim() !== "";

  return (
    <div className="flex flex-col gap-2 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold">{title}</span>
        {questionRaw?.trim() ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="查看原始文本"
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <Info className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>原始文本（未经过 AI 识别）</DialogTitle>
              </DialogHeader>
              <div className="mt-2 max-h-96 overflow-auto whitespace-pre-wrap wrap-break-word rounded-md bg-muted px-3 py-2 font-mono text-sm">
                {questionRaw}
              </div>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {showLegacyGenerating ? (
        <p className="text-sm text-muted-foreground">
          {parsePhase ? PARSE_PHASE_LABELS[parsePhase] : "AI 正在分析题目..."}
        </p>
      ) : null}

      {panelStatus === "processing" && panelCurrentPhase ? (
        <QuestionPanelProgress currentPhase={panelCurrentPhase} isProcessing />
      ) : null}

      {generateStatus === "stopped" && isActivePanel ? (
        <p className="text-sm text-muted-foreground">
          已停止生成。你可以再次点击按钮重新分析。
        </p>
      ) : null}

      {showContentBlock ? (
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
            <div className="flex h-8 items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {onQuestionTypeChange ? (
                  <QuestionTypeSelector
                    value={questionType}
                    onValueChange={(v) => {
                      const label =
                        QUESTION_TYPE_LABELS[
                          v as keyof typeof QUESTION_TYPE_LABELS
                        ] ?? v;
                      onQuestionTypeChange(v, label);
                    }}
                    disabled={!isPanelComplete}
                    className="h-8 w-[100px] shrink-0"
                  />
                ) : (
                  <span className="truncate text-sm text-muted-foreground">
                    {questionTypeLabel}
                  </span>
                )}
                {isPanelComplete && questionRaw?.trim() && onReRecognize ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onReRecognize}
                    disabled={isReRecognizing}
                    aria-label="重新识别题目"
                    className="size-8 shrink-0"
                  >
                    <RefreshCw
                      className={`size-4 ${isReRecognizing ? "animate-spin" : ""}`}
                    />
                  </Button>
                ) : null}
              </div>
              {isPanelComplete ? (
                <div className="flex shrink-0 gap-2">
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
              <div className="min-h-12">
                {hasContent ? (
                  <QuestionMarkdownContent
                    questionMarkdown={formattedContent}
                  />
                ) : questionRaw?.trim() ? (
                  <QuestionMarkdownContent
                    questionMarkdown={textToMarkdown(questionRaw)}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    AI 正在格式化题目...
                  </p>
                )}
              </div>
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
              disabled={!hasValidCatalog || !isPanelComplete}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
