import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { SalesCatalogs } from "@/application/ports/salesRepository";
import type { NewSaleInput } from "@/domain/sales/newSale";
import { getTodayInTimeZone } from "@/domain/business/businessDay";
import { NewSaleView } from "@/presentation/features/sales/views/NewSaleView";

const TIME_ZONE = "UTC";

const catalogs: SalesCatalogs = {
  categories: [{ id: "cat-1", name: "Comida" }],
  paymentMethods: [{ id: "pm-1", name: "Efectivo" }],
};

describe("NewSaleView", () => {
  beforeAll(() => {
    vi.stubGlobal("ResizeObserver", class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(cleanup);

  it("shows required field errors and does not register an empty sale", async () => {
    const interaction = userEvent.setup();
    const registerSale = vi.fn(() => Promise.resolve());
    render(<NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={registerSale} timeZone={TIME_ZONE} />);

    await interaction.click(await screen.findByRole("button", { name: "Registrar venta" }));

    expect(await screen.findByText("Ingresa el monto de la venta.")).toBeTruthy();
    expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();
    expect(registerSale).not.toHaveBeenCalled();
  });

    it("shows the amount error while typing, before submitting", async () => {
    const interaction = userEvent.setup();
    render(<NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={() => Promise.resolve()} timeZone={TIME_ZONE} />);

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.type(amount, "12a");

    expect(await screen.findByText("Ingresa un monto mayor a cero con hasta 2 decimales, usando coma para los decimales.")).toBeTruthy();
  });

  it("shows the selected category and no placeholder after selecting it", async () => {
    const interaction = userEvent.setup();
    render(<NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={() => Promise.resolve()} timeZone={TIME_ZONE} />);

    await interaction.click(await screen.findByRole("button", { name: /Categoría/ }));
    await interaction.click(await screen.findByRole("option", { name: "Comida" }));

    expect(screen.getByRole("button", { name: /Categoría/ }).textContent).toContain("Comida");
    expect(screen.queryByText("Selecciona una categoría")).toBeNull();
  });

  it("registers a valid sale, shows feedback and clears the form", async () => {
    const interaction = userEvent.setup();
    const registerSale = vi.fn<(input: NewSaleInput, transactionDate: string, newImages: Blob[]) => Promise<void>>(() => Promise.resolve());
    render(<NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={registerSale} timeZone={TIME_ZONE} />);

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.type(amount, "150,50");
    await interaction.click(screen.getByRole("button", { name: /Categoría/ }));
    await interaction.click(await screen.findByRole("option", { name: "Comida" }));
    await interaction.click(screen.getByRole("button", { name: "Registrar venta" }));

    expect(await screen.findByText("Venta registrada.")).toBeTruthy();
    expect(registerSale).toHaveBeenCalledWith(
      {
        amount: "150,50",
        categoryId: "cat-1",
        paymentMethodId: null,
        detail: null,
      },
      getTodayInTimeZone(TIME_ZONE),
      [],
    );
    expect(amount.value).toBe("");
  });

  it("rejects a file that is not a supported image", async () => {
    const interaction = userEvent.setup({ applyAccept: false });
    const { container } = render(
      <NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={() => Promise.resolve()} timeZone={TIME_ZONE} />,
    );

    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
    await interaction.upload(fileInput, new File(["notes"], "notes.txt", { type: "text/plain" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Solo se permiten imágenes JPG, PNG o WebP.");
  });

  it("keeps the entered data and shows an error when saving fails", async () => {
    const interaction = userEvent.setup();
    const registerSale = vi.fn(() => Promise.reject(new Error("network")));
    render(<NewSaleView loadCatalogs={() => Promise.resolve(catalogs)} registerSale={registerSale} timeZone={TIME_ZONE} />);

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.type(amount, "80");
    await interaction.click(screen.getByRole("button", { name: /Categoría/ }));
    await interaction.click(await screen.findByRole("option", { name: "Comida" }));
    await interaction.click(screen.getByRole("button", { name: "Registrar venta" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No pudimos registrar la venta. Revisa tu conexión y reintenta.",
    );
    expect(amount.value).toBe("80");
  });
});
