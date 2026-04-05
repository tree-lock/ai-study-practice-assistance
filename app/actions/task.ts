"use server";

import type { UIMessage } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { agentMessages, agentTasks } from "@/lib/db/schema";

export type TaskListItem = {
  id: string;
  title: string;
};

export async function listTasks(): Promise<TaskListItem[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const rows = await db
    .select({
      id: agentTasks.id,
      title: agentTasks.title,
    })
    .from(agentTasks)
    .where(eq(agentTasks.userId, userId))
    .orderBy(desc(agentTasks.updatedAt));

  return rows;
}

export async function createTask(): Promise<
  { id: string } | { error: string }
> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const [row] = await db
    .insert(agentTasks)
    .values({ userId })
    .returning({ id: agentTasks.id });

  if (!row) {
    return { error: "创建任务失败" };
  }

  revalidatePath("/", "layout");

  return { id: row.id };
}

export type TaskWithMessages = {
  id: string;
  title: string;
  messages: UIMessage[];
};

export async function getTaskWithMessages(
  taskId: string,
): Promise<TaskWithMessages | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const [task] = await db
    .select({
      id: agentTasks.id,
      title: agentTasks.title,
    })
    .from(agentTasks)
    .where(and(eq(agentTasks.id, taskId), eq(agentTasks.userId, userId)))
    .limit(1);

  if (!task) {
    return null;
  }

  const rows = await db
    .select({
      id: agentMessages.id,
      role: agentMessages.role,
      content: agentMessages.content,
      clientMessageId: agentMessages.clientMessageId,
    })
    .from(agentMessages)
    .where(eq(agentMessages.taskId, taskId))
    .orderBy(agentMessages.createdAt);

  const messages: UIMessage[] = rows.map((r) => ({
    id: r.clientMessageId ?? r.id,
    role: r.role,
    parts: [{ type: "text" as const, text: r.content }],
  }));

  return { id: task.id, title: task.title, messages };
}
