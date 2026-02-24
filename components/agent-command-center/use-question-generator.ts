"use client";

import { useRef, useState } from "react";
import {
  analyzeQuestionStepNoticeCount,
  analyzeQuestionStepSplit,
} from "@/app/actions/agent-steps";
import {
  getMineruExtractResult,
  submitMineruExtract,
} from "@/app/actions/mineru";
import { getTopics } from "@/app/actions/topic";
import { rotateImageToFile } from "@/lib/rotate-image";
import { isMineruFile, readPlainTextFile } from "./file-utils";
import type { QuestionPanelParsePhase } from "./parse-phase-constants";
import { textToMarkdown } from "./text-to-markdown";
import type {
  CatalogRecommendation,
  QuestionPanelItem,
  TopicOption,
  UploadFileItem,
} from "./types";

type UseQuestionGeneratorProps = {
  prompt: string;
  files: UploadFileItem[];
  onPanelsGenerated: (panels: QuestionPanelItem[]) => void;
  onPanelPatch: (panelId: string, patch: Partial<QuestionPanelItem>) => void;
  onTopicsFetched: (topics: TopicOption[]) => void;
  onStatusChange: (status: "idle" | "generating" | "done" | "stopped") => void;
};

export function useQuestionGenerator({
  prompt,
  files,
  onPanelsGenerated,
  onPanelPatch,
  onTopicsFetched,
  onStatusChange,
}: UseQuestionGeneratorProps) {
  const stoppedRef = useRef(false);
  const [parsePhase, setParsePhase] = useState<QuestionPanelParsePhase>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  function stopGenerating() {
    stoppedRef.current = true;
    onStatusChange("stopped");
  }

  async function startGenerating() {
    stoppedRef.current = false;
    onStatusChange("generating");
    onPanelsGenerated([]);
    setParsePhase(null);
    setSourceLabel(null);

    const hasPromptText = prompt.trim().length > 0;
    const hasFiles = files.length > 0;

    if (!hasPromptText && !hasFiles) {
      onStatusChange("stopped");
      return;
    }

    const parts: string[] = [];

    try {
      if (hasFiles) {
        const mineruItems = files.filter((item) => isMineruFile(item.file));
        const plainItems = files.filter((item) => !isMineruFile(item.file));

        for (const item of plainItems) {
          if (stoppedRef.current) break;
          setParsePhase("parsing");
          const text = await readPlainTextFile(item.file);
          if (text.trim()) {
            parts.push(text);
          }
        }

        if (mineruItems.length > 0 && !stoppedRef.current) {
          setParsePhase("uploading");
          const formData = new FormData();
          for (const item of mineruItems) {
            const isImage = item.file.type.startsWith("image/");
            const needsRotation = isImage && item.rotationDegrees !== 0;
            const fileToAppend = needsRotation
              ? await rotateImageToFile(item.file, item.rotationDegrees)
              : item.file;
            formData.append("file", fileToAppend);
          }

          const submitResult = await submitMineruExtract(formData);
          if (!submitResult.success) {
            onStatusChange("stopped");
            setParsePhase(null);
            alert(`解析失败：${submitResult.error}`);
            return;
          }

          setParsePhase("parsing");
          let batchDone = false;
          let pollResult: Awaited<
            ReturnType<typeof getMineruExtractResult>
          > | null = null;

          while (!batchDone && !stoppedRef.current) {
            pollResult = await getMineruExtractResult(submitResult.batchId);
            if (!pollResult.success && pollResult.state === "failed") {
              onStatusChange("stopped");
              setParsePhase(null);
              alert(`解析失败：${pollResult.error}`);
              return;
            }
            batchDone =
              pollResult.state === "done" || pollResult.state === "failed";
            if (!batchDone) {
              await new Promise((r) => setTimeout(r, 2500));
            }
          }

          if (
            pollResult?.success &&
            pollResult.state === "done" &&
            pollResult.markdownContents?.length &&
            !stoppedRef.current
          ) {
            parts.push(...pollResult.markdownContents);
          }
        }

        setParsePhase(null);
      }

      if (hasPromptText) {
        parts.unshift(prompt.trim());
      }

      const rawContent = parts.join("\n\n---\n\n").trim();
      if (!rawContent || stoppedRef.current) {
        onStatusChange("stopped");
        setParsePhase(null);
        if (!rawContent) alert("未能从文件或文字中提取到有效内容");
        return;
      }

      setSourceLabel("AI 智能分析");

      const topicsData = await getTopics();
      const topicOptions: Array<TopicOption> = topicsData.map((topic) => ({
        id: topic.id,
        name: topic.name,
      }));
      onTopicsFetched(topicOptions);

      setParsePhase("notice-count");
      const noticeCountResult = await analyzeQuestionStepNoticeCount({
        rawContent,
      });
      if (!noticeCountResult.success || stoppedRef.current) {
        if (!noticeCountResult.success)
          alert(`分析失败：${noticeCountResult.error}`);
        onStatusChange("stopped");
        setParsePhase(null);
        return;
      }

      const globalNotice = noticeCountResult.notice;
      const count = noticeCountResult.count;
      setParsePhase("splitting");
      const splitResult = await analyzeQuestionStepSplit({
        rawContent,
        count,
      });
      if (!splitResult.success || stoppedRef.current) {
        if (!splitResult.success) alert(`分析失败：${splitResult.error}`);
        onStatusChange("stopped");
        setParsePhase(null);
        return;
      }
      const questionItems = splitResult.parts;

      const emptyCatalog: CatalogRecommendation = {
        topicId: "",
        topicName: "",
        matchScore: 0,
      };
      const panels: QuestionPanelItem[] = questionItems.map((item) => {
        const questionRaw = item.content;
        const recommendation = item.catalogRecommendation ?? emptyCatalog;
        const recommendedTopic = topicOptions.find(
          (t) =>
            t.id === recommendation.topicId ||
            t.name === recommendation.topicName,
        );
        const defaultTopicId =
          recommendedTopic?.id ?? topicOptions[0]?.id ?? null;

        return {
          id: crypto.randomUUID(),
          questionRaw,
          notice: globalNotice,
          questionType: item.questionType,
          questionTypeLabel: item.questionTypeLabel,
          formattedContent: "",
          catalogRecommendation: recommendation,
          selectedTopicId: defaultTopicId,
          status: "processing" as const,
          currentPhase: "format" as QuestionPanelParsePhase,
        };
      });

      onPanelsGenerated([...panels]);
      setParsePhase(null);

      async function processSingleQuestion(
        panel: QuestionPanelItem,
      ): Promise<void> {
        const panelId = panel.id;
        const questionRaw = panel.questionRaw ?? "";
        const questionType = panel.questionType || "subjective";

        onPanelPatch(panelId, {
          status: "processing",
          currentPhase: "format",
        });
        if (stoppedRef.current) return;

        const formatAbortController = new AbortController();
        let formattedContent = "";
        let formatError: string | null = null;

        try {
          const response = await fetch("/api/agent/format-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionRaw, questionType }),
            signal: formatAbortController.signal,
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            formatError =
              (errBody as { error?: string }).error ?? "格式化请求失败";
          } else if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let sseDone = false;

            while (!sseDone) {
              if (stoppedRef.current) {
                formatAbortController.abort();
                break;
              }
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  try {
                    const payload = JSON.parse(line.slice(6)) as
                      | { type: "chunk"; text: string }
                      | { type: "done" }
                      | { type: "error"; error: string };
                    if (payload.type === "chunk") {
                      formattedContent += payload.text;
                      onPanelPatch(panelId, {
                        formattedContent,
                        currentPhase: "format",
                      });
                    } else if (payload.type === "error") {
                      formatError = payload.error;
                      sseDone = true;
                    } else if (payload.type === "done") {
                      sseDone = true;
                    }
                  } catch {
                    // 忽略解析失败的行
                  }
                }
              }
            }
          }
        } catch (e) {
          if ((e as { name?: string }).name !== "AbortError") {
            formatError = e instanceof Error ? e.message : "格式化请求失败";
          }
        }

        if (formatError) {
          alert(`分析失败：${formatError}`);
          // 格式化失败时，回退为可编辑状态，展示原始文本
          onPanelPatch(panelId, {
            formattedContent: textToMarkdown(questionRaw),
            status: "done",
            currentPhase: null,
          });
          return;
        }
        if (stoppedRef.current) return;

        if (!formattedContent.trim()) {
          formattedContent = textToMarkdown(questionRaw);
        }
        onPanelPatch(panelId, {
          formattedContent,
          status: "done",
          currentPhase: null,
        });
      }

      await Promise.all(panels.map((panel) => processSingleQuestion(panel)));

      setParsePhase(null);
      onStatusChange(stoppedRef.current ? "stopped" : "done");
    } catch (error) {
      console.error("生成失败:", error);
      onStatusChange("stopped");
      setParsePhase(null);
    }
  }

  function handleGenerateClick() {
    if (stoppedRef.current || parsePhase !== null) {
      stopGenerating();
      return;
    }
    if (!files.length && !prompt.trim()) {
      return;
    }
    startGenerating();
  }

  return {
    parsePhase,
    sourceLabel,
    startGenerating,
    stopGenerating,
    handleGenerateClick,
  };
}
