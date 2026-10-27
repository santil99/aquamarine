import { addDays, addMonths, getMonthStart } from "@/domain/business/businessDay";

export type ReportPeriodId = "thisWeek" | "previousWeek" | "thisMonth" | "previousMonth" | "thisYear";

export interface ReportPeriod {
  readonly id: ReportPeriodId;
  readonly dateFrom: string;
  readonly dateTo: string;
}

export const REPORT_PERIOD_IDS: readonly ReportPeriodId[] = [
  "thisWeek",
  "previousWeek",
  "thisMonth",
  "previousMonth",
  "thisYear",
];

/** Resolves a predefined period to an inclusive `YYYY-MM-DD` range. Current periods end today. */
export function getReportPeriod(id: ReportPeriodId, today: string): ReportPeriod {
  return { id, ...resolveRange(id, today) };
}

function resolveRange(id: ReportPeriodId, today: string): { dateFrom: string; dateTo: string } {
  const weekStart = getWeekStart(today);
  const monthStart = getMonthStart(today);

  switch (id) {
    case "thisWeek":
      return { dateFrom: weekStart, dateTo: today };
    case "previousWeek":
      return { dateFrom: addDays(weekStart, -7), dateTo: addDays(weekStart, -1) };
    case "thisMonth":
      return { dateFrom: monthStart, dateTo: today };
    case "previousMonth":
      return { dateFrom: addMonths(monthStart, -1), dateTo: addDays(monthStart, -1) };
    case "thisYear":
      return { dateFrom: `${today.slice(0, 4)}-01-01`, dateTo: today };
  }
}

/** Monday of the week that contains `date` (`YYYY-MM-DD`). */
function getWeekStart(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const sundayBasedWeekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const daysSinceMonday = (sundayBasedWeekday + 6) % 7;

  return addDays(date, -daysSinceMonday);
}
