"use client";

import { useSidebarCollapsed } from "./collapsed-context";
import type { SidebarTaskItem } from "./index";
import { SidebarTaskList } from "./task-list";

export function TaskListWithContext({ tasks }: { tasks: SidebarTaskItem[] }) {
  const collapsed = useSidebarCollapsed();
  return <SidebarTaskList tasks={tasks} collapsed={collapsed} />;
}
