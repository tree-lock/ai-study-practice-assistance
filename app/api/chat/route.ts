import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { and, count, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { assertGatewayApiKey, getGatewayModelId } from "@/lib/ai/gateway-model";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";
import { db } from "@/lib/db";
import { agentMessages, agentTasks } from "@/lib/db/schema";

const SYSTEM_PROMPT = `你是通用 AI 助手，帮助用户思考、写作、规划与解决问题。
回答使用清晰的中文；不要假装自己是题库或刷题工具，也不要引导用户上传「题目」或「题库」。`;

function textFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && typeof (p as { text?: string }).text === "string",
    )
    .map((p) => p.text)
    .join("");
}

export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return new Response(JSON.stringify({ error: "未登录" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "无效请求体" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    !("messages" in body)
  ) {
    return new Response(JSON.stringify({ error: "缺少 id 或 messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const taskId = (body as { id: unknown }).id;
  const messages = (body as { messages: unknown }).messages;

  if (typeof taskId !== "string" || !Array.isArray(messages)) {
    return new Response(JSON.stringify({ error: "参数类型错误" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const [task] = await db
    .select({
      id: agentTasks.id,
      userId: agentTasks.userId,
      title: agentTasks.title,
    })
    .from(agentTasks)
    .where(eq(agentTasks.id, taskId))
    .limit(1);

  if (!task || task.userId !== userId) {
    return new Response(JSON.stringify({ error: "无权访问该任务" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    assertGatewayApiKey();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 未配置";
    return new Response(JSON.stringify({ error: msg }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }

  const uiMessages = messages as UIMessage[];
  const lastUser = [...uiMessages].reverse().find((m) => m.role === "user");
  if (lastUser) {
    const content = textFromParts(lastUser.parts);
    const [existing] = await db
      .select({ id: agentMessages.id })
      .from(agentMessages)
      .where(
        and(
          eq(agentMessages.taskId, taskId),
          eq(agentMessages.clientMessageId, lastUser.id),
        ),
      )
      .limit(1);

    if (!existing && content.trim()) {
      await db.insert(agentMessages).values({
        taskId,
        role: "user",
        content,
        clientMessageId: lastUser.id,
      });

      const [{ n }] = await db
        .select({ n: count() })
        .from(agentMessages)
        .where(eq(agentMessages.taskId, taskId));

      if (n === 1 && task.title === "新任务") {
        await db
          .update(agentTasks)
          .set({
            title: content.trim().slice(0, 60),
            updatedAt: new Date(),
          })
          .where(eq(agentTasks.id, taskId));
      } else {
        await db
          .update(agentTasks)
          .set({ updatedAt: new Date() })
          .where(eq(agentTasks.id, taskId));
      }
      revalidatePath("/", "layout");
    }
  }

  const modelMessages = await convertToModelMessages(
    uiMessages.map(({ id: _id, ...rest }) => rest) as Omit<UIMessage, "id">[],
  );

  const modelId = getGatewayModelId();

  const result = streamText({
    model: modelId,
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      await db.insert(agentMessages).values({
        taskId,
        role: "assistant",
        content: trimmed,
        clientMessageId: null,
      });
      await db
        .update(agentTasks)
        .set({ updatedAt: new Date() })
        .where(eq(agentTasks.id, taskId));
      revalidatePath("/", "layout");
    },
  });

  return result.toUIMessageStreamResponse();
}
