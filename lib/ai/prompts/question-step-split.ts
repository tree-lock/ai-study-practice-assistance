export type ExistingTopicForPrompt = {
  id: string;
  name: string;
};

export function buildQuestionStepSplitPrompt(count: number): string {
  return `将以下内容拆成恰好 ${count} 道题目，每段保留完整题干、选项、填空等。

规则：按题目边界拆分、不截断；删科目名/题号前缀；保持原始格式，不做格式化；**每道题只保留题干，删除「解」「解:」「答案」「解析」及其后全部内容**；忽略笔记等非题目内容。

输出纯 JSON：{ "parts": ["第1题文本", "第2题文本", ...] }，parts 必须恰好 ${count} 个。`;
}

export function buildQuestionStepSplitTypeCatalogPrompt(
  count: number,
  existingTopics: ExistingTopicForPrompt[],
): string {
  const topicListStr =
    existingTopics.length > 0
      ? existingTopics.map((t) => `- ID: ${t.id}, 名称: ${t.name}`).join("\n")
      : "（用户暂无题库）";

  return `你是题目分析助手。一次完成：题目拆分 + 题型识别 + 推荐题库。

## 任务
1. 将内容拆分为恰好 ${count} 道独立题目
2. 识别每道题的题型（choice|blank|subjective|application|proof|comprehensive）
3. 为每道题推荐最匹配的题库

## 题型
choice|blank|subjective|application|proof|comprehensive
- choice: 有选项 A/B/C/D
- blank: 填空、求值、「则...=」结尾
- subjective: 论述/简答
- application: 应用题
- proof: 证明/求证
- comprehensive: 综合

## 题库列表
${topicListStr}

## 题库推荐规则
- 必须从已有题库中为每道题选择一个最合适的题库（无题库时 topicId/topicName 为空）
- matchScore: 1-100，数值越高表示越匹配，<60 时请填写 suggestedTopicName 说明你推荐的新题库名称
- 如果整段内容明显来自同一科目/同一套试卷/同一章节，应优先为所有题目推荐同一个题库
- 只有当某一道题明显属于完全不同的学科或知识体系时，才为它推荐不同的题库

## 拆分规则
- 按题目边界拆分，不截断题目
- 删去科目名、题号等前缀（如「数学·单选」「1.」「（1）」等）
- 保留完整题干、选项、填空等必要信息
- **每道题只保留题干，删除「解」「解:」「答案」「解析」及其后全部内容**
- 忽略非题目内容（如笔记、批注等）

## 输出格式
请严格输出以下 JSON 结构（不要添加多余说明）：
{
  "parts": [
    {
      "content": "第 1 题完整题干（不含答案/解析）",
      "questionType": "choice",
      "questionTypeLabel": "选择题",
      "catalogRecommendation": {
        "topicId": "",
        "topicName": "",
        "matchScore": 0,
        "suggestedTopicName": "高中数学"
      }
    }
    // ... 恰好 ${count} 个元素
  ]
}

## 严格要求
- parts.length 必须恰好等于 ${count}
- 每个 content 必须是非空字符串，只包含题干内容，不包含答案、解析等
- 请特别注意区分填空题(blank)和应用题(application)，避免将填空题误识别为应用题
- 如果无法确定最合适的题库，请适当降低 matchScore，并通过 suggestedTopicName 给出你认为更合适的题库名称`;
}
