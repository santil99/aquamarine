import type { CategoryTotal } from "@/domain/business/categoryTotal";
import { subtractAmounts, sumAmounts } from "@/domain/shared/amount";

export interface MonthSummary {
  salesTotal: string;
  salesCount: number;
  expensesTotal: string;
  expensesCount: number;
  balance: string;
}

export function summarizeMonth(
  sales: CategoryTotal[],
  expenses: CategoryTotal[],
): MonthSummary {
  const salesTotal = sumAmounts(sales.map((category) => category.total));
  const expensesTotal = sumAmounts(expenses.map((category) => category.total));

  return {
    salesTotal,
    salesCount: countTransactions(sales),
    expensesTotal,
    expensesCount: countTransactions(expenses),
    balance: subtractAmounts(salesTotal, expensesTotal),
  };
}

function countTransactions(categories: CategoryTotal[]): number {
  return categories.reduce((total, category) => total + category.count, 0);
}
