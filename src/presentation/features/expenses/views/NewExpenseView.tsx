import { useState, type SyntheticEvent } from "react";
import { Button, Form, ToastProvider, ToastQueue } from "@heroui/react";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseCatalogs } from "@/domain/expenses/expenseForm";
import type { TransactionInput } from "@/domain/shared/transactionInput";
import { SaleFields } from "@/presentation/features/shared/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/features/shared/saleFormValues";
import { TransactionDateField } from "@/presentation/features/shared/TransactionDateField";
import { useSaleCatalogs } from "@/presentation/features/shared/useSaleCatalogs";
import { useSaleForm } from "@/presentation/features/shared/useSaleForm";
import { useTexts } from "@/presentation/texts/useTexts";

const EMPTY_FORM: SaleFormValues = {
  amount: "",
  categoryId: null,
  paymentMethodId: NO_PAYMENT_METHOD,
  detail: "",
};

interface NewExpenseViewProps {
  readonly timeZone: string;
  readonly loadCatalogs: () => Promise<ExpenseCatalogs>;
  readonly registerExpense: (input: TransactionInput, transactionDate: string) => Promise<void>;
}

export function NewExpenseView({ timeZone, loadCatalogs, registerExpense }: NewExpenseViewProps) {
  const texts = useTexts().newExpense;
  const { state: catalogs, retry } = useSaleCatalogs(loadCatalogs);
  const { values, input, errors, handleChange, validateAll, reset } = useSaleForm(EMPTY_FORM);
  const [today] = useState(() => getTodayInTimeZone(timeZone));
  const [transactionDate, setTransactionDate] = useState(today);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastQueue] = useState(() => new ToastQueue());

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setSaveError(null);

    if (!validateAll()) return;

    setIsSubmitting(true);

    try {
      await registerExpense(input, transactionDate);
      reset();
      setTransactionDate(today);
      toastQueue.add({ title: texts.saved });
    } catch {
      setSaveError(texts.saveError);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoadingCatalogs = catalogs.status === "loading";
  const categories = catalogs.status === "success" ? catalogs.catalogs.categories : [];
  const paymentMethods = catalogs.status === "success" ? catalogs.catalogs.paymentMethods : [];

  return (
    <section className="flex w-full max-w-md flex-col gap-4">
      <h5 className="text-xl text-center font-bold">{texts.title}</h5>

      {catalogs.status === "error" ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-danger/20 p-3">
          <p role="alert" className="text-sm text-danger">{texts.catalogsError}</p>
          <Button variant="outline" onPress={retry}>
            {texts.retry}
          </Button>
        </div>
      ) : null}

      <Form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
        <TransactionDateField value={transactionDate} today={today} onChange={setTransactionDate} />
        <SaleFields
          texts={texts}
          values={values}
          categories={categories}
          paymentMethods={paymentMethods}
          isLoadingCatalogs={isLoadingCatalogs}
          errors={errors}
          onChange={handleChange}
        />

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
