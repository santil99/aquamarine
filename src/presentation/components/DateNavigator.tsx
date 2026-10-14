import { useState } from "react";
import { Button, Popover } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DateNavigatorMode } from "@/presentation/navigation/dateNavigatorMode";

interface DateNavigatorProps {
  readonly mode: DateNavigatorMode;
  readonly date: string;
  readonly onDateChange: (date: string) => void;
}

export function DateNavigator({ mode, date, onDateChange }: DateNavigatorProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectDate = (value: string) => {
    onDateChange(value);
    setIsPickerOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        isIconOnly
        variant="ghost"
        aria-label={mode.previousLabel}
        onPress={() => onDateChange(mode.shift(date, -1))}
      >
        <ChevronLeft size={20} />
      </Button>

      <Popover isOpen={isPickerOpen} onOpenChange={setIsPickerOpen}>
        <Popover.Trigger>
          <Button variant="ghost" className="font-semibold">
            {mode.formatLabel(date)}
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom">
          <Popover.Dialog>{mode.renderPicker(date, selectDate)}</Popover.Dialog>
        </Popover.Content>
      </Popover>

      <Button
        isIconOnly
        variant="ghost"
        aria-label={mode.nextLabel}
        onPress={() => onDateChange(mode.shift(date, 1))}
      >
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
