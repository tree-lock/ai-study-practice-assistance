"use client";

import { Flex } from "@radix-ui/themes";
import { useRef, useState } from "react";
import { saveQuestionToCatalog } from "@/app/actions/agent";
import { getTopics } from "@/app/actions/topic";
import { getNextUploadMock } from "@/lib/mock/agent-upload-mocks";
import { buildCatalogActions } from "./catalog-actions";
import { InputArea } from "./input-area";
import { QuestionPanel } from "./question-panel";
import { textToMarkdown } from "./text-to-markdown";
import type { CatalogActionOption, TopicOption, UploadFileItem } from "./types";

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
  const [mockSourceLabel, setMockSourceLabel] = useState<string | null>(null);
  const [isSavingToTopic, setIsSavingToTopic] = useState(false);
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
    setMockSourceLabel(null);

    // 优先使用 prompt 文字内容，如果没有则使用 mock 数据
    const hasPromptText = prompt.trim().length > 0;
    const delayMs = 1200 + Math.floor(Math.random() * 800);

    // 提前获取目录列表
    const topics = await getTopics();
    const topicOptions: Array<TopicOption> = topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
    }));

    generateTimerRef.current = setTimeout(() => {
      if (hasPromptText) {
        // 使用实际的 prompt 内容转换为 markdown
        const convertedMarkdown = textToMarkdown(prompt);
        // 使用真实的目录列表生成推荐选项
        const catalogOptions = buildCatalogActions(topicOptions);
        const defaultCatalogOption = catalogOptions[0];
        const createOption = catalogOptions.find(
          (option) => option.type === "create-new",
        );
        setMockSourceLabel("文字输入");
        setQuestionMarkdown(convertedMarkdown);
        setCatalogOptions(catalogOptions);
        setExistingCatalogCandidates(topicOptions);
        setSelectedCatalogActionId(defaultCatalogOption?.id ?? null);
        setSelectedExistingCatalogId(
          defaultCatalogOption?.type === "save-existing"
            ? (topicOptions[0]?.id ?? null)
            : null,
        );
        setNewCatalogInput(createOption?.suggestion ?? "");
        setQuestionDraft(convertedMarkdown);
      } else {
        // 使用 mock 数据（仅在有文件上传时）
        const mock = getNextUploadMock();
        // mock 数据是 string[]，需要转换为 TopicOption[]
        const mockTopicOptions: Array<TopicOption> =
          mock.output.recommendedCatalog.map((name, index) => ({
            id: `mock-${index}`,
            name,
          }));
        const nextCatalogOptions = buildCatalogActions(mockTopicOptions);
        const defaultCatalogOption = nextCatalogOptions[0];
        const createOption = nextCatalogOptions.find(
          (option) => option.type === "create-new",
        );
        setMockSourceLabel(mock.input.sourceLabel);
        setQuestionMarkdown(mock.output.questionMarkdown);
        setCatalogOptions(nextCatalogOptions);
        setExistingCatalogCandidates(mockTopicOptions);
        setSelectedCatalogActionId(defaultCatalogOption?.id ?? null);
        setSelectedExistingCatalogId(
          defaultCatalogOption?.type === "save-existing"
            ? (mockTopicOptions[0]?.id ?? null)
            : null,
        );
        setNewCatalogInput(createOption?.suggestion ?? "");
        setQuestionDraft(mock.output.questionMarkdown);
      }
      setGenerateStatus("done");
      generateTimerRef.current = null;
    }, delayMs);
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
              mockSourceLabel={mockSourceLabel}
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

                // 根据选项类型获取题库名称
                let topicName: string;
                if (selectedOption.type === "save-existing") {
                  // 从已选题库 ID 查找名称
                  const selectedTopic = existingCatalogCandidates.find(
                    (topic) => topic.id === selectedExistingCatalogId,
                  );
                  if (!selectedTopic) {
                    alert("请选择有效的题库");
                    return;
                  }
                  topicName = selectedTopic.name;
                } else {
                  // 新建题库，使用输入框的值
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
                    source: mockSourceLabel || undefined,
                    actionType: selectedOption.type,
                  });

                  if (result.success) {
                    alert(`题目已保存到题库"${topicName}"`);
                    // 重置状态
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
                    setMockSourceLabel(null);
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
