import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeStepFormatStream } from "@/lib/ai/question-analyzer-steps";
import { getCurrentUserId } from "@/lib/auth/get-current-user-id";

const formatStreamSchema = z.object({
  questionRaw: z.string().trim().min(1, "题目内容不能为空"),
  questionType: z.string().min(1, "题目类型不能为空"),
});

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "请先登录后再使用 AI 分析" },
      { status: 401 },
    );
  }

  if (!process.env.MINIMAX_API_KEY) {
    return NextResponse.json(
      { error: "AI 服务未配置，请联系管理员" },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "请求体不是有效的 JSON" },
      { status: 400 },
    );
  }

  const parsed = formatStreamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "输入不合法" },
      { status: 400 },
    );
  }

  const { questionRaw, questionType } = parsed.data;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of analyzeStepFormatStream(
          questionRaw,
          questionType,
        )) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chunk", text: chunk })}\n\n`,
            ),
          );
        }
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`),
        );
      } catch (error) {
        console.error("Format stream 失败:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", error: "AI 格式化失败，请稍后重试" })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
