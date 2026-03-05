"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { TopicQuestion, TopicTag } from "@/app/actions/question";
import { getTopicDetailById } from "@/app/actions/topic";

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

/** 401/404 时不抛错，返回此结构由页面在 useEffect 中 redirect/notFound，避免渲染中更新 Router */
export type TopicAuthError = {
  __topicError: true;
  code: 401 | 404;
  message: string;
};

export function isTopicAuthError(
  data: TopicData | TopicAuthError,
): data is TopicAuthError {
  return typeof data === "object" && data !== null && "__topicError" in data;
}

/** 供错误边界区分非 401/404 的 HTTP 状态（如 500） */
export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "FetchError";
  }
}

async function fetchTopicData(
  topicId: string,
): Promise<TopicData | TopicAuthError> {
  const res = await getTopicDetailById(topicId);
  if ("error" in res && res.code) {
    const status = res.code === "UNAUTHORIZED" ? 401 : 404;
    return { __topicError: true, code: status, message: res.error };
  }
  if ("data" in res) return res.data;
  throw new FetchError("Failed to fetch", 500);
}

/** 供 prefetch 与 useSuspenseQuery 复用的 query 配置 */
export function getTopicQueryOptions(topicId: string) {
  return {
    queryKey: ["topics", topicId] as const,
    queryFn: () => fetchTopicData(topicId),
  };
}

/**
 * 客户端数据获取 hook，使用 useQuery 避免在渲染中 throw Promise
 *
 * 返回：
 * - data: TopicData | TopicAuthError | undefined
 * - isLoading: 首次加载中
 * - error: 非 401/404 的错误（如 500）
 *
 * 401/404 通过 data.__topicError 返回，由调用方在 useEffect 中 redirect/notFound
 */
export function useTopicData(topicId: string): {
  data: TopicData | TopicAuthError | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery(getTopicQueryOptions(topicId));
  return { data, isLoading, error: error ?? null };
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
