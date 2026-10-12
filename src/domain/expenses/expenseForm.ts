export interface ExpenseCatalogOption {
  id: string;
  name: string;
}

export interface ExpenseInput {
  amount: string;
  categoryId: string;
  paymentMethodId: string | null;
  detail: string | null;
}

export interface ExpenseDetail extends ExpenseInput {
  id: string;
  createdAt: string;
  category: string;
  paymentMethod: string | null;
}

export type ExpenseField = "amount" | "categoryId" | "detail";
export type ExpenseFieldError = "required" | "invalid" | "tooLong";
export type ExpenseValidationErrors = Partial<
  Record<ExpenseField, ExpenseFieldError>
>;

// Amount must be greater than zero with up to two decimals; category is required; detail is capped at 500 characters.
export function validateExpense(input: ExpenseInput): ExpenseValidationErrors {
  const errors: ExpenseValidationErrors = {};
  const amount = input.amount.trim();

  if (!amount) {
    errors.amount = "required";
  } else if (
    !/^\d+(?:\.\d{1,2})?$/.test(amount) ||
    !/[1-9]/.test(amount.replace(".", ""))
  ) {
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
