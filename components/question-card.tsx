"use client";

import { Badge, Card, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import type { TopicQuestion } from "@/app/actions/question";
import { QuestionMarkdownContent } from "./agent-command-center/question-markdown-content";

type QuestionCardProps = {
  question: TopicQuestion;
  topicId: string;
};

const TYPE_LABEL: Record<TopicQuestion["type"], string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
  application: "应用题",
  proof: "证明题",
  comprehensive: "综合题",
};

export function QuestionCard({ question, topicId }: QuestionCardProps) {
  return (
    <Link
      href={`/topics/${topicId}/questions/${question.id}`}
      className="block no-underline"
    >
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <Flex direction="column" gap="2">
          <div className="w-fit">
            <Badge color="gray" variant="soft">
              {TYPE_LABEL[question.type]}
            </Badge>
          </div>
          <div className="line-clamp-3">
            <QuestionMarkdownContent questionMarkdown={question.content} />
          </div>
          <Flex align="center" justify="between" className="mt-auto pt-4">
            <Text size="1" color="gray">
              {question.creator?.name ?? "匿名用户"}
            </Text>
            <Text size="1" color="gray">
              已做 0 次
            </Text>
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
}
