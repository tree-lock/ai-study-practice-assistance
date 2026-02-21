"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Flex, IconButton, Text } from "@radix-ui/themes";
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
    <Flex gap="2" wrap="wrap" mt="1">
      {files.map((item) => (
        <Flex
          key={item.id}
          direction="column"
          gap="1"
          className="w-[98px] overflow-hidden rounded-xl border border-[#d9dee8] bg-white"
        >
          <Flex
            align="start"
            justify="end"
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
              <Flex align="center" justify="center" className="size-full">
                <Text size="1" color="gray">
                  {item.file.name.split(".").pop()?.toUpperCase() ?? "FILE"}
                </Text>
              </Flex>
            )}
            <IconButton
              type="button"
              variant="solid"
              color="gray"
              size="1"
              aria-label="移除文件"
              onClick={() => onRemoveFile(item.id)}
              className="z-[1] m-1 bg-[rgba(17,24,39,0.65)] text-white"
            >
              <Cross2Icon />
            </IconButton>
          </Flex>
          <Text
            size="1"
            className="overflow-hidden text-ellipsis whitespace-nowrap px-1.5 pb-1.5 pt-0"
            title={item.file.name}
          >
            {item.file.name}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
}
