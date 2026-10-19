export interface TransactionInput {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export type TransactionField = "amount" | "categoryId" | "detail";
export type TransactionFieldError = "required" | "invalid" | "tooLong";
export type TransactionValidationErrors = Partial<
  Record<TransactionField, TransactionFieldError>
>;

export function normalizeDetail(detail: string | null): string | null {
  const trimmed = detail?.trim() ?? "";
  return trimmed ? trimmed : null;
}

/**
 * Validates the input shared by sales and expenses. Returns the invalid fields;
 * an empty object means valid.
 *
 * - `amount`: required, positive, with an optional comma decimal part of 1 or 2 digits (e.g. "150", "150,5").
 * - `categoryId`: required.
 * - `detail`: optional, at most 500 characters.
 */
export function validateTransactionInput(input: TransactionInput): TransactionValidationErrors {
  const errors: TransactionValidationErrors = {};
  const amount = input.amount.trim();

  if (!amount) {
    errors.amount = "required";
  } else if (!/^\d+(?:,\d{1,2})?$/.test(amount) || !/[1-9]/.test(amount)) {
    errors.amount = "invalid";
  }

  if (!input.categoryId.trim()) {
    errors.categoryId = "required";
  }

  if ((input.detail?.length ?? 0) > 500) {
    errors.detail = "tooLong";
  }

  return errors;
}
