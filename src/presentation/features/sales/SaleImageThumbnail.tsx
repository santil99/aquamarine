import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { X } from "lucide-react";
import { useObjectUrl } from "@/presentation/features/shared/useObjectUrl";
import type { SaleImageEntry } from "@/presentation/features/sales/useSaleImages";
import { useTexts } from "@/presentation/texts/useTexts";

interface SaleImageThumbnailProps {
  readonly entry: SaleImageEntry;
  readonly onRemove: () => void;
}

export function SaleImageThumbnail({ entry, onRemove }: SaleImageThumbnailProps) {
  const { saleImages: texts } = useTexts();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const localUrl = useObjectUrl(entry.kind === "new" ? entry.file : null);
  const src = entry.kind === "stored" ? entry.url : localUrl;

  return (
    <div className="relative size-20 shrink-0">
      <button
        type="button"
        aria-label={texts.preview}
        onClick={() => setIsPreviewOpen(true)}
        className="size-full overflow-hidden rounded-lg border border-default"
      >
        {src ? <img src={src} alt="" className="size-full object-cover" /> : null}
      </button>

      <Button
        type="button"
        isIconOnly
        size="sm"
        variant="secondary"
        aria-label={texts.remove}
        className="absolute -right-2 -top-2 size-6 min-w-0"
        onPress={onRemove}
      >
        <X size={14} aria-hidden="true" />
      </Button>

      <Modal isOpen={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Modal.Backdrop>
          <Modal.Container placement="center">
            <Modal.Dialog aria-label={texts.preview}>
              <Modal.Body>
                {src ? <img src={src} alt="" className="max-h-[70vh] w-full object-contain" /> : null}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
