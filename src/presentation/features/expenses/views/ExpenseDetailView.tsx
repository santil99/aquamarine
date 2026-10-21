import { useState, type SyntheticEvent } from "react";
import { AlertDialog, Button, Form } from "@heroui/react";
import { CalendarDays } from "lucide-react";
import type { ExpenseCatalogs, ExpenseDetail } from "@/domain/expenses/expenseForm";
import type { TransactionInput } from "@/domain/shared/transactionInput";
import { DetailStatus } from "@/presentation/features/shared/DetailStatus";
import { SaleFields } from "@/presentation/features/shared/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/features/shared/saleFormValues";
import { formatTransactionDate } from "@/presentation/formatters/transactionDate";
import { useDetailLoader } from "@/presentation/features/shared/useDetailLoader";
import { useSaleCatalogs } from "@/presentation/features/shared/useSaleCatalogs";
import { useSaleForm } from "@/presentation/features/shared/useSaleForm";
import { useTexts } from "@/presentation/texts/useTexts";

interface ExpenseDetailViewProps {
  readonly expenseId: string;
  readonly loadExpense: (id: string) => Promise<ExpenseDetail | null>;
  readonly loadCatalogs: () => Promise<ExpenseCatalogs>;
  readonly updateExpense: (id: string, input: TransactionInput) => Promise<void>;
  readonly deleteExpense: (id: string) => Promise<void>;
  readonly onExit: () => void;
}

export function ExpenseDetailView({
  expenseId,
  loadExpense,
  loadCatalogs,
  updateExpense,
  deleteExpense,
  onExit,
}: ExpenseDetailViewProps) {
  const { expenseDetail: texts, newExpense } = useTexts();
  const { state: expense, retry: retryExpense } = useDetailLoader(expenseId, loadExpense);
  const { state: catalogs, retry: retryCatalogs } = useSaleCatalogs(loadCatalogs);

  if (expense.status === "loading" || catalogs.status === "loading") {
    return <DetailStatus kind="loading" />;
  }

  if (expense.status === "notFound") {
    return <DetailStatus kind="notFound" message={texts.notFound} />;
  }

  if (expense.status === "error") {
    return (
      <DetailStatus
        kind="error"
        message={texts.loadError}
        retryLabel={texts.retry}
        onRetry={retryExpense}
      />
    );
  }

  if (catalogs.status === "error") {
    return (
      <DetailStatus
        kind="error"
        message={newExpense.catalogsError}
        retryLabel={newExpense.retry}
        onRetry={retryCatalogs}
      />
    );
  }

  return (
    <ExpenseDetailForm
      expense={expense.data}
      categories={catalogs.catalogs.categories}
      paymentMethods={catalogs.catalogs.paymentMethods}
      updateExpense={updateExpense}
      deleteExpense={deleteExpense}
      onExit={onExit}
    />
  );
}

interface ExpenseDetailFormProps {
  readonly expense: ExpenseDetail;
  readonly categories: ExpenseCatalogs["categories"];
  readonly paymentMethods: ExpenseCatalogs["paymentMethods"];
  readonly updateExpense: (id: string, input: TransactionInput) => Promise<void>;
  readonly deleteExpense: (id: string) => Promise<void>;
  readonly onExit: () => void;
}

function ExpenseDetailForm({
  expense,
  categories,
  paymentMethods,
  updateExpense,
  deleteExpense,
  onExit,
}: ExpenseDetailFormProps) {
  const { common, expenseDetail: texts, newExpense } = useTexts();
  const { values, input, errors, handleChange, validateAll } = useSaleForm(toFormValues(expense));
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
      await updateExpense(expense.id, input);
      onExit();
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
      await deleteExpense(expense.id);
      onExit();
    } catch {
      setDeleteError(texts.deleteError);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="flex w-full max-w-md flex-col gap-4">
      <p className="flex items-center gap-2 text-sm">
        <CalendarDays size={18} aria-hidden="true" />
        <span className="font-medium">{texts.dateLabel}:</span>
        <span>{formatTransactionDate(expense.transactionDate, common.locale)}</span>
      </p>

      <Form onSubmit={handleSave} className="flex w-full flex-col gap-4">
        <SaleFields
          texts={newExpense}
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
        <Button type="button" variant="outline" isDisabled={isBusy} className="w-full" onPress={onExit}>
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

function toFormValues(expense: ExpenseDetail): SaleFormValues {
  return {
    amount: expense.amount.replace(".", ","),
    categoryId: expense.categoryId,
    paymentMethodId: expense.paymentMethodId ?? NO_PAYMENT_METHOD,
    detail: expense.detail ?? "",
  };
}
