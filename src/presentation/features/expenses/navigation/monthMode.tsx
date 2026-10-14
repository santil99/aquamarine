import { addMonths } from "@/domain/business/businessDay";
import { MonthPicker } from "@/presentation/components/MonthPicker";
import { formatMonthLabel } from "@/presentation/formatters/monthLabel";
import type { DateNavigatorMode } from "@/presentation/components/dateNavigatorMode";
import type { Texts } from "@/presentation/texts/types";

type MonthModeTexts = Texts["expensesList"]["monthNavigator"];

interface MonthModeOptions {
  readonly locale: string;
  readonly texts: MonthModeTexts;
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
