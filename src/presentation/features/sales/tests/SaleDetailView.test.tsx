import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import type { SaleWithImages } from "@/domain/sales/saleDetail";
import { SaleDetailView } from "@/presentation/features/sales/views/SaleDetailView";

const sale: SaleWithImages = {
  id: "sale-1",
  amount: "1234.5",
  categoryId: "cat-1",
  category: "Bebidas",
  paymentMethodId: "pay-1",
  paymentMethod: "Efectivo",
  detail: "Mesa 4",
  transactionDate: "2024-05-10",
  createdAt: "2024-05-10T14:30:00Z",
  imagePaths: [],
  images: [],
};

const catalogs: SalesCatalogs = {
  categories: [{ id: "cat-1", name: "Bebidas" }],
  paymentMethods: [{ id: "pay-1", name: "Efectivo" }],
};

function renderView(overrides: Partial<Parameters<typeof SaleDetailView>[0]> = {}) {
  const props = {
    saleId: "sale-1",
    timeZone: "America/Argentina/Buenos_Aires",
    loadSale: vi.fn(() => Promise.resolve(sale)),
    loadCatalogs: vi.fn(() => Promise.resolve(catalogs)),
    updateSale: vi.fn(() => Promise.resolve()),
    deleteSale: vi.fn(() => Promise.resolve()),
    onExit: vi.fn(),
    ...overrides,
  };

  render(<SaleDetailView {...props} />);
  return props;
}

describe("SaleDetailView", () => {
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

  it("shows the sale values in the form, with the amount in comma decimals", async () => {
    renderView();

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    expect(amount.value).toBe("1234,5");
    expect(
      (screen.getByRole("textbox", { name: "Detalle (opcional)" }) as HTMLTextAreaElement).value,
    ).toBe("Mesa 4");
    expect(screen.getByText("11:30")).toBeTruthy();
  });

  it("shows a not found message when the sale does not exist", async () => {
    renderView({ loadSale: () => Promise.resolve(null) });

    expect(
      await screen.findByText("La venta no existe o ya fue eliminada."),
    ).toBeTruthy();
  });

  it("saves the edited values and leaves with the saved feedback", async () => {
    const user = userEvent.setup();
    const props = renderView();

    const amount = await screen.findByRole("textbox", { name: "Monto" });
    await user.clear(amount);
    await user.type(amount, "2000");
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(props.onExit).toHaveBeenCalledWith("saved"));
    expect(props.updateSale).toHaveBeenCalledWith(
      "sale-1",
      {
        amount: "2000",
        categoryId: "cat-1",
        paymentMethodId: "pay-1",
        detail: "Mesa 4",
      },
      [],
      [],
    );
  });

  it("keeps only the remaining existing images when one is removed", async () => {
    const user = userEvent.setup();
    const withImages: SaleWithImages = {
      ...sale,
      imagePaths: ["sales/a.jpg", "sales/b.png"],
      images: [
        { path: "sales/a.jpg", url: "https://example.com/a.jpg" },
        { path: "sales/b.png", url: "https://example.com/b.png" },
      ],
    };
    const props = renderView({ loadSale: () => Promise.resolve(withImages) });

    const removeButtons = await screen.findAllByRole("button", { name: "Quitar imagen" });
    await user.click(removeButtons[0]);
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => expect(props.onExit).toHaveBeenCalledWith("saved"));
    expect(props.updateSale).toHaveBeenCalledWith(
      "sale-1",
      expect.any(Object),
      ["sales/b.png"],
      [],
    );
  });

  it("does not save when the amount is invalid", async () => {
    const user = userEvent.setup();
    const props = renderView();

    const amount = await screen.findByRole("textbox", { name: "Monto" });
    await user.clear(amount);
    await user.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByText("Ingresa el monto de la venta.")).toBeTruthy();
    expect(props.updateSale).not.toHaveBeenCalled();
    expect(props.onExit).not.toHaveBeenCalled();
  });

  it("leaves without saving when cancelled", async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(await screen.findByRole("button", { name: "Cancelar" }));

    expect(props.onExit).toHaveBeenCalledWith();
    expect(props.updateSale).not.toHaveBeenCalled();
  });

  it("deletes the sale only after confirming in the dialog", async () => {
    const user = userEvent.setup();
    const props = renderView();

    await user.click(await screen.findByRole("button", { name: "Eliminar Venta" }));
    expect(props.deleteSale).not.toHaveBeenCalled();

    await user.click(await screen.findByRole("button", { name: "Sí, eliminar" }));

    await waitFor(() => expect(props.onExit).toHaveBeenCalledWith("deleted"));
    expect(props.deleteSale).toHaveBeenCalledWith("sale-1");
  });
});
