"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  analyzeQuestion,
  type QuestionAnalysisResult,
} from "@/lib/ai/question-analyzer";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { questions, topics } from "@/lib/db/schema";
import { getTopics } from "./topic";

type PlanStep = {
  title: string;
  detail: string;
  minutes: number;
};

export type AgentPlan = {
  goal: string;
  totalMinutes: number;
  focusTopics: Array<string>;
  steps: Array<PlanStep>;
};

const analyzeQuestionSchema = z.object({
  rawContent: z.string().trim().min(1, "请输入题目内容"),
});

export type AnalyzeQuestionResult =
  | { success: true; data: QuestionAnalysisResult }
  | { success: false; error: string };

export async function analyzeQuestionAction(input: {
  rawContent: string;
}): Promise<AnalyzeQuestionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }

  const parsed = analyzeQuestionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  try {
    const userTopics = await getTopics();
    const existingTopics = userTopics.map((t) => ({
      id: t.id,
      name: t.name,
    }));

    const result = await analyzeQuestion(
      parsed.data.rawContent,
      existingTopics,
    );
    return { success: true, data: result };
  } catch (error) {
    console.error("AI 分析题目失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const QUESTION_TYPES = [
  "choice",
  "blank",
  "subjective",
  "application",
  "proof",
  "comprehensive",
] as const;

const saveToCatalogSchema = z.object({
  topicId: z.string().uuid("题库参数不合法"),
  questionContent: z.string().trim().min(1, "题目内容不能为空"),
  source: z.string().trim().optional(),
  questionType: z.enum(QUESTION_TYPES).optional(),
});

type SaveToCatalogResult =
  | { success: true; topicId: string; questionId: string }
  | { success: false; error: string };

const saveQuestionsToCatalogSchema = z.object({
  topicId: z.string().uuid("题库参数不合法"),
  questions: z
    .array(
      z.object({
        content: z.string().trim().min(1, "题目内容不能为空"),
        questionType: z.enum(QUESTION_TYPES).optional(),
      }),
    )
    .min(1, "至少需要一道题目"),
  source: z.string().trim().optional(),
});

type SaveQuestionsToCatalogResult =
  | { success: true; topicId: string; questionIds: string[] }
  | { success: false; error: string };

export async function saveQuestionsToCatalog(
  input: z.infer<typeof saveQuestionsToCatalogSchema>,
): Promise<SaveQuestionsToCatalogResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再保存题目" };
  }

  const parsed = saveQuestionsToCatalogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  const { topicId, questions: questionItems, source } = parsed.data;

  try {
    const existingTopic = await db
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
      .limit(1);

    if (existingTopic.length === 0) {
      return {
        success: false,
        error: "指定的题库不存在或无权限",
      };
    }

    const rows = questionItems.map((q) => ({
      topicId,
      content: q.content,
      type: q.questionType ?? "subjective",
      source: source || undefined,
      creatorId: userId,
    }));

    const inserted = await db
      .insert(questions)
      .values(rows)
      .returning({ id: questions.id });

    const questionIds = inserted.map((r) => r.id);

    revalidatePath("/");
    revalidatePath(`/topics/${topicId}`);

    return { success: true, topicId, questionIds };
  } catch (error) {
    console.error("批量保存题目到题库失败:", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
}

export async function saveQuestionToCatalog(
  input: z.infer<typeof saveToCatalogSchema>,
): Promise<SaveToCatalogResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再保存题目" };
  }

  const parsed = saveToCatalogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  const { topicId, questionContent, source, questionType } = parsed.data;

  try {
    const existingTopic = await db
      .select({ id: topics.id })
      .from(topics)
      .where(and(eq(topics.id, topicId), eq(topics.userId, userId)))
      .limit(1);

    if (existingTopic.length === 0) {
      return {
        success: false,
        error: "指定的题库不存在或无权限",
      };
    }

    const newQuestion = await db
      .insert(questions)
      .values({
        topicId,
        content: questionContent,
        type: questionType ?? "subjective",
        source: source || undefined,
        creatorId: userId,
      })
      .returning({ id: questions.id });

    const questionId = newQuestion[0].id;

    revalidatePath("/");
    revalidatePath(`/topics/${topicId}`);

    return { success: true, topicId, questionId };
  } catch (error) {
    console.error("保存题目到题库失败:", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
}
