"use client";

import { ArrowBack } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getQuestionWithDetails,
  type QuestionWithDetails,
} from "@/app/actions/question";
import { QuestionMarkdownContent } from "./agent-command-center/question-markdown-content";
import { SolutionGenerator } from "./solution-generator";

type QuestionPageContentProps = {
  topicId: string;
  questionId: string;
};

export function QuestionPageContent({
  topicId,
  questionId,
}: QuestionPageContentProps) {
  const [question, setQuestion] = useState<QuestionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        const data = await getQuestionWithDetails(questionId, topicId);
        setQuestion(data);
      } catch (error) {
        console.error("Failed to fetch question:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestion();
  }, [questionId, topicId]);

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!question) {
    return (
      <Card className="min-h-[calc(100vh-170px)]">
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            className="h-full py-9"
          >
            <Typography variant="h6">题目不存在或无权限访问</Typography>
            <div className="p-px">
              <Button
                component={Link}
                href={`/topics/${topicId}`}
                color="inherit"
                startIcon={<ArrowBack />}
              >
                返回题库
              </Button>
            </div>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      className="min-h-[calc(100vh-170px)]"
    >
      <div className="p-px w-fit">
        <Button
          component={Link}
          href={`/topics/${topicId}`}
          color="inherit"
          startIcon={<ArrowBack />}
        >
          返回题库
        </Button>
      </div>

      <Card sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent>
          <Box className="prose prose-sm max-w-none py-4">
            <QuestionMarkdownContent questionMarkdown={question.content} />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" className="mb-4">
            答案与解析
          </Typography>

          <SolutionGenerator
            questionId={questionId}
            topicId={topicId}
            answer={question.answer}
            knowledgePoints={question.knowledgePoints}
          />

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            className="mt-auto pt-4 border-t"
          >
            <Typography variant="caption" color="text.secondary">
              创建者：{question.creator?.name ?? "匿名用户"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              创建时间：
              {new Date(question.createdAt).toLocaleDateString("zh-CN")}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
