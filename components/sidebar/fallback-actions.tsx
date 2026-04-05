import { Home, SquarePen } from "lucide-react";

const disabledItemClass =
  "flex h-8 cursor-not-allowed items-center gap-2 rounded-md text-[13px] text-sidebar-foreground/50 opacity-60";

const actionItemExpandedClass = "w-full pl-3 pr-1";

const actionItemCollapsedClass = "justify-center px-2";

/**
 * 纯静态禁用按钮，供 SidebarFallback 使用。
 */
export function FallbackActions({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 pt-2">
      <button
        type="button"
        disabled
        className={
          collapsed
            ? `${disabledItemClass} ${actionItemCollapsedClass}`
            : `${disabledItemClass} ${actionItemExpandedClass}`
        }
        aria-label="首页"
      >
        <Home className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>首页</span>
      </button>
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
