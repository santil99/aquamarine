function toUtcMonthDate(monthStart: string): Date {
  const [year, month] = monthStart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/** Capitalized month name, for example "Octubre". */
export function formatMonthName(monthStart: string, locale: string): string {
  const name = new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
  }).format(toUtcMonthDate(monthStart));

  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** Month and year label, for example "Octubre 2026". */
export function formatMonthLabel(monthStart: string, locale: string): string {
  return `${formatMonthName(monthStart, locale)} ${monthStart.slice(0, 4)}`;
}
