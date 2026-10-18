import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "@heroui/react";
import { Eye } from "lucide-react";
import { getMonthStart, getTodayInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import { DateNavigator } from "@/presentation/components/DateNavigator";
import { formatAmount } from "@/presentation/formatters/amount";
import { formatTransactionDayMonth } from "@/presentation/formatters/transactionDate";
import { createMonthMode } from "@/presentation/components/monthMode";
import { useTexts } from "@/presentation/texts/useTexts";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; expenses: ExpenseListItem[] };

interface ExpensesListViewProps {
  readonly listExpenses: (monthStart: string) => Promise<ExpenseListItem[]>;
  readonly timeZone: string;
  readonly onOpenExpense: (expenseId: string) => void;
}

export function ExpensesListView({ listExpenses, timeZone, onOpenExpense }: ExpensesListViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    getMonthStart(getTodayInTimeZone(timeZone)),
  );
  const { common } = useTexts();
  const monthMode = createMonthMode({
    locale: common.locale,
    today: getTodayInTimeZone(timeZone),
    texts: common.monthNavigator,
  });
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    listExpenses(selectedMonth)
      .then((expenses) => {
        if (isCurrent) setState({ status: "success", expenses });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [listExpenses, selectedMonth, attempt]);

  const changeMonth = (monthStart: string) => {
    setSelectedMonth(monthStart);
    setState({ status: "loading" });
  };

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((current) => current + 1);
  };

  return (
    <section className="flex w-full max-w-none flex-col gap-4">
      <DateNavigator mode={monthMode} date={selectedMonth} onDateChange={changeMonth} />
      <ExpensesListContent state={state} onRetry={retry} onOpenExpense={onOpenExpense} />
    </section>
  );
}

function ExpensesListContent({
  state,
  onRetry,
  onOpenExpense,
}: {
  readonly state: LoadState;
  readonly onRetry: () => void;
  readonly onOpenExpense: (expenseId: string) => void;
}) {
  const { common, expensesList: texts } = useTexts();
  const locale = common.locale;

  if (state.status === "loading") {
    return (
      <div className="flex justify-center">
        <Spinner size="sm" aria-label={common.loading} />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-start gap-3">
        <p role="alert">{texts.error}</p>
        <Button variant="outline" onPress={onRetry}>
          {texts.retry}
        </Button>
      </div>
    );
  }

  if (state.expenses.length === 0) {
    return (
      <div className="flex justify-center">
        <p>{texts.empty}</p>
      </div>
    );
  }

  return (
    <Table.Root variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label={texts.title}>
          <Table.Header>
            <Table.Column isRowHeader>{texts.columns.date}</Table.Column>
            <Table.Column>{texts.columns.amount}</Table.Column>
            <Table.Column>{texts.columns.category}</Table.Column>
            <Table.Column>{texts.columns.paymentMethod}</Table.Column>
            <Table.Column>{texts.columns.action}</Table.Column>
          </Table.Header>
          <Table.Body items={state.expenses}>
            {(expense) => (
              <Table.Row id={expense.id}>
                <Table.Cell className="whitespace-nowrap">
                  {formatTransactionDayMonth(expense.transactionDate, locale)}
                </Table.Cell>
                <Table.Cell className="whitespace-nowrap text-right">
                  {formatAmount(expense.amount, locale)}
                </Table.Cell>
                <Table.Cell>{expense.category}</Table.Cell>
                <Table.Cell>{expense.paymentMethod ?? texts.noPaymentMethod}</Table.Cell>
                <Table.Cell>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    aria-label={texts.detail}
                    onPress={() => onOpenExpense(expense.id)}
                  >
                    <Eye size={18} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table.Root>
  );
}
