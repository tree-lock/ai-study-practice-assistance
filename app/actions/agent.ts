"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { topics } from "@/lib/db/schema";

const agentPromptSchema = z.object({
  prompt: z.string().min(4, "请输入更具体的学习目标"),
});

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

type AgentActionResult =
  | { success: true; data: AgentPlan }
  | { success: false; error: string };

const TOPIC_KEYWORDS: Array<{ topic: string; keywords: Array<string> }> = [
  { topic: "线性代数", keywords: ["线代", "线性代数", "矩阵", "向量"] },
  { topic: "高等数学", keywords: ["高数", "极限", "微分", "积分"] },
  { topic: "计算机网络", keywords: ["计网", "网络", "tcp", "udp"] },
  { topic: "数据结构", keywords: ["数据结构", "链表", "树", "图"] },
  { topic: "离散数学", keywords: ["离散", "命题逻辑", "组合数学"] },
];

function extractMinutes(prompt: string) {
  const matched = prompt.match(/(\d+)\s*分钟/g);
  if (!matched) {
    return 45;
  }

  const total = matched.reduce((sum, item) => {
    const value = Number.parseInt(item.replace(/\D/g, ""), 10);
    if (Number.isNaN(value)) {
      return sum;
    }
    return sum + value;
  }, 0);

  return total > 0 ? total : 45;
}

function extractTopics(prompt: string) {
  const lower = prompt.toLowerCase();
  const topics = TOPIC_KEYWORDS.filter((item) =>
    item.keywords.some((keyword) => lower.includes(keyword.toLowerCase())),
  ).map((item) => item.topic);

  return topics.length > 0 ? topics : ["通用复习"];
}

function generateSteps(
  prompt: string,
  totalMinutes: number,
  topics: Array<string>,
) {
  const includeWrongQuestions = prompt.includes("错题");
  const base = Math.max(5, Math.floor(totalMinutes / 4));

  const steps: Array<PlanStep> = [
    {
      title: "目标拆解",
      detail: `明确本轮重点：${topics.join("、")}`,
      minutes: base,
    },
    {
      title: "专项练习",
      detail: includeWrongQuestions
        ? "优先处理最近错题，标注错因（粗心/概念不清/计算失误）"
        : "按知识点进行集中训练，保证每道题有简短复盘",
      minutes: base + 5,
    },
    {
      title: "复盘归纳",
      detail: "提炼 2-3 条可执行改进点，形成下一轮练习策略",
      minutes: base,
    },
    {
      title: "复习安排",
      detail: "根据本次表现安排明日复习顺序与时长",
      minutes: Math.max(5, totalMinutes - (base * 3 + 5)),
    },
  ];

  return steps;
}

export async function runAgentPlan(input: {
  prompt: string;
}): Promise<AgentActionResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "请先登录后再使用 Agent" };
  }

  const parsed = agentPromptSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "输入不合法",
    };
  }

  const prompt = parsed.data.prompt.trim();
  const totalMinutes = extractMinutes(prompt);
  const focusTopics = extractTopics(prompt);
  const steps = generateSteps(prompt, totalMinutes, focusTopics);

  return {
    success: true,
    data: {
      goal: prompt,
      totalMinutes,
      focusTopics,
      steps,
    },
  };
}

const saveToCatalogSchema = z.object({
  catalogName: z.string().trim().min(1, "题库名称不能为空"),
  questionContent: z.string().trim().min(1, "题目内容不能为空"),
  source: z.string().trim().optional(),
  actionType: z.enum(["save-existing", "create-new"]),
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

  const { catalogName, questionContent, source, actionType } = parsed.data;

  try {
    let topicId: string;

    if (actionType === "save-existing") {
      // 查找已存在的题库
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
      // 创建新题库
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

    // 创建题目
    const { questions } = await import("@/lib/db/schema");
    const newQuestion = await db
      .insert(questions)
      .values({
        topicId,
        content: questionContent,
        type: "subjective",
        source: source || undefined,
        creatorId: userId,
      })
      .returning({ id: questions.id });

    const questionId = newQuestion[0].id;

    // 更新缓存
    revalidatePath("/");
    revalidatePath(`/topics/${topicId}`);

    return { success: true, topicId, questionId };
  } catch (error) {
    console.error("保存题目到题库失败:", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
}
