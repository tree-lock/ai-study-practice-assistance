"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { DefaultChatTransport } from "ai";
import { ArrowUp, Loader2, Square } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/ui/callout";

type TaskChatProps = {
  taskId: string;
  title: string;
  initialMessages: UIMessage[];
};

function textFromParts(parts: UIMessage["parts"]): string {
  return parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && typeof (p as { text?: string }).text === "string",
    )
    .map((p) => p.text)
    .join("\n\n");
}

export function TaskChat({ taskId, title, initialMessages }: TaskChatProps) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    id: taskId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      router.refresh();
    },
  });

  const busy = status !== "ready";
  const lastMessage = messages[messages.length - 1];
  const showReplySpinner = busy && lastMessage?.role === "user";

  return (
    <div className="flex min-h-0 min-h-[320px] w-full flex-1 flex-col">
      <header className="flex shrink-0 items-center pb-4">
        <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight">
          {title}
        </h1>
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto py-6 pr-1">
        {messages.length === 0 && !busy ? (
          <div className="flex min-h-full flex-col items-center justify-center gap-2 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              输入需求后按 Enter 或点击发送，开始与本任务中的 Agent 对话。
            </p>
            <Button variant="link" asChild className="text-sm">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        ) : null}

        {messages.map((m) => {
          const body = textFromParts(m.parts);
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={
                  isUser
                    ? "max-w-[min(100%,36rem)] rounded-2xl bg-muted px-4 py-3 text-foreground shadow-sm"
                    : "max-w-[min(100%,40rem)] rounded-2xl border border-border/80 bg-card px-4 py-3 text-card-foreground shadow-sm"
                }
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {body}
                  </p>
                ) : (
                  <div className="text-[15px] leading-relaxed">
                    <MarkdownContent content={body} />
                  </div>
                )}
                {!isUser && body ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-muted-foreground"
                      disabled={busy}
                      onClick={() => void regenerate()}
                    >
                      重新生成
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}

        {busy && lastMessage?.role === "user" ? (
          <div className="flex justify-start">
            <div className="flex max-w-[min(100%,40rem)] items-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              {showReplySpinner ? (
                <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              ) : null}
              <span>
                {status === "submitted" ? "正在准备回复…" : "正在回复…"}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <Callout variant="red" className="mb-3 shrink-0">
          <div>
            <span className="font-medium">请求失败</span>
            <p className="mt-1">{error.message}</p>
          </div>
        </Callout>
      ) : null}

      <form
        className="shrink-0 pb-1"
        onSubmit={(e) => {
          e.preventDefault();
          const t = input.trim();
          if (!t || busy) return;
          void sendMessage({ text: t });
          setInput("");
        }}
      >
        <label htmlFor="task-chat-input" className="sr-only">
          消息内容
        </label>
        <div className="rounded-2xl border border-border/80 bg-background shadow-sm">
          <textarea
            id="task-chat-input"
            name="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              e.preventDefault();
              const t = input.trim();
              if (!t || busy) return;
              void sendMessage({ text: t });
              setInput("");
            }}
            placeholder="请输入你的需求，按 Enter 发送；Shift+Enter 换行"
            disabled={busy}
            rows={4}
            className="max-h-[200px] min-h-[100px] w-full resize-y rounded-t-2xl border-0 bg-transparent px-4 py-3 text-[15px] leading-relaxed shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50"
          />
          <div className="flex items-center justify-between gap-2 border-t border-border/60 px-2 py-2">
            <div className="flex items-center gap-1 pl-1">
              {busy ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full text-muted-foreground"
                  aria-label="停止生成"
                  onClick={() => stop()}
                >
                  <Square className="size-4 fill-current" />
                </Button>
              ) : (
                <span className="px-2 text-xs text-muted-foreground">
                  Agent 对话
                </span>
              )}
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={busy || !input.trim()}
              className="size-10 shrink-0 rounded-full"
              aria-label="发送"
            >
              <ArrowUp className="size-5" />
            </Button>
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
          内容由 AI 生成，请注意核对重要信息。
        </p>
      </form>
    </div>
  );
}
