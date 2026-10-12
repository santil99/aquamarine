import type { NewSaleInput } from "@/domain/sales/newSale";

export interface SaleDetail extends NewSaleInput {
  id: string;
  createdAt: string;
  category: string;
  paymentMethod: string | null;
}