const DATE_PARTS_OPTIONS: Intl.DateTimeFormatOptions = {
  hourCycle: "h23",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
};

export interface DayRange {
  start: Date;
  end: Date;
}

export function getTodayInTimeZone(timeZone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/**
 * Returns the UTC instants where a calendar day starts and ends in a time zone.
 * `end` is exclusive, so it is the start of the next day.
 */
export function getDayRangeInTimeZone(date: string, timeZone: string): DayRange {
  return {
    start: zonedMidnightToUtc(date, timeZone),
    end: zonedMidnightToUtc(addDays(date, 1), timeZone),
  };
}

function zonedMidnightToUtc(date: string, timeZone: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day);
  // Two passes handle offsets that change around DST transitions.
  let instant = wallClockAsUtc;
  for (let pass = 0; pass < 2; pass++) {
    instant = wallClockAsUtc - getOffsetMs(instant, timeZone);
  }
  return new Date(instant);
}

function getOffsetMs(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    ...DATE_PARTS_OPTIONS,
    timeZone,
  }).formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);

  const wallClockAsUtc = Date.UTC(
    part("year"),
    part("month") - 1,
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  );
  return wallClockAsUtc - Math.floor(instant / 1000) * 1000;
}

export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}
