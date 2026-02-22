"use client";

import { ExpandMore } from "@mui/icons-material";
import { Button, Menu, MenuItem, Tabs as MuiTabs, Tab } from "@mui/material";
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
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);

  const currentSort = SORT_OPTIONS.find((opt) => opt.value === sortBy);

  return (
    <div className="flex items-center justify-between">
      <MuiTabs
        value={activeTab}
        onChange={(_, newValue) => onTabChange(newValue)}
      >
        {TAB_OPTIONS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            disabled={tab.disabled}
          />
        ))}
      </MuiTabs>

      <div>
        <Button
          color="inherit"
          endIcon={<ExpandMore />}
          onClick={(e) => setSortAnchorEl(e.currentTarget)}
          sx={{ textTransform: "none" }}
        >
          {currentSort?.label ?? "排序"}
        </Button>
        <Menu
          anchorEl={sortAnchorEl}
          open={Boolean(sortAnchorEl)}
          onClose={() => setSortAnchorEl(null)}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem
              key={opt.value}
              selected={sortBy === opt.value}
              onClick={() => {
                setSortBy(opt.value);
                setSortAnchorEl(null);
              }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
      </div>
    </div>
  );
}
