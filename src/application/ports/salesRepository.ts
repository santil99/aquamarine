import type { BusinessContext } from "@/domain/business/businessContext";
import type { CategoryAmount } from "@/domain/business/categoryTotal";
import type { DailySaleAmount } from "@/domain/business/dailySales";
import type { SaleCatalogOption } from "@/domain/sales/saleCatalog";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";
import type { SalesReportRow } from "@/domain/reports/salesReport";

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
  transactionDate: string;
  imagePaths: string[];
}

export interface SaleChanges {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
  imagePaths: string[];
}

export interface SalesRepository {
  listForDate(
    business: BusinessContext,
    selectedDate: string,
  ): Promise<SaleListItem[]>;
  listAmountsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<CategoryAmount[]>;
  listDailyAmountsForMonth(
    business: BusinessContext,
    monthStart: string,
  ): Promise<DailySaleAmount[]>;
  search(
    business: BusinessContext,
    filters: SaleSearchFilters,
  ): Promise<SaleSearchItem[]>;
  listForPeriod(
    business: BusinessContext,
    dateFrom: string,
    dateTo: string,
  ): Promise<SalesReportRow[]>;
  listCatalogs(): Promise<SalesCatalogs>;
  create(record: NewSaleRecord): Promise<void>;
  getById(id: string): Promise<SaleDetail | null>;
  update(id: string, changes: SaleChanges): Promise<void>;
  delete(id: string): Promise<void>;
}