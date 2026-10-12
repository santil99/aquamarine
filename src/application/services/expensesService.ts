import type { AuthRepository } from "@/application/ports/authRepository";
import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import {
  validateExpense,
  type ExpenseCatalogOption,
  type ExpenseDetail,
  type ExpenseInput,
} from "@/domain/expenses/expenseForm";

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

  listCategories(): Promise<ExpenseCatalogOption[]> {
    return this.expensesRepository.listCategories();
  }

  listPaymentMethods(): Promise<ExpenseCatalogOption[]> {
    return this.expensesRepository.listPaymentMethods();
  }

  async create(expense: ExpenseInput): Promise<void> {
    if (Object.keys(validateExpense(expense)).length > 0) {
      throw new Error("Invalid expense");
    }

    const user = await this.requireAuthenticatedUser();

    await this.expensesRepository.create(expense, user.id);
  }

  async getById(id: string): Promise<ExpenseDetail | null> {
    await this.requireAuthenticatedUser();
    return this.expensesRepository.getById(id);
  }

  async update(id: string, expense: ExpenseInput): Promise<void> {
    if (Object.keys(validateExpense(expense)).length > 0) {
      throw new Error("Invalid expense");
    }

    await this.requireAuthenticatedUser();
    const updated = await this.expensesRepository.update(id, expense);

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
