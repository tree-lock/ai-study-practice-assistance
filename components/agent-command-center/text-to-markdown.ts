/**
 * 将用户输入的文本转换为规范的 Markdown 格式
 * 支持：
 * - 公式识别（LaTeX 格式）
 * - 段落分割
 * - 列表识别
 * - 代码块识别
 */
export function textToMarkdown(input: string): string {
  if (!input || !input.trim()) {
    return "";
  }

  let result = input.trim();

  // 1. 处理行内公式：将 $...$ 转换为 $...$（保持不变，但确保格式正确）
  // 将 \[...\] 或 \((...)\) 转换为块级公式
  result = result.replace(/\\\[([\s\S]*?)\\\]/g, "$$$$\\n$1$$$$\\n");
  result = result.replace(/\\\(([\s\S]*?)\\\)/g, "$$$$\\n$1$$$$\\n");

  // 2. 处理段落：多个空行合并为一个
  result = result.replace(/\n{3,}/g, "\n\n");

  // 3. 处理列表：识别以 -、*、+ 或数字开头的行
  const lines = result.split("\n");
  const processedLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 检查是否是列表项
    const isUnorderedList = /^[-*+]\s/.test(trimmedLine);
    const isOrderedList = /^\d+\.\s/.test(trimmedLine);
    const isListItem = isUnorderedList || isOrderedList;

    if (isListItem) {
      if (!inList) {
        // 开始新的列表，前面加空行
        if (
          processedLines.length > 0 &&
          processedLines[processedLines.length - 1] !== ""
        ) {
          processedLines.push("");
        }
        inList = true;
      }
      // 规范化列表格式
      if (isUnorderedList) {
        processedLines.push(trimmedLine.replace(/^[-*+]\s/, "- "));
      } else {
        processedLines.push(trimmedLine);
      }
    } else {
      if (inList && trimmedLine !== "") {
        // 列表结束
        inList = false;
        // 如果下一行不是空行，添加空行分隔
        if (
          processedLines.length > 0 &&
          processedLines[processedLines.length - 1] !== ""
        ) {
          processedLines.push("");
        }
      }
      processedLines.push(line);
    }
  }

  result = processedLines.join("\n");

  // 4. 处理代码块：识别缩进或多个空格开头的行
  result = result.replace(/^ {4}(.+)$/gm, "```$1```");

  // 5. 确保块级公式前后有空行
  result = result.replace(
    /(\n?)\$\$([\s\S]*?)\$\$(\n?)/g,
    (_match, before, content, after) => {
      const hasBefore = before === "\n";
      const hasAfter = after === "\n";
      return `${hasBefore ? "" : "\n"}$$${content}$$${hasAfter ? "" : "\n"}`;
    },
  );

  // 6. 清理：移除首尾多余空行，但保留内部结构
  result = result.trim();

  return result;
}
