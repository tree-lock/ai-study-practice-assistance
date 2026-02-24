"use client";

import { RotateCcw, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImageRotationDegrees, UploadFileItem } from "./types";

type FileUploadProps = {
  files: UploadFileItem[];
  onRemoveFile: (id: string) => void;
  onRotationChange: (id: string, degrees: ImageRotationDegrees) => void;
};

function rotateLeft(deg: ImageRotationDegrees): ImageRotationDegrees {
  return ((deg - 90 + 360) % 360) as ImageRotationDegrees;
}

function rotateRight(deg: ImageRotationDegrees): ImageRotationDegrees {
  return ((deg + 90) % 360) as ImageRotationDegrees;
}

export function FileUpload({
  files,
  onRemoveFile,
  onRotationChange,
}: FileUploadProps) {
  const [previewItemId, setPreviewItemId] = useState<string | null>(null);
  const previewItem = previewItemId
    ? (files.find((f) => f.id === previewItemId) ?? null)
    : null;

  useEffect(() => {
    if (previewItemId && !files.some((f) => f.id === previewItemId)) {
      setPreviewItemId(null);
    }
  }, [files, previewItemId]);

  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-1 flex flex-wrap gap-2">
        {files.map((item) => (
          <div
            key={item.id}
            className="flex w-[98px] flex-col gap-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="relative flex h-[72px] w-full items-end justify-end overflow-hidden bg-muted">
              {item.previewUrl ? (
                <button
                  type="button"
                  className="absolute inset-0 z-0 block size-full cursor-pointer"
                  onClick={() => setPreviewItemId(item.id)}
                  aria-label={`预览 ${item.file.name}`}
                >
                  <Image
                    src={item.previewUrl}
                    alt={item.file.name}
                    fill
                    sizes="98px"
                    unoptimized
                    className="size-full object-cover"
                    style={{ transform: `rotate(${item.rotationDegrees}deg)` }}
                  />
                </button>
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {item.file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
                  </span>
                </div>
              )}
              <Button
                type="button"
                size="icon"
                aria-label="移除文件"
                onClick={() => onRemoveFile(item.id)}
                className="z-1 m-1 size-7 bg-[rgba(17,24,39,0.65)] text-white hover:bg-[rgba(17,24,39,0.8)]"
              >
                <X className="size-4" />
              </Button>
            </div>
            <p
              className="overflow-hidden text-ellipsis whitespace-nowrap px-1.5 pb-1.5 pt-0 text-xs"
              title={item.file.name}
            >
              {item.file.name}
            </p>
          </div>
        ))}
      </div>

      <Dialog
        open={!!previewItemId}
        onOpenChange={(open) => !open && setPreviewItemId(null)}
      >
        <DialogContent className="flex max-h-[90vh] max-w-[90vw] flex-col sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewItem?.file.name ?? ""}
            </DialogTitle>
            <DialogDescription>
              若图片为横屏，请使用下方按钮旋转为竖屏后再提交识别。
            </DialogDescription>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto">
            {previewItem?.previewUrl ? (
              <div
                className="relative flex items-center justify-center"
                style={{
                  minHeight: 200,
                  maxHeight: "70vh",
                }}
              >
                <Image
                  src={previewItem.previewUrl}
                  alt={previewItem.file.name}
                  width={600}
                  height={400}
                  unoptimized
                  className="max-h-[70vh] w-auto max-w-full object-contain"
                  style={{
                    transform: `rotate(${previewItem.rotationDegrees}deg)`,
                  }}
                />
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex-row gap-2 sm:justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="左转 90 度"
              onClick={() =>
                previewItem &&
                onRotationChange(
                  previewItem.id,
                  rotateLeft(previewItem.rotationDegrees),
                )
              }
            >
              <RotateCcw className="size-4" />
              左转
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-label="右转 90 度"
              onClick={() =>
                previewItem &&
                onRotationChange(
                  previewItem.id,
                  rotateRight(previewItem.rotationDegrees),
                )
              }
            >
              <RotateCw className="size-4" />
              右转
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
