import { useState } from "react";
import {
  validateTransactionInput,
  type TransactionField,
  type TransactionInput,
  type TransactionValidationErrors,
} from "@/domain/shared/transactionInput";
import { toTransactionInput, type SaleFormValues } from "@/presentation/features/shared/saleFormValues";

type TouchedFields = Partial<Record<TransactionField, boolean>>;

const VALIDATED_FIELDS: readonly TransactionField[] = ["amount", "categoryId", "detail"];

export function useSaleForm(initialValues: SaleFormValues) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<TouchedFields>({});

  const input: TransactionInput = toTransactionInput(values);
  const errors = visibleErrors(validateTransactionInput(input), touched);

  function handleChange<Field extends keyof SaleFormValues>(
    field: Field,
    value: SaleFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    if (isValidatedField(field)) {
      setTouched((current) => ({ ...current, [field]: true }));
    }
  }

  /** Shows every field error and returns whether the form is valid. */
  function validateAll(): boolean {
    setTouched(Object.fromEntries(VALIDATED_FIELDS.map((field) => [field, true])));
    return Object.keys(validateTransactionInput(input)).length === 0;
  }

  function reset() {
    setValues(initialValues);
    setTouched({});
  }

  return { values, input, errors, handleChange, validateAll, reset };
}

function isValidatedField(field: keyof SaleFormValues): field is TransactionField {
  return VALIDATED_FIELDS.some((validated) => validated === field);
}

function visibleErrors(
  errors: TransactionValidationErrors,
  touched: TouchedFields,
): TransactionValidationErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched[field as TransactionField]),
  ) as TransactionValidationErrors;
}
