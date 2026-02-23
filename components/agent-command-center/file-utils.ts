import type { UploadFileItem } from "./types";

export const MINERU_EXTENSIONS = [
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

export function isMineruFile(file: File): boolean {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
  return MINERU_EXTENSIONS.includes(ext);
}

export async function readPlainTextFile(file: File): Promise<string> {
  return file.text();
}

export function toUploadItem(file: File): UploadFileItem {
  return {
    id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
    file,
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : null,
    rotationDegrees: 0,
  };
}
