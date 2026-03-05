"use client";

import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FetchError } from "@/lib/hooks/use-topic-data";

type TopicPageErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function TopicPageError({ error, reset }: TopicPageErrorProps) {
  if (error instanceof FetchError) {
    if (error.status === 404) {
      notFound();
    }
    if (error.status === 401) {
      redirect("/");
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 pt-20 pb-8">
      <p className="text-muted-foreground">加载失败，请重试。</p>
      <Button type="button" onClick={reset}>
        重试
      </Button>
    </div>
  );
}
