import { useEffect, useState } from "react";

// Data URL instead of an object URL: it needs no revocation, which StrictMode's double effects would break.
export function useObjectUrl(blob: Blob | null): string | null {
  const [preview, setPreview] = useState<{ source: Blob; url: string } | null>(null);

  useEffect(() => {
    if (!blob) return;

    const reader = new FileReader();
    reader.onload = () => setPreview({ source: blob, url: reader.result as string });
    reader.readAsDataURL(blob);

    return () => reader.abort();
  }, [blob]);

  return blob && preview?.source === blob ? preview.url : null;
}
