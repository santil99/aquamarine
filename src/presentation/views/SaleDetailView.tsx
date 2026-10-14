import { useEffect, useState, type SyntheticEvent } from "react";
import {
  AlertDialog,
  Button,
  Form,
  Spinner,
} from "@heroui/react";
import { CalendarDays } from "lucide-react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import type { NewSaleInput } from "@/domain/sales/newSale";
import type { SaleDetail } from "@/domain/sales/saleDetail";
import { SaleFields } from "@/presentation/components/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/forms/saleFormValues";
import { formatSaleDateTime } from "@/presentation/formatters/saleDateTime";
import { useSaleCatalogs } from "@/presentation/hooks/useSaleCatalogs";
import { useSaleForm } from "@/presentation/hooks/useSaleForm";
import type { SaleFeedback } from "@/presentation/navigation/salesNavigation";
import { useTexts } from "@/presentation/texts/useTexts";

type SaleState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "notFound" }
  | { status: "success"; sale: SaleDetail };

interface SaleDetailViewProps {
  readonly saleId: string;
  readonly timeZone: string;
  readonly loadSale: (id: string) => Promise<SaleDetail | null>;
  readonly loadCatalogs: () => Promise<SalesCatalogs>;
  readonly updateSale: (id: string, input: NewSaleInput) => Promise<void>;
  readonly deleteSale: (id: string) => Promise<void>;
  readonly onExit: (feedback?: SaleFeedback) => void;
}

export function SaleDetailView({
  saleId,
  timeZone,
  loadSale,
  loadCatalogs,
  updateSale,
  deleteSale,
  onExit,
}: SaleDetailViewProps) {
  const { common, saleDetail: texts, newSale } = useTexts();
  const [sale, setSale] = useState<SaleState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { state: catalogs, retry: retryCatalogs } = useSaleCatalogs(loadCatalogs);

  useEffect(() => {
    let isCurrent = true;

    loadSale(saleId)
      .then((loaded) => {
        if (!isCurrent) return;
        setSale(loaded ? { status: "success", sale: loaded } : { status: "notFound" });
      })
      .catch(() => {
        if (isCurrent) setSale({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadSale, saleId, attempt]);

  if (sale.status === "loading" || catalogs.status === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (sale.status === "notFound") {
    return <p role="alert">{texts.notFound}</p>;
  }

  if (sale.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-danger">{texts.loadError}</p>
        <Button variant="outline" onPress={() => setAttempt((current) => current + 1)}>
          {texts.retry}
        </Button>
      </div>
    );
  }

  if (catalogs.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert" className="text-danger">{newSale.catalogsError}</p>
        <Button variant="outline" onPress={retryCatalogs}>
          {newSale.retry}
        </Button>
      </div>
    );
  }

  return (
    <SaleDetailForm
      sale={sale.sale}
      timeZone={timeZone}
      categories={catalogs.catalogs.categories}
      paymentMethods={catalogs.catalogs.paymentMethods}
      updateSale={updateSale}
      deleteSale={deleteSale}
      onExit={onExit}
    />
  );
}

interface SaleDetailFormProps {
  readonly sale: SaleDetail;
  readonly timeZone: string;
  readonly categories: SalesCatalogs["categories"];
  readonly paymentMethods: SalesCatalogs["paymentMethods"];
  readonly updateSale: (id: string, input: NewSaleInput) => Promise<void>;
  readonly deleteSale: (id: string) => Promise<void>;
  readonly onExit: (feedback?: SaleFeedback) => void;
}

function SaleDetailForm({
  sale,
  timeZone,
  categories,
  paymentMethods,
  updateSale,
  deleteSale,
  onExit,
}: SaleDetailFormProps) {
  const { common, saleDetail: texts, newSale } = useTexts();
  const { values, input, errors, handleChange, validateAll } = useSaleForm(toFormValues(sale));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isBusy = isSaving || isDeleting;

  async function handleSave(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) return;

    setSaveError(null);

    if (!validateAll()) return;

    setIsSaving(true);

    try {
      await updateSale(sale.id, input);
      onExit("saved");
    } catch {
      setSaveError(texts.saveError);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteSale(sale.id);
      onExit("deleted");
    } catch {
      setDeleteError(texts.deleteError);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-4">
      <h2 className="text-xl font-bold">{texts.title}</h2>

      <p className="flex items-center gap-2 text-sm">
        <CalendarDays size={18} aria-hidden="true" />
        <span className="font-medium">{texts.dateTimeLabel}:</span>
        <span>{formatSaleDateTime(sale.createdAt, common.locale, timeZone)}</span>
      </p>

      <Form onSubmit={handleSave} className="flex w-full flex-col gap-4">
        <SaleFields
          texts={newSale}
          values={values}
          categories={categories}
          paymentMethods={paymentMethods}
          isLoadingCatalogs={false}
          errors={errors}
          onChange={handleChange}
        />

        {saveError ? (
          <p role="alert" className="text-sm text-danger">
            {saveError}
          </p>
        ) : null}

        <Button type="submit" isDisabled={isBusy} className="w-full">
          {isSaving ? texts.saving : texts.save}
        </Button>
        <Button type="button" variant="outline" isDisabled={isBusy} className="w-full" onPress={() => onExit()}>
          {texts.cancel}
        </Button>
      </Form>

      <AlertDialog>
        <Button variant="danger-soft" isDisabled={isBusy} className="w-full">
          {texts.delete}
        </Button>
        <AlertDialog.Backdrop>
          <AlertDialog.Container>
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>{texts.deleteConfirmTitle}</AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body>
                <p>{texts.deleteConfirmDescription}</p>
              </AlertDialog.Body>
              <AlertDialog.Footer>
                <Button slot="close" variant="outline">
                  {texts.cancel}
                </Button>
                <Button slot="close" variant="danger" onPress={handleDelete} isDisabled={isDeleting}>
                  {isDeleting ? texts.deleting : texts.deleteConfirm}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>

      {deleteError ? (
        <p role="alert" className="text-sm text-danger">
          {deleteError}
        </p>
      ) : null}
    </section>
  );
}

function toFormValues(sale: SaleDetail): SaleFormValues {
  return {
    amount: sale.amount.replace(".", ","),
    categoryId: sale.categoryId,
    paymentMethodId: sale.paymentMethodId ?? NO_PAYMENT_METHOD,
    detail: sale.detail ?? "",
  };
}
