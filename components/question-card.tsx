"use client";

import Link from "next/link";
import type { TopicQuestion } from "@/app/actions/question";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
      className="block min-w-0 no-underline"
    >
      <Card className="h-48 cursor-pointer  overflow-hidden pb-1 transition-shadow hover:shadow-md">
        <CardContent className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="w-fit shrink-0">
            <Badge variant="secondary">{TYPE_LABEL[question.type]}</Badge>
          </div>
          <div className="line-clamp-3 wrap-break-word">
            <QuestionMarkdownContent questionMarkdown={question.content} />
          </div>
        </CardContent>
        <CardFooter className="shrink-0 border-t px-2.5 pt-0">
          <div className="mt-auto flex min-w-0 items-center w-full justify-between gap-2 pt-1">
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {question.creator?.name ?? "匿名用户"}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              已做 0 次
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
