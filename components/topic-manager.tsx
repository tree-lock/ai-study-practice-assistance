"use client";

import Link from "next/link";
import { useState } from "react";
import { createTopic, deleteTopic } from "@/app/actions/topic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

export function TopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return (
      <Card className="border-none bg-white shadow-none">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">暂无题库，请先创建。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {topics.map((topic) => (
        <Card key={topic.id} className="border-none bg-white shadow-none">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div>
              <p className="font-bold">{topic.name}</p>
              <p className="text-sm text-muted-foreground">
                {topic.description || "暂无描述"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" asChild>
                <Link href={`/dashboard/topics/${topic.id}`}>进入题库</Link>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (confirm("确认删除该题库吗？")) {
                    await deleteTopic(topic.id);
                  }
                }}
              >
                删除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TopicForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await createTopic({ name, description });

    if (result && "error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : "提交失败，请检查输入信息";
      setError(message);
      setIsSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <Card className="border-none bg-white shadow-none">
      <CardHeader>
        <h2 className="text-lg font-semibold">添加题库</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="topic-name" className="text-sm font-medium">
                名称
              </label>
              <div className="mt-2">
                <Input
                  id="topic-name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="topic-description"
                className="text-sm font-medium"
              >
                描述
              </label>
              <div className="mt-2">
                <textarea
                  id="topic-description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  className="w-full rounded-md border border-input px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : "创建题库"}
            </Button>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
