"use client";

import type { TopicTag } from "@/app/actions/question";

type TagFilterProps = {
  tags: Array<TopicTag>;
  selectedTagId: string | null;
  onTagSelect: (tagId: string | null) => void;
};

export function TagFilter({
  tags,
  selectedTagId,
  onTagSelect,
}: TagFilterProps) {
  const allSelected = selectedTagId === null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-4">
      <button
        type="button"
        onClick={() => onTagSelect(null)}
        className={`rounded-full px-3 py-1 text-sm transition-colors ${
          allSelected
            ? "bg-gray-900 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        全部
      </button>
      {tags.map((tag) => {
        const isSelected = selectedTagId === tag.id;
        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagSelect(isSelected ? null : tag.id)}
            className={`rounded-full px-3 py-1 text-sm transition-colors ${
              isSelected
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tag.name}
          </button>
        );
      })}
    </div>
  );
}
