import { unzip } from "fflate";
import {
  MINERU_ERROR_MESSAGES,
  type MinerUExtractResultItem,
  type MinerUExtractResultsBatchResponse,
  type MinerUFileState,
  type MinerUFileUrlRequest,
  type MinerUFileUrlsBatchResponse,
} from "./types";

const MINERU_BASE = "https://mineru.net/api/v4";
const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_FILES_PER_BATCH = 200;
const SUPPORTED_EXTENSIONS = [
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

function getAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "*/*",
  };
}

function getErrorMessage(code: number | string, defaultMsg: string): string {
  const key = String(code);
  return (
    MINERU_ERROR_MESSAGES[key as keyof typeof MINERU_ERROR_MESSAGES] ??
    defaultMsg
  );
}

function isSupportedFile(name: string): boolean {
  const ext = name.toLowerCase().slice(name.lastIndexOf("."));
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/** 申请批量上传链接 */
export async function applyUploadUrls(
  token: string,
  files: Array<{ name: string; data_id?: string }>,
  modelVersion: "vlm" | "pipeline" | "MinerU-HTML" = "vlm",
): Promise<
  | { success: true; batchId: string; urls: string[] }
  | { success: false; error: string }
> {
  if (files.length > MAX_FILES_PER_BATCH) {
    return {
      success: false,
      error: `单次最多上传 ${MAX_FILES_PER_BATCH} 个文件`,
    };
  }

  const requestBody: { files: MinerUFileUrlRequest[]; model_version: string } =
    {
      files: files.map((f) => ({
        name: f.name,
        ...(f.data_id ? { data_id: f.data_id } : {}),
      })),
      model_version: modelVersion,
    };

  const res = await fetch(`${MINERU_BASE}/file-urls/batch`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(requestBody),
  });

  const data = (await res.json()) as MinerUFileUrlsBatchResponse;

  if (data.code !== 0 || !data.data) {
    return {
      success: false,
      error: getErrorMessage(data.code, data.msg ?? "申请上传链接失败"),
    };
  }

  return {
    success: true,
    batchId: data.data.batch_id,
    urls: data.data.file_urls,
  };
}

/** 将文件 PUT 到预签名 URL */
export async function uploadFileToUrl(
  url: string,
  bytes: ArrayBuffer,
): Promise<{ success: boolean }> {
  const res = await fetch(url, {
    method: "PUT",
    body: bytes,
    // MinerU 文档：上传时无需设置 Content-Type
  });

  return { success: res.ok };
}

/** 轮询批量解析结果 */
export async function getBatchExtractResults(
  token: string,
  batchId: string,
): Promise<
  | { success: true; extractResult: MinerUExtractResultItem[] }
  | { success: false; error: string }
> {
  const res = await fetch(`${MINERU_BASE}/extract-results/batch/${batchId}`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  const data = (await res.json()) as MinerUExtractResultsBatchResponse;

  if (data.code !== 0 || !data.data) {
    return {
      success: false,
      error: getErrorMessage(data.code, data.msg ?? "获取解析结果失败"),
    };
  }

  return {
    success: true,
    extractResult: data.data.extract_result,
  };
}

/** 从 ZIP URL 下载并提取 Markdown 内容 */
export async function fetchZipAndExtractMarkdown(
  zipUrl: string,
): Promise<string> {
  const res = await fetch(zipUrl);
  if (!res.ok) {
    throw new Error(`下载解析结果失败: ${res.status}`);
  }

  const zipBytes = new Uint8Array(await res.arrayBuffer());

  return new Promise((resolve, reject) => {
    const markdownParts: string[] = [];
    unzip(zipBytes, (err, unzipped) => {
      if (err) {
        reject(new Error(`解压失败: ${String(err)}`));
        return;
      }

      const entries = Object.entries(unzipped);
      const mdEntries = entries
        .filter(([path]) => path.endsWith(".md"))
        .sort(([a], [b]) => a.localeCompare(b));

      for (const [, data] of mdEntries) {
        if (data && data.length > 0) {
          const text = new TextDecoder("utf-8").decode(data);
          markdownParts.push(text);
        }
      }

      resolve(markdownParts.join("\n\n---\n\n"));
    });
  });
}
/** 判断批量结果是否全部完成（done 或 failed） */
export function isBatchComplete(items: MinerUExtractResultItem[]): {
  done: boolean;
  allSuccess: boolean;
  failedItems: MinerUExtractResultItem[];
} {
  const terminalStates: MinerUFileState[] = ["done", "failed"];
  const allReached = items.every((i) => terminalStates.includes(i.state));
  const failed = items.filter((i) => i.state === "failed");
  const allSuccess = allReached && failed.length === 0;
  return { done: allReached, allSuccess, failedItems: failed };
}

/** 校验文件是否支持 */
export function validateFiles(
  files: Array<{ name: string; size?: number }>,
): { valid: true } | { valid: false; error: string } {
  for (const f of files) {
    if (!isSupportedFile(f.name)) {
      return {
        valid: false,
        error: `文件 "${f.name}" 格式不支持，支持格式：PDF、Word、PPT、图片、HTML`,
      };
    }
    if (f.size !== undefined && f.size > MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `文件 "${f.name}" 超过 200MB 限制`,
      };
    }
  }
  if (files.length > MAX_FILES_PER_BATCH) {
    return {
      valid: false,
      error: `单次最多上传 ${MAX_FILES_PER_BATCH} 个文件`,
    };
  }
  return { valid: true };
}
