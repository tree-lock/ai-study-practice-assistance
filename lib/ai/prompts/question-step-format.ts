type FormatCategory = "choice" | "blank" | "other";

function getFormatCategory(questionType: string): FormatCategory {
  if (questionType === "choice") return "choice";
  if (questionType === "blank") return "blank";
  return "other"; // subjective, application, proof, comprehensive
}

function buildCommonFormatRules(): string {
  return `### 通用
- 删科目名、题号、答题区、图片链接
- 公式用 LaTeX：行内 $...$，行间 $$...$$
- 保持紧凑，仅选项/多小题分段
- **只格式化题目，禁止包含答案或解析**：若原文有「解」「解:」「答案」「解析」等，必须删除其后全部内容，仅保留题干
- 括号半角/全角一致，LaTeX 无误`;
}

const STREAM_OUTPUT_INSTRUCTION = `
## 输出
仅输出 Markdown 格式化的题目，无 JSON、无说明。
若原文本已经符合格式要求，请原封不动地输出。
若原文本包含了不该包含的内容（答案、解析等），删除不该包含的内容后输出。
若原文本缺少填空或格式不规范，请在合适的位置补充或修正后输出。`;

function buildChoiceFormatRules(): string {
  return `### 选择题
- 题目描述加粗；选项用 **（A）** **（B）** 等，每项独占一段`;
}

function buildChoiceFormatPrompt(): string {
  return `请检查并在必要时轻量修正下面这道选择题的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}
${buildChoiceFormatRules()}

请你输出正确格式的题目，仅输出题目 Markdown+Latex 格式化后的文本，不输出任何其它内容。
若原文本已经符合格式要求，请原封不动地输出。
若原文本包含了不该包含的内容，删除不该包含的内容后输出。`;
}

function buildChoiceFormatStreamPrompt(): string {
  return `请检查并在必要时轻量修正下面这道选择题的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}
${buildChoiceFormatRules()}
${STREAM_OUTPUT_INSTRUCTION}`;
}

function buildBlankFormatRules(): string {
  return `### 填空题
检查上述题目是否符合格式：
1. 应当包含 "10" 个连续下划线 ________，而不是 latex 格式的下划线，下划线前后应有空格；
2. 符合 Latex 的正确格式；
3. 应当只包含题目，不包含答案和解析

请你输出正确格式的题目，仅输出题目 Markdown+Latex 格式化后的文本，不输出任何其它内容。
若原文本已经符合格式要求，请原封不动地输出。
若原文本包含了不该包含的内容，删除不该包含的内容后输出。
若原文本缺少填空题需要的下划线，请在合适的位置补充后输出。`;
}

function buildBlankFormatPrompt(): string {
  return `请检查并在必要时轻量修正下面这道填空题的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}
${buildBlankFormatRules()}`;
}

function buildBlankFormatStreamPrompt(): string {
  return `请检查并在必要时轻量修正下面这道填空题的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}
${buildBlankFormatRules()}
${STREAM_OUTPUT_INSTRUCTION}`;
}

function buildOtherFormatPrompt(): string {
  return `请检查并在必要时轻量修正下面这道题目的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}

### 其它题
- 保持紧凑

请你输出正确格式的题目，仅输出题目 Markdown+Latex 格式化后的文本，不输出任何其它内容。
若原文本已经符合格式要求，请原封不动地输出。
若原文本包含了不该包含的内容，删除不该包含的内容后输出。`;
}

function buildOtherFormatStreamPrompt(): string {
  return `请检查并在必要时轻量修正下面这道题目的格式，确保满足给定的格式规则，不改变题意。

${buildCommonFormatRules()}

### 其它题
- 保持紧凑
${STREAM_OUTPUT_INSTRUCTION}`;
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

export function buildQuestionStepFormatStreamPrompt(
  questionType: string,
): string {
  const category = getFormatCategory(questionType);
  switch (category) {
    case "choice":
      return buildChoiceFormatStreamPrompt();
    case "blank":
      return buildBlankFormatStreamPrompt();
    default:
      return buildOtherFormatStreamPrompt();
  }
}
