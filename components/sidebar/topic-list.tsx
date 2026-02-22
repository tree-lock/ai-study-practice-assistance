"use client";

import { Flex, Text } from "@radix-ui/themes";
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
    <Flex direction="column" gap="2">
      <Text as="p" size="2" weight="bold" className="pl-3 whitespace-nowrap">
        题库
      </Text>
      <Flex direction="column">
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
                <Text size="2" className="truncate">
                  {topic.name}
                </Text>
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
      </Flex>
    </Flex>
  );
}
