type FormatCategory = "choice" | "blank" | "other";

function getFormatCategory(questionType: string): FormatCategory {
  if (questionType === "choice") return "choice";
  if (questionType === "blank") return "blank";
  return "other"; // subjective, application, proof, comprehensive
}

function buildCommonFormatRules(): string {
  return `### 通用规则
- 删除题目前的科目名称、题号
- 删除题目后的"答题区"、图片链接等无关内容
- 数学公式使用 LaTeX：行内 $...$，行间 $$...$$
- 数学符号前后加适当空格
- **保持紧凑**：逻辑连贯的句子尽量写在同一段，仅选项、多小题等需要分段时使用空行
- 只格式化题目，不生成答案和解析。
- 题目中如果含有括号，例如在"在点 (1,2) 处可微"，则左右括号要一致，不要出现"在点（1,2) 处可微"左右括号一个为全角括号，一个是半角括号的情况。
- 请注意Latex格式化规则，不要出现格式化错误。`;
}

function buildChoiceFormatPrompt(): string {
  return `你是一个智能题目分析助手。你的任务仅为将单道题目格式化为标准 Markdown。

## 格式化规则

${buildCommonFormatRules()}

当前题目为选择题，请按选择题专用规则格式化。

### 选择题专用规则
- 题目描述（非选项部分）加粗
- 选项使用全角括号并加粗：**（A）**、**（B）**、**（C）**、**（D）**
- 每个选项独占一个段落

## 输出格式

你必须以纯 JSON 格式返回，不要包含任何其他文字。

{ "formattedContent": "格式化后的题目内容（Markdown + LaTeX）" }`;
}

function buildBlankFormatPrompt(): string {
  return `你是一个智能题目分析助手。你的任务仅为将单道题目格式化为标准 Markdown。

## 格式化规则

${buildCommonFormatRules()}

当前题目为填空题，请按填空题专用规则格式化。

### 填空题专用规则
- 填空位置用 10 个连续的英文下划线字符（ASCII 95）表示，即“十个” “_” 连写。禁止使用 LaTeX 的 \\underline 或 \\underline{\\quad} 等。
- 下划线前后应当有空格；
- 若填空在数学公式末尾，格式示例：则 $\\varphi'(1) = $ 后接十个下划线，下划线写在 LaTeX 公式 $ 之外。
- 若题目以「则 A =」「求 A」等结尾且无填空标记，需推断填空位置并添加；
- 生成结果中，应当至少有一个含下划线的填空位置。

## 输出格式

你必须以纯 JSON 格式返回，不要包含任何其他文字。

{ "formattedContent": "格式化后的题目内容（Markdown + LaTeX）" }`;
}

function buildOtherFormatPrompt(): string {
  return `你是一个智能题目分析助手。你的任务仅为将单道题目格式化为标准 Markdown。

## 格式化规则

${buildCommonFormatRules()}

当前格式类别为非选择题、填空题的题目，请按其它题专用规则格式化。

### 其它题专用规则
- 保持紧凑，按通用规则格式化

## 输出格式

你必须以纯 JSON 格式返回，不要包含任何其他文字。

{ "formattedContent": "格式化后的题目内容（Markdown + LaTeX）" }`;
}

export function buildQuestionStepFormatPrompt(questionType: string): string {
  const category = getFormatCategory(questionType);
  switch (category) {
    case "choice":
      return buildChoiceFormatPrompt();
    case "blank":
      return buildBlankFormatPrompt();
    default:
      return buildOtherFormatPrompt();
  }
}
