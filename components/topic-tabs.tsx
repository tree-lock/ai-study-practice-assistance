"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList>
          {TAB_OPTIONS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              disabled={tab.disabled}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm">
            {currentSort?.label ?? "排序"}
            <ChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onSelect={() => setSortBy(opt.value)}
            >
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
