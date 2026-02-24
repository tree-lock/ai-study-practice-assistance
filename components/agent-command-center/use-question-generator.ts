"use client";

import { useRef, useState } from "react";
import {
  analyzeQuestionStepCatalog,
  analyzeQuestionStepCount,
  analyzeQuestionStepFormat,
  analyzeQuestionStepNotice,
  analyzeQuestionStepSplit,
  analyzeQuestionStepType,
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

      setParsePhase("notice");
      const noticeResult = await analyzeQuestionStepNotice({ rawContent });
      if (!noticeResult.success || stoppedRef.current) {
        if (!noticeResult.success) alert(`分析失败：${noticeResult.error}`);
        onStatusChange("stopped");
        setParsePhase(null);
        return;
      }

      const globalNotice = noticeResult.notice;

      setParsePhase("count");
      const countResult = await analyzeQuestionStepCount({
        rawContent,
        notice: globalNotice,
      });
      if (!countResult.success || stoppedRef.current) {
        if (!countResult.success) alert(`分析失败：${countResult.error}`);
        onStatusChange("stopped");
        setParsePhase(null);
        return;
      }

      const count = countResult.count;
      let questionParts: string[];

      if (count > 1) {
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
        questionParts = splitResult.parts;
      } else {
        questionParts = [rawContent];
      }

      const emptyCatalog: CatalogRecommendation = {
        topicId: "",
        topicName: "",
        matchScore: 0,
      };

      const panels: QuestionPanelItem[] = questionParts.map(() => ({
        id: crypto.randomUUID(),
        questionRaw: "",
        notice: undefined,
        questionType: "subjective",
        questionTypeLabel: "主观题",
        formattedContent: "",
        catalogRecommendation: emptyCatalog,
        selectedTopicId: null,
        status: "processing" as const,
        currentPhase: null as QuestionPanelParsePhase,
      }));

      onPanelsGenerated([...panels]);
      setParsePhase(null);

      async function processSingleQuestion(
        questionRaw: string,
        panel: QuestionPanelItem,
      ): Promise<void> {
        const panelId = panel.id;
        onPanelPatch(panelId, {
          questionRaw,
          status: "processing",
          currentPhase: "notice",
        });
        if (stoppedRef.current) return;

        const qNoticeResult = await analyzeQuestionStepNotice({
          rawContent: questionRaw,
        });
        const qNotice = qNoticeResult.success
          ? qNoticeResult.notice
          : undefined;
        if (stoppedRef.current) return;

        onPanelPatch(panelId, { currentPhase: "type" });
        const typeResult = await analyzeQuestionStepType({
          questionRaw,
          notice: qNotice,
        });
        if (!typeResult.success) {
          alert(`分析失败：${typeResult.error}`);
          return;
        }
        if (stoppedRef.current) return;

        const { questionType, questionTypeLabel } = typeResult;
        onPanelPatch(panelId, {
          notice: qNotice,
          questionType,
          questionTypeLabel,
          currentPhase: "format",
        });
        const formatResult = await analyzeQuestionStepFormat({
          questionRaw,
          questionType,
        });
        if (!formatResult.success) {
          alert(`分析失败：${formatResult.error}`);
          return;
        }
        if (stoppedRef.current) return;

        let formattedContent = formatResult.formattedContent;
        if (!formattedContent.trim()) {
          formattedContent = textToMarkdown(questionRaw);
        }
        onPanelPatch(panelId, {
          formattedContent,
          currentPhase: "catalog",
        });
        const catalogResult = await analyzeQuestionStepCatalog({
          questionRaw,
        });
        if (!catalogResult.success) {
          alert(`分析失败：${catalogResult.error}`);
          return;
        }
        if (stoppedRef.current) return;

        const catalogRecommendation = catalogResult.catalogRecommendation;
        const recommendedTopic = topicOptions.find(
          (t) =>
            t.id === catalogRecommendation.topicId ||
            t.name === catalogRecommendation.topicName,
        );
        const defaultTopicId =
          recommendedTopic?.id ?? topicOptions[0]?.id ?? null;

        onPanelPatch(panelId, {
          catalogRecommendation,
          selectedTopicId: defaultTopicId,
          status: "done",
          currentPhase: null,
        });
      }

      await Promise.all(
        questionParts.map((raw, i) => processSingleQuestion(raw, panels[i])),
      );

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
