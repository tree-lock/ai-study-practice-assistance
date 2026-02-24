import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-semibold">页面未找到</h1>
      <p className="mt-3 text-base text-muted-foreground">
        很抱歉，您访问的页面不存在或已被删除。
      </p>
      <Button asChild className="mt-6" type="button" size="lg">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
