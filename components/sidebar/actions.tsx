"use client";

import { Home, SquarePen } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { createTask } from "@/app/actions/task";

type SidebarActionsProps = {
  collapsed: boolean;
  onExpand: () => void;
  disabled?: boolean;
};

const actionItemBaseClass =
  "flex cursor-pointer items-center gap-2 rounded-md h-8 text-[13px] text-sidebar-foreground no-underline transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent/80";

const actionItemExpandedClass = "w-full pl-3 pr-1";

const actionItemCollapsedClass = "justify-center px-2";

const actionItemActiveClass =
  "flex cursor-pointer items-center gap-2 rounded-md h-8 w-full pl-3 pr-1 text-[13px] bg-sidebar-primary text-sidebar-primary-foreground no-underline transition-colors hover:opacity-90";

const disabledItemClass =
  "flex h-8 cursor-not-allowed items-center gap-2 rounded-md text-[13px] text-sidebar-foreground/50 opacity-60";

export function SidebarActions({
  collapsed,
  onExpand,
  disabled = false,
}: SidebarActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  const handleNewTask = async () => {
    try {
      const result = await createTask();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      router.push(`/tasks/${result.id}`);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "创建任务失败，请稍后重试";
      toast.error(message);
    }
  };

  if (disabled) {
    return (
      <div className="flex min-w-0 flex-col pt-2">
        <button
          type="button"
          disabled
          className={
            collapsed
              ? `${disabledItemClass} ${actionItemCollapsedClass}`
              : `${disabledItemClass} ${actionItemExpandedClass}`
          }
          aria-label="新建任务"
        >
          <SquarePen className="size-4 shrink-0" />
          <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
            新建任务
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1 pt-2">
      <Link
        href="/"
        className={
          collapsed
            ? `${actionItemBaseClass} ${actionItemCollapsedClass} ${isHome ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""}`
            : isHome
              ? actionItemActiveClass
              : `${actionItemBaseClass} ${actionItemExpandedClass}`
        }
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          if (collapsed) {
            e.preventDefault();
            onExpand();
          }
        }}
        aria-label="首页"
      >
        <Home className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>首页</span>
      </Link>

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
          }
          void handleNewTask();
        }}
        aria-label="新建任务"
      >
        <SquarePen className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
          新建任务
        </span>
      </button>
    </div>
  );
}
