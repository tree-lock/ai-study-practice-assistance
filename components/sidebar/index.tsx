"use client";

import { useState } from "react";
import { SidebarActions } from "./actions";
import { SidebarCollapsedProvider } from "./collapsed-context";
import { SidebarTaskList } from "./task-list";
import { SidebarUserInfo } from "./user-info";

export type SidebarTaskItem = {
  id: string;
  title: string;
};

type SidebarProps = {
  tasks?: SidebarTaskItem[];
  taskListSlot?: React.ReactNode;
};

export function Sidebar({ tasks = [], taskListSlot }: SidebarProps) {
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
          className={`flex h-full min-h-0 flex-col ${
            collapsed ? "items-center justify-between" : "gap-6"
          }`}
        >
          <div
            className={`flex shrink-0 flex-col gap-6 ${
              collapsed ? "items-center" : "items-stretch"
            }`}
          >
            <SidebarUserInfo
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed((prev) => !prev)}
            />
            <SidebarActions
              collapsed={collapsed}
              onExpand={() => setCollapsed(false)}
            />
          </div>
          {!collapsed ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {taskListSlot ?? (
                <SidebarTaskList tasks={tasks} collapsed={collapsed} />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </SidebarCollapsedProvider>
  );
}
