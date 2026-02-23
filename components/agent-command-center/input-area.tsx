"use client";

import {
  ArrowUp,
  Maximize2,
  Minimize2,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "./file-upload";
import type { UploadFileItem } from "./types";

type InputAreaProps = {
  prompt: string;
  files: UploadFileItem[];
  isMaximized: boolean;
  isDragging: boolean;
  generateStatus: "idle" | "generating" | "done" | "stopped";
  onPromptChange: (value: string) => void;
  onIsMaximizedChange: (value: boolean) => void;
  onDragStateChange: (isDragging: boolean) => void;
  onAddFiles: (newFiles: FileList | File[]) => void;
  onRemoveFile: (id: string) => void;
  onGenerateClick: () => void;
};

export function InputArea({
  prompt,
  files,
  isMaximized,
  isDragging,
  generateStatus,
  onPromptChange,
  onIsMaximizedChange,
  onDragStateChange,
  onAddFiles,
  onRemoveFile,
  onGenerateClick,
}: InputAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filesRef = useRef<UploadFileItem[]>([]);

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

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    return () => {
      // Cleanup all object URLs on unmount
      if (filesRef.current) {
        for (const file of filesRef.current) {
          if (file.previewUrl) {
            try {
              URL.revokeObjectURL(file.previewUrl);
            } catch {
              // Ignore errors during cleanup
            }
          }
        }
      }
    };
  }, []);

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(true);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onDragStateChange(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);
    const dropped = e.dataTransfer.files;
    if (dropped?.length) onAddFiles(dropped);
  }

  const canStartGenerate = files.length > 0 || prompt.trim().length > 0;
  const generateButtonDisabled =
    generateStatus !== "generating" && !canStartGenerate;

  return (
    <section
      aria-label="上传题目输入区"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex min-h-[140px] flex-col gap-2 rounded-2xl px-4 py-3.5 transition-[background,border] duration-150 ${
        isDragging
          ? "border-2 border-dashed border-blue-500 bg-[#f0f4f8]"
          : "border border-[#e8ecf1] bg-[#fafbfc]"
      } ${isMaximized ? "min-h-[560px] max-h-[72vh]" : ""}`}
    >
      <div className="absolute right-2.5 top-2.5 p-px">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isMaximized ? "退出最大化" : "最大化输入框"}
          onClick={() => onIsMaximizedChange(!isMaximized)}
        >
          {isMaximized ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md,.html"
        className="sr-only"
        aria-hidden
        onChange={(e) => {
          const selected = e.target.files;
          if (selected?.length) onAddFiles(selected);
          e.target.value = "";
        }}
      />
      <textarea
        ref={textareaRef}
        placeholder="上传题目，文字、图片或文档 (可拖拽文件到此处)"
        value={prompt}
        onChange={(e) => {
          onPromptChange(e.target.value);
          adjustTextareaHeight();
        }}
        onInput={adjustTextareaHeight}
        rows={1}
        className="max-h-none min-h-0 w-full resize-none overflow-y-auto border-none bg-transparent p-0 font-inherit leading-normal outline-none"
        style={{
          minHeight: MIN_TEXTAREA_HEIGHT,
          maxHeight: MAX_TEXTAREA_HEIGHT,
        }}
      />
      <FileUpload files={files} onRemoveFile={onRemoveFile} />
      <div className="mt-auto flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8"
            aria-label="添加文件"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8"
            aria-label="选项"
          >
            <SlidersHorizontal className="size-4" />
          </Button>
        </div>
        <button
          type="button"
          aria-label={
            generateStatus === "generating" ? "停止生成" : "上传并生成"
          }
          disabled={generateButtonDisabled}
          onClick={onGenerateClick}
          className={`inline-flex size-7 items-center justify-center rounded-full border-none text-white transition-all duration-200 ease-in-out ${
            generateButtonDisabled
              ? "bg-gray-400 opacity-72"
              : generateStatus === "generating"
                ? "bg-[#1f2432] shadow-[0_3px_8px_rgba(17,24,39,0.22)]"
                : "bg-[#111827] shadow-[0_3px_8px_rgba(17,24,39,0.22)]"
          }`}
        >
          {generateStatus === "generating" ? (
            <X className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )}
        </button>
      </div>
    </section>
  );
}
