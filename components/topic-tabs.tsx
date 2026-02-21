"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, Tabs } from "@radix-ui/themes";
import { useState } from "react";

const TAB_OPTIONS = [
  { value: "all", label: "所有题", disabled: false },
  { value: "today", label: "今日推荐", disabled: true },
  { value: "starred", label: "已收藏", disabled: true },
  { value: "wrong", label: "错题本", disabled: true },
  { value: "undone", label: "未完成", disabled: true },
  { value: "done", label: "已完成", disabled: true },
] as const;

const SORT_OPTIONS = [
  { value: "latest", label: "最新" },
  { value: "popular", label: "热门" },
  { value: "difficulty", label: "难度" },
] as const;

type TopicTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function TopicTabs({ activeTab, onTabChange }: TopicTabsProps) {
  const [sortBy, setSortBy] = useState("latest");

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <div className="flex items-center justify-between">
      <Tabs.Root value={activeTab} onValueChange={onTabChange}>
        <Tabs.List>
          {TAB_OPTIONS.map((tab) => (
            <Tabs.Trigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
            >
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs.Root>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button variant="ghost" color="gray">
            {currentSort?.label ?? "排序"}
            <ChevronDownIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenu.Item
              key={opt.value}
              onSelect={() => setSortBy(opt.value)}
            >
              {opt.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
}
