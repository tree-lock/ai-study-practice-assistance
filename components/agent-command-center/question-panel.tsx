"use client";

import {
  CheckIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";
import { Badge, Callout, Flex, Text } from "@radix-ui/themes";
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
    <Flex direction="column" gap="2" className="py-3 px-3.5">
      <Flex justify="between" align="center">
        <Flex gap="2" align="center">
          <Text size="2" weight="bold">
            题目
          </Text>
          {analysisResult?.questionTypeLabel ? (
            <Badge color="blue" size="1">
              {analysisResult.questionTypeLabel}
            </Badge>
          ) : null}
        </Flex>
        {generateStatus === "done" ? (
          <Flex gap="2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  aria-label="取消编辑题目"
                  className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-gray-300 bg-white p-0 text-gray-600"
                >
                  <Cross2Icon />
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  aria-label="保存题目编辑"
                  className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-blue-200 bg-blue-50 p-0 text-blue-700"
                >
                  <CheckIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartEdit}
                aria-label="编辑题目"
                className="inline-flex h-[22px] w-[26px] items-center justify-center rounded-md border border-gray-300 bg-white p-0 text-gray-600"
              >
                <Pencil2Icon />
              </button>
            )}
          </Flex>
        ) : null}
      </Flex>
      {generateStatus === "generating" ? (
        <Text size="2" color="gray">
          AI 正在分析题目...
        </Text>
      ) : null}
      {generateStatus === "stopped" ? (
        <Text size="2" color="gray">
          已停止生成。你可以再次点击按钮重新分析。
        </Text>
      ) : null}
      {generateStatus === "done" && questionMarkdown ? (
        <Flex direction="column" gap="3">
          {sourceLabel ? (
            <Text size="1" color="gray">
              来源: {sourceLabel}
            </Text>
          ) : null}

          {analysisResult?.notice ? (
            <Callout.Root color="amber" size="1">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Callout.Text>{analysisResult.notice}</Callout.Text>
            </Callout.Root>
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
        </Flex>
      ) : null}
    </Flex>
  );
}
