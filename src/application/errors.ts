import type { TransactionValidationErrors } from "@/domain/shared/transactionInput";

export class NotFoundError extends Error {}

export class InputValidationError extends Error {
  readonly errors: TransactionValidationErrors;

  constructor(errors: TransactionValidationErrors) {
    super("Invalid input");
    this.errors = errors;
  }
}
