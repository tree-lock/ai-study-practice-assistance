"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

type UploadFileItem = {
  id: string;
  file: File;
  previewUrl: string | null;
};

type FileUploadProps = {
  files: UploadFileItem[];
  onRemoveFile: (id: string) => void;
};

export function FileUpload({ files, onRemoveFile }: FileUploadProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {files.map((item) => (
        <div
          key={item.id}
          className="flex w-[98px] flex-col gap-1 overflow-hidden rounded-xl border border-[#d9dee8] bg-white"
        >
          <div className="relative flex h-[72px] w-full items-end justify-end bg-[#eef2f7]">
            {item.previewUrl ? (
              <Image
                src={item.previewUrl}
                alt={item.file.name}
                fill
                sizes="98px"
                unoptimized
                className="absolute inset-0 size-full object-cover"
              />
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
              className="z-[1] m-1 size-7 bg-[rgba(17,24,39,0.65)] text-white hover:bg-[rgba(17,24,39,0.8)]"
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
  );
}
