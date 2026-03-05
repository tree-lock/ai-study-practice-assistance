"use client";

import { useParams } from "next/navigation";
import { Suspense } from "react";
import { LoadingBar } from "@/components/loading-bar";
import { TopicPageClient } from "@/components/topic-page-client";

export default function TopicPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-20 pb-8">
        <Suspense fallback={<LoadingBar />}>
          <TopicPageClient topicId={id} />
        </Suspense>
      </div>
    </div>
  );
}
