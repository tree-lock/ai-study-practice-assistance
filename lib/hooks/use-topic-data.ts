"use client";

import useSWR, { mutate } from "swr";
import type { TopicQuestion, TopicTag } from "@/app/actions/question";

type TopicData = {
  questions: Array<TopicQuestion>;
  tags: Array<TopicTag>;
};

/**
 * 客户端缓存 hook，用于缓存 topic 页面数据
 *
 * 工作原理：
 * 1. 首次访问：Server Component 获取数据 -> 传给客户端作为 fallbackData
 * 2. 返回页面：SWR 立即显示缓存数据（无需等待）
 * 3. 后台重新验证：可选，通过 revalidateOnFocus 等配置
 */
export function useTopicData(
  topicId: string,
  fallbackData?: TopicData,
): TopicData & { isLoading: boolean } {
  const { data, isLoading } = useSWR<TopicData>(
    `topic-${topicId}`,
    null, // 不需要 fetcher，数据来自 Server Component
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    },
  );

  return {
    questions: data?.questions ?? [],
    tags: data?.tags ?? [],
    isLoading,
  };
}

/**
 * 预热缓存 - 在 Server Component 中调用，将数据写入 SWR 缓存
 * 这样客户端组件首次渲染时就能立即获取数据
 */
export function prefillTopicCache(topicId: string, data: TopicData) {
  mutate(`topic-${topicId}`, data, false);
}

/**
 * 更新缓存 - 在数据变更后调用（如创建/删除题目）
 */
export function invalidateTopicCache(topicId: string) {
  mutate(`topic-${topicId}`);
}

/**
 * 乐观更新缓存 - 立即更新 UI，无需等待服务端响应
 */
export function updateTopicQuestionsCache(
  topicId: string,
  updater: (questions: Array<TopicQuestion>) => Array<TopicQuestion>,
) {
  mutate(
    `topic-${topicId}`,
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
