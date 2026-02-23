/** MinerU API 错误码到用户可读提示的映射 */
export const MINERU_ERROR_MESSAGES: Record<string, string> = {
  A0202: "Token 错误，请检查 .env 中的 MINERU_API_TOKEN",
  A0211: "Token 已过期，请更换新 Token",
  "-500": "传参错误，请检查参数格式",
  "-10001": "MinerU 服务异常，请稍后再试",
  "-10002": "请求参数错误，请检查格式",
  "-60001": "生成上传链接失败，请稍后再试",
  "-60002": "文件格式不支持，请使用 PDF、Word、PPT、图片或 HTML",
  "-60003": "文件读取失败，请检查文件是否损坏",
  "-60004": "空文件，请上传有效文件",
  "-60005": "文件大小超出限制（最大 200MB）",
  "-60006": "文件页数超过限制（最大 600 页）",
  "-60007": "模型服务暂时不可用，请稍后再试",
  "-60008": "文件读取超时，请检查网络",
  "-60009": "任务队列已满，请稍后再试",
  "-60010": "解析失败，请稍后再试",
  "-60011": "获取有效文件失败，请确保文件已上传",
  "-60012": "找不到任务，请重试",
  "-60013": "没有权限访问该任务",
  "-60014": "运行中的任务暂不支持删除",
  "-60015": "文件转换失败，可尝试转为 PDF 后上传",
  "-60016": "文件格式转换失败，请重试",
  "-60017": "重试次数已达上限，请稍后再试",
  "-60018": "每日解析任务数量已达上限，明日再来",
  "-60019": "HTML 解析额度不足，明日再来",
  "-60020": "文件拆分失败，请稍后再试",
  "-60021": "读取文件页数失败，请稍后再试",
  "-60022": "网页读取失败，请稍后再试",
};

export type MinerUModelVersion = "pipeline" | "vlm" | "MinerU-HTML";

export type MinerUFileState =
  | "waiting-file"
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "converting";

export interface MinerUFileUrlRequest {
  name: string;
  data_id?: string;
  is_ocr?: boolean;
  page_ranges?: string;
}

export interface MinerUFileUrlsBatchResponse {
  code: number;
  msg: string;
  trace_id?: string;
  data?: {
    batch_id: string;
    file_urls: string[];
  };
}

export interface MinerUExtractResultItem {
  file_name: string;
  state: MinerUFileState;
  err_msg?: string;
  full_zip_url?: string;
  data_id?: string;
  extract_progress?: {
    extracted_pages: number;
    total_pages: number;
    start_time: string;
  };
}

export interface MinerUExtractResultsBatchResponse {
  code: number;
  msg: string;
  trace_id?: string;
  data?: {
    batch_id: string;
    extract_result: MinerUExtractResultItem[];
  };
}
