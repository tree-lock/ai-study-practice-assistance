"use client";

import { Check, Close, Edit, Warning } from "@mui/icons-material";
import { Alert, Badge, Box, Typography } from "@mui/material";
import { CatalogPanel } from "./catalog-panel";
import { QuestionMarkdownContent } from "./question-markdown-content";
import type { AnalysisResult, TopicOption } from "./types";

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type QuestionPanelProps = {
  generateStatus: GenerateStatus;
  questionMarkdown: string;
  sourceLabel: string | null;
  analysisResult: AnalysisResult | null;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  isSaving: boolean;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
};

export function QuestionPanel({
  generateStatus,
  questionMarkdown,
  sourceLabel,
  analysisResult,
  isEditing,
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
    <Box display="flex" flexDirection="column" gap={1} className="py-3 px-3.5">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" gap={1} alignItems="center">
          <Typography variant="body2" fontWeight="fontWeightBold">
            题目
          </Typography>
          {analysisResult?.questionTypeLabel ? (
            <Badge color="primary">{analysisResult.questionTypeLabel}</Badge>
          ) : null}
        </Box>
        {generateStatus === "done" ? (
          <Box display="flex" gap={1}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  aria-label="取消编辑题目"
                  className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-gray-300 bg-white p-0 text-gray-600"
                >
                  <Close sx={{ fontSize: 14 }} />
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  aria-label="保存题目编辑"
                  className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 p-0 text-blue-700"
                >
                  <Check sx={{ fontSize: 14 }} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartEdit}
                aria-label="编辑题目"
                className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-gray-300 bg-white p-0 text-gray-600"
              >
                <Edit sx={{ fontSize: 14 }} />
              </button>
            )}
          </Box>
        ) : null}
      </Box>
      {generateStatus === "generating" ? (
        <Typography variant="body2" color="text.secondary">
          AI 正在分析题目...
        </Typography>
      ) : null}
      {generateStatus === "stopped" ? (
        <Typography variant="body2" color="text.secondary">
          已停止生成。你可以再次点击按钮重新分析。
        </Typography>
      ) : null}
      {generateStatus === "done" && questionMarkdown ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {sourceLabel ? (
            <Typography variant="caption" color="text.secondary">
              来源：{sourceLabel}
            </Typography>
          ) : null}

          {analysisResult?.notice ? (
            <Alert
              severity="warning"
              icon={<Warning />}
              sx={{ fontSize: "0.875rem" }}
            >
              {analysisResult.notice}
            </Alert>
          ) : null}

          {isEditing ? (
            <textarea
              value={draftValue}
              onChange={(event) => onDraftChange(event.target.value)}
              className="min-h-[120px] w-full resize-y rounded-lg border border-[#dbe1ea] px-2.5 py-2 font-inherit leading-relaxed"
            />
          ) : (
            <QuestionMarkdownContent questionMarkdown={questionMarkdown} />
          )}

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
        </Box>
      ) : null}
    </Box>
  );
}
