import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { ExpenseCatalogs, ExpenseDetail } from "@/domain/expenses/expenseForm";
import { ExpenseDetailView } from "@/presentation/features/expenses/views/ExpenseDetailView";

const TIME_ZONE = "America/Argentina/Buenos_Aires";

const catalogs: ExpenseCatalogs = {
  categories: [{ id: "cat-1", name: "Alquiler" }],
  paymentMethods: [{ id: "pm-1", name: "Transferencia" }],
};

const expense: ExpenseDetail = {
  id: "10",
  createdAt: "2026-03-05T15:00:00Z",
  amount: "1234.5",
  categoryId: "cat-1",
  category: "Alquiler",
  paymentMethodId: null,
  paymentMethod: null,
  detail: null,
};

describe("ExpenseDetailView", () => {
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

  function renderView(overrides: Partial<Parameters<typeof ExpenseDetailView>[0]> = {}) {
    const props = {
      expenseId: "10",
      timeZone: TIME_ZONE,
      loadExpense: vi.fn(() => Promise.resolve(expense)),
      loadCatalogs: () => Promise.resolve(catalogs),
      updateExpense: vi.fn(() => Promise.resolve()),
      deleteExpense: vi.fn(() => Promise.resolve()),
      onExit: vi.fn(),
      ...overrides,
    };
    render(<ExpenseDetailView {...props} />);
    return props;
  }

  it("shows the loaded expense in the form", async () => {
    renderView();

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;

    expect(amount.value).toBe("1234,5");
    expect(screen.getByRole("button", { name: /Categoría/ }).textContent).toContain("Alquiler");
  });

  it("shows a not found message when the expense does not exist", async () => {
    renderView({ loadExpense: () => Promise.resolve(null) });

    expect(await screen.findByText("El gasto no existe o ya fue eliminado.")).toBeTruthy();
  });

  it("saves the changes and leaves the view", async () => {
    const interaction = userEvent.setup();
    const { updateExpense, onExit } = renderView();

    const amount = (await screen.findByRole("textbox", { name: "Monto" })) as HTMLInputElement;
    await interaction.clear(amount);
    await interaction.type(amount, "900");
    await interaction.click(screen.getByRole("button", { name: "Guardar" }));

    expect(updateExpense).toHaveBeenCalledWith("10", {
      amount: "900",
      categoryId: "cat-1",
      paymentMethodId: null,
      detail: null,
    });
    expect(onExit).toHaveBeenCalled();
  });

  it("deletes the expense after confirming and leaves the view", async () => {
    const interaction = userEvent.setup();
    const { deleteExpense, onExit } = renderView();

    await interaction.click(await screen.findByRole("button", { name: "Eliminar gasto" }));
    await interaction.click(await screen.findByRole("button", { name: "Sí, eliminar" }));

    expect(deleteExpense).toHaveBeenCalledWith("10");
    expect(onExit).toHaveBeenCalled();
  });
});
