"use client";

import { Check, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TopicOption } from "./types";

type CatalogPanelProps = {
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  matchScore: number;
  suggestedTopicName?: string;
  isSaving: boolean;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
  /** 禁用时不可选题库，显示加载占位 */
  disabled?: boolean;
};

export function CatalogPanel({
  existingCatalogCandidates,
  selectedTopicId,
  matchScore,
  suggestedTopicName,
  isSaving,
  onSelectTopic,
  onConfirm,
  disabled = false,
}: CatalogPanelProps) {
  const hasTopics = existingCatalogCandidates.length > 0;
  const isLowMatch = matchScore > 0 && matchScore < 60;

  return (
    <div className="flex w-full flex-col gap-2 border-t border-border/60 pt-2.5">
      {disabled && hasTopics ? (
        <p className="text-sm text-muted-foreground">AI 正在推荐题库...</p>
      ) : null}
      {!disabled && isLowMatch && suggestedTopicName ? (
        <Alert className="border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          <TriangleAlert className="size-4" />
          <AlertDescription className="text-inherit">
            匹配度较低，建议新建题库：「{suggestedTopicName}」
          </AlertDescription>
        </Alert>
      ) : null}

      {!hasTopics ? (
        <p className="text-sm text-muted-foreground">
          暂无题库，请先在侧边栏创建题库
        </p>
      ) : null}
      {!disabled && hasTopics ? (
        <div className="flex w-full items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">
            保存到：
          </span>
          <div className="min-w-0 flex-1">
            <Select
              value={selectedTopicId ?? undefined}
              onValueChange={onSelectTopic}
            >
              <SelectTrigger aria-label="选择题库" className="w-full">
                <SelectValue placeholder="选择题库" />
              </SelectTrigger>
              <SelectContent position="popper">
                {existingCatalogCandidates.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <div className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Check className="size-3.5" />
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}
