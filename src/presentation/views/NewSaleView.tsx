import { useEffect, useState, type SyntheticEvent } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Spinner,
  TextArea,
  TextField,
  ToastProvider,
  ToastQueue,
} from "@heroui/react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import {
  validateNewSale,
  type NewSaleField,
  type NewSaleFieldError,
  type NewSaleInput,
  type NewSaleValidationErrors,
} from "@/domain/sales/newSale";
import { useTexts } from "@/presentation/texts/useTexts";

const NO_PAYMENT_METHOD = "none";

type CatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; catalogs: SalesCatalogs };

type TouchedFields = Partial<Record<NewSaleField, boolean>>;

interface NewSaleViewProps {
  readonly loadCatalogs: () => Promise<SalesCatalogs>;
  readonly registerSale: (input: NewSaleInput) => Promise<void>;
}

export function NewSaleView({ loadCatalogs, registerSale }: NewSaleViewProps) {
  const texts = useTexts().newSale;
  const errorMessages: Record<NewSaleField, Partial<Record<NewSaleFieldError, string>>> = {
    amount: { required: texts.amountRequired, invalid: texts.amountInvalid },
    categoryId: { required: texts.categoryRequired },
    detail: { tooLong: texts.detailTooLong },
  };
  const [catalogs, setCatalogs] = useState<CatalogState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState(NO_PAYMENT_METHOD);
  const [detail, setDetail] = useState("");
  const [touched, setTouched] = useState<TouchedFields>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastQueue] = useState(() => new ToastQueue());

  const input: NewSaleInput = {
    amount,
    categoryId: categoryId ?? "",
    paymentMethodId: paymentMethodId === NO_PAYMENT_METHOD ? null : paymentMethodId,
    detail: detail || null,
  };
  const fieldErrors = visibleErrors(validateNewSale(input), touched);

  useEffect(() => {
    let isCurrent = true;

    loadCatalogs()
      .then((loaded) => {
        if (isCurrent) setCatalogs({ status: "success", catalogs: loaded });
      })
      .catch(() => {
        if (isCurrent) setCatalogs({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadCatalogs, attempt]);

  function touch(field: NewSaleField) {
    setTouched((current) => ({ ...current, [field]: true }));
  }

  function resetForm() {
    setAmount("");
    setCategoryId(null);
    setPaymentMethodId(NO_PAYMENT_METHOD);
    setDetail("");
    setTouched({});
  }

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setTouched({ amount: true, categoryId: true, detail: true });
    setSaveError(null);

    if (Object.keys(validateNewSale(input)).length > 0) return;

    setIsSubmitting(true);

    try {
      await registerSale(input);
      resetForm();
      toastQueue.add({ title: texts.saved });
    } catch {
      setSaveError(texts.saveError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const fieldMessage = (field: NewSaleField): string | undefined => {
    const code = fieldErrors[field];
    return code ? errorMessages[field][code] : undefined;
  };

  const isLoadingCatalogs = catalogs.status === "loading";
  const categories = catalogs.status === "success" ? catalogs.catalogs.categories : [];
  const paymentMethods = catalogs.status === "success" ? catalogs.catalogs.paymentMethods : [];

  return (
    <section className="flex w-full max-w-md flex-col gap-4">
      <h2 className="text-xl font-bold">{texts.title}</h2>

      {catalogs.status === "error" ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-danger/20 p-3">
          <p role="alert" className="text-sm text-danger">{texts.catalogsError}</p>
          <Button
            variant="outline"
            onPress={() => {
              setCatalogs({ status: "loading" });
              setAttempt((current) => current + 1);
            }}
          >
            {texts.retry}
          </Button>
        </div>
      ) : null}

      <Form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <TextField
          name="amount"
          isInvalid={Boolean(fieldErrors.amount)}
          value={amount}
          onChange={(value) => {
            setAmount(value);
            touch("amount");
          }}
          className="w-full"
        >
          <Label>{texts.amountLabel}</Label>
          <Input inputMode="decimal" />
          {fieldErrors.amount ? <FieldError>{fieldMessage("amount")}</FieldError> : null}
        </TextField>

        <Select
          name="categoryId"
          placeholder={texts.categoryPlaceholder}
          value={categoryId}
          onChange={(key) => {
            setCategoryId(key ? String(key) : null);
            touch("categoryId");
          }}
          isDisabled={isLoadingCatalogs}
          isInvalid={Boolean(fieldErrors.categoryId)}
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
        {fieldErrors.categoryId ? (
          <p role="alert" className="-mt-2 text-sm text-danger">
            {fieldMessage("categoryId")}
          </p>
        ) : null}

        <Select
          name="paymentMethodId"
          placeholder={texts.paymentMethodPlaceholder}
          value={paymentMethodId}
          onChange={(key) => {
            setPaymentMethodId(key ? String(key) : NO_PAYMENT_METHOD);
          }}
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
          isInvalid={Boolean(fieldErrors.detail)}
          value={detail}
          onChange={(value) => {
            setDetail(value);
            touch("detail");
          }}
          className="w-full"
        >
          <Label>{texts.detailLabel}</Label>
          <TextArea rows={3} />
          {fieldErrors.detail ? <FieldError>{fieldMessage("detail")}</FieldError> : null}
        </TextField>

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}

        <Button type="submit" isDisabled={isSubmitting || isLoadingCatalogs} className="w-full">
          {isSubmitting ? texts.submitting : texts.submit}
        </Button>
      </Form>

      <ToastProvider queue={toastQueue} placement="bottom" />
    </section>
  );
}

function visibleErrors(errors: NewSaleValidationErrors, touched: TouchedFields): NewSaleValidationErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => touched[field as NewSaleField]),
  ) as NewSaleValidationErrors;
}