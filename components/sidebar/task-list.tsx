"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarTaskItem } from "./index";

type SidebarTaskListProps = {
  tasks: SidebarTaskItem[];
  collapsed: boolean;
};

export function SidebarTaskList({ tasks, collapsed }: SidebarTaskListProps) {
  const pathname = usePathname();

  if (collapsed) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-nowrap pl-3 text-sm font-bold text-sidebar-foreground">
        任务记录
      </p>
      <div className="flex flex-col">
        {tasks.length === 0 ? (
          <p className="pl-3 text-[13px] text-muted-foreground">暂无任务</p>
        ) : null}
        {tasks.map((task) => {
          const href = `/tasks/${task.id}`;
          const isActive = pathname === href;
          return (
            <Link
              key={task.id}
              href={href}
              className={`rounded-md py-1.5 pl-3 pr-2 text-[13px] no-underline transition-colors ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span className="line-clamp-2 text-sm">{task.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
