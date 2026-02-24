import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingBar } from "@/components/loading-bar";
import { TopicPageClient } from "@/components/topic-page-client";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";

type TopicPageProps = {
  params: Promise<{ id: string }>;
};

function isValidUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function TopicPageData({ params }: TopicPageProps) {
  const { id } = await params;

  const isUuid = isValidUuid(id);

  if (!isUuid) {
    notFound();
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    notFound();
  }

  const topic = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, id), eq(topics.userId, userId)))
    .limit(1);

  if (topic.length === 0) {
    notFound();
  }

  return <TopicPageClient topicId={id} />;
}

export default function TopicPage({ params }: TopicPageProps) {
  return (
    <div className="relative">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 pt-20 pb-8">
        <Suspense fallback={<LoadingBar />}>
          <TopicPageData params={params} />
        </Suspense>
      </div>
    </div>
  );
}
