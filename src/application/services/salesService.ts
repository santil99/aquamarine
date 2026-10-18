import type { AuthRepository } from "@/application/ports/authRepository";
import type { SalesCatalogs, SalesRepository } from "@/application/ports/salesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import { groupByCategory, type CategoryTotal } from "@/domain/business/categoryTotal";
import { buildDailySalesSeries, type DailySalesPoint } from "@/domain/business/dailySales";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import {
  normalizeSaleAmount,
  normalizeSaleDetail,
  validateNewSale,
  type NewSaleInput,
  type NewSaleValidationErrors,
} from "@/domain/sales/newSale";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";

export class NewSaleValidationError extends Error {
  readonly errors: NewSaleValidationErrors;

  constructor(errors: NewSaleValidationErrors) {
    super("Invalid new sale");
    this.errors = errors;
  }
}

export class SalesService {
  private readonly salesRepository: SalesRepository;
  private readonly authRepository: AuthRepository;

  constructor(salesRepository: SalesRepository, authRepository: AuthRepository) {
    this.salesRepository = salesRepository;
    this.authRepository = authRepository;
  }

  async listForDate(business: BusinessContext, date: string): Promise<SaleListItem[]> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.listForDate(business, date);
  }

  async searchSales(
    business: BusinessContext,
    filters: SaleSearchFilters,
  ): Promise<SaleSearchItem[]> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.search(business, {
      ...filters,
      minAmount: filters.minAmount ? normalizeSaleAmount(filters.minAmount) : null,
      maxAmount: filters.maxAmount ? normalizeSaleAmount(filters.maxAmount) : null,
    });
  }

  async getCategoryTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryTotal[]> {
    await this.requireAuthenticatedUser();

    return groupByCategory(
      await this.salesRepository.listAmountsForMonth(business, monthStart),
    );
  }

  async getDailyTotalsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<DailySalesPoint[]> {
    await this.requireAuthenticatedUser();

    return buildDailySalesSeries(
      await this.salesRepository.listDailyAmountsForMonth(business, monthStart),
      monthStart,
      getTodayInTimeZone(business.timeZone),
    );
  }

  async loadCatalogs(): Promise<SalesCatalogs> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.listCatalogs();
  }

  async registerSale(input: NewSaleInput, transactionDate: string): Promise<void> {
    const user = await this.requireAuthenticatedUser();
    const errors = validateNewSale(input);

    if (Object.keys(errors).length > 0) {
      throw new NewSaleValidationError(errors);
    }

    await this.salesRepository.create({
      userId: user.id,
      amount: normalizeSaleAmount(input.amount),
      categoryId: input.categoryId,
      paymentMethodId: input.paymentMethodId,
      detail: normalizeSaleDetail(input.detail),
      transactionDate,
    });
  }

  async getSale(id: string): Promise<SaleDetail | null> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.getById(id);
  }

  async updateSale(id: string, input: NewSaleInput): Promise<void> {
    await this.requireAuthenticatedUser();
    const errors = validateNewSale(input);

    if (Object.keys(errors).length > 0) {
      throw new NewSaleValidationError(errors);
    }

    await this.salesRepository.update(id, {
      amount: normalizeSaleAmount(input.amount),
      categoryId: input.categoryId,
      paymentMethodId: input.paymentMethodId,
      detail: normalizeSaleDetail(input.detail),
    });
  }

  async deleteSale(id: string): Promise<void> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.delete(id);
  }

  private async requireAuthenticatedUser() {
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error("Authenticated user required");
    }

    return user;
  }
}