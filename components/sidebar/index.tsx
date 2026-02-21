"use client";

import { Box, Flex } from "@radix-ui/themes";
import { useState } from "react";
import { SidebarActions } from "./actions";
import { SidebarTopicList } from "./topic-list";
import { SidebarUserInfo } from "./user-info";

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
      className={`sticky top-0 h-screen py-3.5 px-2.5 bg-[#efeff1] transition-all duration-200 ease-in-out ${
        collapsed ? "w-[88px] min-w-[88px]" : "w-[250px] min-w-[250px]"
      }`}
    >
      <Flex direction="column" gap="6">
        <SidebarUserInfo
          userLabel={userLabel}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
        />
        <SidebarActions collapsed={collapsed} />
        <SidebarTopicList topics={topics} collapsed={collapsed} />
      </Flex>
    </Box>
  );
}
