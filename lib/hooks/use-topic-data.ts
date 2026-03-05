"use client";

import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import type { TopicQuestion, TopicTag } from "@/app/actions/question";

type TopicInfo = {
  id: string;
  name: string;
  description: string | null;
  outline: string | null;
};

export type TopicData = {
  topic: TopicInfo;
  questions: Array<TopicQuestion>;
  tags: Array<TopicTag>;
};

/** 供错误边界区分 404/401 等 HTTP 状态 */
export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

async function fetcher(url: string): Promise<TopicData> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    const message = body.error ?? "Failed to fetch";
    throw new FetchError(message, res.status);
  }
  return res.json();
}

/** 供 prefetch 与 useSuspenseQuery 复用的 query 配置 */
export function getTopicQueryOptions(topicId: string) {
  return {
    queryKey: ["topics", topicId] as const,
    queryFn: () => fetcher(`/api/topics/${topicId}`),
  };
}

/**
 * 客户端数据获取 hook，使用 TanStack Query suspense 模式
 *
 * 工作原理：
 * 1. useSuspenseQuery 在 loading 时 throw promise，触发 Suspense boundary
 * 2. 数据加载完成后缓存在 QueryClient 中
 * 3. 再次访问页面时，优先显示缓存数据（无需等待）
 */
export function useTopicData(topicId: string): TopicData {
  const { data } = useSuspenseQuery(getTopicQueryOptions(topicId));
  return data;
}

/**
 * 返回使 topic 缓存失效的函数，在数据变更后调用（如创建/删除题目）
 */
export function useInvalidateTopicCache(): (topicId: string) => void {
  const queryClient = useQueryClient();
  return (topicId: string) => {
    queryClient.invalidateQueries({ queryKey: ["topics", topicId] });
  };
}

/**
 * 返回乐观更新题目列表缓存的函数
 */
export function useUpdateTopicQuestionsCache(): (
  topicId: string,
  updater: (questions: Array<TopicQuestion>) => Array<TopicQuestion>,
) => void {
  const queryClient = useQueryClient();
  return (topicId: string, updater) => {
    queryClient.setQueryData<TopicData>(["topics", topicId], (prev) => {
      if (!prev) return prev;
      return { ...prev, questions: updater(prev.questions) };
    });
  };
}

/**
 * 返回更新题库大纲缓存的函数
 */
export function useUpdateTopicOutlineCache(): (
  topicId: string,
  outline: string,
) => void {
  const queryClient = useQueryClient();
  return (topicId: string, outline: string) => {
    queryClient.setQueryData<TopicData>(["topics", topicId], (prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        topic: { ...prev.topic, outline },
      };
    });
  };
}
