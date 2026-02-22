"use client";

import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TopicActionMenu } from "@/components/topic-action-menu";

type Topic = {
  id: string;
  name: string;
  description: string | null;
};

type SidebarTopicListProps = {
  topics: Array<Topic>;
  collapsed: boolean;
};

export function SidebarTopicList({ topics, collapsed }: SidebarTopicListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <Typography
        variant="body2"
        fontWeight="bold"
        className="pl-3 py-1.5 whitespace-nowrap"
      >
        题库
      </Typography>
      <Box display="flex" flexDirection="column">
        {topics.map((topic) => {
          const isActive = pathname === `/topics/${topic.id}`;
          return (
            <div
              key={topic.id}
              className={`group flex items-center rounded-md transition-colors ${
                isActive
                  ? "bg-blue-200"
                  : "bg-transparent hover:bg-gray-200 active:bg-gray-300"
              }`}
            >
              <Link
                href={`/topics/${topic.id}`}
                className="min-w-0 flex-1 py-1.5 pl-3 pr-2 text-[13px] text-gray-700 no-underline"
              >
                <Typography variant="body2" className="truncate">
                  {topic.name}
                </Typography>
              </Link>
              <div
                className={`transition-opacity ${
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-has-[[data-state='open']]:opacity-100"
                }`}
              >
                <TopicActionMenu topicId={topic.id} topicName={topic.name} />
              </div>
            </div>
          );
        })}
      </Box>
    </Box>
  );
}
