import { getTimeInTimeZone } from "@/domain/business/businessDay";
import type { ReportPeriod } from "@/domain/reports/reportPeriod";
import { sumAmounts } from "@/domain/shared/amount";

export interface SalesReportRow {
  readonly id: string;
  readonly amount: string;
  readonly transactionDate: string;
  readonly createdAt: string;
  readonly paymentMethod: string | null;
  readonly detail: string | null;
}

export interface SalesReportItem {
  readonly transactionDate: string;
  readonly time: string;
  readonly paymentMethod: string | null;
  readonly detail: string | null;
  readonly amount: string;
}

export interface SalesReport {
  readonly period: ReportPeriod;
  readonly items: SalesReportItem[];
  readonly total: string;
}

/** Items are ordered oldest first: by transaction date, then by registration time. */
export function buildSalesReport(
  rows: SalesReportRow[],
  period: ReportPeriod,
  timeZone: string,
): SalesReport {
  const items = [...rows]
    .sort(compareRows)
    .map((row) => ({
      transactionDate: row.transactionDate,
      time: getTimeInTimeZone(timeZone, new Date(row.createdAt)),
      paymentMethod: row.paymentMethod,
      detail: row.detail,
      amount: row.amount,
    }));

  return {
    period,
    items,
    total: sumAmounts(rows.map((row) => row.amount)),
  };
}

function compareRows(left: SalesReportRow, right: SalesReportRow): number {
  if (left.transactionDate !== right.transactionDate) {
    return left.transactionDate < right.transactionDate ? -1 : 1;
  }

  return Date.parse(left.createdAt) - Date.parse(right.createdAt);
}
