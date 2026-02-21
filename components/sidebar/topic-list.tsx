"use client";

import { Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GhostButton } from "@/components/ghost-button";

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
          <GhostButton
            key={topic.id}
            layout="text"
            isActive={pathname === `/topics/${topic.id}`}
            asChild
            className="pl-3"
          >
            <Link href={`/topics/${topic.id}`}>
              <Text size="2">{topic.name}</Text>
            </Link>
          </GhostButton>
        ))}
      </Flex>
    </Flex>
  );
}
