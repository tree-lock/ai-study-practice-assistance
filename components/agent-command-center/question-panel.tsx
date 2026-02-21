"use client";

import { CheckIcon, Cross2Icon, Pencil2Icon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import type { CatalogActionOption } from "./catalog-actions";
import { CatalogPanel } from "./catalog-panel";
import { QuestionMarkdownContent } from "./question-markdown-content";
import type { TopicOption } from "./types";

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type QuestionPanelProps = {
  generateStatus: GenerateStatus;
  questionMarkdown: string;
  mockSourceLabel: string | null;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  catalogOptions: Array<CatalogActionOption>;
  existingCatalogCandidates: Array<TopicOption>;
  selectedCatalogActionId: string | null;
  selectedExistingCatalogId: string | null;
  newCatalogInput: string;
  isSaving: boolean;
  onSelectCatalogAction: (id: string) => void;
  onSelectExistingCatalog: (id: string) => void;
  onNewCatalogInputChange: (value: string) => void;
  onConfirmCatalogAction: () => void;
};

export function QuestionPanel({
  generateStatus,
  questionMarkdown,
  mockSourceLabel,
  isEditing,
  draftValue,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  catalogOptions,
  existingCatalogCandidates,
  selectedCatalogActionId,
  selectedExistingCatalogId,
  newCatalogInput,
  isSaving,
  onSelectCatalogAction,
  onSelectExistingCatalog,
  onNewCatalogInputChange,
  onConfirmCatalogAction,
}: QuestionPanelProps) {
  return (
    <Flex direction="column" gap="2" className="py-3 px-3.5">
      <Flex justify="between" align="center">
        <Text size="2" weight="bold">
          题目 (Markdown + 公式)
        </Text>
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
          正在模拟生成题目内容...
        </Text>
      ) : null}
      {generateStatus === "stopped" ? (
        <Text size="2" color="gray">
          已停止生成。你可以再次点击上传按钮重新生成。
        </Text>
      ) : null}
      {generateStatus === "done" && questionMarkdown ? (
        <Flex direction="column" gap="2">
          {mockSourceLabel ? (
            <Text size="1" color="gray">
              模拟来源:{mockSourceLabel}
            </Text>
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
          {!isEditing && catalogOptions.length > 0 ? (
            <CatalogPanel
              catalogOptions={catalogOptions}
              existingCatalogCandidates={existingCatalogCandidates}
              selectedCatalogActionId={selectedCatalogActionId}
              selectedExistingCatalogId={selectedExistingCatalogId}
              newCatalogInput={newCatalogInput}
              isSaving={isSaving}
              onSelectCatalogAction={onSelectCatalogAction}
              onSelectExistingCatalog={onSelectExistingCatalog}
              onNewCatalogInputChange={onNewCatalogInputChange}
              onConfirmCatalogAction={onConfirmCatalogAction}
            />
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
}
