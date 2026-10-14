import { cleanup, render as renderWithoutRouter, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { MemoryRouter, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthenticatedUser } from "@/application/ports/authRepository";
import { AppLayout } from "@/presentation/layout/AppLayout";
import { LanguageProvider } from "@/presentation/texts/LanguageProvider";

function render(ui: ReactElement) {
  return renderWithoutRouter(<MemoryRouter>{ui}</MemoryRouter>);
}

function LocationProbe() {
  return <p>{useLocation().pathname}</p>;
}

const authenticatedUser: AuthenticatedUser = {
  id: "user-1",
  displayName: "Santiago",
  email: "santi@example.com",
};

const noopLogout = () => Promise.resolve();

describe("AppLayout", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    cleanup();
    document.documentElement.classList.remove("dark");
  });

  it("shows the authenticated profile and the navigation options in the menu", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(authenticatedUser)} onLogout={noopLogout}>
        <p>Contenido</p>
      </AppLayout>,
    );

    expect(screen.getByRole("heading", { name: "Aquamarine" })).toBeTruthy();
    expect(screen.getByText("Contenido")).toBeTruthy();

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByText("Santiago")).toBeTruthy();
    expect(screen.getByText("santi@example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Nueva venta" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ventas del día" })).toBeTruthy();
  });

  it("navigates to the selected screen and closes the menu", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(authenticatedUser)} onLogout={noopLogout}>
        <LocationProbe />
      </AppLayout>,
    );

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));
    await interaction.click(await screen.findByRole("button", { name: "Nueva venta" }));

    expect(await screen.findByText("/sales/new")).toBeTruthy();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("shows a localized fallback in the menu when there is no user", async () => {
    const interaction = userEvent.setup();
    render(<AppLayout loadUser={() => Promise.resolve(null)} onLogout={noopLogout}>{null}</AppLayout>);

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByText("Perfil no disponible")).toBeTruthy();
  });

  it("closes the menu when a navigation option is selected", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(authenticatedUser)} onLogout={noopLogout}>{null}</AppLayout>,
    );

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));
    await interaction.click(await screen.findByRole("button", { name: "Ventas del día" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });

  it("calls onLogout when the header logout button is pressed", async () => {
    const interaction = userEvent.setup();
    const onLogout = vi.fn(() => Promise.resolve());
    render(<AppLayout loadUser={() => Promise.resolve(null)} onLogout={onLogout}>{null}</AppLayout>);

    await interaction.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it("shows a visible error when logout fails", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(null)} onLogout={() => Promise.reject(new Error("fallo"))}>
        {null}
      </AppLayout>,
    );

    await interaction.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect((await screen.findByRole("alert")).textContent).toBe("No se pudo cerrar la sesión. Reintenta.");
  });

  it("switches the document to dark mode from the menu toggle", async () => {
    const interaction = userEvent.setup();
    render(<AppLayout loadUser={() => Promise.resolve(null)} onLogout={noopLogout}>{null}</AppLayout>);

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));
    const toggle = (await screen.findByRole("switch", { name: "Modo oscuro" })) as HTMLInputElement;
    expect(toggle.checked).toBe(false);

    await interaction.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(toggle.checked).toBe(true);

    await interaction.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(toggle.checked).toBe(false);
  });

  it("starts with the toggle reflecting the dark mode already applied", async () => {
    const interaction = userEvent.setup();
    document.documentElement.classList.add("dark");
    render(<AppLayout loadUser={() => Promise.resolve(null)} onLogout={noopLogout}>{null}</AppLayout>);

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));

    const toggle = (await screen.findByRole("switch", { name: "Modo oscuro" })) as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it("switches the layout texts to English from the menu and back to Spanish", async () => {
    const interaction = userEvent.setup();
    renderWithoutRouter(
      <LanguageProvider>
        <MemoryRouter>
          <AppLayout loadUser={() => Promise.resolve(null)} onLogout={noopLogout}>{null}</AppLayout>
        </MemoryRouter>
      </LanguageProvider>,
    );

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));
    await interaction.click(await screen.findByRole("button", { name: "English" }));

    expect(screen.getByRole("button", { name: "Close menu" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("en");

    await interaction.click(screen.getByRole("button", { name: "Español" }));

    expect(screen.getByRole("button", { name: "Cerrar menú" })).toBeTruthy();
    expect(document.documentElement.lang).toBe("es");
  });
});
