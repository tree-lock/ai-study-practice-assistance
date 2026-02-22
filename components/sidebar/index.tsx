"use client";

import { Box } from "@mui/material";
import { useState } from "react";
import { SidebarActions } from "./actions";
import { SidebarTopicList } from "./topic-list";
import { SidebarFooter, SidebarUserInfo } from "./user-info";

type Topic = {
  id: string;
  name: string;
  description: string | null;
};

type SidebarProps = {
  topics?: Array<Topic>;
  userLabel?: string;
};

export function Sidebar({ topics = [], userLabel }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box
      className={`sticky top-0 h-screen py-3.5 px-2.5 bg-[#efeff1] transition-all duration-200 ease-in-out overflow-hidden ${
        collapsed ? "w-14 min-w-14" : "w-[250px] min-w-[250px]"
      }`}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems={collapsed ? "center" : "stretch"}
        className="h-full"
      >
        <Box
          display="flex"
          flexDirection="column"
          gap={2}
          alignItems={collapsed ? "center" : "stretch"}
        >
          <SidebarUserInfo
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
          <SidebarActions
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
          />
          <SidebarTopicList topics={topics} collapsed={collapsed} />
        </Box>
        <SidebarFooter userLabel={userLabel} collapsed={collapsed} />
      </Box>
    </Box>
  );
}
