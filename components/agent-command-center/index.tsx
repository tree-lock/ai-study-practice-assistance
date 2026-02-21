"use client";

import { Flex } from "@radix-ui/themes";
import { useRef, useState } from "react";
import {
  analyzeQuestionAction,
  saveQuestionToCatalog,
} from "@/app/actions/agent";
import { getTopics } from "@/app/actions/topic";
import { buildCatalogActions } from "./catalog-actions";
import { InputArea } from "./input-area";
import { QuestionPanel } from "./question-panel";
import { textToMarkdown } from "./text-to-markdown";
import type {
  AnalysisResult,
  CatalogActionOption,
  TopicOption,
  UploadFileItem,
} from "./types";

export function AgentCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<
    "idle" | "generating" | "done" | "stopped"
  >("idle");
  const [questionMarkdown, setQuestionMarkdown] = useState("");
  const [catalogOptions, setCatalogOptions] = useState<
    Array<CatalogActionOption>
  >([]);
  const [existingCatalogCandidates, setExistingCatalogCandidates] = useState<
    Array<TopicOption>
  >([]);
  const [selectedCatalogActionId, setSelectedCatalogActionId] = useState<
    string | null
  >(null);
  const [selectedExistingCatalogId, setSelectedExistingCatalogId] = useState<
    string | null
  >(null);
  const [newCatalogInput, setNewCatalogInput] = useState("");
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
    setCatalogOptions([]);
    setExistingCatalogCandidates([]);
    setSelectedCatalogActionId(null);
    setSelectedExistingCatalogId(null);
    setNewCatalogInput("");
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
        const catalogOpts = buildCatalogActions(topicOptions);
        const defaultOpt = catalogOpts[0];
        const createOpt = catalogOpts.find((o) => o.type === "create-new");

        setSourceLabel("文字输入（AI 分析失败，使用本地转换）");
        setQuestionMarkdown(convertedMarkdown);
        setCatalogOptions(catalogOpts);
        setExistingCatalogCandidates(topicOptions);
        setSelectedCatalogActionId(defaultOpt?.id ?? null);
        setSelectedExistingCatalogId(
          defaultOpt?.type === "save-existing"
            ? (topicOptions[0]?.id ?? null)
            : null,
        );
        setNewCatalogInput(createOpt?.suggestion ?? "");
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

      const catalogOpts = buildCatalogActions(topicOptions);

      let defaultActionId: string | null = null;
      let defaultExistingId: string | null = null;
      let defaultNewInput = "";

      if (analysis.catalogRecommendation.action === "use-existing") {
        const existingOpt = catalogOpts.find((o) => o.type === "save-existing");
        defaultActionId = existingOpt?.id ?? null;
        const recommendedTopic = topicOptions.find(
          (t) =>
            t.id === analysis.catalogRecommendation.topicId ||
            t.name === analysis.catalogRecommendation.topicName,
        );
        defaultExistingId = recommendedTopic?.id ?? topicOptions[0]?.id ?? null;
      } else {
        const createOpt = catalogOpts.find((o) => o.type === "create-new");
        defaultActionId = createOpt?.id ?? null;
        defaultNewInput = analysis.catalogRecommendation.topicName;
      }

      setSourceLabel("AI 智能分析");
      setQuestionMarkdown(analysis.formattedContent);
      setCatalogOptions(catalogOpts);
      setExistingCatalogCandidates(topicOptions);
      setSelectedCatalogActionId(defaultActionId);
      setSelectedExistingCatalogId(defaultExistingId);
      setNewCatalogInput(defaultNewInput);
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
    <Flex direction="column" gap="5" className="w-full max-w-[760px]">
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
        <Flex direction="column" gap="3" className="w-full">
          <Flex
            direction="column"
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
              catalogOptions={catalogOptions}
              existingCatalogCandidates={existingCatalogCandidates}
              selectedCatalogActionId={selectedCatalogActionId}
              selectedExistingCatalogId={selectedExistingCatalogId}
              newCatalogInput={newCatalogInput}
              isSaving={isSavingToTopic}
              onSelectCatalogAction={(id) => {
                setSelectedCatalogActionId(id);
              }}
              onSelectExistingCatalog={(id) => {
                setSelectedExistingCatalogId(id);
              }}
              onNewCatalogInputChange={(value) => {
                setNewCatalogInput(value);
              }}
              onConfirmCatalogAction={async () => {
                const selectedOption =
                  catalogOptions.find(
                    (option) => option.id === selectedCatalogActionId,
                  ) ?? null;
                if (
                  !selectedCatalogActionId ||
                  !selectedOption ||
                  !questionMarkdown.trim()
                ) {
                  return;
                }

                let topicName: string;
                if (selectedOption.type === "save-existing") {
                  const selectedTopic = existingCatalogCandidates.find(
                    (topic) => topic.id === selectedExistingCatalogId,
                  );
                  if (!selectedTopic) {
                    alert("请选择有效的题库");
                    return;
                  }
                  topicName = selectedTopic.name;
                } else {
                  topicName = newCatalogInput.trim();
                  if (!topicName) {
                    alert("请输入题库名称");
                    return;
                  }
                }

                setIsSavingToTopic(true);
                try {
                  const result = await saveQuestionToCatalog({
                    catalogName: topicName,
                    questionContent: questionMarkdown.trim(),
                    source: sourceLabel || undefined,
                    actionType: selectedOption.type,
                    questionType: analysisResult?.questionType,
                    knowledgePoints: analysisResult?.knowledgePoints,
                  });

                  if (result.success) {
                    alert(`题目已保存到题库"${topicName}"`);
                    setPrompt("");
                    setFiles([]);
                    setQuestionMarkdown("");
                    setCatalogOptions([]);
                    setExistingCatalogCandidates([]);
                    setSelectedCatalogActionId(null);
                    setSelectedExistingCatalogId(null);
                    setNewCatalogInput("");
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
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
}
