import {
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextArea,
  TextField,
} from "@heroui/react";
import type {
  NewSaleField,
  NewSaleFieldError,
  NewSaleValidationErrors,
  SaleCatalogOption,
} from "@/domain/sales/newSale";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/features/shared/saleFormValues";
import type { Texts } from "@/presentation/texts/types";

interface SaleFieldsProps {
  readonly texts: Texts["newSale"];
  readonly values: SaleFormValues;
  readonly categories: SaleCatalogOption[];
  readonly paymentMethods: SaleCatalogOption[];
  readonly isLoadingCatalogs: boolean;
  /** Only the errors that should be shown; the parent decides visibility. */
  readonly errors: NewSaleValidationErrors;
  readonly onChange: <Field extends keyof SaleFormValues>(
    field: Field,
    value: SaleFormValues[Field],
  ) => void;
}

export function SaleFields({
  texts,
  values,
  categories,
  paymentMethods,
  isLoadingCatalogs,
  errors,
  onChange,
}: SaleFieldsProps) {
  const errorMessages: Record<NewSaleField, Partial<Record<NewSaleFieldError, string>>> = {
    amount: { required: texts.amountRequired, invalid: texts.amountInvalid },
    categoryId: { required: texts.categoryRequired },
    detail: { tooLong: texts.detailTooLong },
  };
  const fieldMessage = (field: NewSaleField): string | undefined => {
    const code = errors[field];
    return code ? errorMessages[field][code] : undefined;
  };

  return (
    <>
      <TextField
        name="amount"
        isInvalid={Boolean(errors.amount)}
        value={values.amount}
        onChange={(value) => onChange("amount", value)}
        className="w-full"
      >
        <Label>{texts.amountLabel}</Label>
        <Input inputMode="decimal" />
        {errors.amount ? <FieldError>{fieldMessage("amount")}</FieldError> : null}
      </TextField>

      <Select
        name="categoryId"
        placeholder={texts.categoryPlaceholder}
        value={values.categoryId}
        onChange={(key) => onChange("categoryId", key ? String(key) : null)}
        isDisabled={isLoadingCatalogs}
        isInvalid={Boolean(errors.categoryId)}
        className="w-full"
      >
        <Label>{texts.categoryLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator>
            {isLoadingCatalogs ? <Spinner size="sm" /> : <Select.Indicator />}
          </Select.Indicator>
        </Select.Trigger>
        <Select.Popover>
          <ListBox items={categories}>
            {(category) => (
              <ListBox.Item id={String(category.id)} textValue={category.name}>
                {category.name}
              </ListBox.Item>
            )}
          </ListBox>
        </Select.Popover>
      </Select>
      {errors.categoryId ? (
        <p role="alert" className="-mt-2 text-sm text-danger">
          {fieldMessage("categoryId")}
        </p>
      ) : null}

      <Select
        name="paymentMethodId"
        placeholder={texts.paymentMethodPlaceholder}
        value={values.paymentMethodId}
        onChange={(key) => onChange("paymentMethodId", key ? String(key) : NO_PAYMENT_METHOD)}
        isDisabled={isLoadingCatalogs}
        className="w-full"
      >
        <Label>{texts.paymentMethodLabel}</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator>
            {isLoadingCatalogs ? <Spinner size="sm" /> : <Select.Indicator />}
          </Select.Indicator>
        </Select.Trigger>
        <Select.Popover>
          <ListBox
            items={[
              { id: NO_PAYMENT_METHOD, name: texts.noPaymentMethod },
              ...paymentMethods,
            ]}
          >
            {(method) => (
              <ListBox.Item id={String(method.id)} textValue={method.name}>
                {method.name}
              </ListBox.Item>
            )}
          </ListBox>
        </Select.Popover>
      </Select>

      <TextField
        name="detail"
        isInvalid={Boolean(errors.detail)}
        value={values.detail}
        onChange={(value) => onChange("detail", value)}
        className="w-full"
      >
        <Label>{texts.detailLabel}</Label>
        <TextArea rows={3} />
        {errors.detail ? <FieldError>{fieldMessage("detail")}</FieldError> : null}
      </TextField>
    </>
  );
}

