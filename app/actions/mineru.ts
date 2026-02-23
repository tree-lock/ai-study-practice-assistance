"use server";

import {
  applyUploadUrls,
  fetchZipAndExtractMarkdown,
  getBatchExtractResults,
  isBatchComplete,
  uploadFileToUrl,
  validateFiles,
} from "@/lib/mineru/client";

export type SubmitMineruExtractResult =
  | { success: true; batchId: string }
  | { success: false; error: string };

export type MineruExtractState =
  | "pending"
  | "running"
  | "waiting-file"
  | "converting"
  | "done"
  | "failed";

export type GetMineruExtractResultResult =
  | {
      success: true;
      state: MineruExtractState;
      markdownContents?: string[];
      extractResult?: Array<{
        file_name: string;
        state: string;
        err_msg?: string;
      }>;
    }
  | {
      success: false;
      error: string;
      state: MineruExtractState;
      extractResult?: Array<{
        file_name: string;
        state: string;
        err_msg?: string;
      }>;
    };

export async function submitMineruExtract(
  formData: FormData,
): Promise<SubmitMineruExtractResult> {
  const token = process.env.MINERU_API_TOKEN;
  if (!token?.trim()) {
    return { success: false, error: "请在 .env 中配置 MINERU_API_TOKEN" };
  }

  const files = formData.getAll("file") as File[];
  if (files.length === 0) {
    return { success: false, error: "请选择至少一个文件" };
  }

  const fileInfos = files.map((f) => ({ name: f.name, size: f.size }));
  const validation = validateFiles(fileInfos);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const hasHtml = files.some((f) => f.name.toLowerCase().endsWith(".html"));
  const modelVersion = hasHtml ? "MinerU-HTML" : "vlm";

  const applyResult = await applyUploadUrls(
    token,
    files.map((f) => ({ name: f.name })),
    modelVersion,
  );

  if (!applyResult.success) {
    return applyResult;
  }

  for (let i = 0; i < files.length; i += 1) {
    const bytes = await files[i].arrayBuffer();
    const ok = await uploadFileToUrl(applyResult.urls[i], bytes);
    if (!ok.success) {
      return { success: false, error: `上传文件 ${files[i].name} 失败` };
    }
  }

  return { success: true, batchId: applyResult.batchId };
}

export async function getMineruExtractResult(
  batchId: string,
): Promise<GetMineruExtractResultResult> {
  const token = process.env.MINERU_API_TOKEN;
  if (!token?.trim()) {
    return {
      success: false,
      error: "请在 .env 中配置 MINERU_API_TOKEN",
      state: "failed",
    };
  }

  const result = await getBatchExtractResults(token, batchId);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      state: "failed",
    };
  }

  const { done, allSuccess, failedItems } = isBatchComplete(
    result.extractResult,
  );

  const extractResultForClient = result.extractResult.map((r) => ({
    file_name: r.file_name,
    state: r.state,
    err_msg: r.err_msg,
  }));

  if (!done) {
    const hasRunning = result.extractResult.some(
      (r) =>
        r.state === "running" ||
        r.state === "pending" ||
        r.state === "converting",
    );
    const hasWaiting = result.extractResult.some(
      (r) => r.state === "waiting-file",
    );
    let state: MineruExtractState = "pending";
    if (hasWaiting && !hasRunning) {
      state = "waiting-file";
    } else if (hasRunning) {
      state = "running";
    } else if (result.extractResult.some((r) => r.state === "converting")) {
      state = "converting";
    }

    return {
      success: true,
      state,
      extractResult: extractResultForClient,
    };
  }

  if (!allSuccess) {
    const errMsg = failedItems
      .map((f) => `${f.file_name}: ${f.err_msg ?? "解析失败"}`)
      .join("；");
    return {
      success: false,
      error: errMsg,
      state: "failed",
      extractResult: extractResultForClient,
    };
  }

  const markdownContents: string[] = [];
  for (const item of result.extractResult) {
    if (item.full_zip_url) {
      try {
        const md = await fetchZipAndExtractMarkdown(item.full_zip_url);
        markdownContents.push(md);
      } catch (err) {
        console.error("下载或解压解析结果失败:", err);
        return {
          success: false,
          error: `获取 ${item.file_name} 的解析结果失败`,
          state: "failed",
          extractResult: extractResultForClient,
        };
      }
    }
  }

  return {
    success: true,
    state: "done",
    markdownContents,
    extractResult: extractResultForClient,
  };
}
