import { Badge, Card, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import type { TopicQuestion } from "@/app/actions/question";

type QuestionCardProps = {
  question: TopicQuestion;
  topicId: string;
};

const TYPE_LABEL: Record<TopicQuestion["type"], string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
};

export function QuestionCard({ question, topicId }: QuestionCardProps) {
  const contentPreview =
    question.content.length > 80
      ? `${question.content.slice(0, 80)}...`
      : question.content;

  return (
    <Link
      href={`/topics/${topicId}/questions/${question.id}`}
      className="block no-underline"
    >
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <Flex direction="column" gap="2">
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
          <Text size="2" className="line-clamp-3">
            {contentPreview}
          </Text>
          <Flex align="center" justify="between" className="mt-auto pt-2">
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
