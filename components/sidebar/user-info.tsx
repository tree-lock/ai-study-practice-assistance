import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function SidebarUserInfo({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  if (collapsed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        aria-label="展开侧边栏"
      >
        <ChevronRight />
      </Button>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        asChild
        aria-label="返回首页"
      >
        <Link href="/">
          <Home />
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        aria-label="收起侧边栏"
      >
        <ChevronLeft />
      </Button>
    </div>
  );
}

export function SidebarFooter({
  userLabel,
  collapsed,
}: {
  userLabel?: string;
  collapsed: boolean;
}) {
  return (
    <div className="flex items-center gap-3 whitespace-nowrap">
      <Avatar>
        <AvatarFallback>AI</AvatarFallback>
      </Avatar>
      {!collapsed ? (
        <div>
          <p className="text-sm font-bold">AI 学习助教</p>
          <p className="text-xs text-muted-foreground">
            {userLabel ?? "欢迎使用"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
