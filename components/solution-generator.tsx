"use client";

import { AutoFixHigh, Info } from "@mui/icons-material";
import {
  Alert,
  Badge,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
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
    <Box className="flex flex-col gap-4">
      {knowledgePoints.length > 0 && (
        <Box className="flex flex-wrap items-center gap-2">
          <Typography variant="body2" color="text.secondary">
            知识点：
          </Typography>
          {knowledgePoints.map((kp) => (
            <Badge key={kp.id} variant="standard" color="primary">
              {kp.name}
            </Badge>
          ))}
        </Box>
      )}

      {hasContent ? (
        <Box className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          {answer?.content && (
            <Box>
              <Typography variant="h6" className="mb-2">
                答案
              </Typography>
              <Box className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.content} />
              </Box>
            </Box>
          )}

          {answer?.explanation && (
            <Box>
              <Typography variant="h6" className="mb-2">
                解析
              </Typography>
              <Box className="rounded-md bg-white p-3">
                <MarkdownContent content={answer.explanation} />
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        <Box className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <Typography variant="body2" color="text.secondary">
            暂无答案和解析
          </Typography>
        </Box>
      )}

      {suggestions.length > 0 && (
        <Alert severity="info" icon={<Info />} sx={{ fontSize: "0.875rem" }}>
          {suggestions.map((s, i) => (
            <span key={s}>
              {s}
              {i < suggestions.length - 1 ? "；" : ""}
            </span>
          ))}
        </Alert>
      )}

      {error && (
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      )}

      <Box className="flex gap-2">
        <Button
          variant={hasContent ? "outlined" : "contained"}
          onClick={handleGenerate}
          disabled={isGenerating}
          startIcon={
            isGenerating ? <CircularProgress size={20} /> : <AutoFixHigh />
          }
        >
          {hasContent ? "重新生成" : "AI 生成解析"}
        </Button>
      </Box>
    </Box>
  );
}
