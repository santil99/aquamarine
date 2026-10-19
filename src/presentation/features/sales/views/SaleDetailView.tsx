import { useState, type SyntheticEvent } from "react";
import {
  AlertDialog,
  Button,
  Form,
} from "@heroui/react";
import { CalendarDays } from "lucide-react";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import type { TransactionInput } from "@/domain/shared/transactionInput";
import type { SaleDetail, SaleWithImages } from "@/domain/sales/saleDetail";
import { DetailStatus } from "@/presentation/features/shared/DetailStatus";
import { SaleFields } from "@/presentation/features/shared/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/features/shared/saleFormValues";
import { formatTransactionDate } from "@/presentation/formatters/transactionDate";
import { useDetailLoader } from "@/presentation/features/shared/useDetailLoader";
import { useSaleCatalogs } from "@/presentation/features/shared/useSaleCatalogs";
import { useSaleForm } from "@/presentation/features/shared/useSaleForm";
import { SaleImagesField } from "@/presentation/features/sales/SaleImagesField";
import { useSaleImages } from "@/presentation/features/sales/useSaleImages";
import type { SaleFeedback } from "@/presentation/features/sales/navigation/salesNavigation";
import { useTexts } from "@/presentation/texts/useTexts";

interface SaleDetailViewProps {
  readonly saleId: string;
  readonly loadSale: (id: string) => Promise<SaleWithImages | null>;
  readonly loadCatalogs: () => Promise<SalesCatalogs>;
  readonly updateSale: (
    id: string,
    input: TransactionInput,
    keptPaths: string[],
    newImages: Blob[],
  ) => Promise<void>;
  readonly deleteSale: (id: string) => Promise<void>;
  readonly onExit: (feedback?: SaleFeedback) => void;
}

export function SaleDetailView({
  saleId,
  loadSale,
  loadCatalogs,
  updateSale,
  deleteSale,
  onExit,
}: SaleDetailViewProps) {
  const { saleDetail: texts, newSale } = useTexts();
  const { state: sale, retry: retrySale } = useDetailLoader(saleId, loadSale);
  const { state: catalogs, retry: retryCatalogs } = useSaleCatalogs(loadCatalogs);

  if (sale.status === "loading" || catalogs.status === "loading") {
    return <DetailStatus kind="loading" />;
  }

  if (sale.status === "notFound") {
    return <DetailStatus kind="notFound" message={texts.notFound} />;
  }

  if (sale.status === "error") {
    return (
      <DetailStatus
        kind="error"
        message={texts.loadError}
        retryLabel={texts.retry}
        onRetry={retrySale}
      />
    );
  }

  if (catalogs.status === "error") {
    return (
      <DetailStatus
        kind="error"
        message={newSale.catalogsError}
        retryLabel={newSale.retry}
        onRetry={retryCatalogs}
      />
    );
  }

  return (
    <SaleDetailForm
      sale={sale.data}
      categories={catalogs.catalogs.categories}
      paymentMethods={catalogs.catalogs.paymentMethods}
      updateSale={updateSale}
      deleteSale={deleteSale}
      onExit={onExit}
    />
  );
}

interface SaleDetailFormProps {
  readonly sale: SaleWithImages;
  readonly categories: SalesCatalogs["categories"];
  readonly paymentMethods: SalesCatalogs["paymentMethods"];
  readonly updateSale: SaleDetailViewProps["updateSale"];
  readonly deleteSale: (id: string) => Promise<void>;
  readonly onExit: (feedback?: SaleFeedback) => void;
}

function SaleDetailForm({
  sale,
  categories,
  paymentMethods,
  updateSale,
  deleteSale,
  onExit,
}: SaleDetailFormProps) {
  const { common, saleDetail: texts, newSale } = useTexts();
  const { values, input, errors, handleChange, validateAll } = useSaleForm(toFormValues(sale));
  const images = useSaleImages(sale.images);
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
      await updateSale(sale.id, input, images.keptPaths, images.newFiles);
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
        <span className="font-medium">{texts.dateLabel}:</span>
        <span>{formatTransactionDate(sale.transactionDate, common.locale)}</span>
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
        <SaleImagesField images={images} />

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
