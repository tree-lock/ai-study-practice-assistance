"use client";

import { Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GhostButton } from "@/components/ghost-button";
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
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="group flex items-center justify-between pr-1"
          >
            <GhostButton
              layout="text"
              isActive={pathname === `/topics/${topic.id}`}
              asChild
              className="min-w-0 flex-1 pl-3"
            >
              <Link href={`/topics/${topic.id}`}>
                <Text size="2" className="truncate">
                  {topic.name}
                </Text>
              </Link>
            </GhostButton>
            <div className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
              <TopicActionMenu topicId={topic.id} topicName={topic.name} />
            </div>
          </div>
        ))}
      </Flex>
    </Flex>
  );
}
