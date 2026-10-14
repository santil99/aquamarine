import type { CategoryTotal } from "@/domain/business/categoryTotal";
import { subtractSaleAmounts, sumSaleAmounts } from "@/domain/sales/saleTotal";

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
  const salesTotal = sumSaleAmounts(sales.map((category) => category.total));
  const expensesTotal = sumSaleAmounts(expenses.map((category) => category.total));

  return {
    salesTotal,
    salesCount: countTransactions(sales),
    expensesTotal,
    expensesCount: countTransactions(expenses),
    balance: subtractSaleAmounts(salesTotal, expensesTotal),
  };
}

function countTransactions(categories: CategoryTotal[]): number {
  return categories.reduce((total, category) => total + category.count, 0);
}
