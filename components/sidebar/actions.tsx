"use client";

import { PostAdd as FilePlusIcon, Add as PlusIcon } from "@mui/icons-material";
import { Box, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createTopic } from "@/app/actions/topic";

type SidebarActionsProps = {
  collapsed: boolean;
  onExpand: () => void;
};

export function SidebarActions({ collapsed, onExpand }: SidebarActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNewQuestionPage = pathname === "/";

  const handleCreateTopic = async () => {
    const name = newTopicName.trim();
    if (!name || isSubmitting) return;
    setIsSubmitting(true);
    setCreateError("");
    const result = await createTopic({ name });
    setIsSubmitting(false);
    if ("error" in result) {
      const message =
        typeof result.error === "string" ? result.error : "创建题库失败";
      setCreateError(message);
      return;
    }
    setNewTopicName("");
    setIsCreatingTopic(false);
    setCreateError("");
    router.refresh();
  };

  const handleCancelCreate = () => {
    setIsCreatingTopic(false);
    setNewTopicName("");
    setCreateError("");
  };

  return (
    <Box display="flex" flexDirection="column" className="pt-2">
      <Link
        href="/"
        className={
          isNewQuestionPage
            ? "group flex items-center rounded-md bg-blue-200 py-1.5 pl-3 pr-1 text-[13px] text-gray-700 no-underline transition-colors cursor-pointer"
            : "group flex items-center rounded-md py-1.5 pl-3 pr-1 text-[13px] text-gray-700 no-underline transition-colors hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
        }
        onClick={(e) => {
          if (collapsed) {
            e.preventDefault();
            onExpand();
          }
        }}
        aria-label="新增题目"
      >
        <FilePlusIcon fontSize="small" />
        {!collapsed && (
          <Typography variant="body2" className="ml-2 truncate">
            新增题目
          </Typography>
        )}
      </Link>

      {isCreatingTopic && !collapsed ? (
        <div className="py-1 pl-3 pr-1">
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateTopic();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancelCreate();
              }
            }}
          >
            <TextField
              size="small"
              value={newTopicName}
              onChange={(e) => {
                setNewTopicName(e.target.value);
                setCreateError("");
              }}
              onBlur={() => {
                if (!newTopicName.trim()) {
                  handleCancelCreate();
                }
              }}
              placeholder="输入题库名称..."
              autoFocus
              disabled={isSubmitting}
              fullWidth
            />
          </form>
          {createError ? (
            <Typography variant="caption" color="error" className="mt-1 block">
              {createError}
            </Typography>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="group flex items-center rounded-md py-1.5 pl-3 pr-1 text-[13px] text-gray-700 no-underline transition-colors hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
          onClick={() => {
            if (collapsed) {
              onExpand();
            } else {
              setIsCreatingTopic(true);
            }
          }}
          aria-label="新建题库"
        >
          <PlusIcon fontSize="small" />
          {!collapsed && (
            <Typography variant="body2" className="ml-2 truncate">
              新建题库
            </Typography>
          )}
        </button>
      )}
    </Box>
  );
}
