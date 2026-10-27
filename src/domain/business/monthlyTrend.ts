import { addMonths } from "@/domain/business/businessDay";
import type { DailySaleAmount } from "@/domain/business/dailySales";
import {
  averageAmounts,
  compareAmounts,
  subtractAmounts,
  sumAmounts,
} from "@/domain/shared/amount";

export const TREND_MONTHS = 12;
export const TREND_RANGES = [3, 6, 12] as const;
export type TrendRange = (typeof TREND_RANGES)[number];

export const TREND_METRICS = ["income", "expenses", "balance", "ticket"] as const;
export type TrendMetric = (typeof TREND_METRICS)[number];

export interface MonthlyTotal {
  /** First day of the month (YYYY-MM-01). */
  month: string;
  total: string;
  count: number;
  /** Average of the daily totals, skipping days without records. */
  averageDaily: string;
}

export interface TrendPoint {
  month: string;
  value: string;
}

export interface TrendChange {
  delta: string;
  /** Null when the previous month is 0, where a percentage is meaningless. */
  percent: number | null;
}

/** One entry per month, oldest first, ending at `endMonthStart`. Months without records are 0. */
export function buildMonthlyTotals(
  amounts: DailySaleAmount[],
  endMonthStart: string,
  months = TREND_MONTHS,
): MonthlyTotal[] {
  const amountsByDate = groupAmountsByDate(amounts);

  return Array.from({ length: months }, (_, index) => {
    const month = addMonths(endMonthStart, index - (months - 1));
    const prefix = month.slice(0, 7);
    const dailyEntries = [...amountsByDate].filter(([date]) => date.startsWith(prefix));
    const dailyTotals = dailyEntries
      .map(([, dayAmounts]) => sumAmounts(dayAmounts))
      .filter((total) => compareAmounts(total, "0") > 0);

    return {
      month,
      total: sumAmounts(dailyEntries.flatMap(([, dayAmounts]) => dayAmounts)),
      count: dailyEntries.reduce((count, [, dayAmounts]) => count + dayAmounts.length, 0),
      averageDaily: averageAmounts(dailyTotals),
    };
  });
}

/** Combines sales and expenses into the series of the chosen metric. Both lists share the same months. */
export function buildTrendSeries(
  metric: TrendMetric,
  sales: MonthlyTotal[],
  expenses: MonthlyTotal[],
): TrendPoint[] {
  return sales.map((sale, index) => ({
    month: sale.month,
    value: selectValue(metric, sale, expenses[index]),
  }));
}

/** Change of the last point against the one before it; null when there is no previous point. */
export function getLastChange(series: TrendPoint[]): TrendChange | null {
  if (series.length < 2) return null;

  const current = series[series.length - 1].value;
  const previous = series[series.length - 2].value;
  const isPreviousZero = compareAmounts(previous, "0") === 0;

  return {
    delta: subtractAmounts(current, previous),
    percent: isPreviousZero
      ? null
      : ((Number(current) - Number(previous)) / Math.abs(Number(previous))) * 100,
  };
}

function selectValue(metric: TrendMetric, sale: MonthlyTotal, expense: MonthlyTotal | undefined): string {
  const expenseTotal = expense?.total ?? "0.00";

  switch (metric) {
    case "income":
      return sale.total;
    case "expenses":
      return expenseTotal;
    case "balance":
      return subtractAmounts(sale.total, expenseTotal);
    case "ticket":
      return sale.averageDaily;
  }
}

function groupAmountsByDate(amounts: DailySaleAmount[]): Map<string, string[]> {
  const amountsByDate = new Map<string, string[]>();

  for (const { transactionDate, amount } of amounts) {
    amountsByDate.set(transactionDate, [...(amountsByDate.get(transactionDate) ?? []), amount]);
  }

  return amountsByDate;
}
