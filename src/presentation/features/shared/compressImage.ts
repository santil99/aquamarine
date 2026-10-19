const MAX_SIDE_PX = 1600;
const WEBP_QUALITY = 0.8;
const JPEG_QUALITY = 0.85;

/** Downscales to MAX_SIDE_PX and re-encodes as WebP (JPEG fallback). */
export async function compressImage(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);

  try {
    const scale = Math.min(1, MAX_SIDE_PX / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext("2d");
    if (!context) throw new Error("2D canvas is not available");

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob =
      (await canvasToBlob(canvas, "image/webp", WEBP_QUALITY)) ??
      (await canvasToBlob(canvas, "image/jpeg", JPEG_QUALITY));

    if (!blob) throw new Error("Image could not be encoded");

    return blob;
  } finally {
    bitmap.close();
  }
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}
