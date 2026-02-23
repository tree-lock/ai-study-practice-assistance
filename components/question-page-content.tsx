"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getQuestionWithDetails,
  type QuestionWithDetails,
} from "@/app/actions/question";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    let ignored = false;
    async function fetchQuestion() {
      try {
        const data = await getQuestionWithDetails(questionId, topicId);
        if (!ignored) setQuestion(data);
      } catch (error) {
        if (!ignored) console.error("Failed to fetch question:", error);
      } finally {
        if (!ignored) setLoading(false);
      }
    }
    fetchQuestion();
    return () => {
      ignored = true;
    };
  }, [questionId, topicId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!question) {
    return (
      <Card className="min-h-[calc(100vh-170px)]">
        <div className="flex h-full flex-col items-center justify-center gap-4 py-9">
          <h2 className="text-lg font-semibold">题目不存在或无权限访问</h2>
          <Button variant="ghost" asChild>
            <Link href={`/topics/${topicId}`}>
              <ArrowLeft className="size-4" />
              返回题库
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-170px)] flex-col gap-4">
      <div className="w-fit p-px">
        <Button variant="ghost" asChild>
          <Link href={`/topics/${topicId}`}>
            <ArrowLeft className="size-4" />
            返回题库
          </Link>
        </Button>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardContent className="flex flex-col pt-6">
          <div className="prose prose-sm max-w-none py-4">
            <QuestionMarkdownContent questionMarkdown={question.content} />
          </div>

          <hr className="my-4 border-border" />

          <h2 className="mb-4 text-lg font-semibold">答案与解析</h2>

          <SolutionGenerator
            questionId={questionId}
            topicId={topicId}
            answer={question.answer}
            knowledgePoints={question.knowledgePoints}
          />

          <div className="mt-auto flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              创建者：{question.creator?.name ?? "匿名用户"}
            </p>
            <p className="text-xs text-muted-foreground">
              创建时间：
              {new Date(question.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
