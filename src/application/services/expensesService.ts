import type { AuthRepository } from "@/application/ports/authRepository";
import type { ExpensesRepository } from "@/application/ports/expensesRepository";
import { InputValidationError } from "@/application/errors";
import { requireAuthenticatedUser } from "@/application/services/requireAuthenticatedUser";
import type { BusinessContext } from "@/domain/business/businessContext";
import { addMonths } from "@/domain/business/businessDay";
import { buildMonthlyTotals, TREND_MONTHS, type MonthlyTotal } from "@/domain/business/monthlyTrend";
import { groupByCategory, type CategoryTotal } from "@/domain/business/categoryTotal";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import { normalizeAmount } from "@/domain/shared/amount";
import {
  normalizeDetail,
  validateTransactionInput,
} from "@/domain/shared/transactionInput";
import type {
  ExpenseCatalogOption,
  ExpenseDetail,
  ExpenseInput,
} from "@/domain/expenses/expenseForm";
import type {
  ExpenseSearchFilters,
  ExpenseSearchItem,
} from "@/domain/expenses/expenseSearch";

function toExpensePayload(input: ExpenseInput): ExpenseInput {
  return {
    ...input,
    amount: normalizeAmount(input.amount),
    detail: normalizeDetail(input.detail),
  };
}

function assertValidExpense(expense: ExpenseInput): void {
  const errors = validateTransactionInput(expense);

  if (Object.keys(errors).length > 0) {
    throw new InputValidationError(errors);
  }
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

  async listForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<ExpenseListItem[]> {
    await requireAuthenticatedUser(this.authRepository);
    return this.expensesRepository.listForMonth(business, monthStart);
  }

  async searchExpenses(
    business: BusinessContext,
    filters: ExpenseSearchFilters,
  ): Promise<ExpenseSearchItem[]> {
    await requireAuthenticatedUser(this.authRepository);
    return this.expensesRepository.search(business, filters);
  }

  async getCategoryTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryTotal[]> {
    await requireAuthenticatedUser(this.authRepository);

    return groupByCategory(
      await this.expensesRepository.listAmountsForMonth(business, monthStart),
    );
  }

  async getMonthlyTotals(business: BusinessContext, endMonthStart: string): Promise<MonthlyTotal[]> {
    await requireAuthenticatedUser(this.authRepository);

    return buildMonthlyTotals(
      await this.expensesRepository.listAmountsForRange(
        business,
        addMonths(endMonthStart, -(TREND_MONTHS - 1)),
        addMonths(endMonthStart, 1),
      ),
      endMonthStart,
    );
  }

  async listCategories(): Promise<ExpenseCatalogOption[]> {
    await requireAuthenticatedUser(this.authRepository);
    return this.expensesRepository.listCategories();
  }

  async listPaymentMethods(): Promise<ExpenseCatalogOption[]> {
    await requireAuthenticatedUser(this.authRepository);
    return this.expensesRepository.listPaymentMethods();
  }

  async create(expense: ExpenseInput, transactionDate: string): Promise<void> {
    assertValidExpense(expense);

    const user = await requireAuthenticatedUser(this.authRepository);

    await this.expensesRepository.create({
      ...toExpensePayload(expense),
      userId: user.id,
      transactionDate,
    });
  }

  async getById(id: string): Promise<ExpenseDetail | null> {
    await requireAuthenticatedUser(this.authRepository);
    return this.expensesRepository.getById(id);
  }

  async update(id: string, expense: ExpenseInput): Promise<void> {
    assertValidExpense(expense);

    await requireAuthenticatedUser(this.authRepository);
    await this.expensesRepository.update(id, toExpensePayload(expense));
  }

  async delete(id: string): Promise<void> {
    await requireAuthenticatedUser(this.authRepository);
    await this.expensesRepository.delete(id);
  }
}
