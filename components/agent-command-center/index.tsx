"use client";

import { Box } from "@mui/material";
import { useRef, useState } from "react";
import {
  analyzeQuestionAction,
  saveQuestionToCatalog,
} from "@/app/actions/agent";
import { getTopics } from "@/app/actions/topic";
import { InputArea } from "./input-area";
import { QuestionPanel } from "./question-panel";
import { textToMarkdown } from "./text-to-markdown";
import type { AnalysisResult, TopicOption, UploadFileItem } from "./types";

export function AgentCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<
    "idle" | "generating" | "done" | "stopped"
  >("idle");
  const [questionMarkdown, setQuestionMarkdown] = useState("");
  const [existingCatalogCandidates, setExistingCatalogCandidates] = useState<
    Array<TopicOption>
  >([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [isSavingToTopic, setIsSavingToTopic] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toUploadItem(file: File): UploadFileItem {
    return {
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    };
  }

  function addFiles(newFiles: FileList | File[]) {
    const items = Array.from(newFiles).map(toUploadItem);
    setFiles((prev) => [...prev, ...items]);
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }

  function stopGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    setIsEditingQuestion(false);
    setGenerateStatus("stopped");
  }

  async function startGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
    }
    setGenerateStatus("generating");
    setQuestionMarkdown("");
    setExistingCatalogCandidates([]);
    setSelectedTopicId(null);
    setIsEditingQuestion(false);
    setQuestionDraft("");
    setSourceLabel(null);
    setAnalysisResult(null);

    const hasPromptText = prompt.trim().length > 0;

    if (!hasPromptText) {
      setGenerateStatus("stopped");
      return;
    }

    try {
      const result = await analyzeQuestionAction({ rawContent: prompt.trim() });

      if (!result.success) {
        console.error("AI 分析失败:", result.error);
        const convertedMarkdown = textToMarkdown(prompt);
        const topics = await getTopics();
        const topicOptions: Array<TopicOption> = topics.map((topic) => ({
          id: topic.id,
          name: topic.name,
        }));

        setSourceLabel("文字输入（AI 分析失败，使用本地转换）");
        setQuestionMarkdown(convertedMarkdown);
        setExistingCatalogCandidates(topicOptions);
        setSelectedTopicId(topicOptions[0]?.id ?? null);
        setQuestionDraft(convertedMarkdown);
        setGenerateStatus("done");
        return;
      }

      const analysis = result.data;
      setAnalysisResult(analysis);

      const topics = await getTopics();
      const topicOptions: Array<TopicOption> = topics.map((topic) => ({
        id: topic.id,
        name: topic.name,
      }));

      const recommendedTopic = topicOptions.find(
        (t) =>
          t.id === analysis.catalogRecommendation.topicId ||
          t.name === analysis.catalogRecommendation.topicName,
      );
      const defaultTopicId =
        recommendedTopic?.id ?? topicOptions[0]?.id ?? null;

      setSourceLabel("AI 智能分析");
      setQuestionMarkdown(analysis.formattedContent);
      setExistingCatalogCandidates(topicOptions);
      setSelectedTopicId(defaultTopicId);
      setQuestionDraft(analysis.formattedContent);
      setGenerateStatus("done");
    } catch (error) {
      console.error("生成失败:", error);
      setGenerateStatus("stopped");
    }
  }

  function handleGenerateClick() {
    if (generateStatus === "generating") {
      stopGenerating();
      return;
    }
    if (!files.length && !prompt.trim()) {
      return;
    }
    startGenerating();
  }

  const shouldShowResultPanels = files.length > 0 || generateStatus !== "idle";

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      className="w-full max-w-[760px]"
    >
      <InputArea
        prompt={prompt}
        files={files}
        isMaximized={isMaximized}
        isDragging={isDragging}
        generateStatus={generateStatus}
        onPromptChange={setPrompt}
        onIsMaximizedChange={setIsMaximized}
        onDragStateChange={setIsDragging}
        onAddFiles={addFiles}
        onRemoveFile={removeFile}
        onGenerateClick={handleGenerateClick}
      />
      {shouldShowResultPanels ? (
        <Box display="flex" flexDirection="column" gap={1.5} className="w-full">
          <Box
            display="flex"
            flexDirection="column"
            className="overflow-hidden rounded-xl border border-[#e5eaf3] bg-white"
          >
            <QuestionPanel
              generateStatus={generateStatus}
              questionMarkdown={questionMarkdown}
              sourceLabel={sourceLabel}
              analysisResult={analysisResult}
              isEditing={isEditingQuestion}
              draftValue={questionDraft}
              onDraftChange={setQuestionDraft}
              onStartEdit={() => {
                setQuestionDraft(questionMarkdown);
                setIsEditingQuestion(true);
              }}
              onCancelEdit={() => {
                setQuestionDraft(questionMarkdown);
                setIsEditingQuestion(false);
              }}
              onSaveEdit={() => {
                setQuestionMarkdown(questionDraft.trim());
                setIsEditingQuestion(false);
              }}
              existingCatalogCandidates={existingCatalogCandidates}
              selectedTopicId={selectedTopicId}
              isSaving={isSavingToTopic}
              onSelectTopic={(id) => {
                setSelectedTopicId(id);
              }}
              onConfirm={async () => {
                if (!selectedTopicId || !questionMarkdown.trim()) {
                  return;
                }

                const selectedTopic = existingCatalogCandidates.find(
                  (topic) => topic.id === selectedTopicId,
                );
                if (!selectedTopic) {
                  alert("请选择有效的题库");
                  return;
                }

                setIsSavingToTopic(true);
                try {
                  const result = await saveQuestionToCatalog({
                    topicId: selectedTopicId,
                    questionContent: questionMarkdown.trim(),
                    source: sourceLabel || undefined,
                    questionType: analysisResult?.questionType,
                  });

                  if (result.success) {
                    alert(`题目已保存到题库"${selectedTopic.name}"`);
                    setPrompt("");
                    setFiles([]);
                    setQuestionMarkdown("");
                    setExistingCatalogCandidates([]);
                    setSelectedTopicId(null);
                    setIsEditingQuestion(false);
                    setQuestionDraft("");
                    setSourceLabel(null);
                    setAnalysisResult(null);
                    setGenerateStatus("idle");
                  } else {
                    alert(`保存失败：${result.error}`);
                  }
                } catch (error) {
                  console.error("保存题目失败:", error);
                  alert("保存失败，请稍后重试");
                } finally {
                  setIsSavingToTopic(false);
                }
              }}
            />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
