"use client";

import { Close } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";
import Image from "next/image";

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
    <Box display="flex" gap={1} flexWrap="wrap" mt={0.5}>
      {files.map((item) => (
        <Box
          key={item.id}
          display="flex"
          flexDirection="column"
          gap={0.5}
          className="w-[98px] overflow-hidden rounded-xl border border-[#d9dee8] bg-white"
        >
          <Box
            display="flex"
            alignItems="start"
            justifyContent="end"
            className="relative h-[72px] w-full bg-[#eef2f7]"
          >
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
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                className="size-full"
              >
                <Typography variant="caption" color="text.secondary">
                  {item.file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
                </Typography>
              </Box>
            )}
            <IconButton
              type="button"
              color="inherit"
              size="small"
              aria-label="移除文件"
              onClick={() => onRemoveFile(item.id)}
              className="z-[1] m-1 bg-[rgba(17,24,39,0.65)] text-white"
            >
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
          <Typography
            variant="caption"
            className="overflow-hidden text-ellipsis whitespace-nowrap px-1.5 pb-1.5 pt-0"
            title={item.file.name}
          >
            {item.file.name}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
