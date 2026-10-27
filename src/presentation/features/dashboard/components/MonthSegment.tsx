import { useCallback } from "react";
import { Card } from "@heroui/react";
import type { CategoryTotal } from "@/domain/business/categoryTotal";
import { summarizeMonth } from "@/domain/business/monthSummary";
import { averageAmounts } from "@/domain/shared/amount";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { DailySalesChart } from "@/presentation/features/dashboard/components/DailySalesChart";
import { LoadedContent } from "@/presentation/features/dashboard/components/LoadedContent";
import { useLoadedData } from "@/presentation/features/dashboard/hooks/useLoadedData";
import type { SummaryLoaders } from "@/presentation/features/dashboard/summaryLoaders";
import { useTexts } from "@/presentation/texts/useTexts";

interface MonthSegmentProps {
  readonly loaders: SummaryLoaders;
  readonly monthStart: string;
}

export function MonthSegment({ loaders, monthStart }: MonthSegmentProps) {
  const { sales, expenses, dailySales } = loaders;
  const { common, summary: texts } = useTexts();
  const load = useCallback(
    async () => {
      const [salesTotals, expenseTotals, daily] = await Promise.all([
        sales(monthStart),
        expenses(monthStart),
        dailySales(monthStart),
      ]);

      return { sales: salesTotals, expenses: expenseTotals, dailySales: daily };
    },
    [sales, expenses, dailySales, monthStart],
  );
  const { state, retry } = useLoadedData(load);

  return (
    <LoadedContent state={state} onRetry={retry}>
      {(data) => {
        const monthSummary = summarizeMonth(data.sales, data.expenses);
        const isNegativeBalance = monthSummary.balance.startsWith("-");
        const averageDailySale = averageAmounts(data.dailySales.map((point) => point.total));

        return (
          <div className="flex flex-col gap-4">
            <Card className="flex flex-col gap-3 p-4">
              <p className="text-sm text-default-500">{texts.dailySales}</p>
              <DailySalesChart points={data.dailySales} locale={common.locale} />
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
              categories={data.sales}
            />
            <CategorySection
              title={texts.expensesByCategory}
              emptyText={texts.emptyExpenses}
              categories={data.expenses}
            />
          </div>
        );
      }}
    </LoadedContent>
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
