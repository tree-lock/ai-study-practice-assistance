"use client";

import { useState } from "react";
import { SidebarActions } from "./actions";
import { SidebarTopicListFallback } from "./topic-list-fallback";
import { SidebarFooter, SidebarUserInfo } from "./user-info";

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
            disabled
            onExpand={() => setCollapsed(false)}
          />
          <SidebarTopicListFallback />
        </div>
        <SidebarFooter userLabel="加载中" collapsed={collapsed} />
      </div>
    </div>
  );
}
