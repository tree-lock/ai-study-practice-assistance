export function TaskListFallback() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <p className="shrink-0 whitespace-nowrap pl-3 text-sm font-bold text-sidebar-foreground">
        任务记录
      </p>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col py-2 pl-3">
          <p className="text-[13px] text-muted-foreground">加载中...</p>
        </div>
      </div>
    </div>
  );
}
