"use client";

import { useState } from "react";
import { SidebarActions } from "./actions";
import { SidebarCollapsedProvider } from "./collapsed-context";
import { SidebarTaskList } from "./task-list";
import { SidebarFooter, SidebarUserInfo } from "./user-info";

export type SidebarTaskItem = {
  id: string;
  title: string;
};

type SidebarProps = {
  tasks?: SidebarTaskItem[];
  userLabel?: string;
  taskListSlot?: React.ReactNode;
};

export function Sidebar({ tasks = [], userLabel, taskListSlot }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SidebarCollapsedProvider collapsed={collapsed}>
      <div
        className={`sticky top-0 h-screen overflow-hidden px-2.5 py-3.5 text-sidebar-foreground transition-all duration-200 ease-in-out ${
          collapsed
            ? "w-14 min-w-14 bg-sidebar"
            : "min-w-[250px] w-[250px] bg-sidebar"
        }`}
      >
        <div
          className={`flex h-full flex-col ${collapsed ? "items-center justify-between" : "items-stretch justify-between"}`}
        >
          <div
            className={`flex flex-col gap-6 ${collapsed ? "items-center" : "items-stretch"}`}
          >
            <SidebarUserInfo
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />
            <SidebarActions
              collapsed={collapsed}
              onExpand={() => setCollapsed(false)}
            />
            {taskListSlot ?? (
              <SidebarTaskList tasks={tasks} collapsed={collapsed} />
            )}
          </div>
          <SidebarFooter userLabel={userLabel} collapsed={collapsed} />
        </div>
      </div>
    </SidebarCollapsedProvider>
  );
}
