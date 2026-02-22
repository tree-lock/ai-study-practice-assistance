"use client";

import { CheckIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Callout, Flex, Select, Text } from "@radix-ui/themes";
import type { TopicOption } from "./types";

type CatalogPanelProps = {
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  matchScore: number;
  suggestedTopicName?: string;
  isSaving: boolean;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
};

export function CatalogPanel({
  existingCatalogCandidates,
  selectedTopicId,
  matchScore,
  suggestedTopicName,
  isSaving,
  onSelectTopic,
  onConfirm,
}: CatalogPanelProps) {
  const hasTopics = existingCatalogCandidates.length > 0;
  const isLowMatch = matchScore > 0 && matchScore < 60;

  return (
    <Flex
      direction="column"
      gap="2"
      className="border-t border-[#eef2f7] pt-2.5"
    >
      {isLowMatch && suggestedTopicName && (
        <Callout.Root color="amber" size="1">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>
            匹配度较低，建议新建题库：「{suggestedTopicName}」
          </Callout.Text>
        </Callout.Root>
      )}

      {!hasTopics ? (
        <Text size="2" color="gray">
          暂无题库，请先在侧边栏创建题库
        </Text>
      ) : (
        <Flex gap="2" align="center" className="w-full">
          <Text size="2" color="gray" className="shrink-0">
            保存到：
          </Text>
          <div className="min-w-0 flex-1">
            <Select.Root
              value={selectedTopicId || undefined}
              onValueChange={onSelectTopic}
              size="2"
            >
              <Select.Trigger
                aria-label="选择题库"
                placeholder="选择题库"
                style={{ width: "100%" }}
              />
              <Select.Content position="popper">
                {existingCatalogCandidates.map((topic) => (
                  <Select.Item key={topic.id} value={topic.id}>
                    {topic.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving || !selectedTopicId}
            aria-label="确认保存"
            className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-none text-white transition-all duration-150 ease-in-out ${
              isSaving
                ? "bg-blue-400 opacity-70"
                : selectedTopicId
                  ? "bg-blue-600 opacity-100 shadow-[0_4px_10px_rgba(37,99,235,0.28)]"
                  : "bg-blue-300 opacity-70"
            }`}
          >
            {isSaving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckIcon width={14} height={14} />
            )}
          </button>
        </Flex>
      )}
    </Flex>
  );
}
