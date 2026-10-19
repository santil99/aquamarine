import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "@heroui/react";
import { getMonthStart, getTodayInTimeZone } from "@/domain/business/businessDay";
import type { CategoryTotal } from "@/domain/business/categoryTotal";
import type { DailySalesPoint } from "@/domain/business/dailySales";
import { summarizeMonth } from "@/domain/business/monthSummary";
import { averageAmounts } from "@/domain/shared/amount";
import { DateNavigator } from "@/presentation/components/DateNavigator";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { createMonthMode } from "@/presentation/components/monthMode";
import { DailySalesChart } from "@/presentation/features/dashboard/components/DailySalesChart";
import { useTexts } from "@/presentation/texts/useTexts";

interface MonthData {
  readonly sales: CategoryTotal[];
  readonly expenses: CategoryTotal[];
  readonly dailySales: DailySalesPoint[];
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; data: MonthData };

interface SummaryViewProps {
  readonly loadSales: (monthStart: string) => Promise<CategoryTotal[]>;
  readonly loadExpenses: (monthStart: string) => Promise<CategoryTotal[]>;
  readonly loadDailySales: (monthStart: string) => Promise<DailySalesPoint[]>;
  readonly timeZone: string;
}

export function SummaryView({ loadSales, loadExpenses, loadDailySales, timeZone }: SummaryViewProps) {
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

    Promise.all([loadSales(selectedMonth), loadExpenses(selectedMonth), loadDailySales(selectedMonth)])
      .then(([sales, expenses, dailySales]) => {
        if (isCurrent) setState({ status: "success", data: { sales, expenses, dailySales } });
      })
      .catch(() => {
        if (isCurrent) setState({ status: "error" });
      });

    return () => {
      isCurrent = false;
    };
  }, [loadSales, loadExpenses, loadDailySales, selectedMonth, attempt]);

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
      <SummaryContent state={state} onRetry={retry} />
    </section>
  );
}

function SummaryContent({ state, onRetry }: { readonly state: LoadState; readonly onRetry: () => void }) {
  const { common, summary: texts } = useTexts();

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

  const monthSummary = summarizeMonth(state.data.sales, state.data.expenses);
  const isNegativeBalance = monthSummary.balance.startsWith("-");
  const averageDailySale = averageAmounts(state.data.dailySales.map((point) => point.total));

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-sm text-default-500">{texts.dailySales}</p>
        <DailySalesChart points={state.data.dailySales} locale={common.locale} />
      </Card>

      <Card className="flex flex-col gap-1 p-5">
        <p className="text-sm text-default-500">{texts.netBalance}</p>
        <p
          className={`text-4xl font-bold tabular-nums ${isNegativeBalance ? "text-danger" : "text-success"}`}
        >
          {formatArsAmount(monthSummary.balance, common.locale)}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1 p-4">
          <p className="text-sm text-default-500">{texts.collected}</p>
          <p className="text-lg font-semibold tabular-nums text-success">
            {formatArsAmount(monthSummary.salesTotal, common.locale)}
          </p>
          <p className="text-sm text-default-500">{texts.saleCount(monthSummary.salesCount)}</p>
        </Card>
        <Card className="flex flex-col gap-1 p-4">
          <p className="text-sm text-default-500">{texts.expenses}</p>
          <p className="text-lg font-semibold tabular-nums text-danger">
            {formatArsAmount(monthSummary.expensesTotal, common.locale)}
          </p>
          <p className="text-sm text-default-500">{texts.expenseCount(monthSummary.expensesCount)}</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-1 p-4">
        <p className="text-sm text-default-500">{texts.averageTicket}</p>
        <p className="text-lg font-semibold tabular-nums">
          {formatArsAmount(averageDailySale, common.locale)}
        </p>
      </Card>

      <CategorySection
        title={texts.salesByCategory}
        emptyText={texts.emptySales}
        categories={state.data.sales}
      />
      <CategorySection
        title={texts.expensesByCategory}
        emptyText={texts.emptyExpenses}
        categories={state.data.expenses}
      />
    </div>
  );
}

function CategorySection({
  title,
  emptyText,
  categories,
}: {
  readonly title: string;
  readonly emptyText: string;
  readonly categories: CategoryTotal[];
}) {
  const { common, summary: texts } = useTexts();

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold">{title}</h2>
      <Card className="p-4">
        {categories.length === 0 ? (
          <p className="text-default-500">{emptyText}</p>
        ) : (
          <ul>
            {categories.map((category) => (
              <li
                key={category.category}
                className="flex items-center justify-between gap-3 border-b border-default-200 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{category.category}</p>
                  <p className="text-sm text-default-500">{texts.recordCount(category.count)}</p>
                </div>
                <p className="whitespace-nowrap font-semibold tabular-nums">
                  {formatArsAmount(category.total, common.locale)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </section>
  );
}
