import type { NewSaleInput } from "@/domain/sales/newSale";

export interface SaleDetail extends NewSaleInput {
  id: string;
  transactionDate: string;
  category: string;
  paymentMethod: string | null;
  imagePaths: string[];
}

export interface SaleImage {
  path: string;
  url: string;
}

/** Sale with short-lived signed URLs for its images; URLs are never persisted. */
export interface SaleWithImages extends SaleDetail {
  images: SaleImage[];
}