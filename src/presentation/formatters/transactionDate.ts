/** Formats a `YYYY-MM-DD` transaction date for the active locale, without time zone shifts. */
export function formatTransactionDate(date: string, locale: string): string {
  return formatUtcDate(date, locale, { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** Formats a `YYYY-MM-DD` transaction date as day and month only, for compact listings. */
export function formatTransactionDayMonth(date: string, locale: string): string {
  return formatUtcDate(date, locale, { day: "2-digit", month: "2-digit" });
}

function formatUtcDate(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = date.split("-").map(Number);

  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
    Date.UTC(year, month - 1, day),
  );
}
