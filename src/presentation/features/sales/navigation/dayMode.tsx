import { addDays } from "@/domain/business/businessDay";
import { DayCalendar } from "@/presentation/components/DayCalendar";
import type { DateNavigatorMode } from "@/presentation/components/dateNavigatorMode";
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
    maxDate: today,
    shift: (date, steps) => addDays(date, steps),
    formatLabel: (date) => formatDayLabel(date, today, locale, texts),
    renderPicker: (value, onSelect) => (
      <DayCalendar
        locale={locale}
        label={texts.calendar}
        value={value}
        maxValue={today}
        onChange={onSelect}
      />
    ),
  };
}
