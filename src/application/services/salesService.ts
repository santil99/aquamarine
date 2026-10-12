import type { AuthRepository } from "@/application/ports/authRepository";
import type { SalesCatalogs, SalesRepository } from "@/application/ports/salesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import {
  normalizeSaleAmount,
  normalizeSaleDetail,
  validateNewSale,
  type NewSaleInput,
  type NewSaleValidationErrors,
} from "@/domain/sales/newSale";
import type { SaleListItem } from "@/domain/sales/saleListItem";

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

  async listToday(business: BusinessContext): Promise<SaleListItem[]> {
    await this.requireAuthenticatedUser();

    const today = getTodayInTimeZone(business.timeZone);
    return this.salesRepository.listForDate(business, today);
  }

  async loadCatalogs(): Promise<SalesCatalogs> {
    await this.requireAuthenticatedUser();

    return this.salesRepository.listCatalogs();
  }

  async registerSale(input: NewSaleInput): Promise<void> {
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
    });
  }

  private async requireAuthenticatedUser() {
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error("Authenticated user required");
    }

    return user;
  }
}