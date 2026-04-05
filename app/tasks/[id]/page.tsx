import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTaskWithMessages } from "@/app/actions/task";
import { TaskChat } from "@/components/task-chat";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function TaskPageInner({ params }: PageProps) {
  const { id } = await params;
  const task = await getTaskWithMessages(id);
  if (!task) {
    notFound();
  }

  return (
    <TaskChat
      key={task.id}
      taskId={task.id}
      title={task.title}
      initialMessages={task.messages}
    />
  );
}

export default function TaskPage({ params }: PageProps) {
  return (
    <div className="flex min-h-0 flex-1 justify-center px-3 pb-6 pt-4 md:px-8">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">加载对话…</p>}
      >
        <TaskPageInner params={params} />
      </Suspense>
    </div>
  );
}
