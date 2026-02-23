"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createQuestionsInTopic,
  type TopicQuestion,
} from "@/app/actions/question";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/ai/types";

type TopicQuestionsProps = {
  topicId: string;
  initialQuestions: Array<TopicQuestion>;
};

export function TopicQuestions({
  topicId,
  initialQuestions,
}: TopicQuestionsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("subjective");
  const [files, setFiles] = useState<Array<string>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await createQuestionsInTopic({
      topicId,
      content,
      source,
      type: questionType,
      fileNames: files,
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(`已创建 ${result.count} 道题目`);
    setContent("");
    setSource("");
    setFiles([]);
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="border-none bg-white shadow-none">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">上传题目到当前题库</h2>

              <div>
                <label
                  htmlFor="topic-questions-content"
                  className="text-sm font-medium"
                >
                  题目文本（可选）
                </label>
                <div className="mt-2">
                  <textarea
                    id="topic-questions-content"
                    placeholder="可直接粘贴题干；如果只上传图片/PDF，这里可以留空"
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent(e.target.value)
                    }
                    className="w-full rounded-md border border-input px-3 py-2 text-sm"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="min-w-[180px]">
                  <label
                    htmlFor="topic-questions-type"
                    className="text-sm font-medium"
                  >
                    题目类型
                  </label>
                  <div className="mt-2">
                    <Select
                      value={questionType}
                      onValueChange={(value: string) =>
                        setQuestionType(value as QuestionType)
                      }
                    >
                      <SelectTrigger id="topic-questions-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="choice">选择题</SelectItem>
                        <SelectItem value="blank">填空题</SelectItem>
                        <SelectItem value="subjective">主观题</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="min-w-[240px] flex-1">
                  <label
                    htmlFor="topic-questions-source"
                    className="text-sm font-medium"
                  >
                    题目来源（可选）
                  </label>
                  <div className="mt-2">
                    <Input
                      id="topic-questions-source"
                      placeholder="例如：2025 考研数学一"
                      value={source}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSource(e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="topic-questions-files"
                  className="text-sm font-medium"
                >
                  上传图片/PDF（可多选）
                </label>
                <div className="mt-2">
                  <input
                    id="topic-questions-files"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const selected = Array.from(e.target.files ?? []).map(
                        (file) => file.name,
                      );
                      setFiles(selected);
                    }}
                  />
                </div>
                {files.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {files.map((name) => (
                      <Badge key={name} variant="secondary">
                        {name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  当前版本先落库题目和文件名占位，下一步可接入 OCR/PDF
                  解析流水线。
                </p>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "上传中..." : "上传题目"}
                </Button>
              </div>

              {error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : null}
              {success ? (
                <p className="text-sm text-green-600">{success}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none bg-white shadow-none">
        <CardContent className="flex flex-col gap-3 pt-6">
          <h2 className="text-lg font-semibold">本题库题目</h2>
          {initialQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有题目，先上传第一道题吧。
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {initialQuestions.map((question) => (
                <Card
                  key={question.id}
                  className="border-none bg-[#f7f7f8] shadow-none"
                >
                  <CardContent className="flex flex-col gap-2 pt-4">
                    <div className="flex items-center gap-2">
                      <Badge>{QUESTION_TYPE_LABELS[question.type]}</Badge>
                      {question.source ? (
                        <Badge variant="secondary">{question.source}</Badge>
                      ) : null}
                    </div>
                    <p className="text-sm">{question.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
