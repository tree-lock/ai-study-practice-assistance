"use server";

import { and, eq } from "drizzle-orm";
import { cacheTag, revalidatePath } from "next/cache";
import { treeifyError, z } from "zod";
import {
  generateKnowledgePointsFromOutline,
  generateOutline,
} from "@/lib/ai/topic/outline";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import {
  questionKnowledgePoints,
  topicKnowledgePoints,
  topics,
} from "@/lib/db/schema";

const topicSchema = z.object({
  name: z.string().min(1, "题库名称不能为空"),
  description: z.string().optional(),
});

const DEFAULT_TOPIC_NAME = "默认题库";

export async function getTopics() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const list = await db.select().from(topics).where(eq(topics.userId, userId));

  // 若用户尚无题库，懒创建默认题库（兼容注册前已存在的用户）
  if (list.length === 0) {
    await db.insert(topics).values({
      name: DEFAULT_TOPIC_NAME,
      userId,
      isDefault: true,
    });
    return await db.select().from(topics).where(eq(topics.userId, userId));
  }

  return list;
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

  const topic = await db
    .select({ isDefault: topics.isDefault })
    .from(topics)
    .where(and(eq(topics.id, id), eq(topics.userId, userId)))
    .limit(1);
  if (topic.length > 0 && topic[0].isDefault) {
    return { error: "默认题库不可删除" };
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

const outlineSchema = z.object({
  outline: z.string().min(1, "大纲内容不能为空"),
});

export async function updateTopicOutline(topicId: string, outline: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const validated = outlineSchema.safeParse({ outline });
  if (!validated.success) {
    return { error: treeifyError(validated.error) };
  }

  try {
    const result = await db
      .update(topics)
      .set({
        outline: validated.data.outline,
        updatedAt: new Date(),
      })
      .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
      .returning({ id: topics.id });

    if (result.length === 0) {
      return { error: "题库不存在或无权限修改" };
    }

    revalidatePath(`/topics/${topicId}`);
    return { success: true };
  } catch (error) {
    console.error("更新大纲失败:", error);
    return { error: "更新大纲失败" };
  }
}

export async function generateTopicOutline(topicId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const topic = await db
    .select({ id: topics.id, name: topics.name })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  if (topic.length === 0) {
    return { error: "题库不存在或无权限" };
  }

  try {
    const outline = await generateOutline(topic[0].name);

    await db
      .update(topics)
      .set({
        outline,
        updatedAt: new Date(),
      })
      .where(eq(topics.id, topicId));

    revalidatePath(`/topics/${topicId}`);

    return {
      success: true,
      outline,
    };
  } catch (error) {
    console.error("AI 生成大纲失败:", error);
    return { error: "AI 生成大纲失败，请稍后重试" };
  }
}

export type KnowledgePoint = {
  id: string;
  name: string;
  createdAt: Date;
};

export async function getTopicKnowledgePoints(
  topicId: string,
): Promise<KnowledgePoint[]> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const topic = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  if (topic.length === 0) {
    return [];
  }

  return db
    .select({
      id: topicKnowledgePoints.id,
      name: topicKnowledgePoints.name,
      createdAt: topicKnowledgePoints.createdAt,
    })
    .from(topicKnowledgePoints)
    .where(eq(topicKnowledgePoints.topicId, topicId));
}

export async function addKnowledgePoint(topicId: string, name: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { error: "知识点名称不能为空" };
  }

  if (trimmedName.length > 10) {
    return { error: "知识点名称不能超过10个字符" };
  }

  const topic = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  if (topic.length === 0) {
    return { error: "题库不存在或无权限" };
  }

  const existing = await db
    .select({ id: topicKnowledgePoints.id })
    .from(topicKnowledgePoints)
    .where(
      and(
        eq(topicKnowledgePoints.topicId, topicId),
        eq(topicKnowledgePoints.name, trimmedName),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    return { error: "该知识点已存在" };
  }

  try {
    const result = await db
      .insert(topicKnowledgePoints)
      .values({
        topicId,
        name: trimmedName,
      })
      .returning({
        id: topicKnowledgePoints.id,
        name: topicKnowledgePoints.name,
        createdAt: topicKnowledgePoints.createdAt,
      });

    revalidatePath(`/topics/${topicId}`);
    return { success: true, knowledgePoint: result[0] };
  } catch (error) {
    console.error("添加知识点失败:", error);
    return { error: "添加知识点失败" };
  }
}

export async function deleteKnowledgePoint(knowledgePointId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const kp = await db
    .select({
      id: topicKnowledgePoints.id,
      topicId: topicKnowledgePoints.topicId,
    })
    .from(topicKnowledgePoints)
    .innerJoin(topics, eq(topicKnowledgePoints.topicId, topics.id))
    .where(
      and(
        eq(topicKnowledgePoints.id, knowledgePointId),
        eq(topics.userId, userId),
      ),
    )
    .limit(1);

  if (kp.length === 0) {
    return { error: "知识点不存在或无权限" };
  }

  const linkedQuestions = await db
    .select({ questionId: questionKnowledgePoints.questionId })
    .from(questionKnowledgePoints)
    .where(eq(questionKnowledgePoints.knowledgePointId, knowledgePointId));

  try {
    await db
      .delete(topicKnowledgePoints)
      .where(eq(topicKnowledgePoints.id, knowledgePointId));

    revalidatePath(`/topics/${kp[0].topicId}`);
    return {
      success: true,
      removedFromQuestions: linkedQuestions.length,
    };
  } catch (error) {
    console.error("删除知识点失败:", error);
    return { error: "删除知识点失败" };
  }
}

export async function generateKnowledgePoints(topicId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const topic = await db
    .select({
      id: topics.id,
      name: topics.name,
      outline: topics.outline,
    })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  if (topic.length === 0) {
    return { error: "题库不存在或无权限" };
  }

  if (!topic[0].outline) {
    return { error: "请先添加题库大纲" };
  }

  try {
    const knowledgePointNames = await generateKnowledgePointsFromOutline(
      topic[0].outline,
      topic[0].name,
    );

    const existing = await db
      .select({ name: topicKnowledgePoints.name })
      .from(topicKnowledgePoints)
      .where(eq(topicKnowledgePoints.topicId, topicId));

    const existingNames = new Set(existing.map((e) => e.name));
    const newNames = knowledgePointNames.filter(
      (name) => !existingNames.has(name),
    );

    if (newNames.length === 0) {
      return { success: true, added: 0, message: "没有新的知识点需要添加" };
    }

    await db.insert(topicKnowledgePoints).values(
      newNames.map((name) => ({
        topicId,
        name,
      })),
    );

    revalidatePath(`/topics/${topicId}`);
    return {
      success: true,
      added: newNames.length,
      knowledgePoints: newNames,
    };
  } catch (error) {
    console.error("AI 生成知识点失败:", error);
    return { error: "AI 生成知识点失败，请稍后重试" };
  }
}

export async function getKnowledgePointLinkedCount(
  knowledgePointId: string,
): Promise<number> {
  const result = await db
    .select({ questionId: questionKnowledgePoints.questionId })
    .from(questionKnowledgePoints)
    .where(eq(questionKnowledgePoints.knowledgePointId, knowledgePointId));

  return result.length;
}
