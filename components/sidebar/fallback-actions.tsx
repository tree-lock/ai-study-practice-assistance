import { FilePlus, Plus } from "lucide-react";

const disabledItemClass =
  "flex h-8 cursor-not-allowed items-center gap-2 rounded-md text-[13px] text-sidebar-foreground/50 opacity-60";

const actionItemExpandedClass = "w-full pl-3 pr-1";

const actionItemCollapsedClass = "justify-center px-2";

/**
 * 纯静态禁用按钮，供 SidebarFallback 使用。
 * 不使用 usePathname/useRouter 等请求级 hook，避免在 Suspense fallback 中触发 blocking-route 错误。
 */
export function FallbackActions({ collapsed }: { collapsed: boolean }) {
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
        aria-label="新增题目"
      >
        <FilePlus className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
          新增题目
        </span>
      </button>
      <button
        type="button"
        disabled
        className={
          collapsed
            ? `${disabledItemClass} ${actionItemCollapsedClass}`
            : `${disabledItemClass} ${actionItemExpandedClass}`
        }
        aria-label="新建题库"
      >
        <Plus className="size-4 shrink-0" />
        <span className={collapsed ? "hidden" : "whitespace-nowrap"}>
          新建题库
        </span>
      </button>
    </div>
  );
}
