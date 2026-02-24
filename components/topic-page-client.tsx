"use client";

import dynamic from "next/dynamic";
import { LoadingBar } from "@/components/loading-bar";

type TopicPageClientProps = {
  topicId: string;
};

const TopicPageContent = dynamic(
  () => import("./topic-page-content").then((mod) => mod.TopicPageContent),
  {
    ssr: false,
    loading: () => <LoadingBar />,
  },
);

export function TopicPageClient({ topicId }: TopicPageClientProps) {
  return <TopicPageContent topicId={topicId} />;
}
