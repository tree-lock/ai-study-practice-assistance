import { MINIMAX_MODEL, minimax } from "../minimax";
import { buildOutlineGeneratePrompt } from "../prompts/outline-generate";

export async function generateOutline(topicName: string): Promise<string> {
  const prompt = buildOutlineGeneratePrompt(topicName);

  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 未返回有效的文本响应");
  }

  const outline = textBlock.text.trim();

  if (!outline || outline.length < 10) {
    throw new Error("AI 返回的大纲内容无效");
  }

  return outline;
}

export async function generateKnowledgePointsFromOutline(
  outline: string,
  topicName: string,
): Promise<string[]> {
  const prompt = `你是一个知识点提取助手。根据题库名称和大纲描述，生成该题库应包含的知识点列表。

## 输入
题库名称：${topicName}
大纲描述：${outline}

## 知识点规则

- 知识点必须简短精炼（2-4 个字）
- 不要添加"的计算"、"的应用"、"的性质"等修饰词
- 知识点应该覆盖大纲描述中的核心内容
- 数量控制在 5-15 个

## 输出格式

必须以纯 JSON 数组格式返回，不要包含任何其他文字：

["知识点1", "知识点2", ...]`;

  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 未返回有效的文本响应");
  }

  const responseText = textBlock.text.trim();

  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as string[];

  if (!Array.isArray(parsed)) {
    throw new Error("AI 返回的知识点格式无效");
  }

  return parsed.filter(
    (kp) => typeof kp === "string" && kp.length >= 2 && kp.length <= 10,
  );
}
