"use client";

import { FilePlusIcon, PlusIcon } from "@radix-ui/react-icons";
import { Flex, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createTopic } from "@/app/actions/topic";
import { GhostButton } from "@/components/ghost-button";

type SidebarActionsProps = {
  collapsed: boolean;
  onExpand: () => void;
};

export function SidebarActions({ collapsed, onExpand }: SidebarActionsProps) {
  const router = useRouter();
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDir = async () => {
    const name = newDirName.trim();
    if (!name || isSubmitting) return;
    setIsSubmitting(true);
    setCreateError("");
    const result = await createTopic({ name });
    setIsSubmitting(false);
    if ("error" in result) {
      const message =
        typeof result.error === "string" ? result.error : "创建目录失败";
      setCreateError(message);
      return;
    }
    setNewDirName("");
    setIsCreatingDir(false);
    setCreateError("");
    router.refresh();
  };

  const handleCancelCreate = () => {
    setIsCreatingDir(false);
    setNewDirName("");
    setCreateError("");
  };

  return (
    <Flex direction="column" className="pt-2">
      <GhostButton
        asChild
        layout="icon-text"
        aria-label="新增题目"
        className="pl-3"
      >
        <Link
          href="/"
          className="text-inherit no-underline"
          onClick={(e) => {
            if (collapsed) {
              e.preventDefault();
              onExpand();
            }
          }}
        >
          <FilePlusIcon />
          <Text size="2" className={collapsed ? "hidden" : ""}>
            新增题目
          </Text>
        </Link>
      </GhostButton>

      {isCreatingDir && !collapsed ? (
        <Flex direction="column" gap="1" className="px-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateDir();
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancelCreate();
              }
            }}
          >
            <TextField.Root
              size="2"
              value={newDirName}
              onChange={(e) => {
                setNewDirName(e.target.value);
                setCreateError("");
              }}
              onBlur={() => {
                if (!newDirName.trim()) {
                  handleCancelCreate();
                }
              }}
              placeholder="输入目录名称..."
              autoFocus
              disabled={isSubmitting}
              style={{ width: "100%" }}
            />
          </form>
          {createError ? (
            <Text size="1" color="red">
              {createError}
            </Text>
          ) : null}
        </Flex>
      ) : (
        <GhostButton
          layout="icon-text"
          onClick={() => {
            if (collapsed) {
              onExpand();
            } else {
              setIsCreatingDir(true);
            }
          }}
          aria-label="新建目录"
          className="pl-3"
        >
          <PlusIcon />
          <Text size="2" className={collapsed ? "hidden" : ""}>
            新建目录
          </Text>
        </GhostButton>
      )}
    </Flex>
  );
}
