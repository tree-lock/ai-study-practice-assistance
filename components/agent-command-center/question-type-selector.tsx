"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  type QuestionType,
} from "@/lib/ai/types";

type QuestionTypeSelectorProps = {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  /** 与 Badge 保持 h-8 高度一致，避免布局抖动 */
  className?: string;
};

export function QuestionTypeSelector({
  value,
  onValueChange,
  disabled = false,
  className,
}: QuestionTypeSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger size="sm" className={className} aria-label="选择题型">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {QUESTION_TYPES.map((t) => (
          <SelectItem key={t} value={t}>
            {QUESTION_TYPE_LABELS[t as QuestionType]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
