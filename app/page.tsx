import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createTask } from "@/app/actions/task";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

async function createTaskAndRedirect() {
  "use server";
  const r = await createTask();
  if ("error" in r) {
    return;
  }
  redirect(`/tasks/${r.id}`);
}

async function HomeInner() {
  const userId = await getCurrentUserId();

  return (
    <>
      {userId ? (
        <form action={createTaskAndRedirect}>
          <Button type="submit" size="lg">
            新建任务并开始
          </Button>
        </form>
      ) : (
        <p className="text-center text-sm text-muted-foreground">
          请通过右上角登录后开始使用。
        </p>
      )}
    </>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-170px)] flex-col items-center justify-center gap-8 overflow-auto px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <Sparkles className="size-12 text-primary" aria-hidden />
        <h1 className="home-hero-title text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          与 AI Agent
          <span className="text-primary"> 对话协作 </span>
        </h1>
        <p className="home-hero-subtitle max-w-lg text-center text-base text-muted-foreground sm:text-lg">
          在侧栏查看任务记录；新建任务后与模型多轮对话，消息会保存在该任务下。
        </p>
      </div>

      <Suspense
        fallback={
          <p className="text-center text-sm text-muted-foreground">加载中…</p>
        }
      >
        <HomeInner />
      </Suspense>
    </div>
  );
}
