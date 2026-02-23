"use client";

import { Check, Pencil, TriangleAlert, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { CatalogPanel } from "./catalog-panel";
import { QuestionMarkdownContent } from "./question-markdown-content";
import type { AnalysisResult, TopicOption } from "./types";

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type QuestionPanelProps = {
  generateStatus: GenerateStatus;
  parsePhase: "uploading" | "parsing" | "analyzing" | null;
  questions: Array<{
    id: string;
    formattedContent: string;
    questionType: string;
    questionTypeLabel: string;
  }>;
  sourceLabel: string | null;
  analysisResult: AnalysisResult | null;
  isEditing: boolean;
  editingIndex: number;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: (index: number) => void;
  onCancelEdit: () => void;
  onSaveEdit: (index: number) => void;
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  isSaving: boolean;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
};

export function QuestionPanel({
  generateStatus,
  parsePhase,
  questions,
  sourceLabel,
  analysisResult,
  isEditing,
  editingIndex,
  draftValue,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  existingCatalogCandidates,
  selectedTopicId,
  isSaving,
  onSelectTopic,
  onConfirm,
}: QuestionPanelProps) {
  return (
    <div className="flex flex-col gap-2 px-3.5 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">
            题目{questions.length > 1 ? `（共 ${questions.length} 道）` : ""}
          </span>
        </div>
      </div>
      {generateStatus === "generating" ? (
        <p className="text-sm text-muted-foreground">
          {parsePhase === "uploading"
            ? "正在上传文档..."
            : parsePhase === "parsing"
              ? "正在解析文档..."
              : parsePhase === "analyzing"
                ? "AI 正在分析题目..."
                : "AI 正在分析题目..."}
        </p>
      ) : null}
      {generateStatus === "stopped" ? (
        <p className="text-sm text-muted-foreground">
          已停止生成。你可以再次点击按钮重新分析。
        </p>
      ) : null}
      {generateStatus === "done" && questions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sourceLabel ? (
            <p className="text-xs text-muted-foreground">来源: {sourceLabel}</p>
          ) : null}

          {analysisResult?.notice ? (
            <Callout
              variant="amber"
              icon={<TriangleAlert className="size-4" />}
            >
              {analysisResult.notice}
            </Callout>
          ) : null}

          <div className="flex flex-col gap-4">
            {questions.map((q, index) => (
              <div key={q.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {q.questionTypeLabel}
                  </Badge>
                  {generateStatus === "done" ? (
                    <div className="flex gap-2">
                      {isEditing && editingIndex === index ? (
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
                            onClick={() => onSaveEdit(index)}
                            aria-label="保存题目编辑"
                            className="size-[26px] border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <Check className="size-4" />
                          </Button>
                        </>
                      ) : !isEditing ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => onStartEdit(index)}
                          aria-label="编辑题目"
                          className="size-[26px] border-gray-300 bg-white hover:bg-gray-50"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
                {isEditing && editingIndex === index ? (
                  <textarea
                    value={draftValue}
                    onChange={(e) => onDraftChange(e.target.value)}
                    className="min-h-[120px] w-full resize-y rounded-lg border border-[#dbe1ea] px-2.5 py-2 font-inherit leading-relaxed"
                  />
                ) : (
                  <QuestionMarkdownContent
                    questionMarkdown={q.formattedContent}
                  />
                )}
              </div>
            ))}
          </div>

          {!isEditing ? (
            <CatalogPanel
              existingCatalogCandidates={existingCatalogCandidates}
              selectedTopicId={selectedTopicId}
              matchScore={
                analysisResult?.catalogRecommendation?.matchScore ?? 0
              }
              suggestedTopicName={
                analysisResult?.catalogRecommendation?.suggestedTopicName
              }
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
