import { useRef, useState, type ChangeEvent } from "react";
import { Button, Dropdown } from "@heroui/react";
import { Camera, Images, Paperclip, PenLine } from "lucide-react";
import { MAX_SALE_IMAGES } from "@/domain/sales/saleImages";
import { DrawingCanvasModal } from "@/presentation/features/sales/DrawingCanvasModal";
import { SaleImageThumbnail } from "@/presentation/features/sales/SaleImageThumbnail";
import type { SaleImagesState } from "@/presentation/features/sales/useSaleImages";
import { useTexts } from "@/presentation/texts/useTexts";

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

interface SaleImagesFieldProps {
  readonly images: SaleImagesState;
}

export function SaleImagesField({ images }: SaleImagesFieldProps) {
  const { saleImages: texts } = useTexts();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  const errorMessages = {
    unsupportedType: texts.unsupportedType,
    tooLarge: texts.tooLarge,
    tooMany: texts.tooMany,
    processError: texts.processError,
  };

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (file) void images.addImage(file);
  }

  function handleSourceSelect(key: string) {
    if (key === "gallery") galleryInputRef.current?.click();
    if (key === "camera") cameraInputRef.current?.click();
    if (key === "draw") setIsDrawingOpen(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{texts.label}</p>

      <Dropdown>
        <Dropdown.Trigger>
          <Button type="button" variant="outline" className="w-full" isDisabled={!images.canAddMore}>
            <Paperclip size={16} aria-hidden="true" />
            {texts.add(images.entries.length, MAX_SALE_IMAGES)}
          </Button>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu onAction={(key) => handleSourceSelect(String(key))}>
            <Dropdown.Item id="gallery" textValue={texts.fromGallery}>
              <Images size={16} aria-hidden="true" />
              {texts.fromGallery}
            </Dropdown.Item>
            <Dropdown.Item id="camera" textValue={texts.fromCamera}>
              <Camera size={16} aria-hidden="true" />
              {texts.fromCamera}
            </Dropdown.Item>
            <Dropdown.Item id="draw" textValue={texts.draw}>
              <PenLine size={16} aria-hidden="true" />
              {texts.draw}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <input
        ref={galleryInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {images.entries.length > 0 ? (
        <div className="flex flex-wrap gap-3 pt-2">
          {images.entries.map((entry) => (
            <SaleImageThumbnail
              key={entry.key}
              entry={entry}
              onRemove={() => images.removeImage(entry.key)}
            />
          ))}
        </div>
      ) : null}

      {images.error ? (
        <p role="alert" className="text-sm text-danger">
          {errorMessages[images.error]}
        </p>
      ) : null}

      <DrawingCanvasModal
        isOpen={isDrawingOpen}
        onOpenChange={setIsDrawingOpen}
        onConfirm={(drawing) => void images.addImage(drawing)}
      />
    </div>
  );
}
