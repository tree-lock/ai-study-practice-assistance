"use client";

import { useState } from "react";
import type { TopicQuestion, TopicTag } from "@/app/actions/question";
import { useTopicData } from "@/lib/hooks/use-topic-data";
import { QuestionCard } from "./question-card";
import { TagFilter } from "./tag-filter";
import { TopicTabs } from "./topic-tabs";

type TopicContentProps = {
  topicId: string;
  initialQuestions: Array<TopicQuestion>;
  initialTags: Array<TopicTag>;
};

export function TopicContent({
  topicId,
  initialQuestions,
  initialTags,
}: TopicContentProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const { questions, tags } = useTopicData(topicId, {
    questions: initialQuestions,
    tags: initialTags,
  });

  return (
    <div className="flex flex-col">
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
  );
}
