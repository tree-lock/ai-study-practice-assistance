"use client";

import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
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
        <CardContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
              <Chip
                label={TYPE_LABEL[question.type]}
                size="small"
                color="default"
              />
            </Box>
            <div className="line-clamp-3">
              <QuestionMarkdownContent questionMarkdown={question.content} />
            </div>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              className="mt-auto pt-2"
            >
              <Typography variant="caption" color="text.secondary">
                {question.creator?.name ?? "匿名用户"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                已做 0 次
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
