"use client";

import { useSidebarCollapsed } from "./collapsed-context";
import { SidebarTopicList } from "./topic-list";

type Topic = {
  id: string;
  name: string;
  description: string | null;
  isDefault?: boolean;
};

export function TopicListWithContext({ topics }: { topics: Array<Topic> }) {
  const collapsed = useSidebarCollapsed();
  return <SidebarTopicList topics={topics} collapsed={collapsed} />;
}
