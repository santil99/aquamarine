import { CategoryScale, Chart as ChartJS, LinearScale, LineController, LineElement, PointElement, Tooltip } from "chart.js";
import { Line } from "react-chartjs-2";
import type { DailySalesPoint } from "@/domain/business/dailySales";
import { buildDailySalesChartData, buildDailySalesChartOptions } from "@/presentation/features/dashboard/components/dailySalesChartOptions";

ChartJS.register(
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
);

interface DailySalesChartProps {
  readonly points: DailySalesPoint[];
  readonly locale: string;
}

export function DailySalesChart({ points, locale }: DailySalesChartProps) {
  return (
    <div className="relative h-[40svh] min-h-64 w-full">
      <Line data={buildDailySalesChartData(points)} options={buildDailySalesChartOptions(points, locale)} />
    </div>
  );
}
