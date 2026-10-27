import { BarController, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { TrendMetric, TrendPoint } from "@/domain/business/monthlyTrend";
import {
  buildTrendChartData,
  buildTrendChartOptions,
} from "@/presentation/features/dashboard/components/trendChartOptions";

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

interface TrendChartProps {
  readonly points: TrendPoint[];
  readonly metric: TrendMetric;
  readonly currentMonth: string;
  readonly locale: string;
  readonly partialMonthLabel: string;
}

export function TrendChart({ points, metric, currentMonth, locale, partialMonthLabel }: TrendChartProps) {
  return (
    <div className="relative h-[34svh] min-h-60 w-full">
      <Bar
        data={buildTrendChartData(points, metric, currentMonth, locale)}
        options={buildTrendChartOptions(points, locale, partialMonthLabel, currentMonth)}
      />
    </div>
  );
}
