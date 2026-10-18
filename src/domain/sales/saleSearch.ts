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
  transactionDate: string;
  detail: string | null;
}

/** Date range starts on the first day of the month of `today` (YYYY-MM-DD). */
export function getDefaultSaleSearchFilters(today: string): SaleSearchFilters {
  return {
    dateFrom: `${today.slice(0, 8)}01`,
    dateTo: today,
    minAmount: null,
    maxAmount: null,
    detail: null,
    categoryId: null,
    paymentMethodId: null,
  };
}
