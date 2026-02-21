"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  analyzeQuestion,
  type QuestionAnalysisResult,
} from "@/lib/ai/question-analyzer";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { questions, questionTags, tags, topics } from "@/lib/db/schema";
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
  catalogName: z.string().trim().min(1, "题库名称不能为空"),
  questionContent: z.string().trim().min(1, "题目内容不能为空"),
  source: z.string().trim().optional(),
  actionType: z.enum(["save-existing", "create-new"]),
  questionType: z.enum(QUESTION_TYPES).optional(),
  knowledgePoints: z.array(z.string().trim()).optional(),
});

type SaveToCatalogResult =
  | { success: true; topicId: string; questionId: string }
  | { success: false; error: string };

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

  const {
    catalogName,
    questionContent,
    source,
    actionType,
    questionType,
    knowledgePoints,
  } = parsed.data;

  try {
    let topicId: string;

    if (actionType === "save-existing") {
      const existingTopic = await db
        .select({ id: topics.id })
        .from(topics)
        .where(eq(topics.name, catalogName))
        .limit(1);

      if (existingTopic.length === 0) {
        return {
          success: false,
          error: "指定的题库不存在",
        };
      }

      topicId = existingTopic[0].id;
    } else {
      const newTopic = await db
        .insert(topics)
        .values({
          name: catalogName,
          userId,
          description: `自动创建的题库 - ${new Date().toLocaleDateString("zh-CN")}`,
        })
        .returning({ id: topics.id });

      topicId = newTopic[0].id;
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

    if (knowledgePoints && knowledgePoints.length > 0) {
      for (const pointName of knowledgePoints) {
        const trimmedName = pointName.trim();
        if (!trimmedName) continue;

        const existingTag = await db
          .select({ id: tags.id })
          .from(tags)
          .where(eq(tags.name, trimmedName))
          .limit(1);

        let tagId: string;
        if (existingTag.length > 0) {
          tagId = existingTag[0].id;
        } else {
          const newTag = await db
            .insert(tags)
            .values({
              name: trimmedName,
              topicId,
            })
            .returning({ id: tags.id });
          tagId = newTag[0].id;
        }

        await db
          .insert(questionTags)
          .values({
            questionId,
            tagId,
          })
          .onConflictDoNothing();
      }
    }

    revalidatePath("/");
    revalidatePath(`/topics/${topicId}`);

    return { success: true, topicId, questionId };
  } catch (error) {
    console.error("保存题目到题库失败:", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
}
