import type { AuthRepository } from "@/application/ports/authRepository";
import type { SalesRepository } from "@/application/ports/salesRepository";
import type { BusinessContext } from "@/domain/business/businessContext";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { SaleListItem } from "@/domain/sales/saleListItem";

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

  private async requireAuthenticatedUser() {
    const user = await this.authRepository.getCurrentUser();

    if (!user) {
      throw new Error("Authenticated user required");
    }

    return user;
  }
}