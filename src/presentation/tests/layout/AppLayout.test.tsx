import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AuthenticatedUser } from "@/application/ports/authRepository";
import { AppLayout } from "@/presentation/layout/AppLayout";

const authenticatedUser: AuthenticatedUser = {
  id: "user-1",
  displayName: "Santiago",
  email: "santi@example.com",
};

const noopLogout = () => Promise.resolve();

describe("AppLayout", () => {
  afterEach(cleanup);

  it("shows the authenticated profile and the mock options in the menu", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(authenticatedUser)} onLogout={noopLogout}>
        <p>Contenido</p>
      </AppLayout>,
    );

    expect(screen.getByRole("heading", { name: "Mi negocio" })).toBeTruthy();
    expect(screen.getByText("Contenido")).toBeTruthy();

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByText("Santiago")).toBeTruthy();
    expect(screen.getByText("santi@example.com")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pantalla 1" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pantalla 2" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Pantalla 3" })).toBeTruthy();
  });

  it("shows a localized fallback in the menu when there is no user", async () => {
    const interaction = userEvent.setup();
    render(<AppLayout loadUser={() => Promise.resolve(null)} onLogout={noopLogout}>{null}</AppLayout>);

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));

    expect(await screen.findByText("Perfil no disponible")).toBeTruthy();
  });

  it("closes the menu when an option is selected", async () => {
    const interaction = userEvent.setup();
    render(
      <AppLayout loadUser={() => Promise.resolve(authenticatedUser)} onLogout={noopLogout}>{null}</AppLayout>,
    );

    await interaction.click(screen.getByRole("button", { name: "Abrir menú" }));
    await interaction.click(await screen.findByRole("button", { name: "Pantalla 2" }));

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
});
