import type { TopicOption } from "./types";

type CatalogActionType = "save-existing" | "create-new";

export type CatalogActionOption = {
  id: string;
  type: CatalogActionType;
  optionLabel: string;
  suggestion: string;
  topicId?: string; // 当 type 为 save-existing 时，存储题库 ID
};

export function buildCatalogActions(
  topics: Array<TopicOption>,
): Array<CatalogActionOption> {
  if (topics.length === 0) {
    // 没有任何题库时，只提供创建新题库选项
    return [
      {
        id: "create-new-only",
        type: "create-new",
        optionLabel: "新建题库并存入",
        suggestion: "新建题库",
      },
    ];
  }

  const firstTopic = topics[0];
  const baseName = firstTopic.name.split("/")[0] ?? "通用复习";
  const created = `${baseName}/新建题库`;

  return [
    {
      id: `existing-${firstTopic.id}`,
      type: "save-existing",
      optionLabel: "存到已有题库",
      suggestion: firstTopic.name,
      topicId: firstTopic.id,
    },
    {
      id: `create-${created}`,
      type: "create-new",
      optionLabel: "新建题库并存入",
      suggestion: created,
    },
  ];
}
