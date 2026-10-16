import { addMonths, getDayRangeInTimeZone } from "@/domain/business/businessDay";

export function getMonthRange(monthStart: string, timeZone: string) {
  return {
    from: getDayRangeInTimeZone(monthStart, timeZone).start.toISOString(),
    to: getDayRangeInTimeZone(addMonths(monthStart, 1), timeZone).start.toISOString(),
  };
}
