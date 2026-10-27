import { useCallback, useState } from "react";
import { Card } from "@heroui/react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  buildTrendSeries,
  getLastChange,
  TREND_METRICS,
  TREND_RANGES,
  type TrendChange,
  type TrendMetric,
  type TrendRange,
} from "@/domain/business/monthlyTrend";
import { compareAmounts } from "@/domain/shared/amount";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { LoadedContent } from "@/presentation/features/dashboard/components/LoadedContent";
import { SegmentTabs } from "@/presentation/features/dashboard/components/SegmentTabs";
import { TrendChart } from "@/presentation/features/dashboard/components/TrendChart";
import { useLoadedData } from "@/presentation/features/dashboard/hooks/useLoadedData";
import type { SummaryLoaders } from "@/presentation/features/dashboard/summaryLoaders";
import { useTexts } from "@/presentation/texts/useTexts";

const DEFAULT_RANGE: TrendRange = 6;

interface TrendSegmentProps {
  readonly loaders: SummaryLoaders;
  readonly monthStart: string;
  readonly currentMonth: string;
}

export function TrendSegment({ loaders, monthStart, currentMonth }: TrendSegmentProps) {
  const { salesTrend, expensesTrend } = loaders;
  const { common, summary } = useTexts();
  const texts = summary.trend;
  const [metric, setMetric] = useState<TrendMetric>("income");
  const [range, setRange] = useState<TrendRange>(DEFAULT_RANGE);
  const load = useCallback(async () => {
    const [sales, expenses] = await Promise.all([salesTrend(monthStart), expensesTrend(monthStart)]);

    return { sales, expenses };
  }, [salesTrend, expensesTrend, monthStart]);
  const { state, retry } = useLoadedData(load);

  return (
    <div className="flex flex-col gap-4">
      <SegmentTabs
        label={texts.metricLabel}
        value={metric}
        options={TREND_METRICS.map((id) => ({ id, label: texts.metrics[id] }))}
        onChange={setMetric}
      />
      <LoadedContent state={state} onRetry={retry}>
        {(data) => {
          const series = buildTrendSeries(metric, data.sales.slice(-range), data.expenses.slice(-range));
          const isCurrentMonthLast = series[series.length - 1]?.month === currentMonth;

          return (
            <>
              <Card className="flex flex-col gap-3 p-4">
                <p className="text-sm text-default-500">{texts.metricTitles[metric]}</p>
                <TrendChart
                  points={series}
                  metric={metric}
                  currentMonth={currentMonth}
                  locale={common.locale}
                  partialMonthLabel={texts.partialMonth}
                />
                <SegmentTabs
                  label={texts.rangeLabel}
                  value={String(range)}
                  options={TREND_RANGES.map((months) => ({ id: String(months), label: texts.range(months) }))}
                  onChange={(id) => setRange(Number(id) as TrendRange)}
                />
              </Card>
              <ChangeCard
                metric={metric}
                change={getLastChange(series)}
                isPartial={isCurrentMonthLast}
              />
            </>
          );
        }}
      </LoadedContent>
    </div>
  );
}

function ChangeCard({
  metric,
  change,
  isPartial,
}: {
  readonly metric: TrendMetric;
  readonly change: TrendChange | null;
  readonly isPartial: boolean;
}) {
  const { common, summary } = useTexts();
  const texts = summary.trend;

  if (change === null) return null;

  const direction = compareAmounts(change.delta, "0");
  const isImprovement = metric === "expenses" ? direction < 0 : direction > 0;
  const color = direction === 0 ? "text-default-500" : isImprovement ? "text-success" : "text-danger";
  const Icon = direction < 0 ? TrendingDown : TrendingUp;
  const sign = direction > 0 ? "+" : "";

  return (
    <Card className="flex flex-col gap-1 p-4">
      <p className="text-sm text-default-500">
        {texts.changeLabel}
        {isPartial && ` · ${texts.partialMonth}`}
      </p>
      <p className={`flex items-center gap-2 text-2xl font-semibold tabular-nums ${color}`}>
        <Icon aria-hidden size={22} />
        <span>
          {sign}
          {formatArsAmount(change.delta, common.locale)}
        </span>
        {change.percent !== null && (
          <span className="text-base">
            ({sign}
            {change.percent.toLocaleString(common.locale, { maximumFractionDigits: 1 })}%)
          </span>
        )}
      </p>
      {change.percent === null && <p className="text-sm text-default-500">{texts.noPreviousData}</p>}
    </Card>
  );
}
