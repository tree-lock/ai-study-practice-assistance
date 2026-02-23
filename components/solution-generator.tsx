"use client";

import { Info, Wand2 } from "lucide-react";
import { useState } from "react";
import {
  generateSolution,
  type QuestionAnswer,
  type QuestionKnowledgePoint,
} from "@/app/actions/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";
import { Spinner } from "@/components/ui/spinner";
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
          <span className="text-sm text-muted-foreground">知识点：</span>
          {knowledgePoints.map((kp) => (
            <Badge key={kp.id} variant="secondary">
              {kp.name}
            </Badge>
          ))}
        </div>
      )}

      {hasContent ? (
        <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {answer?.content && (
            <div>
              <h3 className="mb-2 text-base font-semibold">答案</h3>
              <div className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.content} />
              </div>
            </div>
          )}

          {answer?.explanation && (
            <div>
              <h3 className="mb-2 text-base font-semibold">解析</h3>
              <div className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.explanation} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-sm text-muted-foreground">暂无答案和解析</p>
        </div>
      )}

      {suggestions.length > 0 && (
        <Callout icon={<Info className="size-4" />}>
          {suggestions.map((s, i) => (
            <span key={s}>
              {s}
              {i < suggestions.length - 1 ? "；" : ""}
            </span>
          ))}
        </Callout>
      )}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button
          variant={hasContent ? "secondary" : "default"}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Spinner className="size-4" />
          ) : (
            <Wand2 className="size-4" />
          )}
          {hasContent ? "重新生成" : "AI 生成解析"}
        </Button>
      </div>
    </div>
  );
}
