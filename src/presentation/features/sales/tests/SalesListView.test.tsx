import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { addDays, getTodayInTimeZone } from "@/domain/business/businessDay";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { SalesListView } from "@/presentation/features/sales/views/SalesListView";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const sales: SaleListItem[] = [
  { id: "1", amount: "1234.5", category: "Bebidas", paymentMethod: "Efectivo" },
  { id: "2", amount: "100", category: "Comida", paymentMethod: null },
  { id: "3", amount: "0.25", category: "Postres", paymentMethod: "Tarjeta" },
];

describe("SalesListView", () => {
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

  it("shows a loading spinner while sales are being fetched", () => {
    render(
      <SalesListView listSales={() => new Promise(() => {})} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />,
    );

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Cargando ventas...")).toBeNull();
  });

  it("renders sales with formatted amounts and the exact daily total", async () => {
    render(
      <SalesListView listSales={() => Promise.resolve(sales)} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />,
    );

    expect(await screen.findByText("1.234,50")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("0,25")).toBeTruthy();
    expect(screen.getByText("Bebidas")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("1.334,75")).toBeTruthy();
  });

  it("shows an empty state when there are no sales", async () => {
    render(<SalesListView listSales={() => Promise.resolve([])} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />);

    expect(
      await screen.findByText("No hay ventas registradas para este día."),
    ).toBeTruthy();
  });

  it("shows an error state and retries the query", async () => {
    const listSales = vi
      .fn<(date: string) => Promise<SaleListItem[]>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(sales);
    const user = userEvent.setup();

    render(<SalesListView listSales={listSales} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />);

    expect(
      await screen.findByText("No se pudieron cargar las ventas."),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("1.234,50")).toBeTruthy();
    expect(listSales).toHaveBeenCalledTimes(2);
  });

  it("loads today's sales and labels the navigator with Hoy on first render", async () => {
    const listSales = vi.fn(() => Promise.resolve(sales));

    render(<SalesListView listSales={listSales} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />);

    expect(await screen.findByText("Hoy")).toBeTruthy();
    expect(listSales).toHaveBeenCalledWith(getTodayInTimeZone(TIME_ZONE));
  });

  it("moves one day back and forth with the arrow buttons", async () => {
    const today = getTodayInTimeZone(TIME_ZONE);
    const listSales = vi.fn(() => Promise.resolve(sales));
    const user = userEvent.setup();

    render(<SalesListView listSales={listSales} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />);
    await screen.findByText("Hoy");

    await user.click(screen.getByRole("button", { name: "Día anterior" }));

    expect(await screen.findByText("Ayer")).toBeTruthy();
    expect(listSales).toHaveBeenLastCalledWith(addDays(today, -1));

    await user.click(screen.getByRole("button", { name: "Día siguiente" }));
    await user.click(screen.getByRole("button", { name: "Día siguiente" }));

    expect(listSales).toHaveBeenLastCalledWith(addDays(today, 1));
    expect(screen.queryByText("Hoy")).toBeNull();
  });

  it("loads the sales of the day picked in the calendar", async () => {
    const today = getTodayInTimeZone(TIME_ZONE);
    const day = today.endsWith("-15") ? "16" : "15";
    const target = `${today.slice(0, 8)}${day}`;
    const listSales = vi.fn(() => Promise.resolve(sales));
    const user = userEvent.setup();

    render(<SalesListView listSales={listSales} timeZone={TIME_ZONE} onOpenSale={vi.fn()} />);
    await user.click(await screen.findByText("Hoy"));

    const calendar = await screen.findByRole("grid");
    await user.click(within(calendar).getByText(String(Number(day))));

    expect(listSales).toHaveBeenLastCalledWith(target);
    const trigger = screen
      .getByText(target.split("-").reverse().join("/"))
      .closest("button");
    await waitFor(() => expect(trigger?.getAttribute("aria-expanded")).toBe("false"));
    expect(screen.queryByText("Hoy")).toBeNull();
  });
});
