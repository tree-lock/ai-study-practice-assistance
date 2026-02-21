"use server";

import { and, eq } from "drizzle-orm";
import { cacheTag, revalidatePath } from "next/cache";
import { treeifyError, z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";

const topicSchema = z.object({
  name: z.string().min(1, "题库名称不能为空"),
  description: z.string().optional(),
});

export async function getTopics() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  return await db.select().from(topics).where(eq(topics.userId, userId));
}

async function fetchTopicById(topicId: string, userId: string) {
  "use cache";
  cacheTag(`topic-${topicId}`);

  const result = await db
    .select()
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function getTopicById(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  return fetchTopicById(id, userId);
}

export async function createTopic(data: z.infer<typeof topicSchema>) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再创建题库" };
  }

  const validated = topicSchema.safeParse(data);
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  const existing = await db
    .select({ id: topics.id })
    .from(topics)
    .where(
      and(
        eq(topics.userId, userId),
        eq(topics.name, validated.data.name.trim()),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    return { error: "该题库名称已存在" };
  }

  try {
    await db.insert(topics).values({
      name: validated.data.name.trim(),
      description: validated.data.description,
      userId,
    });
    revalidatePath("/");
    revalidatePath("/topics");
    return { success: true };
  } catch (error) {
    console.error("创建题库失败:", error);
    return { error: "创建题库失败" };
  }
}

export async function updateTopic(
  id: string,
  data: z.infer<typeof topicSchema>,
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再更新题库" };
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
    console.error("更新题库失败:", error);
    return { error: "更新题库失败" };
  }
}

export async function deleteTopic(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录后再删除题库" };
  }

  try {
    await db
      .delete(topics)
      .where(and(eq(topics.id, id), eq(topics.userId, userId)));
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("删除题库失败:", error);
    return { error: "删除题库失败" };
  }
}
