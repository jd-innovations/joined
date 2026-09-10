export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  previewUrl: string;
}

const MAX_EDGE = 1600;
const QUALITY = 0.75;

/**
 * Downscale + re-encode a picked photo in the browser so chat uploads stay
 * fast on mobile data. Falls back to the original file if the browser can't
 * decode/encode it.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no 2d context");
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", QUALITY),
    );
    if (!blob) throw new Error("encode failed");

    return { blob, width, height, previewUrl: URL.createObjectURL(blob) };
  } catch {
    return {
      blob: file,
      width: 0,
      height: 0,
      previewUrl: URL.createObjectURL(file),
    };
  }
}
