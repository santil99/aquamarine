import { useState } from "react";
import { Button, Calendar, I18nProvider, Popover } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths } from "@/domain/business/businessDay";
import { MonthPicker } from "@/presentation/components/MonthPicker";
import { formatDayLabel } from "@/presentation/formatters/dayLabel";
import { formatMonthLabel } from "@/presentation/formatters/monthLabel";
import { useTexts } from "@/presentation/texts/useTexts";

interface DayNavigatorProps {
  readonly mode?: "day";
  readonly date: string;
  readonly today: string;
  readonly onDateChange: (date: string) => void;
}

interface MonthNavigatorProps {
  readonly mode: "month";
  readonly date: string;
  readonly onDateChange: (monthStart: string) => void;
}

export type DateNavigatorProps = DayNavigatorProps | MonthNavigatorProps;

export function DateNavigator(props: DateNavigatorProps) {
  const { date, onDateChange } = props;
  const { common, salesList, expensesList } = useTexts();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const isMonth = props.mode === "month";

  const texts = isMonth
    ? {
        previous: expensesList.monthNavigator.previousMonth,
        next: expensesList.monthNavigator.nextMonth,
      }
    : {
        previous: salesList.dateNavigator.previousDay,
        next: salesList.dateNavigator.nextDay,
      };
  const label = isMonth
    ? formatMonthLabel(date, common.locale)
    : formatDayLabel(date, props.today, common.locale, salesList.dateNavigator);

  const shift = (step: number) =>
    onDateChange(isMonth ? addMonths(date, step) : addDays(date, step));

  const selectDate = (value: string) => {
    onDateChange(value);
    setIsCalendarOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <Button isIconOnly variant="ghost" aria-label={texts.previous} onPress={() => shift(-1)}>
        <ChevronLeft size={20} />
      </Button>

      <Popover isOpen={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <Popover.Trigger>
          <Button variant="ghost" className="font-semibold">
            {label}
          </Button>
        </Popover.Trigger>
        <Popover.Content placement="bottom">
          <Popover.Dialog>
            {isMonth ? (
              <MonthPicker selectedMonth={date} locale={common.locale} onSelect={selectDate} />
            ) : (
              <I18nProvider locale={common.locale}>
                <Calendar
                  aria-label={salesList.dateNavigator.calendar}
                  value={parseDate(date)}
                  firstDayOfWeek="mon"
                  onChange={(value) => selectDate(value.toString())}
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
            )}
          </Popover.Dialog>
        </Popover.Content>
      </Popover>

      <Button isIconOnly variant="ghost" aria-label={texts.next} onPress={() => shift(1)}>
        <ChevronRight size={20} />
      </Button>
    </div>
  );
}
