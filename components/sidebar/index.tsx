"use client";

import { Box, Flex } from "@radix-ui/themes";
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
      <Flex
        direction="column"
        justify="between"
        align={collapsed ? "center" : "stretch"}
        className="h-full"
      >
        <Flex
          direction="column"
          gap="6"
          align={collapsed ? "center" : "stretch"}
        >
          <SidebarUserInfo
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((prev) => !prev)}
          />
          <SidebarActions collapsed={collapsed} />
          <SidebarTopicList topics={topics} collapsed={collapsed} />
        </Flex>
        <SidebarFooter userLabel={userLabel} collapsed={collapsed} />
      </Flex>
    </Box>
  );
}
