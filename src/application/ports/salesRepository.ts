import type { BusinessContext } from "@/domain/business/businessContext";
import type { SaleListItem } from "@/domain/sales/saleListItem";

export interface SalesRepository {
  listForDate(
    business: BusinessContext,
    selectedDate: string,
  ): Promise<SaleListItem[]>;
}