export type KnowledgePointForPrompt = {
  id: string;
  name: string;
};

export function buildSolutionGeneratePrompt(
  questionContent: string,
  questionType: string,
  knowledgePoints: KnowledgePointForPrompt[],
): string {
  const kpListStr =
    knowledgePoints.length > 0
      ? knowledgePoints
          .map((kp) => `- ID: ${kp.id}, 名称: ${kp.name}`)
          .join("\n")
      : "（题库暂无知识点）";

  return `你是一个智能题目解析助手。你的任务是为给定的题目生成标准答案、详细解析、关联知识点和建议提示。

## 题目信息

题型：${questionType}

题目内容：
${questionContent}

## 题库现有知识点

${kpListStr}

## 输出要求

请生成以下内容：

1. **答案**：
   - 选择题：返回正确选项字母（如 "A" 或 "A,B"）
   - 填空题：返回填空答案，多个空用 ";" 分隔
   - 其他题型：返回完整的标准答案

2. **解析**：
   - 详细的解题思路和步骤
   - 使用 Markdown 格式
   - 数学公式使用 LaTeX 语法（行内 $...$，行间 $$...$$）

3. **关联知识点**：
   - 从题库现有知识点中选择最相关的 1-3 个
   - 只能选择上面列出的知识点 ID
   - 如果没有匹配的知识点，返回空数组

4. **建议提示**：
   - 根据题目情况给出建议
   - 可能的场景：
     - 题库知识点不足："此题涉及【xxx】知识点，建议在题库中添加"
     - 题目较难："此题为综合题，涉及多个知识点的交叉应用"
     - 其他有价值的提示

## 输出格式

必须以纯 JSON 格式返回，不要包含任何其他文字：

{
  "answer": "答案内容",
  "explanation": "解析内容（Markdown + LaTeX）",
  "matchedKnowledgePointIds": ["知识点ID1", "知识点ID2"],
  "suggestions": ["建议1", "建议2"]
}

## 示例

题目：已知 $f(x) = x^2 + 2x + 1$，求 $f(3)$ 的值。

输出：
{
  "answer": "16",
  "explanation": "**解题思路**\\n\\n将 $x = 3$ 代入函数表达式：\\n\\n$$f(3) = 3^2 + 2 \\\\times 3 + 1 = 9 + 6 + 1 = 16$$\\n\\n因此 $f(3) = 16$。",
  "matchedKnowledgePointIds": ["知识点ID"],
  "suggestions": []
}`;
}
