import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";

export interface ExpenseSearchFilters {
  dateFrom: string;
  dateTo: string;
  detail: string | null;
  categoryId: string | null;
}

export interface ExpenseSearchItem extends ExpenseListItem {
  detail: string | null;
}
