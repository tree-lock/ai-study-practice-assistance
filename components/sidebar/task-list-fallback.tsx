export function TaskListFallback() {
  return (
    <div className="flex flex-col gap-2">
      <p className="whitespace-nowrap pl-3 text-sm font-bold text-sidebar-foreground">
        任务记录
      </p>
      <div className="flex flex-col py-2 pl-3">
        <p className="text-[13px] text-muted-foreground">加载中...</p>
      </div>
    </div>
  );
}
