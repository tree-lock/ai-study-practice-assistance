"use client";

import { useState } from "react";
import { useTopicData } from "@/lib/hooks/use-topic-data";
import { QuestionCard } from "./question-card";
import { TagFilter } from "./tag-filter";
import { TopicHeader } from "./topic-header";
import { TopicTabs } from "./topic-tabs";

type TopicPageContentProps = {
  topicId: string;
};

export function TopicPageContent({ topicId }: TopicPageContentProps) {
  const { topic, questions, tags } = useTopicData(topicId);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  return (
    <>
      <TopicHeader name={topic.name} description={topic.description} />
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
