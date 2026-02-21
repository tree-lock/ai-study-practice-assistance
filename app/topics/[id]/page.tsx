import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getQuestionsByTopic, getTagsByTopic } from "@/app/actions/question";
import { getTopicById } from "@/app/actions/topic";
import { TopicContent } from "@/components/topic-content";
import { TopicHeader } from "@/components/topic-header";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

async function TopicPageContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;

  const topic = await getTopicById(id);
  if (!topic) {
    notFound();
  }

  const [questions, tags] = await Promise.all([
    getQuestionsByTopic(id),
    getTagsByTopic(id),
  ]);

  return (
    <>
      <TopicHeader
        name={topic.name}
        description={topic.description}
        topicId={id}
      />
      <TopicContent
        topicId={id}
        initialQuestions={questions}
        initialTags={tags}
      />
    </>
  );
}

function TopicPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-10 w-48 rounded bg-gray-200" />
      <div className="h-5 w-64 rounded bg-gray-200" />
      <div className="h-10 w-80 rounded bg-gray-200" />
      <div className="mt-4 h-8 w-full rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function TopicPage({ params }: TopicPageProps) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-16 pb-8">
      <Suspense fallback={<TopicPageSkeleton />}>
        <TopicPageContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
