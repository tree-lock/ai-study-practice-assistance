"use client";

import { InfoCircledIcon, MagicWandIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Button,
  Callout,
  Heading,
  Spinner,
  Text,
} from "@radix-ui/themes";
import { useState } from "react";
import {
  generateSolution,
  type QuestionAnswer,
  type QuestionKnowledgePoint,
} from "@/app/actions/question";
import { MarkdownContent } from "./markdown-content";

type SolutionGeneratorProps = {
  questionId: string;
  topicId: string;
  answer: QuestionAnswer | null;
  knowledgePoints: QuestionKnowledgePoint[];
};

export function SolutionGenerator({
  questionId,
  topicId,
  answer: initialAnswer,
  knowledgePoints: initialKnowledgePoints,
}: SolutionGeneratorProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [knowledgePoints] = useState(initialKnowledgePoints);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateSolution(questionId, topicId);
      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setAnswer({
          id: answer?.id ?? "",
          content: result.answer ?? null,
          explanation: result.explanation ?? null,
        });
        setSuggestions(result.suggestions ?? []);
      }
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const hasContent = answer?.content || answer?.explanation;

  return (
    <div className="flex flex-col gap-4">
      {knowledgePoints.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Text size="2" color="gray">
            知识点：
          </Text>
          {knowledgePoints.map((kp) => (
            <Badge key={kp.id} variant="soft" size="1">
              {kp.name}
            </Badge>
          ))}
        </div>
      )}

      {hasContent ? (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {answer?.content && (
            <div>
              <Heading size="3" className="mb-2">
                答案
              </Heading>
              <div className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.content} />
              </div>
            </div>
          )}

          {answer?.explanation && (
            <div>
              <Heading size="3" className="mb-2">
                解析
              </Heading>
              <div className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.explanation} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <Text size="2" color="gray">
            暂无答案和解析
          </Text>
        </div>
      )}

      {suggestions.length > 0 && (
        <Callout.Root color="blue" size="1">
          <Callout.Icon>
            <InfoCircledIcon />
          </Callout.Icon>
          <Callout.Text>
            {suggestions.map((s, i) => (
              <span key={s}>
                {s}
                {i < suggestions.length - 1 ? "；" : ""}
              </span>
            ))}
          </Callout.Text>
        </Callout.Root>
      )}

      {error && (
        <Text size="2" color="red">
          {error}
        </Text>
      )}

      <div className="flex gap-2">
        <Button
          variant={hasContent ? "soft" : "solid"}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? <Spinner size="1" /> : <MagicWandIcon />}
          {hasContent ? "重新生成" : "AI 生成解析"}
        </Button>
      </div>
    </div>
  );
}
