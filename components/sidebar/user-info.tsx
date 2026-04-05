import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
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
