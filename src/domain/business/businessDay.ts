export function getDateInTimeZone(timeZone: string, instant = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Time of day as `HH:mm` in the given time zone. */
export function getTimeInTimeZone(timeZone: string, instant: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(instant);
}

export function getTodayInTimeZone(timeZone: string, now = new Date()): string {
  return getDateInTimeZone(timeZone, now);
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

export function getMonthStart(date: string): string {
  return `${date.slice(0, 8)}01`;
}

export function addMonths(monthStart: string, months: number): string {
  const [year, month] = monthStart.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + months, 1))
    .toISOString()
    .slice(0, 10);
}
