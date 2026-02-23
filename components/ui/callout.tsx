import type * as React from "react";
import { cn } from "@/lib/utils";

type CalloutProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "amber" | "red";
  icon?: React.ReactNode;
};

const variantClasses = {
  default: "border-border bg-muted/50 text-foreground",
  amber:
    "border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200",
  red: "border-destructive/50 bg-destructive/10 text-destructive",
};

function Callout({
  className,
  variant = "default",
  icon,
  children,
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <div className="flex-1">{children}</div>
    </div>
  );
}

export { Callout };
