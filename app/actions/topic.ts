"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { treeifyError, z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";

const topicSchema = z.object({
  name: z.string().min(1, "目录名称不能为空"),
  description: z.string().optional(),
});

export async function getTopics() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  return await db.select().from(topics).where(eq(topics.userId, userId));
}

export async function createTopic(data: z.infer<typeof topicSchema>) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再创建目录" };
  }

  const validated = topicSchema.safeParse(data);
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  try {
    await db.insert(topics).values({
      name: validated.data.name,
      description: validated.data.description,
      userId,
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("创建目录失败:", error);
    return { error: "创建目录失败" };
  }
}

export async function updateTopic(
  id: string,
  data: z.infer<typeof topicSchema>,
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再更新目录" };
  }

  const validated = topicSchema.safeParse(data);
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  try {
    await db
      .update(topics)
      .set({
        name: validated.data.name,
        description: validated.data.description,
        updatedAt: new Date(),
      })
      .where(and(eq(topics.id, id), eq(topics.userId, userId)));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("更新目录失败:", error);
    return { error: "更新目录失败" };
  }
}

export async function deleteTopic(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再删除目录" };
  }

  try {
    await db
      .delete(topics)
      .where(and(eq(topics.id, id), eq(topics.userId, userId)));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("删除目录失败:", error);
    return { error: "删除目录失败" };
  }
}
