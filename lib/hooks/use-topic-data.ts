"use client";

import useSWR, { mutate } from "swr";
import type { TopicQuestion, TopicTag } from "@/app/actions/question";

type TopicInfo = {
  id: string;
  name: string;
  description: string | null;
};

type TopicData = {
  topic: TopicInfo;
  questions: Array<TopicQuestion>;
  tags: Array<TopicTag>;
};

async function fetcher(url: string): Promise<TopicData> {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
}

/**
 * 客户端数据获取 hook，使用 SWR suspense 模式
 *
 * 工作原理：
 * 1. 使用 suspense: true，数据加载时会触发 Suspense boundary
 * 2. 数据加载完成后缓存在 SWR 中
 * 3. 再次访问页面时，优先显示缓存数据（无需等待）
 */
export function useTopicData(topicId: string): TopicData {
  const { data } = useSWR<TopicData>(`/api/topics/${topicId}`, fetcher, {
    suspense: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return data as TopicData;
}

/**
 * 使缓存失效 - 在数据变更后调用（如创建/删除题目）
 */
export function invalidateTopicCache(topicId: string) {
  mutate(`/api/topics/${topicId}`);
}

/**
 * 乐观更新缓存 - 立即更新 UI，无需等待服务端响应
 */
export function updateTopicQuestionsCache(
  topicId: string,
  updater: (questions: Array<TopicQuestion>) => Array<TopicQuestion>,
) {
  mutate(
    `/api/topics/${topicId}`,
    (current: TopicData | undefined) => {
      if (!current) return current;
      return {
        ...current,
        questions: updater(current.questions),
      };
    },
    false,
  );
}
