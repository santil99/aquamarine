import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SaleListItem } from "@/domain/sales/saleListItem";
import { SalesListView } from "@/presentation/views/SalesListView";

const sales: SaleListItem[] = [
  { id: "1", amount: "1234.5", category: "Bebidas", paymentMethod: "Efectivo" },
  { id: "2", amount: "100", category: "Comida", paymentMethod: null },
  { id: "3", amount: "0.25", category: "Postres", paymentMethod: "Tarjeta" },
];

describe("SalesListView", () => {
  afterEach(cleanup);

  it("shows a loading spinner while sales are being fetched", () => {
    render(<SalesListView listSales={() => new Promise(() => {})} />);

    expect(screen.getByRole("status")).toBeTruthy();
    expect(screen.queryByText("Cargando ventas...")).toBeNull();
  });

  it("renders sales with formatted amounts and the exact daily total", async () => {
    render(<SalesListView listSales={() => Promise.resolve(sales)} />);

    expect(await screen.findByText("1.234,50")).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("0,25")).toBeTruthy();
    expect(screen.getByText("Bebidas")).toBeTruthy();
    expect(screen.getByText("—")).toBeTruthy();
    expect(screen.getByText("1.334,75")).toBeTruthy();
  });

  it("shows an empty state when there are no sales", async () => {
    render(<SalesListView listSales={() => Promise.resolve([])} />);

    expect(
      await screen.findByText("No hay ventas registradas hoy."),
    ).toBeTruthy();
  });

  it("shows an error state and retries the query", async () => {
    const listSales = vi
      .fn<() => Promise<SaleListItem[]>>()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(sales);
    const user = userEvent.setup();

    render(<SalesListView listSales={listSales} />);

    expect(
      await screen.findByText("No se pudieron cargar las ventas."),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(await screen.findByText("1.234,50")).toBeTruthy();
    expect(listSales).toHaveBeenCalledTimes(2);
  });
});
