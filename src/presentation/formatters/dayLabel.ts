import { addDays } from "@/domain/business/businessDay";

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

  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, day));
}
