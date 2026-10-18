import type { AuthRepository } from "@/application/ports/authRepository";
import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import { groupByCategory, type CategoryTotal } from "@/domain/business/categoryTotal";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import {
  normalizeSaleAmount,
  normalizeSaleDetail,
  validateNewSale,
  type NewSaleInput,
} from "@/domain/sales/newSale";
import type {
  ExpenseCatalogOption,
  ExpenseDetail,
} from "@/domain/expenses/expenseForm";
import type {
  ExpenseSearchFilters,
  ExpenseSearchItem,
} from "@/domain/expenses/expenseSearch";

function toExpensePayload(input: NewSaleInput): NewSaleInput {
  return {
    ...input,
    amount: normalizeSaleAmount(input.amount),
    detail: normalizeSaleDetail(input.detail),
  };
}

export class ExpensesService {
  private readonly expensesRepository: ExpensesRepository;
  private readonly authRepository: AuthRepository;

  constructor(
    expensesRepository: ExpensesRepository,
    authRepository: AuthRepository,
  ) {
    this.expensesRepository = expensesRepository;
    this.authRepository = authRepository;
  }

  listForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<ExpenseListItem[]> {
    return this.expensesRepository.listForMonth(business, monthStart);
  }

  async searchExpenses(
    business: BusinessContext,
    filters: ExpenseSearchFilters,
  ): Promise<ExpenseSearchItem[]> {
    await this.requireAuthenticatedUser();
    return this.expensesRepository.search(business, filters);
  }

  async getCategoryTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryTotal[]> {
    await this.requireAuthenticatedUser();

    return groupByCategory(
      await this.expensesRepository.listAmountsForMonth(business, monthStart),
    );
  }

  listCategories(): Promise<ExpenseCatalogOption[]> {
    return this.expensesRepository.listCategories();
  }

  listPaymentMethods(): Promise<ExpenseCatalogOption[]> {
    return this.expensesRepository.listPaymentMethods();
  }

  async create(expense: NewSaleInput, transactionDate: string): Promise<void> {
    if (Object.keys(validateNewSale(expense)).length > 0) {
      throw new Error("Invalid expense");
    }

    const user = await this.requireAuthenticatedUser();

    await this.expensesRepository.create({
      ...toExpensePayload(expense),
      userId: user.id,
      transactionDate,
    });
  }

  async getById(id: string): Promise<ExpenseDetail | null> {
    await this.requireAuthenticatedUser();
    return this.expensesRepository.getById(id);
  }

  async update(id: string, expense: NewSaleInput): Promise<void> {
    if (Object.keys(validateNewSale(expense)).length > 0) {
      throw new Error("Invalid expense");
    }

    await this.requireAuthenticatedUser();
    const updated = await this.expensesRepository.update(id, toExpensePayload(expense));

    if (!updated) {
      throw new Error("Expense not found");
    }
  }

  async delete(id: string): Promise<void> {
    await this.requireAuthenticatedUser();
    const deleted = await this.expensesRepository.delete(id);

    if (!deleted) {
      throw new Error("Expense not found");
    }
  }

  private async requireAuthenticatedUser() {
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error("Authenticated user required");
    }

    return user;
  }
}
