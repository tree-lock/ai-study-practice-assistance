"use client";

import { useState } from "react";
import { FallbackActions } from "./fallback-actions";
import { TaskListFallback } from "./task-list-fallback";
import { SidebarUserInfo } from "./user-info";

export function SidebarFallback() {
  const [collapsed, setCollapsed] = useState(false);

  return (
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
          <FallbackActions collapsed={collapsed} />
        </div>
        {!collapsed ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <TaskListFallback />
          </div>
        ) : null}
      </div>
    </div>
  );
}
