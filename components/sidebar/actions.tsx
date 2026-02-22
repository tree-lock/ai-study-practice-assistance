"use client";

import { FilePlusIcon, PlusIcon } from "@radix-ui/react-icons";
import { Flex, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createTopic } from "@/app/actions/topic";

type SidebarActionsProps = {
  collapsed: boolean;
  onExpand: () => void;
};

const actionItemClass =
  "flex items-center gap-2 rounded-md py-1.5 pl-3 pr-1 text-[13px] text-gray-700 no-underline transition-colors hover:bg-gray-200 active:bg-gray-300 cursor-pointer";

const actionItemActiveClass =
  "flex items-center gap-2 rounded-md bg-blue-200 py-1.5 pl-3 pr-1 text-[13px] text-gray-700 no-underline transition-colors cursor-pointer";

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
    <Flex direction="column" className="pt-2">
      <Link
        href="/"
        className={isNewQuestionPage ? actionItemActiveClass : actionItemClass}
        onClick={(e) => {
          if (collapsed) {
            e.preventDefault();
            onExpand();
          }
        }}
        aria-label="新增题目"
      >
        <FilePlusIcon />
        <Text size="2" className={collapsed ? "hidden" : ""}>
          新增题目
        </Text>
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
            <TextField.Root
              size="1"
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
              style={{ width: "100%" }}
            />
          </form>
          {createError ? (
            <Text size="1" color="red" className="mt-1 block">
              {createError}
            </Text>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className={actionItemClass}
          onClick={() => {
            if (collapsed) {
              onExpand();
            } else {
              setIsCreatingTopic(true);
            }
          }}
          aria-label="新建题库"
        >
          <PlusIcon />
          <Text size="2" className={collapsed ? "hidden" : ""}>
            新建题库
          </Text>
        </button>
      )}
    </Flex>
  );
}
