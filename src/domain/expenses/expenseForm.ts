import type { TransactionInput } from "@/domain/shared/transactionInput";

export interface ExpenseCatalogOption {
  id: string;
  name: string;
}

export interface ExpenseCatalogs {
  categories: ExpenseCatalogOption[];
  paymentMethods: ExpenseCatalogOption[];
}

export type ExpenseInput = TransactionInput;

export interface ExpenseDetail extends ExpenseInput {
  id: string;
  transactionDate: string;
  category: string;
  paymentMethod: string | null;
}

