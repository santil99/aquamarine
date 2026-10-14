import type { NewSaleInput } from "@/domain/sales/newSale";

export const NO_PAYMENT_METHOD = "none";

export interface SaleFormValues {
  amount: string;
  categoryId: string | null;
  paymentMethodId: string;
  detail: string;
}

export function toNewSaleInput(values: SaleFormValues): NewSaleInput {
  return {
    amount: values.amount,
    categoryId: values.categoryId ?? "",
    paymentMethodId: values.paymentMethodId === NO_PAYMENT_METHOD ? null : values.paymentMethodId,
    detail: values.detail || null,
  };
}
