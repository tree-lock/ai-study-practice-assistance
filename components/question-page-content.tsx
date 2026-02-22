"use client";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Separator,
  Text,
} from "@radix-ui/themes";
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
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="4"
          className="h-full py-9"
        >
          <Heading size="4">题目不存在或无权限访问</Heading>
          <div className="p-px">
            <Button variant="ghost" color="gray" asChild>
              <Link href={`/topics/${topicId}`}>
                <ArrowLeftIcon />
                返回题库
              </Link>
            </Button>
          </div>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="4" className="min-h-[calc(100vh-170px)]">
      <div className="p-px w-fit">
        <Button variant="ghost" color="gray" asChild>
          <Link href={`/topics/${topicId}`}>
            <ArrowLeftIcon />
            返回题库
          </Link>
        </Button>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Box className="prose prose-sm max-w-none py-4">
          <QuestionMarkdownContent questionMarkdown={question.content} />
        </Box>

        <Separator size="4" className="my-4" />

        <Heading size="4" className="mb-4">
          答案与解析
        </Heading>

        <SolutionGenerator
          questionId={questionId}
          topicId={topicId}
          answer={question.answer}
          knowledgePoints={question.knowledgePoints}
        />

        <Flex
          align="center"
          justify="between"
          className="mt-auto pt-4 border-t"
        >
          <Text size="1" color="gray">
            创建者：{question.creator?.name ?? "匿名用户"}
          </Text>
          <Text size="1" color="gray">
            创建时间：
            {new Date(question.createdAt).toLocaleDateString("zh-CN")}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
