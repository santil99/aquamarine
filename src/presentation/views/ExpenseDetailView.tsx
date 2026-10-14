import { useEffect, useState, type SyntheticEvent } from "react";
import { AlertDialog, Button, Form, Spinner } from "@heroui/react";
import { CalendarDays } from "lucide-react";
import type { ExpenseCatalogs, ExpenseDetail } from "@/domain/expenses/expenseForm";
import type { NewSaleInput } from "@/domain/sales/newSale";
import { SaleFields } from "@/presentation/components/SaleFields";
import { NO_PAYMENT_METHOD, type SaleFormValues } from "@/presentation/forms/saleFormValues";
import { formatSaleDateTime } from "@/presentation/formatters/saleDateTime";
import { useSaleCatalogs } from "@/presentation/hooks/useSaleCatalogs";
import { useSaleForm } from "@/presentation/hooks/useSaleForm";
import { useTexts } from "@/presentation/texts/useTexts";

type ExpenseState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "notFound" }
  | { status: "success"; expense: ExpenseDetail };

interface ExpenseDetailViewProps {
  readonly expenseId: string;
  readonly timeZone: string;
  readonly loadExpense: (id: string) => Promise<ExpenseDetail | null>;
  readonly loadCatalogs: () => Promise<ExpenseCatalogs>;
  readonly updateExpense: (id: string, input: NewSaleInput) => Promise<void>;
  readonly deleteExpense: (id: string) => Promise<void>;
  readonly onExit: () => void;
}

export function ExpenseDetailView({
  expenseId,
  timeZone,
  loadExpense,
  loadCatalogs,
  updateExpense,
  deleteExpense,
  onExit,
}: ExpenseDetailViewProps) {
  const { common, expenseDetail: texts, newExpense } = useTexts();
  const [expense, setExpense] = useState<ExpenseState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const { state: catalogs, retry: retryCatalogs } = useSaleCatalogs(loadCatalogs);

  useEffect(() => {
    let isCurrent = true;

    loadExpense(expenseId)
      .then((loaded) => {
        if (!isCurrent) return;
        setExpense(loaded ? { status: "success", expense: loaded } : { status: "notFound" });
      })
      .catch(() => {
        if (isCurrent) setExpense({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadExpense, expenseId, attempt]);

  if (expense.status === "loading" || catalogs.status === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (expense.status === "notFound") {
    return <p role="alert">{texts.notFound}</p>;
  }

  if (expense.status === "error") {
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
        <p role="alert" className="text-danger">{newExpense.catalogsError}</p>
        <Button variant="outline" onPress={retryCatalogs}>
          {newExpense.retry}
        </Button>
      </div>
    );
  }

  return (
    <ExpenseDetailForm
      expense={expense.expense}
      timeZone={timeZone}
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
  readonly timeZone: string;
  readonly categories: ExpenseCatalogs["categories"];
  readonly paymentMethods: ExpenseCatalogs["paymentMethods"];
  readonly updateExpense: (id: string, input: NewSaleInput) => Promise<void>;
  readonly deleteExpense: (id: string) => Promise<void>;
  readonly onExit: () => void;
}

function ExpenseDetailForm({
  expense,
  timeZone,
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
      <h2 className="text-xl font-bold">{texts.title}</h2>

      <p className="flex items-center gap-2 text-sm">
        <CalendarDays size={18} aria-hidden="true" />
        <span className="font-medium">{texts.dateTimeLabel}:</span>
        <span>{formatSaleDateTime(expense.createdAt, common.locale, timeZone)}</span>
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
