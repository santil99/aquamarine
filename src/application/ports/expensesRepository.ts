import type { BusinessContext } from "@/domain/business/businessContext";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import type {
  ExpenseCatalogOption,
  ExpenseDetail,
  ExpenseInput,
} from "@/domain/expenses/expenseForm";

export interface ExpensesRepository {
  listForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<ExpenseListItem[]>;
  listCategories(): Promise<ExpenseCatalogOption[]>;
  listPaymentMethods(): Promise<ExpenseCatalogOption[]>;
  create(expense: ExpenseInput, userId: string): Promise<void>;
  getById(id: string): Promise<ExpenseDetail | null>;
  update(id: string, expense: ExpenseInput): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
