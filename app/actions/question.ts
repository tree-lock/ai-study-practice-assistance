"use server";

import { and, desc, eq } from "drizzle-orm";
import { cacheTag, revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { generateSolution as generateSolutionAI } from "@/lib/ai/question/solution";
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPES,
  type QuestionType,
} from "@/lib/ai/types";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import {
  answers,
  questionKnowledgePoints,
  questions,
  tags,
  topicKnowledgePoints,
  topics,
  users,
} from "@/lib/db/schema";

const createQuestionSchema = z
  .object({
    topicId: z.string().uuid("题库参数不合法"),
    content: z.string().trim().optional(),
    type: z.enum(QUESTION_TYPES).default("subjective"),
    source: z.string().trim().optional(),
    fileNames: z.array(z.string().trim().min(1)).default([]),
    parsedContents: z.array(z.string().trim().min(1)).default([]),
  })
  .refine(
    (input) => {
      return (
        Boolean(input.content) ||
        input.fileNames.length > 0 ||
        input.parsedContents.length > 0
      );
    },
    { message: "请填写题目内容，或至少上传一个文件" },
  );

export type TopicQuestion = {
  id: string;
  content: string;
  type: QuestionType;
  source: string | null;
  createdAt: Date;
  creator: { id: string; name: string | null } | null;
};

export type TopicTag = {
  id: string;
  name: string;
};

async function canAccessTopic(topicId: string, userId: string) {
  const found = await db
    .select({ id: topics.id })
    .from(topics)
    .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
    .limit(1);

  return found.length > 0;
}

async function fetchQuestionsByTopic(topicId: string) {
  "use cache";
  cacheTag(`topic-${topicId}-questions`);

  const rows = await db
    .select({
      id: questions.id,
      content: questions.content,
      type: questions.type,
      source: questions.source,
      createdAt: questions.createdAt,
      creatorId: users.id,
      creatorName: users.name,
    })
    .from(questions)
    .leftJoin(users, eq(questions.creatorId, users.id))
    .where(eq(questions.topicId, topicId))
    .orderBy(desc(questions.createdAt));

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    type: row.type,
    source: row.source,
    createdAt: row.createdAt,
    creator: row.creatorId
      ? { id: row.creatorId, name: row.creatorName }
      : null,
  }));
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

  return fetchQuestionsByTopic(topicId);
}

async function fetchTagsByTopic(topicId: string) {
  "use cache";
  cacheTag(`topic-${topicId}-tags`);

  return await db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .where(eq(tags.topicId, topicId));
}

export async function getTagsByTopic(
  topicId: string,
): Promise<Array<TopicTag>> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return [];
  }

  const accessible = await canAccessTopic(topicId, userId);
  if (!accessible) {
    return [];
  }

  return fetchTagsByTopic(topicId);
}

