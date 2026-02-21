"use client";

import dynamic from "next/dynamic";
import { Suspense, use } from "react";
import { LoadingBar } from "@/components/loading-bar";

type QuestionPageProps = {
  params: Promise<{ id: string; questionId: string }>;
};

const QuestionPageContent = dynamic(
  () =>
    import("@/components/question-page-content").then(
      (mod) => mod.QuestionPageContent,
    ),
  {
    ssr: false,
    loading: () => <LoadingBar />,
  },
);

function QuestionPageInner({
  params,
}: {
  params: Promise<{ id: string; questionId: string }>;
}) {
  const { id, questionId } = use(params);
  return <QuestionPageContent topicId={id} questionId={questionId} />;
}

export default function QuestionPage({ params }: QuestionPageProps) {
  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-20 pb-8">
        <Suspense fallback={<LoadingBar />}>
          <QuestionPageInner params={params} />
        </Suspense>
      </div>
    </div>
  );
}
