export const MAX_SALE_IMAGES = 3;
export const MAX_SALE_IMAGE_BYTES = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type SaleImageError = "unsupportedType" | "tooLarge" | "tooMany";

export function validateSaleImage(image: Blob): SaleImageError | null {
  if (!IMAGE_EXTENSIONS.has(image.type)) return "unsupportedType";
  if (image.size > MAX_SALE_IMAGE_BYTES) return "tooLarge";

  return null;
}

/** `keptCount` is the number of images already stored that the sale will keep. */
export function validateSaleImages(images: Blob[], keptCount = 0): SaleImageError | null {
  if (keptCount + images.length > MAX_SALE_IMAGES) return "tooMany";

  for (const image of images) {
    const error = validateSaleImage(image);
    if (error) return error;
  }

  return null;
}

export function buildSaleImagePath(contentType: string, id: string, timestamp: number): string {
  return `sales/${timestamp}_${id}.${IMAGE_EXTENSIONS.get(contentType)}`;
}
