export interface SaleCatalogOption {
  id: string;
  name: string;
}

export interface NewSaleInput {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export type NewSaleField = "amount" | "categoryId" | "detail";
export type NewSaleFieldError = "required" | "invalid" | "tooLong";
export type NewSaleValidationErrors = Partial<
  Record<NewSaleField, NewSaleFieldError>
>;

export function normalizeSaleAmount(amount: string): string {
  return amount.trim().replace(",", ".");
}

export function normalizeSaleDetail(detail: string | null): string | null {
  const trimmed = detail?.trim() ?? "";
  return trimmed ? trimmed : null;
}

/**
 * Validates the input data for creating a new sale record.
 *
 * What it does:
 * - Checks `amount`: Must be present, positive, and formatted with a comma as decimal separator
 *   (for example "150" or "150,5" or "150,50"). If a comma is written, it needs 1 or 2 digits after it.
 * - Checks `categoryId`: Must not be empty.
 * - Checks `detail`: Optional, but cannot exceed 500 characters.
 *
 * Usage / How it exposes to caller:
 * Accept a `NewSaleInput` object and return a `NewSaleValidationErrors` map containing error keys 
 * for any invalid fields. An empty returned object indicates valid input.
 */
export function validateNewSale(input: NewSaleInput): NewSaleValidationErrors {
  const errors: NewSaleValidationErrors = {};
  const amount = input.amount.trim();

  // Validate amount field
  if (!amount) {
    errors.amount = "required";
  } else if (
    !/^\d+(?:,\d{1,2})?$/.test(amount) ||
    !/[1-9]/.test(amount)
  ) {
    errors.amount = "invalid";
  }

  // Validate category selection
  if (!input.categoryId.trim()) {
    errors.categoryId = "required";
  }

  // Validate detail character limit
  if ((input.detail?.length ?? 0) > 500) {
    errors.detail = "tooLong";
  }

  return errors;
}