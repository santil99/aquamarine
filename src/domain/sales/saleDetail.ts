import type { NewSaleInput } from "@/domain/sales/newSale";

export interface SaleDetail extends NewSaleInput {
  id: string;
  transactionDate: string;
  category: string;
  paymentMethod: string | null;
}