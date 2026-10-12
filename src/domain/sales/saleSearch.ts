import type { SaleListItem } from "@/domain/sales/saleListItem";

export interface SaleSearchFilters {
  dateFrom: string;
  dateTo: string;
  minAmount: string | null;
  maxAmount: string | null;
  detail: string | null;
  categoryId: string | null;
  paymentMethodId: string | null;
}

export interface SaleSearchItem extends SaleListItem {
  createdAt: string;
  detail: string | null;
}
