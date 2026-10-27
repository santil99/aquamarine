import type { CategoryTotal } from "@/domain/business/categoryTotal";
import type { DailySalesPoint } from "@/domain/business/dailySales";
import type { MonthlyTotal } from "@/domain/business/monthlyTrend";

export interface SummaryLoaders {
  readonly sales: (monthStart: string) => Promise<CategoryTotal[]>;
  readonly expenses: (monthStart: string) => Promise<CategoryTotal[]>;
  readonly dailySales: (monthStart: string) => Promise<DailySalesPoint[]>;
  readonly salesTrend: (endMonthStart: string) => Promise<MonthlyTotal[]>;
  readonly expensesTrend: (endMonthStart: string) => Promise<MonthlyTotal[]>;
}
