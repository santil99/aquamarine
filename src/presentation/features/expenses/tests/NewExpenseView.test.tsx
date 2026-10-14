import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { ExpenseCatalogs } from "@/domain/expenses/expenseForm";
import type { NewSaleInput } from "@/domain/sales/newSale";
import { NewExpenseView } from "@/presentation/features/expenses/views/NewExpenseView";

const catalogs: ExpenseCatalogs = {
  categories: [{ id: "cat-1", name: "Alquiler" }],
  paymentMethods: [{ id: "pm-1", name: "Transferencia" }],
};

describe("NewExpenseView", () => {
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

  it("shows required field errors and does not register an empty expense", async () => {
    const interaction = userEvent.setup();
    const registerExpense = vi.fn(() => Promise.resolve());
    render(<NewExpenseView loadCatalogs={() => Promise.resolve(catalogs)} registerExpense={registerExpense} />);

    await interaction.click(await screen.findByRole("button", { name: "Registrar gasto" }));

    expect(await screen.findByText("Ingresa el monto del gasto.")).toBeTruthy();
    expect(screen.getByText("Selecciona una categoría.")).toBeTruthy();
    expect(registerExpense).not.toHaveBeenCalled();
  });

  it("registers a valid expense, shows feedback and clears the form", async () => {
    const interaction = userEvent.setup();
    const registerExpense = vi.fn<(input: NewSaleInput) => Promise<void>>(() => Promise.resolve());
    render(<NewExpenseView loadCatalogs={() => Promise.resolve(catalogs)} registerExpense={registerExpense} />);

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.type(amount, "5000,25");
    await interaction.click(screen.getByRole("button", { name: /Categoría/ }));
    await interaction.click(await screen.findByRole("option", { name: "Alquiler" }));
    await interaction.click(screen.getByRole("button", { name: "Registrar gasto" }));

    expect(await screen.findByText("Gasto registrado.")).toBeTruthy();
    expect(registerExpense).toHaveBeenCalledWith({
      amount: "5000,25",
      categoryId: "cat-1",
      paymentMethodId: null,
      detail: null,
    });
    expect(amount.value).toBe("");
  });

  it("keeps the entered data and shows an error when saving fails", async () => {
    const interaction = userEvent.setup();
    const registerExpense = vi.fn(() => Promise.reject(new Error("network")));
    render(<NewExpenseView loadCatalogs={() => Promise.resolve(catalogs)} registerExpense={registerExpense} />);

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.type(amount, "80");
    await interaction.click(screen.getByRole("button", { name: /Categoría/ }));
    await interaction.click(await screen.findByRole("option", { name: "Alquiler" }));
    await interaction.click(screen.getByRole("button", { name: "Registrar gasto" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No pudimos registrar el gasto. Revisa tu conexión y reintenta.",
    );
    expect(amount.value).toBe("80");
  });
});
