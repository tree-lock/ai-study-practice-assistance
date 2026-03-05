"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopicActionMenu } from "@/components/topic-action-menu";
import { getTopicQueryOptions } from "@/lib/hooks/use-topic-data";

type Topic = {
  id: string;
  name: string;
  description: string | null;
  isDefault?: boolean;
};

type SidebarTopicListProps = {
  topics: Array<Topic>;
  collapsed: boolean;
};

export function SidebarTopicList({ topics, collapsed }: SidebarTopicListProps) {
  const pathname = usePathname();
  const queryClient = useQueryClient();

  if (collapsed) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-nowrap pl-3 text-sm font-bold text-sidebar-foreground">
        题库
      </p>
      <div className="flex flex-col">
        {topics.map((topic) => {
          const isActive = pathname === `/topics/${topic.id}`;
          return (
            <div
              key={topic.id}
              className={`group flex items-center rounded-md transition-colors ${
                isActive
                  ? "bg-sidebar-primary"
                  : "bg-transparent hover:bg-sidebar-accent active:bg-sidebar-accent/80"
              }`}
            >
              <Link
                href={`/topics/${topic.id}`}
                className="min-w-0 flex-1 py-1.5 pl-3 pr-2 text-[13px] text-sidebar-foreground no-underline hover:text-sidebar-accent-foreground"
                onMouseEnter={() =>
                  queryClient.prefetchQuery(getTopicQueryOptions(topic.id))
                }
                onFocus={() =>
                  queryClient.prefetchQuery(getTopicQueryOptions(topic.id))
                }
              >
                <span
                  className={`truncate text-sm ${isActive ? "text-sidebar-primary-foreground" : ""}`}
                >
                  {topic.name}
                </span>
              </Link>
              <div
                className={`flex items-center pr-1.5 transition-opacity ${
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-has-data-[state=open]:opacity-100"
                }`}
              >
                <TopicActionMenu
                  topicId={topic.id}
                  topicName={topic.name}
                  isDefault={topic.isDefault}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
