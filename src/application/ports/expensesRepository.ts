import type { BusinessContext } from "@/domain/business/businessContext";
import type { CategoryAmount } from "@/domain/business/categoryTotal";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import type {
  ExpenseCatalogOption,
  ExpenseDetail,
  ExpenseInput,
} from "@/domain/expenses/expenseForm";
import type {
  ExpenseSearchFilters,
  ExpenseSearchItem,
} from "@/domain/expenses/expenseSearch";

export interface ExpensesRepository {
  listForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<ExpenseListItem[]>;
  listAmountsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryAmount[]>;
  search(
    business: BusinessContext,
    filters: ExpenseSearchFilters,
  ): Promise<ExpenseSearchItem[]>;
  listCategories(): Promise<ExpenseCatalogOption[]>;
  listPaymentMethods(): Promise<ExpenseCatalogOption[]>;
  create(expense: ExpenseInput, userId: string): Promise<void>;
  getById(id: string): Promise<ExpenseDetail | null>;
  update(id: string, expense: ExpenseInput): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
