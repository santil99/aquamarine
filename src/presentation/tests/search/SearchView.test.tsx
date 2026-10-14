import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import type { SaleSearchFilters, SaleSearchItem } from "@/domain/sales/saleSearch";
import { SearchView } from "@/presentation/views/SearchView";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const catalogs = {
  categories: [{ id: "1", name: "Bebidas" }],
  paymentMethods: [{ id: "10", name: "Efectivo" }],
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

function renderSearch(searchSales: (filters: SaleSearchFilters) => Promise<SaleSearchItem[]>) {
  return render(
    <SearchView
      loadCatalogs={() => Promise.resolve(catalogs)}
      searchSales={searchSales}
      timeZone={TIME_ZONE}
      onOpenSale={vi.fn()}
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

  it("shows no payment method filter and no query for expenses", async () => {
    const user = userEvent.setup();
    const searchSales = vi.fn(() => Promise.resolve(results));
    renderSearch(searchSales);
    await screen.findByText("Ventas encontradas (2)");

    await user.click(screen.getByRole("tab", { name: "Gastos" }));

    expect(screen.getByText("Gastos encontrados (0)")).toBeTruthy();
    expect(screen.queryByText("Medio de pago")).toBeNull();
    expect(searchSales).toHaveBeenCalledTimes(1);
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
