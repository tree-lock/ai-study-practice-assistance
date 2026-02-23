"use client";

import { useState } from "react";
import { isMineruFile, toUploadItem } from "./file-utils";
import type { ImageRotationDegrees, UploadFileItem } from "./types";

export type GenerateStatus = "idle" | "generating" | "done" | "stopped";

export function useCore() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");

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

  return {
    prompt,
    setPrompt,
    files,
    setFiles,
    isDragging,
    setIsDragging,
    isMaximized,
    setIsMaximized,
    generateStatus,
    setGenerateStatus,
    addFiles,
    removeFile,
    updateFileRotation,
  };
}

export { isMineruFile };
