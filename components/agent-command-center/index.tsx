"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  analyzeQuestionAction,
  saveQuestionToCatalog,
} from "@/app/actions/agent";
import {
  getMineruExtractResult,
  submitMineruExtract,
} from "@/app/actions/mineru";
import { getTopics } from "@/app/actions/topic";
import { invalidateTopicCache } from "@/lib/hooks/use-topic-data";
import { rotateImageToFile } from "@/lib/rotate-image";
import { InputArea } from "./input-area";
import { QuestionPanel } from "./question-panel";
import { textToMarkdown } from "./text-to-markdown";
import type {
  AnalysisResult,
  ImageRotationDegrees,
  TopicOption,
  UploadFileItem,
} from "./types";

const MINERU_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".html",
];

function isMineruFile(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return MINERU_EXTENSIONS.includes(ext);
}

async function readPlainTextFile(file: File): Promise<string> {
  return file.text();
}

export function AgentCommandCenter() {
  const router = useRouter();
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
  const [parsePhase, setParsePhase] = useState<
    "uploading" | "parsing" | "analyzing" | null
  >(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function toUploadItem(file: File): UploadFileItem {
    return {
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      rotationDegrees: 0,
    };
  }

  function updateFileRotation(id: string, degrees: ImageRotationDegrees) {
    setFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, rotationDegrees: degrees } : item,
      ),
    );
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
    setParsePhase(null);

    const hasPromptText = prompt.trim().length > 0;
    const hasFiles = files.length > 0;

    if (!hasPromptText && !hasFiles) {
      setGenerateStatus("stopped");
      return;
    }

    const parts: string[] = [];

    try {
      if (hasFiles) {
        const mineruItems = files.filter((item) => isMineruFile(item.file));
        const plainItems = files.filter((item) => !isMineruFile(item.file));

        for (const item of plainItems) {
          setParsePhase("parsing");
          const text = await readPlainTextFile(item.file);
          if (text.trim()) {
            parts.push(text);
            console.log(`【文档解析】${item.file.name}:\n`, text);
          }
        }

        if (mineruItems.length > 0) {
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
            setGenerateStatus("stopped");
            setParsePhase(null);
            alert(`解析失败：${submitResult.error}`);
            return;
          }

          setParsePhase("parsing");
          let batchDone = false;
          let pollResult: Awaited<
            ReturnType<typeof getMineruExtractResult>
          > | null = null;

          while (!batchDone) {
            pollResult = await getMineruExtractResult(submitResult.batchId);
            if (!pollResult.success && pollResult.state === "failed") {
              setGenerateStatus("stopped");
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
            pollResult.markdownContents?.length
          ) {
            for (let i = 0; i < pollResult.markdownContents.length; i += 1) {
              const md = pollResult.markdownContents[i];
              const fileName = mineruItems[i]?.file.name ?? `文件${i + 1}`;
              console.log(`【MinerU 解析】${fileName}:\n`, md);
            }
            parts.push(...pollResult.markdownContents);
          }
        }

        setParsePhase(null);
      }

      if (hasPromptText) {
        parts.unshift(prompt.trim());
      }

      const rawContent = parts.join("\n\n---\n\n").trim();
      console.log("【合并后的原始内容】:\n", rawContent);
      if (!rawContent) {
        setGenerateStatus("stopped");
        alert("未能从文件或文字中提取到有效内容");
        return;
      }

      setParsePhase("analyzing");
      const result = await analyzeQuestionAction({ rawContent });
      setParsePhase(null);

      if (!result.success) {
        console.error("AI 分析失败:", result.error);
        const convertedMarkdown = textToMarkdown(rawContent);
        const topicsData = await getTopics();
        const topicOptions: Array<TopicOption> = topicsData.map((topic) => ({
          id: topic.id,
          name: topic.name,
        }));

        setSourceLabel("文字/文档输入（AI 分析失败，使用本地转换）");
        setQuestionMarkdown(convertedMarkdown);
        setExistingCatalogCandidates(topicOptions);
        setSelectedTopicId(topicOptions[0]?.id ?? null);
        setQuestionDraft(convertedMarkdown);
        setGenerateStatus("done");
        return;
      }

      const analysis = result.data;
      setAnalysisResult(analysis);

      const topicsData = await getTopics();
      const topicOptions: Array<TopicOption> = topicsData.map((topic) => ({
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
      setParsePhase(null);
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
    <div className="flex w-full max-w-[760px] flex-col gap-5">
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
        onRotationChange={updateFileRotation}
        onGenerateClick={handleGenerateClick}
      />
      {shouldShowResultPanels ? (
        <div className="flex w-full flex-col gap-3">
          <div className="flex flex-col overflow-hidden rounded-xl border border-[#e5eaf3] bg-white">
            <QuestionPanel
              generateStatus={generateStatus}
              parsePhase={parsePhase}
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

                // 验证题目内容在保存前没有为空
                const trimmedContent = questionMarkdown.trim();
                if (!trimmedContent) {
                  alert("题目内容不能为空");
                  return;
                }

                setIsSavingToTopic(true);
                try {
                  const result = await saveQuestionToCatalog({
                    topicId: selectedTopicId,
                    questionContent: trimmedContent,
                    source: sourceLabel || undefined,
                    questionType: analysisResult?.questionType,
                  });

                  if (result.success) {
                    invalidateTopicCache(result.topicId);
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
                    router.push(`/topics/${result.topicId}`);
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
