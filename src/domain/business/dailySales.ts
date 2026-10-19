import { compareAmounts, sumAmounts } from "@/domain/shared/amount";

export interface DailySaleAmount {
  transactionDate: string;
  amount: string;
}

export interface DailySalesPoint {
  day: number;
  date: string;
  total: string;
}

/**
 * Builds one point per day with sales, from day 1 up to `today` (or the last
 * day of the month when it is already over). Days whose total is 0 are skipped,
 * since they are assumed to be days the business was closed.
 */
export function buildDailySalesSeries(
  amounts: DailySaleAmount[],
  monthStart: string,
  today: string,
): DailySalesPoint[] {
  const amountsByDate = new Map<string, string[]>();

  for (const { transactionDate, amount } of amounts) {
    amountsByDate.set(transactionDate, [...(amountsByDate.get(transactionDate) ?? []), amount]);
  }

  return listDatesUntil(monthStart, today)
    .map((date, index) => ({
      day: index + 1,
      date,
      total: sumAmounts(amountsByDate.get(date) ?? []),
    }))
    .filter((point) => compareAmounts(point.total, "0") > 0);
}

function listDatesUntil(monthStart: string, today: string): string[] {
  const [year, month] = monthStart.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const currentMonthStart = `${today.slice(0, 8)}01`;
  const todayDay = Number(today.slice(8, 10));
  const endDay = monthStart < currentMonthStart ? lastDay : monthStart === currentMonthStart ? todayDay : 0;
  const monthPrefix = monthStart.slice(0, 8);

  return Array.from({ length: endDay }, (_, index) => `${monthPrefix}${pad(index + 1)}`);
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
