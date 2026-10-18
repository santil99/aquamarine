import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { formatMonthName } from "@/presentation/formatters/monthLabel";
import { useTexts } from "@/presentation/texts/useTexts";

const MONTH_NUMBERS = Array.from({ length: 12 }, (_, index) => index + 1);

interface MonthPickerProps {
  readonly selectedMonth: string;
  readonly maxMonth: string;
  readonly locale: string;
  readonly onSelect: (monthStart: string) => void;
}

export function MonthPicker({ selectedMonth, maxMonth, locale, onSelect }: MonthPickerProps) {
  const texts = useTexts().common.monthNavigator;
  const [year, setYear] = useState(() => Number(selectedMonth.slice(0, 4)));
  const maxYear = Number(maxMonth.slice(0, 4));

  return (
    <div role="group" aria-label={texts.pickMonth} className="flex flex-col gap-3 p-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          isIconOnly
          variant="ghost"
          aria-label={texts.previousYear}
          onPress={() => setYear((current) => current - 1)}
        >
          <ChevronLeft size={20} />
        </Button>
        <span className="font-semibold">{year}</span>
        <Button
          isIconOnly
          variant="ghost"
          aria-label={texts.nextYear}
          isDisabled={year >= maxYear}
          onPress={() => setYear((current) => current + 1)}
        >
          <ChevronRight size={20} />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTH_NUMBERS.map((month) => {
          const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
          const isSelected = monthStart === selectedMonth;

          return (
            <Button
              key={monthStart}
              variant={isSelected ? "primary" : "ghost"}
              aria-current={isSelected ? "date" : undefined}
              isDisabled={monthStart > maxMonth}
              onPress={() => onSelect(monthStart)}
            >
              {formatMonthName(monthStart, locale)}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