export async function createQuestionsInTopic(input: {
  topicId: string;
  content?: string;
  type?: QuestionType;
  source?: string;
  fileNames?: Array<string>;
  parsedContents?: Array<string>;
}) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false as const, error: "请先登录后再上传题目" };
  }

  const parsed = createQuestionSchema.safeParse({
    ...input,
    fileNames: input.fileNames ?? [],
    parsedContents: input.parsedContents ?? [],
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false as const, error: issue?.message ?? "输入不合法" };
  }

  const accessible = await canAccessTopic(parsed.data.topicId, userId);
  if (!accessible) {
    return { success: false as const, error: "题库不存在或无权限操作" };
  }

  const rows: Array<{
    topicId: string;
    content: string;
    type: QuestionType;
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

  for (const content of parsed.data.parsedContents) {
    rows.push({
      topicId: parsed.data.topicId,
      content,
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
  updateTag(`topic-${parsed.data.topicId}-questions`);
  revalidatePath("/");

  return { success: true as const, count: rows.length };
}

async function fetchQuestionById(
  questionId: string,
  topicId: string,
): Promise<TopicQuestion | null> {
  "use cache";
  cacheTag(`question-${questionId}`);

  const rows = await db
    .select({
      id: questions.id,
      content: questions.content,
      type: questions.type,
      source: questions.source,
      createdAt: questions.createdAt,
      creatorId: users.id,
      creatorName: users.name,
    })
    .from(questions)
    .leftJoin(users, eq(questions.creatorId, users.id))
    .where(and(eq(questions.id, questionId), eq(questions.topicId, topicId)))
    .limit(1);

  const row = rows.at(0);
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    content: row.content,
    type: row.type,
    source: row.source,
    createdAt: row.createdAt,
    creator: row.creatorId
      ? { id: row.creatorId, name: row.creatorName }
      : null,
  };
}

export async function getQuestionById(
  questionId: string,
  topicId: string,
): Promise<TopicQuestion | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const accessible = await canAccessTopic(topicId, userId);
  if (!accessible) {
    return null;
  }

  return fetchQuestionById(questionId, topicId);
}

export type QuestionAnswer = {
  id: string;
  content: string | null;
  explanation: string | null;
};

export type QuestionKnowledgePoint = {
  id: string;
  name: string;
};

export type QuestionWithDetails = TopicQuestion & {
  answer: QuestionAnswer | null;
  knowledgePoints: QuestionKnowledgePoint[];
};

export async function getQuestionWithDetails(
  questionId: string,
  topicId: string,
): Promise<QuestionWithDetails | null> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }

  const accessible = await canAccessTopic(topicId, userId);
  if (!accessible) {
    return null;
  }

  const question = await fetchQuestionById(questionId, topicId);
  if (!question) {
    return null;
  }

  const [answerRows, kpRows] = await Promise.all([
    db
      .select({
        id: answers.id,
        content: answers.content,
        explanation: answers.explanation,
      })
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .limit(1),
    db
      .select({
        id: topicKnowledgePoints.id,
        name: topicKnowledgePoints.name,
      })
      .from(questionKnowledgePoints)
      .innerJoin(
        topicKnowledgePoints,
        eq(questionKnowledgePoints.knowledgePointId, topicKnowledgePoints.id),
      )
      .where(eq(questionKnowledgePoints.questionId, questionId)),
  ]);

  return {
    ...question,
    answer: answerRows[0] ?? null,
    knowledgePoints: kpRows,
  };
}

export async function generateSolution(questionId: string, topicId: string) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { error: "请先登录" };
  }

  const accessible = await canAccessTopic(topicId, userId);
  if (!accessible) {
    return { error: "题库不存在或无权限" };
  }

  const questionRows = await db
    .select({
      id: questions.id,
      content: questions.content,
      type: questions.type,
    })
    .from(questions)
    .where(and(eq(questions.id, questionId), eq(questions.topicId, topicId)))
    .limit(1);

  if (questionRows.length === 0) {
    return { error: "题目不存在" };
  }

  const question = questionRows[0];

  const knowledgePointsRows = await db
    .select({
      id: topicKnowledgePoints.id,
      name: topicKnowledgePoints.name,
    })
    .from(topicKnowledgePoints)
    .where(eq(topicKnowledgePoints.topicId, topicId));

  try {
    const result = await generateSolutionAI(
      question.content,
      QUESTION_TYPE_LABELS[question.type] || question.type,
      knowledgePointsRows,
    );

    const existingAnswer = await db
      .select({ id: answers.id })
      .from(answers)
      .where(eq(answers.questionId, questionId))
      .limit(1);

    if (existingAnswer.length > 0) {
      await db
        .update(answers)
        .set({
          content: result.answer,
          explanation: result.explanation,
        })
        .where(eq(answers.id, existingAnswer[0].id));
    } else {
      await db.insert(answers).values({
        questionId,
        content: result.answer,
        explanation: result.explanation,
      });
    }

    await db
      .delete(questionKnowledgePoints)
      .where(eq(questionKnowledgePoints.questionId, questionId));

    if (result.matchedKnowledgePointIds.length > 0) {
      await db.insert(questionKnowledgePoints).values(
        result.matchedKnowledgePointIds.map((kpId) => ({
          questionId,
          knowledgePointId: kpId,
        })),
      );
    }

    revalidatePath(`/topics/${topicId}/questions/${questionId}`);

    return {
      success: true,
      answer: result.answer,
      explanation: result.explanation,
      matchedKnowledgePointIds: result.matchedKnowledgePointIds,
      suggestions: result.suggestions,
    };
  } catch (error) {
    console.error("AI 生成解析失败:", error);
    return { error: "AI 生成解析失败，请稍后重试" };
  }
}
