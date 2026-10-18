import { useState } from "react";
import { Button, Popover } from "@heroui/react";
import { CalendarDays } from "lucide-react";
import { DayCalendar } from "@/presentation/components/DayCalendar";
import { formatDayLabel } from "@/presentation/formatters/dayLabel";
import { useTexts } from "@/presentation/texts/useTexts";

interface TransactionDateFieldProps {
  readonly value: string;
  readonly today: string;
  readonly onChange: (date: string) => void;
}

export function TransactionDateField({ value, today, onChange }: TransactionDateFieldProps) {
  const { locale, transactionDate } = useTexts().common;
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const selectDate = (date: string) => {
    onChange(date);
    setIsPickerOpen(false);
  };

  return (
    <Popover isOpen={isPickerOpen} onOpenChange={setIsPickerOpen}>
      <Popover.Trigger>
        <Button variant="outline" className="w-full justify-start">
          <CalendarDays size={18} />
          {`${transactionDate.label}: ${formatDayLabel(value, today, locale, transactionDate)}`}
        </Button>
      </Popover.Trigger>
      <Popover.Content placement="bottom">
        <Popover.Dialog>
          <DayCalendar
            locale={locale}
            label={transactionDate.calendar}
            value={value}
            maxValue={today}
            onChange={selectDate}
          />
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
