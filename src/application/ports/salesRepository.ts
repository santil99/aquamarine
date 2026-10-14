import type { BusinessContext } from "@/domain/business/businessContext";
import type { SaleCatalogOption } from "@/domain/sales/newSale";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import type { SaleListItem } from "@/domain/sales/saleListItem";

export interface SalesCatalogs {
  categories: SaleCatalogOption[];
  paymentMethods: SaleCatalogOption[];
}

export interface NewSaleRecord {
  userId: string;
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export interface SaleChanges {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export interface SalesRepository {
  listForDate(
    business: BusinessContext,
    selectedDate: string,
  ): Promise<SaleListItem[]>;
  listCatalogs(): Promise<SalesCatalogs>;
  create(record: NewSaleRecord): Promise<void>;
  getById(id: string): Promise<SaleDetail | null>;
  update(id: string, changes: SaleChanges): Promise<void>;
  delete(id: string): Promise<void>;
}