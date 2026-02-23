/**
 * 使用 Canvas 将图片旋转指定角度，返回新的 File。
 * 仅支持 90、180、270 度旋转。
 */
export async function rotateImageToFile(
  file: File,
  degrees: 0 | 90 | 180 | 270,
): Promise<File> {
  if (degrees === 0) {
    return file;
  }

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法获取 Canvas 2D 上下文");
  }

  const { width, height } = getRotatedDimensions(
    img.width,
    img.height,
    degrees,
  );
  canvas.width = width;
  canvas.height = height;

  ctx.translate(width / 2, height / 2);
  ctx.rotate((degrees * Math.PI) / 180);
  ctx.translate(-img.width / 2, -img.height / 2);
  ctx.drawImage(img, 0, 0);

  const mime = file.type || "image/png";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob 失败"))),
      mime,
      0.95,
    );
  });

  const ext = getExtensionFromMime(mime);
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const newName = `${baseName}.${ext}`;
  return new File([blob], newName, { type: mime });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("图片加载失败"));
    };
    img.src = url;
  });
}

function getRotatedDimensions(
  w: number,
  h: number,
  degrees: 90 | 180 | 270,
): { width: number; height: number } {
  if (degrees === 180) return { width: w, height: h };
  return { width: h, height: w };
}

function getExtensionFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mime] ?? "png";
}
