import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { addMonths, getMonthStart, getTodayInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseListItem } from "@/domain/expenses/expenseListItem";
import { formatMonthLabel, formatMonthName } from "@/presentation/formatters/monthLabel";
import { ExpensesListView } from "@/presentation/views/ExpensesListView";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const expenses: ExpenseListItem[] = [
  {
    id: "10",
    createdAt: "2026-03-05T15:00:00Z",
    amount: "1234.5",
    category: "Alquiler",
    paymentMethod: "Transferencia",
  },
  { id: "11", createdAt: "2026-03-09T15:00:00Z", amount: "80", category: "Limpieza", paymentMethod: null },
];

describe("ExpensesListView", () => {
  beforeAll(() => {
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

  it("loads the current month and shows its label", async () => {
    const currentMonth = getMonthStart(getTodayInTimeZone(TIME_ZONE));
    const listExpenses = vi.fn(() => Promise.resolve(expenses));

    render(<ExpensesListView listExpenses={listExpenses} timeZone={TIME_ZONE} onOpenExpense={vi.fn()} />);

    expect(await screen.findByText("1.234,50")).toBeTruthy();
    expect(listExpenses).toHaveBeenCalledWith(currentMonth);
    expect(screen.getByText(formatMonthLabel(currentMonth, "es-AR"))).toBeTruthy();
  });

  it("moves one month back and forth with the arrow buttons", async () => {
    const currentMonth = getMonthStart(getTodayInTimeZone(TIME_ZONE));
    const listExpenses = vi.fn(() => Promise.resolve(expenses));
    const user = userEvent.setup();

    render(<ExpensesListView listExpenses={listExpenses} timeZone={TIME_ZONE} onOpenExpense={vi.fn()} />);
    await screen.findByText("1.234,50");

    await user.click(screen.getByRole("button", { name: "Mes anterior" }));

    expect(listExpenses).toHaveBeenLastCalledWith(addMonths(currentMonth, -1));

    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));
    await user.click(screen.getByRole("button", { name: "Mes siguiente" }));

    expect(listExpenses).toHaveBeenLastCalledWith(addMonths(currentMonth, 1));
  });

  it("loads the expenses of the month picked in the month picker", async () => {
    const currentMonth = getMonthStart(getTodayInTimeZone(TIME_ZONE));
    const isJanuary = currentMonth.endsWith("-01-01");
    const target = isJanuary ? addMonths(currentMonth, 1) : `${currentMonth.slice(0, 4)}-01-01`;
    const listExpenses = vi.fn(() => Promise.resolve(expenses));
    const user = userEvent.setup();

    render(<ExpensesListView listExpenses={listExpenses} timeZone={TIME_ZONE} onOpenExpense={vi.fn()} />);
    await user.click(await screen.findByText(formatMonthLabel(currentMonth, "es-AR")));
    await user.click(screen.getByRole("button", { name: formatMonthName(target, "es-AR") }));

    expect(listExpenses).toHaveBeenLastCalledWith(target);
    expect(await screen.findByText(formatMonthLabel(target, "es-AR"))).toBeTruthy();
  });

  it("opens the detail of an expense from its eye button", async () => {
    const onOpenExpense = vi.fn();
    const user = userEvent.setup();

    render(
      <ExpensesListView
        listExpenses={() => Promise.resolve(expenses)}
        timeZone={TIME_ZONE}
        onOpenExpense={onOpenExpense}
      />,
    );

    const [firstDetailButton] = await screen.findAllByRole("button", { name: "Ver detalle" });
    await user.click(firstDetailButton);

    expect(onOpenExpense).toHaveBeenCalledWith("10");
  });
});
