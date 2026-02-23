"use client";

import Link from "next/link";
import type { TopicQuestion } from "@/app/actions/question";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        <CardContent className="flex flex-col gap-2 pt-6">
          <div className="w-fit">
            <Badge variant="secondary">{TYPE_LABEL[question.type]}</Badge>
          </div>
          <div className="line-clamp-3">
            <QuestionMarkdownContent questionMarkdown={question.content} />
          </div>
          <div className="mt-auto flex items-center justify-between pt-4">
            <span className="text-xs text-muted-foreground">
              {question.creator?.name ?? "匿名用户"}
            </span>
            <span className="text-xs text-muted-foreground">已做 0 次</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
