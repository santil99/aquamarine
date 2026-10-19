import { useCallback, useRef, useState, type PointerEvent } from "react";
import { Button, Modal } from "@heroui/react";
import { canvasToBlob } from "@/presentation/features/shared/compressImage";
import { useTexts } from "@/presentation/texts/useTexts";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const STROKE_WIDTH = 4;

interface DrawingCanvasModalProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly onConfirm: (drawing: Blob) => void;
}

export function DrawingCanvasModal({ isOpen, onOpenChange, onConfirm }: DrawingCanvasModalProps) {
  const { saleImages: texts } = useTexts();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  const setupCanvas = useCallback((canvas: HTMLCanvasElement | null) => {
    canvasRef.current = canvas;
    if (canvas) clearCanvas(canvas);
  }, []);

  function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function handlePointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setLastPoint(getCanvasPoint(event));
  }

  function handlePointerMove(event: PointerEvent<HTMLCanvasElement>) {
    if (!lastPoint) return;

    const point = getCanvasPoint(event);
    const context = event.currentTarget.getContext("2d");

    if (context) {
      context.beginPath();
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(point.x, point.y);
      context.stroke();
    }

    setLastPoint(point);
  }

  function handlePointerUp() {
    setLastPoint(null);
  }

  function handleClear() {
    if (canvasRef.current) clearCanvas(canvasRef.current);
  }

  async function handleConfirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawing = await canvasToBlob(canvas, "image/png");
    if (drawing) onConfirm(drawing);
    onOpenChange(false);
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{texts.drawTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <canvas
                ref={setupCanvas}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="aspect-[4/3] w-full touch-none rounded-lg border border-default"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button type="button" variant="outline" slot="close">
                {texts.drawBack}
              </Button>
              <Button type="button" variant="outline" onPress={handleClear}>
                {texts.drawClear}
              </Button>
              <Button type="button" onPress={handleConfirm}>
                {texts.drawConfirm}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function clearCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#000000";
  context.lineWidth = STROKE_WIDTH;
  context.lineCap = "round";
  context.lineJoin = "round";
}
