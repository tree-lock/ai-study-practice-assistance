"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { questions, topics } from "@/lib/db/schema";

const createQuestionSchema = z
  .object({
    topicId: z.string().uuid("目录参数不合法"),
    content: z.string().trim().optional(),
    type: z.enum(["choice", "blank", "subjective"]).default("subjective"),
    source: z.string().trim().optional(),
    fileNames: z.array(z.string().trim().min(1)).default([]),
  })
  .refine(
    (input) => {
      return Boolean(input.content) || input.fileNames.length > 0;
    },
    { message: "请填写题目内容，或至少上传一个文件" },
  );

export type TopicQuestion = {
  id: string;
  content: string;
  type: "choice" | "blank" | "subjective";
  source: string | null;
  createdAt: Date;
};

async function canAccessTopic(topicId: string, userId: string) {
  const found = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  return found.length > 0;
}

export async function getQuestionsByTopic(
  topicId: string,
): Promise<Array<TopicQuestion>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const accessible = await canAccessTopic(topicId, userId);
  if (!accessible) {
    return [];
  }

  return await db
    .select({
      id: questions.id,
      content: questions.content,
      type: questions.type,
      source: questions.source,
      createdAt: questions.createdAt,
    })
    .from(questions)
    .where(eq(questions.topicId, topicId))
    .orderBy(desc(questions.createdAt));
}

export async function createQuestionsInTopic(input: {
  topicId: string;
  content?: string;
  type?: "choice" | "blank" | "subjective";
  source?: string;
  fileNames?: Array<string>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false as const, error: "请先登录后再上传题目" };
  }

  const parsed = createQuestionSchema.safeParse({
    ...input,
    fileNames: input.fileNames ?? [],
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false as const, error: issue?.message ?? "输入不合法" };
  }

  const accessible = await canAccessTopic(parsed.data.topicId, userId);
  if (!accessible) {
    return { success: false as const, error: "目录不存在或无权限操作" };
  }

  const rows: Array<{
    topicId: string;
    content: string;
    type: "choice" | "blank" | "subjective";
    source?: string;
    creatorId: string;
  }> = [];

  if (parsed.data.content) {
    rows.push({
      topicId: parsed.data.topicId,
      content: parsed.data.content,
      type: parsed.data.type,
      source: parsed.data.source,
      creatorId: userId,
    });
  }

  for (const fileName of parsed.data.fileNames) {
    rows.push({
      topicId: parsed.data.topicId,
      content: `【待解析文件】${fileName}`,
      type: parsed.data.type,
      source: parsed.data.source,
      creatorId: userId,
    });
  }

  await db.insert(questions).values(rows);
  revalidatePath("/");

  return { success: true as const, count: rows.length };
}
