import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { addMonths, getMonthStart, getTodayInTimeZone } from "@/domain/business/businessDay";
import { buildMonthlyTotals } from "@/domain/business/monthlyTrend";
import type { SummaryLoaders } from "@/presentation/features/dashboard/summaryLoaders";
import { SummaryView } from "@/presentation/features/dashboard/views/SummaryView";

vi.mock("react-chartjs-2", () => ({
  Line: () => <div data-testid="daily-chart" />,
  Bar: () => <div data-testid="trend-chart" />,
}));

const timeZone = "America/Argentina/Buenos_Aires";
const currentMonth = getMonthStart(getTodayInTimeZone(timeZone));

function createLoaders(): SummaryLoaders {
  const trendSales = buildMonthlyTotals(
    [
      { transactionDate: `${addMonths(currentMonth, -1).slice(0, 8)}10`, amount: "100.00" },
      { transactionDate: currentMonth, amount: "150.00" },
    ],
    currentMonth,
  );

  return {
    sales: vi.fn().mockResolvedValue([]),
    expenses: vi.fn().mockResolvedValue([]),
    dailySales: vi.fn().mockResolvedValue([{ day: 1, date: currentMonth, total: "400.00" }]),
    salesTrend: vi.fn().mockResolvedValue(trendSales),
    expensesTrend: vi.fn().mockResolvedValue(buildMonthlyTotals([], currentMonth)),
  };
}

describe("SummaryView", () => {
  beforeAll(() => {
    Element.prototype.getAnimations = () => [];
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
  });

  afterEach(cleanup);

  it("empieza en Mes con el gráfico diario", async () => {
    render(<SummaryView loaders={createLoaders()} timeZone={timeZone} />);

    expect(await screen.findByTestId("daily-chart")).toBeTruthy();
  });

  it("en Evolución muestra la variación frente al mes anterior", async () => {
    const user = userEvent.setup();
    render(<SummaryView loaders={createLoaders()} timeZone={timeZone} />);

    await user.click(screen.getByRole("tab", { name: "Evolución" }));

    expect(await screen.findByTestId("trend-chart")).toBeTruthy();
    expect(screen.getByText("+$ 50")).toBeTruthy();
  });
});
