import { useState, type SyntheticEvent } from "react";
import { Button, Form, ToastProvider, ToastQueue } from "@heroui/react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import type { NewSaleInput } from "@/domain/sales/newSale";
import { SaleFields } from "@/presentation/components/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/forms/saleFormValues";
import { useSaleCatalogs } from "@/presentation/hooks/useSaleCatalogs";
import { useSaleForm } from "@/presentation/hooks/useSaleForm";
import { useTexts } from "@/presentation/texts/useTexts";

const EMPTY_FORM: SaleFormValues = {
  amount: "",
  categoryId: null,
  paymentMethodId: NO_PAYMENT_METHOD,
  detail: "",
};

interface NewSaleViewProps {
  readonly loadCatalogs: () => Promise<SalesCatalogs>;
  readonly registerSale: (input: NewSaleInput) => Promise<void>;
}

export function NewSaleView({ loadCatalogs, registerSale }: NewSaleViewProps) {
  const texts = useTexts().newSale;
  const { state: catalogs, retry } = useSaleCatalogs(loadCatalogs);
  const { values, input, errors, handleChange, validateAll, reset } = useSaleForm(EMPTY_FORM);
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
      await registerSale(input);
      reset();
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
