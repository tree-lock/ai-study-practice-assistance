"use server";

import { z } from "zod";
import type { CatalogRecommendation } from "@/lib/ai/question-analyzer";
import {
  analyzeStepCatalog,
  analyzeStepCount,
  analyzeStepFormat,
  analyzeStepNotice,
  analyzeStepNoticeCount,
  analyzeStepSplitTypeCatalog,
  analyzeStepType,
} from "@/lib/ai/question-analyzer-steps";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { getTopics } from "./topic";

const stepNoticeSchema = z.object({
  rawContent: z.string().trim().min(1, "请输入题目内容"),
});

export type StepNoticeResult =
  | { success: true; notice?: string }
  | { success: false; error: string };

export async function analyzeQuestionStepNotice(input: {
  rawContent: string;
}): Promise<StepNoticeResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepNoticeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const result = await analyzeStepNotice(parsed.data.rawContent);
    return { success: true, notice: result.notice };
  } catch (error) {
    console.error("Step notice 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepNoticeCountSchema = z.object({
  rawContent: z.string().trim().min(1, "请输入题目内容"),
});

export type StepNoticeCountResult =
  | { success: true; notice?: string; count: number }
  | { success: false; error: string };

export async function analyzeQuestionStepNoticeCount(input: {
  rawContent: string;
}): Promise<StepNoticeCountResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepNoticeCountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const result = await analyzeStepNoticeCount(parsed.data.rawContent);
    return {
      success: true,
      notice: result.notice,
      count: result.count,
    };
  } catch (error) {
    console.error("Step notice-count 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepCountSchema = z.object({
  rawContent: z.string().trim().min(1, "请输入题目内容"),
  notice: z.string().optional(),
});

export type StepCountResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function analyzeQuestionStepCount(input: {
  rawContent: string;
  notice?: string;
}): Promise<StepCountResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepCountSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const result = await analyzeStepCount(
      parsed.data.rawContent,
      parsed.data.notice,
    );
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Step count 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepSplitSchema = z.object({
  rawContent: z.string().trim().min(1, "请输入题目内容"),
  count: z.number().int().min(1),
});

export type StepSplitPart = {
  content: string;
  questionType: string;
  questionTypeLabel: string;
  catalogRecommendation: CatalogRecommendation;
};

export type StepSplitResult =
  | { success: true; parts: StepSplitPart[] }
  | { success: false; error: string };

export async function analyzeQuestionStepSplit(input: {
  rawContent: string;
  count: number;
}): Promise<StepSplitResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepSplitSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const topicsData = await getTopics();
    const existingTopics = topicsData.map((t) => ({ id: t.id, name: t.name }));

    const result = await analyzeStepSplitTypeCatalog(
      parsed.data.rawContent,
      parsed.data.count,
      existingTopics,
    );

    const parts: StepSplitPart[] = result.parts.map((part) => ({
      content: part.content,
      questionType: part.questionType,
      questionTypeLabel: part.questionTypeLabel,
      catalogRecommendation: part.catalogRecommendation,
    }));

    return { success: true, parts };
  } catch (error) {
    console.error("Step split 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepTypeSchema = z.object({
  questionRaw: z.string().trim().min(1, "题目内容不能为空"),
  notice: z.string().optional(),
});

export type StepTypeResult =
  | {
      success: true;
      questionType: string;
      questionTypeLabel: string;
    }
  | { success: false; error: string };

export async function analyzeQuestionStepType(input: {
  questionRaw: string;
  notice?: string;
}): Promise<StepTypeResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepTypeSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const result = await analyzeStepType(
      parsed.data.questionRaw,
      parsed.data.notice,
    );
    return {
      success: true,
      questionType: result.questionType,
      questionTypeLabel: result.questionTypeLabel,
    };
  } catch (error) {
    console.error("Step type 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepFormatSchema = z.object({
  questionRaw: z.string().trim().min(1, "题目内容不能为空"),
  questionType: z.string().min(1, "题目类型不能为空"),
});

export type StepFormatResult =
  | { success: true; formattedContent: string }
  | { success: false; error: string };

export async function analyzeQuestionStepFormat(input: {
  questionRaw: string;
  questionType: string;
}): Promise<StepFormatResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepFormatSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const result = await analyzeStepFormat(
      parsed.data.questionRaw,
      parsed.data.questionType,
    );
    return { success: true, formattedContent: result.formattedContent };
  } catch (error) {
    console.error("Step format 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}

const stepCatalogSchema = z.object({
  questionRaw: z.string().trim().min(1, "题目内容不能为空"),
});

export type StepCatalogResult =
  | { success: true; catalogRecommendation: CatalogRecommendation }
  | { success: false; error: string };

export async function analyzeQuestionStepCatalog(input: {
  questionRaw: string;
}): Promise<StepCatalogResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 AI 分析" };
  }
  if (!process.env.MINIMAX_API_KEY) {
    return { success: false, error: "AI 服务未配置，请联系管理员" };
  }

  const parsed = stepCatalogSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  try {
    const topicsData = await getTopics();
    const existingTopics = topicsData.map((t) => ({ id: t.id, name: t.name }));

    const result = await analyzeStepCatalog(
      parsed.data.questionRaw,
      existingTopics,
    );
    return {
      success: true,
      catalogRecommendation: result.catalogRecommendation,
    };
  } catch (error) {
    console.error("Step catalog 失败:", error);
    return { success: false, error: "AI 分析失败，请稍后重试" };
  }
}
