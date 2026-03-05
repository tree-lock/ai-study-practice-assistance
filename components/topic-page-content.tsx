"use client";

import { notFound, redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { isTopicAuthError, useTopicData } from "@/lib/hooks/use-topic-data";
import { LoadingBar } from "./loading-bar";
import { QuestionCard } from "./question-card";
import { TagFilter } from "./tag-filter";
import { TopicHeader } from "./topic-header";
import { TopicTabs } from "./topic-tabs";

type TopicPageContentProps = {
  topicId: string;
};

export function TopicPageContent({ topicId }: TopicPageContentProps) {
  const { data, isLoading, error } = useTopicData(topicId);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  useEffect(() => {
    if (data && isTopicAuthError(data)) {
      if (data.code === 404) notFound();
      if (data.code === 401) redirect("/");
    }
  }, [data]);

  if (isLoading) {
    return <LoadingBar />;
  }

  if (error) {
    return (
      <div className="py-12 text-center text-gray-500">加载失败，请重试。</div>
    );
  }

  if (!data || isTopicAuthError(data)) {
    return <LoadingBar />;
  }

  const { topic, questions, tags } = data;

  return (
    <>
      <TopicHeader
        topicId={topicId}
        name={topic.name}
        description={topic.description}
        outline={topic.outline}
      />
      <div className="flex flex-col gap-4">
        <TopicTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <TagFilter
          tags={tags}
          selectedTagId={selectedTagId}
          onTagSelect={setSelectedTagId}
        />
        {questions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            还没有题目，点击右上角「创建」添加第一道题吧。
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                topicId={topicId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
