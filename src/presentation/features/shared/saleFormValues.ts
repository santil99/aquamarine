import type { TransactionInput } from "@/domain/shared/transactionInput";

export const NO_PAYMENT_METHOD = "none";

export interface SaleFormValues {
  amount: string;
  categoryId: string | null;
  paymentMethodId: string;
  detail: string;
}

export function toTransactionInput(values: SaleFormValues): TransactionInput {
  return {
    amount: values.amount,
    categoryId: values.categoryId ?? "",
    paymentMethodId: values.paymentMethodId === NO_PAYMENT_METHOD ? null : values.paymentMethodId,
    detail: values.detail || null,
  };
}
