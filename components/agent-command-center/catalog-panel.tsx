"use client";

import { CheckIcon } from "@radix-ui/react-icons";
import { Flex, Select, TextField } from "@radix-ui/themes";
import type { CatalogActionOption } from "./catalog-actions";
import type { TopicOption } from "./types";

type CatalogPanelProps = {
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

export function CatalogPanel({
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
}: CatalogPanelProps) {
  const selectedCatalogOption =
    catalogOptions.find((option) => option.id === selectedCatalogActionId) ??
    null;
  const effectiveCatalogValue =
    selectedCatalogOption?.type === "save-existing"
      ? selectedCatalogOption?.suggestion
      : newCatalogInput;

  return (
    <Flex
      direction="column"
      gap="2"
      className="border-t border-[#eef2f7] pt-2.5"
    >
      <Flex gap="2" align="center" className="w-full">
        <Select.Root
          value={selectedCatalogActionId ?? undefined}
          onValueChange={onSelectCatalogAction}
          size="2"
        >
          <Select.Trigger
            aria-label="选择题库操作"
            placeholder="选择题库操作"
            className="min-w-[150px] shrink-0"
          />
          <Select.Content position="popper">
            {catalogOptions.map((option) => (
              <Select.Item key={option.id} value={option.id}>
                {option.optionLabel}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        {selectedCatalogOption?.type === "save-existing" ? (
          <div className="min-w-0 flex-1">
            <Select.Root
              value={selectedExistingCatalogId || undefined}
              onValueChange={onSelectExistingCatalog}
              size="2"
            >
              <Select.Trigger
                aria-label="选择已有题库"
                placeholder="选择已有题库"
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
        ) : (
          <div className="min-w-0 flex-1">
            <TextField.Root
              size="2"
              aria-label="题库名称"
              value={newCatalogInput}
              onChange={(event) => onNewCatalogInputChange(event.target.value)}
              placeholder="输入题库名称"
              style={{ width: "100%" }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={onConfirmCatalogAction}
          disabled={
            isSaving ||
            !selectedCatalogActionId ||
            !effectiveCatalogValue.trim()
          }
          aria-label="确认题库方案"
          className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-none text-white transition-all duration-150 ease-in-out ${
            isSaving
              ? "bg-blue-400 opacity-70"
              : selectedCatalogActionId && effectiveCatalogValue.trim()
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
    </Flex>
  );
}
