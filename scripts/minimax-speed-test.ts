/**
 * MiniMax API 速度测试脚本
 *
 * 用法: bun run scripts/minimax-speed-test.ts
 * 环境: 需设置 MINIMAX_API_KEY
 */

import { MINIMAX_MODEL, minimax } from "@/lib/ai/minimax";

const DEFAULT_RUNS = 3;
const DEFAULT_PROMPT = "请用一句话回答：1+1等于几？";

async function measureSingleCall(
  userPrompt: string,
): Promise<{ elapsedMs: number; outputLength: number }> {
  const start = performance.now();
  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 256,
    messages: [{ role: "user", content: userPrompt }],
  });
  const elapsedMs = performance.now() - start;

  const textBlock = message.content.find((block) => block.type === "text");
  const outputLength =
    textBlock && textBlock.type === "text" ? textBlock.text.length : 0;

  return { elapsedMs, outputLength };
}

async function runStreamingTest(
  userPrompt: string,
): Promise<{ ttftMs: number; totalMs: number; outputLength: number }> {
  const start = performance.now();
  let ttftMs: number | null = null;
  let fullText = "";

  const stream = minimax.messages.stream({
    model: MINIMAX_MODEL,
    max_tokens: 256,
    messages: [{ role: "user", content: userPrompt }],
  });

  await new Promise<void>((resolve, reject) => {
    stream.on("text", (textDelta: string) => {
      if (ttftMs === null) {
        ttftMs = performance.now() - start;
      }
      fullText += textDelta;
    });
    stream.on("end", () => resolve());
    stream.on("error", (err: Error) => reject(err));
  });

  const totalMs = performance.now() - start;
  return {
    ttftMs: ttftMs ?? totalMs,
    totalMs,
    outputLength: fullText.length,
  };
}

function formatMs(ms: number): string {
  return `${ms.toFixed(0)}ms`;
}

function stats(numbers: number[]): { avg: number; min: number; max: number } {
  const sum = numbers.reduce((a, b) => a + b, 0);
  return {
    avg: sum / numbers.length,
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

async function main() {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.error("错误: 请设置环境变量 MINIMAX_API_KEY");
    process.exit(1);
  }

  const runs = Number(process.env.RUNS ?? DEFAULT_RUNS) || DEFAULT_RUNS;
  const prompt = process.env.PROMPT ?? DEFAULT_PROMPT;
  const streaming = process.env.STREAM === "1";

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("MiniMax API 速度测试");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`模型: ${MINIMAX_MODEL}`);
  console.log(`测试轮数: ${runs}`);
  console.log(`提示词: ${prompt}`);
  console.log(`模式: ${streaming ? "流式 (stream)" : "非流式"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (streaming) {
    const results: { ttftMs: number; totalMs: number; outputLength: number }[] =
      [];
    for (let i = 0; i < runs; i++) {
      process.stdout.write(`  第 ${i + 1}/${runs} 次... `);
      const r = await runStreamingTest(prompt);
      results.push(r);
      console.log(
        `TTFT ${formatMs(r.ttftMs)}, 总耗时 ${formatMs(r.totalMs)}, 输出 ${r.outputLength} 字符`,
      );
    }

    const ttftStats = stats(results.map((r) => r.ttftMs));
    const totalStats = stats(results.map((r) => r.totalMs));

    console.log("\n━━━━ 流式接口统计 ━━━━");
    console.log(
      `首字延迟 (TTFT): 平均 ${formatMs(ttftStats.avg)}, 最小 ${formatMs(ttftStats.min)}, 最大 ${formatMs(ttftStats.max)}`,
    );
    console.log(
      `总耗时: 平均 ${formatMs(totalStats.avg)}, 最小 ${formatMs(totalStats.min)}, 最大 ${formatMs(totalStats.max)}`,
    );
  } else {
    const results: { elapsedMs: number; outputLength: number }[] = [];
    for (let i = 0; i < runs; i++) {
      process.stdout.write(`  第 ${i + 1}/${runs} 次... `);
      const r = await measureSingleCall(prompt);
      results.push(r);
      console.log(`${formatMs(r.elapsedMs)}, 输出 ${r.outputLength} 字符`);
    }

    const elapsedStats = stats(results.map((r) => r.elapsedMs));

    console.log("\n━━━━ 非流式接口统计 ━━━━");
    console.log(
      `延迟: 平均 ${formatMs(elapsedStats.avg)}, 最小 ${formatMs(elapsedStats.min)}, 最大 ${formatMs(elapsedStats.max)}`,
    );
  }

  console.log("\n完成。");
}

main().catch((err) => {
  console.error("测试失败:", err);
  process.exit(1);
});
