import { addMonths } from "@/domain/business/businessDay";
import { MonthPicker } from "@/presentation/components/MonthPicker";
import type { DateNavigatorMode } from "@/presentation/components/dateNavigatorMode";
import { formatMonthLabel } from "@/presentation/formatters/monthLabel";
import type { Texts } from "@/presentation/texts/types";

interface MonthModeOptions {
  readonly locale: string;
  readonly texts: Texts["common"]["monthNavigator"];
}

export function createMonthMode({ locale, texts }: MonthModeOptions): DateNavigatorMode {
  return {
    previousLabel: texts.previousMonth,
    nextLabel: texts.nextMonth,
    shift: (date, steps) => addMonths(date, steps),
    formatLabel: (date) => formatMonthLabel(date, locale),
    renderPicker: (value, onSelect) => (
      <MonthPicker selectedMonth={value} locale={locale} onSelect={onSelect} />
    ),
  };
}
