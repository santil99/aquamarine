import { useState } from "react";
import {
  validateNewSale,
  type NewSaleField,
  type NewSaleInput,
  type NewSaleValidationErrors,
} from "@/domain/sales/newSale";
import { toNewSaleInput, type SaleFormValues } from "@/presentation/forms/saleFormValues";

type TouchedFields = Partial<Record<NewSaleField, boolean>>;

export function useSaleForm(initialValues: SaleFormValues) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState<TouchedFields>({});

  const input: NewSaleInput = toNewSaleInput(values);
  const errors = visibleErrors(validateNewSale(input), touched);

  function handleChange<Field extends keyof SaleFormValues>(
    field: Field,
    value: SaleFormValues[Field],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    if (isNewSaleField(field)) {
      setTouched((current) => ({ ...current, [field]: true }));
    }
  }

  /** Shows every field error and returns whether the form is valid. */
  function validateAll(): boolean {
    setTouched({ amount: true, categoryId: true, detail: true });
    return Object.keys(validateNewSale(input)).length === 0;
  }

  function reset() {
    setValues(initialValues);
    setTouched({});
  }

  return { values, input, errors, handleChange, validateAll, reset };
}

function isNewSaleField(field: keyof SaleFormValues): field is NewSaleField {
  return field === "amount" || field === "categoryId" || field === "detail";
}

function visibleErrors(
  errors: NewSaleValidationErrors,
  touched: TouchedFields,
): NewSaleValidationErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched[field as NewSaleField]),
  ) as NewSaleValidationErrors;
}
