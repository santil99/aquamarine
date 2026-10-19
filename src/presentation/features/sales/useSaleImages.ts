import { useCallback, useState } from "react";
import type { SaleImage } from "@/domain/sales/saleDetail";
import { MAX_SALE_IMAGES, validateSaleImage, type SaleImageError } from "@/domain/sales/saleImages";
import { compressImage } from "@/presentation/features/shared/compressImage";

export type SaleImageEntry =
  | { key: string; kind: "stored"; path: string; url: string }
  | { key: string; kind: "new"; file: Blob };

export type SaleImageFieldError = SaleImageError | "processError";

function toStoredEntries(images: SaleImage[]): SaleImageEntry[] {
  return images.map((image) => ({
    key: image.path,
    kind: "stored",
    path: image.path,
    url: image.url,
  }));
}

export function useSaleImages(storedImages: SaleImage[] = []) {
  const [entries, setEntries] = useState<SaleImageEntry[]>(() => toStoredEntries(storedImages));
  const [error, setError] = useState<SaleImageFieldError | null>(null);

  const addImage = useCallback(async (image: Blob) => {
    const validationError = validateSaleImage(image);

    if (validationError) {
      setError(validationError);
      return;
    }

    let compressed: Blob;

    try {
      compressed = await compressImage(image);
    } catch {
      setError("processError");
      return;
    }

    setEntries((current) =>
      current.length >= MAX_SALE_IMAGES
        ? current
        : [...current, { key: crypto.randomUUID(), kind: "new", file: compressed }],
    );
    setError(null);
  }, []);

  const removeImage = useCallback((key: string) => {
    setEntries((current) => current.filter((entry) => entry.key !== key));
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setEntries([]);
    setError(null);
  }, []);

  return {
    entries,
    error,
    canAddMore: entries.length < MAX_SALE_IMAGES,
    keptPaths: entries.flatMap((entry) => (entry.kind === "stored" ? [entry.path] : [])),
    newFiles: entries.flatMap((entry) => (entry.kind === "new" ? [entry.file] : [])),
    addImage,
    removeImage,
    reset,
  };
}

export type SaleImagesState = ReturnType<typeof useSaleImages>;
