import type { ChartData, ChartOptions } from "chart.js";
import type { DailySalesPoint } from "@/domain/business/dailySales";
import { formatArsAmount } from "@/presentation/formatters/amount";

const LINE_COLOR = "#17c964";
const GRID_COLOR = "rgba(128, 128, 128, 0.2)";
const TICK_COLOR = "#71717a";

export function buildDailySalesChartData(points: DailySalesPoint[]): ChartData<"line", number[], number> {
  return {
    labels: points.map((point) => point.day),
    datasets: [
      {
        data: points.map((point) => Number(point.total)),
        borderColor: LINE_COLOR,
        backgroundColor: LINE_COLOR,
        pointStyle: "circle",
        pointRadius: 3,
        pointHoverRadius: 6,
        pointBackgroundColor: LINE_COLOR,
        pointBorderColor: LINE_COLOR,
        tension: 0.3,
      },
    ],
  };
}

export function buildDailySalesChartOptions(
  points: DailySalesPoint[],
  locale: string,
): ChartOptions<"line"> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: ([item]) => formatTooltipDate(points[item.dataIndex].date, locale),
          // The label uses the exact decimal string; the plotted number is only for drawing.
          label: (item) => formatArsAmount(points[item.dataIndex].total, locale),
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: TICK_COLOR, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID_COLOR },
        ticks: {
          color: TICK_COLOR,
          callback: (value) => formatArsAmount(String(value), locale),
        },
      },
    },
  };
}

function formatTooltipDate(date: string, locale: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(Date.UTC(year, month - 1, day));
}
