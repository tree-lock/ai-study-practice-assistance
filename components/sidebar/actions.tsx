"use client";

import { FilePlus, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createTopic } from "@/app/actions/topic";
import { Input } from "@/components/ui/input";

type SidebarActionsProps = {
  collapsed: boolean;
  onExpand: () => void;
};

const actionItemBaseClass =
  "flex cursor-pointer items-center gap-2 rounded-md h-8 text-[13px] text-sidebar-foreground no-underline transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80";

const actionItemExpandedClass = "w-full pl-3 pr-1";

const actionItemCollapsedClass = "justify-center px-2";

const actionItemActiveClass =
  "flex cursor-pointer items-center gap-2 rounded-md h-8 w-full pl-3 pr-1 text-[13px] bg-sidebar-primary text-sidebar-primary-foreground no-underline transition-colors hover:opacity-90";

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
    <div className="flex min-w-0 flex-col pt-2">
      <Link
        href="/"
        className={
          collapsed
            ? `${actionItemBaseClass} ${actionItemCollapsedClass} ${isNewQuestionPage ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""}`
            : isNewQuestionPage
              ? actionItemActiveClass
              : `${actionItemBaseClass} ${actionItemExpandedClass}`
        }
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (collapsed) {
            e.preventDefault();
            onExpand();
          }
        }}
        aria-label="新增题目"
      >
        <FilePlus className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
          新增题目
        </span>
      </Link>

      {isCreatingTopic && !collapsed ? (
        <div className="flex flex-col h-8 gap-1">
          <form
            className="w-full h-full"
            onSubmit={(e) => {
              e.preventDefault();
              void handleCreateTopic();
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLFormElement>) => {
              if (e.key === "Escape") {
                e.preventDefault();
                handleCancelCreate();
              }
            }}
          >
            <Input
              value={newTopicName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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
              className="h-full min-h-0 px-2 text-[13px] leading-none"
            />
          </form>
          {createError ? (
            <p className="block text-xs text-destructive">{createError}</p>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className={
            collapsed
              ? `${actionItemBaseClass} ${actionItemCollapsedClass}`
              : `${actionItemBaseClass} ${actionItemExpandedClass}`
          }
          onClick={() => {
            if (collapsed) {
              onExpand();
            } else {
              setIsCreatingTopic(true);
            }
          }}
          aria-label="新建题库"
        >
          <Plus className="size-4 shrink-0" />
          <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
            新建题库
          </span>
        </button>
      )}
    </div>
  );
}
