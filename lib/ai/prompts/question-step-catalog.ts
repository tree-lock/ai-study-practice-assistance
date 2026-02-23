export type ExistingTopicForPrompt = {
  id: string;
  name: string;
};

export function buildQuestionStepCatalogPrompt(
  existingTopics: ExistingTopicForPrompt[],
): string {
  const topicListStr =
    existingTopics.length > 0
      ? existingTopics.map((t) => `- ID: ${t.id}, 名称: ${t.name}`).join("\n")
      : "（用户暂无题库）";

  return `你是一个智能题目分析助手。你的任务仅为针对单道题目，从用户现有题库中选择最合适的存放位置。

## 用户现有的题库列表

${topicListStr}

## 推荐策略

1. **必须选择已有题库**：无论匹配度高低，都必须从用户现有题库中选择一个（无题库时 topicId 填空字符串）
2. **匹配度评分**：
   - 90-100：完全匹配
   - 70-89：较好匹配
   - 50-69：勉强匹配
   - 30-49：较差匹配
   - 1-29：几乎不匹配
3. **低匹配度**：当匹配度低于 60 时，必须在 suggestedTopicName 给出建议新建的题库名称
4. **用户没有题库时**：topicId 和 topicName 返回空字符串，matchScore 为 0，必须提供 suggestedTopicName

## 输出格式

你必须以纯 JSON 格式返回，不要包含任何其他文字。

{
  "catalogRecommendation": {
    "topicId": "已有题库的 ID 或空字符串",
    "topicName": "选择的题库名称或空字符串",
    "matchScore": 1-100 的匹配度分数,
    "suggestedTopicName": "当匹配度低于 60 时填写，否则不填"
  }
}`;
}
