import { MINIMAX_MODEL, minimax } from "../minimax";
import {
  buildSolutionGeneratePrompt,
  type KnowledgePointForPrompt,
} from "../prompts/solution-generate";
import type { SolutionGenerationResult } from "../types";

export async function generateSolution(
  questionContent: string,
  questionType: string,
  knowledgePoints: KnowledgePointForPrompt[],
): Promise<SolutionGenerationResult> {
  const prompt = buildSolutionGeneratePrompt(
    questionContent,
    questionType,
    knowledgePoints,
  );

  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 4096,
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

  const parsed = JSON.parse(jsonStr) as SolutionGenerationResult;

  if (!parsed.answer || typeof parsed.answer !== "string") {
    parsed.answer = "";
  }

  if (!parsed.explanation || typeof parsed.explanation !== "string") {
    parsed.explanation = "";
  }

  if (!Array.isArray(parsed.matchedKnowledgePointIds)) {
    parsed.matchedKnowledgePointIds = [];
  }

  if (!Array.isArray(parsed.suggestions)) {
    parsed.suggestions = [];
  }

  const validKpIds = new Set(knowledgePoints.map((kp) => kp.id));
  parsed.matchedKnowledgePointIds = parsed.matchedKnowledgePointIds.filter(
    (id) => validKpIds.has(id),
  );

  return parsed;
}
