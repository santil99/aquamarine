import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { ExpenseSearchFilters, ExpenseSearchItem } from "@/domain/expenses/expenseSearch";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";
import { SearchView } from "@/presentation/views/SearchView";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const catalogs = {
  categories: [{ id: "1", name: "Bebidas" }],
  paymentMethods: [{ id: "10", name: "Efectivo" }],
  expenseCategories: [{ id: "7", name: "Servicios" }],
};

const results: SaleSearchItem[] = [
  {
    id: "1",
    amount: "1234.5",
    category: "Bebidas",
    paymentMethod: "Efectivo",
    createdAt: "2024-05-10T15:00:00Z",
    detail: "Gaseosas",
  },
  {
    id: "2",
    amount: "100",
    category: "Comida",
    paymentMethod: null,
    createdAt: "2024-05-11T15:00:00Z",
    detail: null,
  },
];

const expenseResults: ExpenseSearchItem[] = [
  {
    id: "e1",
    amount: "500.25",
    category: "Servicios",
    paymentMethod: null,
    createdAt: "2024-05-12T15:00:00Z",
    detail: "Luz",
  },
];

function renderSearch(
  searchSales: (filters: SaleSearchFilters) => Promise<SaleSearchItem[]>,
  searchExpenses: (filters: ExpenseSearchFilters) => Promise<ExpenseSearchItem[]> = () =>
    Promise.resolve(expenseResults),
) {
  return render(
    <SearchView
      loadCatalogs={() => Promise.resolve(catalogs)}
      searchSales={searchSales}
      searchExpenses={searchExpenses}
      timeZone={TIME_ZONE}
      onOpenSale={vi.fn()}
      onOpenExpense={vi.fn()}
    />,
  );
}

describe("SearchView", () => {
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

  it("searches sales from the first day of the month to today on load", async () => {
    const searchSales = vi.fn(() => Promise.resolve(results));
    renderSearch(searchSales);

    expect(await screen.findByText("Ventas encontradas (2)")).toBeTruthy();
    expect(screen.getByText("Gaseosas")).toBeTruthy();
    expect(screen.getByText("Sin descripción")).toBeTruthy();

    const today = getTodayInTimeZone(TIME_ZONE);
    expect(searchSales).toHaveBeenCalledWith(
      expect.objectContaining({ dateFrom: `${today.slice(0, 8)}01`, dateTo: today }),
    );
  });

  it("applies the minimum amount typed in the filters", async () => {
    const user = userEvent.setup();
    const searchSales = vi.fn(() => Promise.resolve(results));
    renderSearch(searchSales);
    await screen.findByText("Ventas encontradas (2)");

    await user.type(screen.getByLabelText("Monto mínimo"), "100");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() =>
      expect(searchSales).toHaveBeenLastCalledWith(expect.objectContaining({ minAmount: "100" })),
    );
  });

  it("clears the filter fields without running a search", async () => {
    const user = userEvent.setup();
    const searchSales = vi.fn(() => Promise.resolve(results));
    renderSearch(searchSales);
    await screen.findByText("Ventas encontradas (2)");

    await user.type(screen.getByLabelText("Descripción"), "agua");
    await user.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(screen.getByLabelText("Descripción")).toHaveProperty("value", "");
    expect(searchSales).toHaveBeenCalledTimes(1);
  });

  it("searches expenses with the expense categories when the Gastos tab is selected", async () => {
    const user = userEvent.setup();
    const searchExpenses = vi.fn<(filters: ExpenseSearchFilters) => Promise<ExpenseSearchItem[]>>(
      () => Promise.resolve(expenseResults),
    );
    renderSearch(vi.fn(() => Promise.resolve(results)), searchExpenses);
    await screen.findByText("Ventas encontradas (2)");

    await user.click(screen.getByRole("tab", { name: "Gastos" }));

    expect(await screen.findByText("Gastos encontrados (1)")).toBeTruthy();
    expect(screen.getByText("Luz")).toBeTruthy();
    expect(screen.queryByText("Medio de pago")).toBeNull();
    expect(searchExpenses).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: null, detail: null }),
    );
    expect(searchExpenses.mock.calls[0][0]).not.toHaveProperty("minAmount");
  });

  it("offers expense categories in the category filter for expenses", async () => {
    const user = userEvent.setup();
    renderSearch(vi.fn(() => Promise.resolve(results)));
    await screen.findByText("Ventas encontradas (2)");

    await user.click(screen.getByRole("tab", { name: "Gastos" }));
    await user.click(screen.getByRole("button", { name: /Todas las categorías/ }));

    expect(await screen.findByRole("option", { name: "Servicios" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "Bebidas" })).toBeNull();
  });

  it("shows an error with a retry action when the search fails", async () => {
    const user = userEvent.setup();
    const searchSales = vi
      .fn<(filters: SaleSearchFilters) => Promise<SaleSearchItem[]>>()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(results);
    renderSearch(searchSales);

    expect(await screen.findByRole("alert")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("Ventas encontradas (2)")).toBeTruthy();
  });
});
