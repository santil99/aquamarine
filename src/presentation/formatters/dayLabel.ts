import { addDays } from "@/domain/business/businessDay";
import { formatTransactionDate } from "@/presentation/formatters/transactionDate";

interface DayLabelTexts {
  readonly today: string;
  readonly yesterday: string;
}

export function formatDayLabel(
  date: string,
  today: string,
  locale: string,
  texts: DayLabelTexts,
): string {
  if (date === today) return texts.today;
  if (date === addDays(today, -1)) return texts.yesterday;

  return formatTransactionDate(date, locale);
}
