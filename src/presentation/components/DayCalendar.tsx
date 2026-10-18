import { Calendar, I18nProvider } from "@heroui/react";
import { parseDate } from "@internationalized/date";

interface DayCalendarProps {
  readonly locale: string;
  readonly label: string;
  readonly value: string;
  readonly maxValue?: string;
  readonly onChange: (date: string) => void;
}

export function DayCalendar({ locale, label, value, maxValue, onChange }: DayCalendarProps) {
  return (
    <I18nProvider locale={locale}>
      <Calendar
        aria-label={label}
        value={parseDate(value)}
        maxValue={maxValue ? parseDate(maxValue) : undefined}
        firstDayOfWeek="mon"
        onChange={(selected) => onChange(selected.toString())}
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
  );
}
