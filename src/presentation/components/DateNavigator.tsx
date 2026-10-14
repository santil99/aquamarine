import { useState } from "react";
import { Button, Calendar, I18nProvider, Popover } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays } from "@/domain/business/businessDay";
import { formatDayLabel } from "@/presentation/formatters/dayLabel";
import { useTexts } from "@/presentation/texts/useTexts";

interface DateNavigatorProps {
  readonly date: string;
  readonly today: string;
  readonly onDateChange: (date: string) => void;
}

export function DateNavigator({ date, today, onDateChange }: DateNavigatorProps) {
  const { common, salesList } = useTexts();
  const texts = salesList.dateNavigator;
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectFromCalendar = (value: { toString(): string }) => {
    onDateChange(value.toString());
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        isIconOnly
        variant="ghost"
        aria-label={texts.previousDay}
        onPress={() => onDateChange(addDays(date, -1))}
      >
        <ChevronIcon direction="left" />
      </Button>

      <Popover isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <Popover.Trigger>
          <Button variant="ghost" className="font-semibold">
            {formatDayLabel(date, today, common.locale, texts)}
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom">
          <Popover.Dialog>
            <I18nProvider locale={common.locale}>
              <Calendar
                aria-label={texts.calendar}
                value={parseDate(date)}
                firstDayOfWeek="mon"
                onChange={selectFromCalendar}
              >
                <Calendar.Header>
                  <Calendar.NavButton slot="previous" />
                  <Calendar.Heading />
                  <Calendar.NavButton slot="next" />
                </Calendar.Header>
                <Calendar.Grid>
                  <Calendar.GridHeader>
                    {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                  </Calendar.GridHeader>
                  <Calendar.GridBody>
                    {(calendarDate) => <Calendar.Cell date={calendarDate} />}
                  </Calendar.GridBody>
                </Calendar.Grid>
              </Calendar>
            </I18nProvider>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <Button
        isIconOnly
        variant="ghost"
        aria-label={texts.nextDay}
        onPress={() => onDateChange(addDays(date, 1))}
      >
        <ChevronIcon direction="right" />
      </Button>
    </div>
  );
}

function ChevronIcon({ direction }: { readonly direction: "left" | "right" }) {
  return direction === "left" ? <ChevronLeft size={20} /> : <ChevronRight size={20} />;
}
