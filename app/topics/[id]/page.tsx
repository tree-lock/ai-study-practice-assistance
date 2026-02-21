"use client";

import dynamic from "next/dynamic";
import { Suspense, use } from "react";
import { LoadingBar } from "@/components/loading-bar";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

const TopicPageContent = dynamic(
  () =>
    import("@/components/topic-page-content").then(
      (mod) => mod.TopicPageContent,
    ),
  {
    ssr: false,
    loading: () => <LoadingBar />,
  },
);

function TopicPageInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <TopicPageContent topicId={id} />;
}

export default function TopicPage({ params }: TopicPageProps) {
  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-20 pb-8">
        <Suspense fallback={<LoadingBar />}>
          <TopicPageInner params={params} />
        </Suspense>
      </div>
    </div>
  );
}
