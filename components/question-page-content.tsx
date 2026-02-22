"use client";

import { ArrowLeftIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
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
import { GhostButton } from "./ghost-button";
import { SolutionGenerator } from "./solution-generator";

const TYPE_LABEL: Record<QuestionWithDetails["type"], string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
  application: "应用题",
  proof: "证明题",
  comprehensive: "综合题",
};

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
          <GhostButton layout="icon-text" asChild>
            <Link href={`/topics/${topicId}`}>
              <ArrowLeftIcon />
              返回题库
            </Link>
          </GhostButton>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="4" className="min-h-[calc(100vh-170px)]">
      <GhostButton layout="icon-text" asChild>
        <Link href={`/topics/${topicId}`}>
          <ArrowLeftIcon />
          返回题库
        </Link>
      </GhostButton>

      <Card style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <Flex align="center" gap="2">
          <Badge color="gray" variant="soft">
            {TYPE_LABEL[question.type]}
          </Badge>
          {question.source ? (
            <Badge color="blue" variant="soft">
              {question.source}
            </Badge>
          ) : null}
        </Flex>

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
