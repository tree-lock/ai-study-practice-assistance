"use client";

import {
  ArrowUpIcon,
  CheckIcon,
  Cross2Icon,
  EnterFullScreenIcon,
  ExitFullScreenIcon,
  MixerHorizontalIcon,
  Pencil2Icon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Badge, Flex, IconButton, Text } from "@radix-ui/themes";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import { getNextUploadMock } from "@/lib/mock/agent-upload-mocks";

type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type GenerateStatus = "idle" | "generating" | "done" | "stopped";

type QuestionPanelProps = {
  generateStatus: GenerateStatus;
  questionMarkdown: string;
  mockSourceLabel: string | null;
  isEditing: boolean;
  draftValue: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
};

function QuestionPanel({
  generateStatus,
  questionMarkdown,
  mockSourceLabel,
  isEditing,
  draftValue,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}: QuestionPanelProps) {
  return (
    <Flex direction="column" gap="2" style={{ padding: "12px 14px" }}>
      <Flex justify="between" align="center">
        <Text size="2" weight="bold">
          题目（Markdown + 公式）
        </Text>
        {generateStatus === "done" ? (
          <Flex gap="2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={onCancelEdit}
                  aria-label="取消编辑题目"
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    width: 26,
                    height: 22,
                    padding: 0,
                    background: "#fff",
                    color: "#4b5563",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Cross2Icon />
                </button>
                <button
                  type="button"
                  onClick={onSaveEdit}
                  aria-label="保存题目编辑"
                  style={{
                    border: "1px solid #bfdbfe",
                    borderRadius: 6,
                    width: 26,
                    height: 22,
                    padding: 0,
                    background: "#eff6ff",
                    color: "#1d4ed8",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onStartEdit}
                aria-label="编辑题目"
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  width: 26,
                  height: 22,
                  padding: 0,
                  background: "#fff",
                  color: "#4b5563",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Pencil2Icon />
              </button>
            )}
          </Flex>
        ) : null}
      </Flex>
      {generateStatus === "generating" ? (
        <Text size="2" color="gray">
          正在模拟生成题目内容...
        </Text>
      ) : null}
      {generateStatus === "stopped" ? (
        <Text size="2" color="gray">
          已停止生成。你可以再次点击上传按钮重新生成。
        </Text>
      ) : null}
      {generateStatus === "done" && questionMarkdown ? (
        <Flex direction="column" gap="2">
          {mockSourceLabel ? (
            <Text size="1" color="gray">
              模拟来源：{mockSourceLabel}
            </Text>
          ) : null}
          {isEditing ? (
            <textarea
              value={draftValue}
              onChange={(event) => onDraftChange(event.target.value)}
              style={{
                width: "100%",
                minHeight: 120,
                border: "1px solid #dbe1ea",
                borderRadius: 8,
                padding: "8px 10px",
                font: "inherit",
                lineHeight: 1.5,
                resize: "vertical",
              }}
            />
          ) : (
            <div style={{ lineHeight: 1.65 }}>
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {questionMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </Flex>
      ) : null}
    </Flex>
  );
}

export function AgentCommandCenter() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");
  const [questionMarkdown, setQuestionMarkdown] = useState("");
  const [recommendedCatalog, setRecommendedCatalog] = useState<Array<string>>(
    [],
  );
  const [generatedCatalog, setGeneratedCatalog] = useState<Array<string>>([]);
  const [isCatalogGenerating, setIsCatalogGenerating] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [isEditingCatalog, setIsEditingCatalog] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [catalogDraft, setCatalogDraft] = useState("");
  const [mockSourceLabel, setMockSourceLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filesRef = useRef<UploadFileItem[]>([]);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MIN_TEXTAREA_HEIGHT = isMaximized ? 420 : 60;
  const MAX_TEXTAREA_HEIGHT = isMaximized ? 640 : 320;

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(
      Math.max(el.scrollHeight, MIN_TEXTAREA_HEIGHT),
      MAX_TEXTAREA_HEIGHT,
    );
    el.style.height = `${next}px`;
  }, [MAX_TEXTAREA_HEIGHT, MIN_TEXTAREA_HEIGHT]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [adjustTextareaHeight]);

  useEffect(() => {
    if (isMaximized) {
      document.body.classList.add("agent-input-maximized");
    } else {
      document.body.classList.remove("agent-input-maximized");
    }

    return () => {
      document.body.classList.remove("agent-input-maximized");
    };
  }, [isMaximized]);

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

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files;
    if (dropped?.length) addFiles(dropped);
  }

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
      }
      if (catalogTimerRef.current) {
        clearTimeout(catalogTimerRef.current);
      }
      for (const file of filesRef.current) {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      }
    };
  }, []);

  const canStartGenerate = files.length > 0 || prompt.trim().length > 0;

  function parseListInput(raw: string): Array<string> {
    return raw
      .split(/[\n,，]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  function stopGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }
    if (catalogTimerRef.current) {
      clearTimeout(catalogTimerRef.current);
      catalogTimerRef.current = null;
    }
    setIsCatalogGenerating(false);
    setIsEditingQuestion(false);
    setIsEditingCatalog(false);
    setGenerateStatus("stopped");
  }

  function startGenerating() {
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
    }
    setGenerateStatus("generating");
    setQuestionMarkdown("");
    setRecommendedCatalog([]);
    setGeneratedCatalog([]);
    setIsCatalogGenerating(false);
    setIsEditingQuestion(false);
    setIsEditingCatalog(false);
    setQuestionDraft("");
    setCatalogDraft("");
    setMockSourceLabel(null);

    const mock = getNextUploadMock();
    const delayMs = 1200 + Math.floor(Math.random() * 800);

    generateTimerRef.current = setTimeout(() => {
      setMockSourceLabel(mock.input.sourceLabel);
      setQuestionMarkdown(mock.output.questionMarkdown);
      setRecommendedCatalog(mock.output.recommendedCatalog);
      setQuestionDraft(mock.output.questionMarkdown);
      setCatalogDraft(mock.output.recommendedCatalog.join("\n"));
      setGenerateStatus("done");
      generateTimerRef.current = null;
    }, delayMs);
  }

  function handleGenerateCatalog() {
    if (isCatalogGenerating) return;
    setIsCatalogGenerating(true);
    if (catalogTimerRef.current) {
      clearTimeout(catalogTimerRef.current);
    }
    catalogTimerRef.current = setTimeout(() => {
      const base = recommendedCatalog[0]?.split("/")[0] ?? "通用复习";
      setGeneratedCatalog([
        `${base}/专题训练`,
        `${base}/错题回顾`,
        `${base}/综合提升`,
      ]);
      setIsCatalogGenerating(false);
      catalogTimerRef.current = null;
    }, 900);
  }

  function handleGenerateClick() {
    if (generateStatus === "generating") {
      stopGenerating();
      return;
    }
    if (!canStartGenerate) {
      return;
    }
    startGenerating();
  }

  const generateButtonDisabled =
    generateStatus !== "generating" && !canStartGenerate;
  const shouldShowResultPanels = files.length > 0 || generateStatus !== "idle";

  return (
    <Flex direction="column" gap="5" style={{ width: "100%", maxWidth: 760 }}>
      <Flex
        direction="column"
        gap="2"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          background: isDragging ? "#f0f4f8" : "#fafbfc",
          borderRadius: 16,
          border: isDragging ? "2px dashed #3b82f6" : "1px solid #e8ecf1",
          padding: "14px 16px",
          minHeight: isMaximized ? 560 : 140,
          maxHeight: isMaximized ? "72vh" : undefined,
          transition: "background 0.15s, border 0.15s",
          position: "relative",
        }}
      >
        <IconButton
          type="button"
          variant="ghost"
          color="gray"
          size="1"
          aria-label={isMaximized ? "退出最大化" : "最大化输入框"}
          onClick={() => setIsMaximized((prev) => !prev)}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          {isMaximized ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.txt,.md"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0,0,0,0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
          aria-hidden
          onChange={(e) => {
            const selected = e.target.files;
            if (selected?.length) addFiles(selected);
            e.target.value = "";
          }}
        />
        <textarea
          ref={textareaRef}
          placeholder="上传题目，文字、图片或文档（可拖拽文件到此处）"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            adjustTextareaHeight();
          }}
          onInput={adjustTextareaHeight}
          rows={1}
          style={{
            minHeight: MIN_TEXTAREA_HEIGHT,
            maxHeight: MAX_TEXTAREA_HEIGHT,
            overflowY: "auto",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            width: "100%",
            font: "inherit",
            padding: 0,
            lineHeight: 1.5,
          }}
        />
        {files.length > 0 ? (
          <Flex gap="2" wrap="wrap" mt="1">
            {files.map((item) => (
              <Flex
                key={item.id}
                direction="column"
                gap="1"
                style={{
                  width: 98,
                  borderRadius: 12,
                  border: "1px solid #d9dee8",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                <Flex
                  align="start"
                  justify="end"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: 72,
                    background: "#eef2f7",
                  }}
                >
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.file.name}
                      fill
                      sizes="98px"
                      unoptimized
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Text size="1" color="gray">
                        {item.file.name.split(".").pop()?.toUpperCase() ??
                          "FILE"}
                      </Text>
                    </Flex>
                  )}
                  <IconButton
                    type="button"
                    variant="solid"
                    color="gray"
                    size="1"
                    aria-label="移除文件"
                    onClick={() => removeFile(item.id)}
                    style={{
                      margin: 4,
                      zIndex: 1,
                      background: "rgba(17, 24, 39, 0.65)",
                      color: "#fff",
                    }}
                  >
                    <Cross2Icon />
                  </IconButton>
                </Flex>
                <Text
                  size="1"
                  style={{
                    padding: "0 6px 6px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.file.name}
                >
                  {item.file.name}
                </Text>
              </Flex>
            ))}
          </Flex>
        ) : null}
        <Flex justify="between" align="center" style={{ marginTop: "auto" }}>
          <Flex gap="1">
            <IconButton
              type="button"
              variant="soft"
              color="gray"
              size="1"
              aria-label="添加文件"
              onClick={() => fileInputRef.current?.click()}
            >
              <PlusIcon />
            </IconButton>
            <IconButton
              type="button"
              variant="soft"
              color="gray"
              size="1"
              aria-label="选项"
            >
              <MixerHorizontalIcon />
            </IconButton>
          </Flex>
          <button
            type="button"
            aria-label={
              generateStatus === "generating" ? "停止生成" : "上传并生成"
            }
            disabled={generateButtonDisabled}
            onClick={handleGenerateClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              borderRadius: "50%",
              width: 28,
              height: 28,
              transition: "all 0.2s ease",
              background: generateButtonDisabled
                ? "#9ca3af"
                : generateStatus === "generating"
                  ? "#1f2432"
                  : "#111827",
              boxShadow: generateButtonDisabled
                ? "none"
                : "0 3px 8px rgba(17, 24, 39, 0.22)",
              color: "#fff",
              opacity: generateButtonDisabled ? 0.72 : 1,
            }}
          >
            {generateStatus === "generating" ? (
              <Cross2Icon width={14} height={14} />
            ) : (
              <ArrowUpIcon width={14} height={14} />
            )}
          </button>
        </Flex>
      </Flex>
      {shouldShowResultPanels ? (
        <Flex direction="column" gap="3" style={{ width: "100%" }}>
          <Flex
            direction="column"
            style={{
              background: "#fff",
              border: "1px solid #e5eaf3",
              borderRadius: 12,
              overflow: "hidden",
            }}
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
            />
          </Flex>
          <Flex
            direction="column"
            gap="1"
            style={{
              background: "#f8fafc",
              border: "1px dashed #d5dcea",
              borderRadius: 12,
              padding: "10px 12px",
            }}
          >
            <Flex justify="between" align="center">
              <Text size="2" weight="bold">
                推荐目录
              </Text>
              {generateStatus === "done" ? (
                <Flex gap="2">
                  {isEditingCatalog ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const currentCatalogs =
                            generatedCatalog.length > 0
                              ? generatedCatalog
                              : recommendedCatalog;
                          setCatalogDraft(currentCatalogs.join("\n"));
                          setIsEditingCatalog(false);
                        }}
                        aria-label="取消编辑推荐目录"
                        style={{
                          border: "1px solid #d1d5db",
                          borderRadius: 6,
                          width: 26,
                          height: 22,
                          padding: 0,
                          background: "#fff",
                          color: "#4b5563",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Cross2Icon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseListInput(catalogDraft);
                          setRecommendedCatalog(parsed);
                          setGeneratedCatalog([]);
                          setIsEditingCatalog(false);
                        }}
                        aria-label="保存推荐目录编辑"
                        style={{
                          border: "1px solid #bfdbfe",
                          borderRadius: 6,
                          width: 26,
                          height: 22,
                          padding: 0,
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckIcon />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const currentCatalogs =
                          generatedCatalog.length > 0
                            ? generatedCatalog
                            : recommendedCatalog;
                        setCatalogDraft(currentCatalogs.join("\n"));
                        setIsEditingCatalog(true);
                      }}
                      aria-label="编辑推荐目录"
                      style={{
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        width: 26,
                        height: 22,
                        padding: 0,
                        background: "#fff",
                        color: "#4b5563",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Pencil2Icon />
                    </button>
                  )}
                </Flex>
              ) : null}
            </Flex>
            {generateStatus === "generating" ? (
              <Text size="1" color="gray">
                正在模拟推荐目录...
              </Text>
            ) : null}
            {generateStatus === "stopped" ? (
              <Text size="1" color="gray">
                已停止目录推荐。
              </Text>
            ) : null}
            {generateStatus === "done" && isEditingCatalog ? (
              <textarea
                value={catalogDraft}
                onChange={(event) => setCatalogDraft(event.target.value)}
                placeholder="每行一个目录，或使用逗号分隔"
                style={{
                  width: "100%",
                  minHeight: 84,
                  border: "1px solid #dbe1ea",
                  borderRadius: 8,
                  padding: "8px 10px",
                  font: "inherit",
                  lineHeight: 1.5,
                  resize: "vertical",
                }}
              />
            ) : null}
            {generateStatus === "done" &&
            !isEditingCatalog &&
            recommendedCatalog.length > 0 ? (
              <Flex direction="column" gap="1">
                <Text size="1" color="gray">
                  已有目录优先推荐：
                </Text>
                <Flex gap="2" wrap="wrap">
                  {recommendedCatalog.map((catalog) => (
                    <Badge key={catalog} color="green" variant="soft">
                      {catalog}
                    </Badge>
                  ))}
                </Flex>
              </Flex>
            ) : null}
            {generateStatus === "done" && recommendedCatalog.length === 0 ? (
              <Text size="1" color="gray">
                暂无合适的已有目录。
              </Text>
            ) : null}
            {generateStatus === "done" && !isEditingCatalog ? (
              <Flex direction="column" gap="2" mt="1">
                <button
                  type="button"
                  onClick={handleGenerateCatalog}
                  disabled={isCatalogGenerating}
                  style={{
                    width: "fit-content",
                    border: "1px solid #c7d2fe",
                    background: isCatalogGenerating ? "#e5e7eb" : "#eef2ff",
                    color: "#374151",
                    borderRadius: 8,
                    fontSize: 12,
                    lineHeight: 1,
                    padding: "6px 10px",
                  }}
                >
                  {isCatalogGenerating ? "生成中..." : "生成目录"}
                </button>
                {generatedCatalog.length > 0 ? (
                  <Flex gap="2" wrap="wrap">
                    {generatedCatalog.map((catalog) => (
                      <Badge key={catalog} color="blue" variant="soft">
                        {catalog}
                      </Badge>
                    ))}
                  </Flex>
                ) : null}
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      ) : null}
    </Flex>
  );
}
