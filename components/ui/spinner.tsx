import { cn } from "@/lib/utils";

function Spinner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: <output> 用于表单结果，加载指示器用 role="status" 更语义
    <span
      role="status"
      aria-label="加载中"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
