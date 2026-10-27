import type { ChartData, ChartOptions } from "chart.js";
import type { TrendMetric, TrendPoint } from "@/domain/business/monthlyTrend";
import { formatArsAmount } from "@/presentation/formatters/amount";
import { formatMonthLabel } from "@/presentation/formatters/monthLabel";

const GRID_COLOR = "rgba(128, 128, 128, 0.2)";
const TICK_COLOR = "#71717a";
const DANGER_COLOR = "#f31260";
const METRIC_COLORS: Record<TrendMetric, string> = {
  income: "#17c964",
  expenses: DANGER_COLOR,
  balance: "#6366f1",
  ticket: "#0d9488",
};
const PARTIAL_MONTH_OPACITY = "66";

export function buildTrendChartData(
  points: TrendPoint[],
  metric: TrendMetric,
  currentMonth: string,
  locale: string,
): ChartData<"bar", number[], string> {
  const colors = points.map((point) => {
    const color = metric === "balance" && point.value.startsWith("-") ? DANGER_COLOR : METRIC_COLORS[metric];
    return point.month === currentMonth ? `${color}${PARTIAL_MONTH_OPACITY}` : color;
  });

  return {
    labels: points.map((point) => formatShortMonth(point.month, locale)),
    datasets: [
      {
        data: points.map((point) => Number(point.value)),
        backgroundColor: colors,
        borderRadius: 4,
        maxBarThickness: 40,
      },
    ],
  };
}

export function buildTrendChartOptions(
  points: TrendPoint[],
  locale: string,
  partialMonthLabel: string,
  currentMonth: string,
): ChartOptions<"bar"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: ([item]) => {
            const { month } = points[item.dataIndex];
            const label = formatMonthLabel(month, locale);
            return month === currentMonth ? `${label} (${partialMonthLabel})` : label;
          },
          // The label uses the exact decimal string; the plotted number is only for drawing.
          label: (item) => formatArsAmount(points[item.dataIndex].value, locale),
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: TICK_COLOR, maxRotation: 0 } },
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: { color: TICK_COLOR, callback: (value) => formatArsAmount(String(value), locale) },
      },
    },
  };
}

function formatShortMonth(monthStart: string, locale: string): string {
  const [year, month] = monthStart.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(
    Date.UTC(year, month - 1, 1),
  );
}
