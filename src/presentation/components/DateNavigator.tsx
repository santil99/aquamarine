import { useState } from "react";
import { Button, Calendar, I18nProvider, Popover } from "@heroui/react";
import { parseDate } from "@internationalized/date";
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
  const points = direction === "left" ? "15 18 9 12 15 6" : "9 18 15 12 9 6";

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points={points} />
    </svg>
  );
}
