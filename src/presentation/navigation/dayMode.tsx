import { Calendar, I18nProvider } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { addDays } from "@/domain/business/businessDay";
import type { DateNavigatorMode } from "@/presentation/navigation/dateNavigatorMode";
import { formatDayLabel } from "@/presentation/formatters/dayLabel";
import type { Texts } from "@/presentation/texts/types";

type DayModeTexts = Texts["salesList"]["dateNavigator"];

interface DayModeOptions {
  readonly locale: string;
  readonly today: string;
  readonly texts: DayModeTexts;
}

export function createDayMode({ locale, today, texts }: DayModeOptions): DateNavigatorMode {
  return {
    previousLabel: texts.previousDay,
    nextLabel: texts.nextDay,
    shift: (date, steps) => addDays(date, steps),
    formatLabel: (date) => formatDayLabel(date, today, locale, texts),
    renderPicker: (value, onSelect) => (
      <I18nProvider locale={locale}>
        <Calendar
          aria-label={texts.calendar}
          value={parseDate(value)}
          firstDayOfWeek="mon"
          onChange={(selected) => onSelect(selected.toString())}
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
    ),
  };
}
