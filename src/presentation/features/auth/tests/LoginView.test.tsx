import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthConnectionError, AuthCredentialsError } from "@/application/ports/authRepository";
import { LoginView } from "@/presentation/features/auth/views/LoginView";

describe("LoginView", () => {
  afterEach(cleanup);

  it("shows field errors and does not sign in when the fields are invalid", async () => {
    const interaction = userEvent.setup();
    const signIn = vi.fn(() => Promise.resolve());
    render(<LoginView signIn={signIn} onSignedIn={vi.fn()} />);

    await interaction.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Ingresa el email de tu cuenta.")).toBeTruthy();
    expect(screen.getByText("Ingresa tu contraseña.")).toBeTruthy();

    await interaction.type(screen.getByLabelText("Usuario o email"), "no-es-email");
    await interaction.click(screen.getByRole("button", { name: "Ingresar" }));

    expect(await screen.findByText("Ingresa un email válido, por ejemplo nombre@dominio.com.")).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
  });

  it("shows a credentials error and allows retrying when the login is rejected", async () => {
    const interaction = userEvent.setup();
    const signIn = vi.fn(() => Promise.reject(new AuthCredentialsError("invalid")));
    const onSignedIn = vi.fn();
    render(<LoginView signIn={signIn} onSignedIn={onSignedIn} />);

    await interaction.type(screen.getByLabelText("Usuario o email"), "santi@example.com");
    await interaction.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await interaction.click(screen.getByRole("button", { name: "Ingresar" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "El email o la contraseña no son correctos. Revísalos e intenta de nuevo.",
    );
    expect((screen.getByRole("button", { name: "Ingresar" }) as HTMLButtonElement).disabled).toBe(false);
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it("shows a connection error when the service cannot be reached", async () => {
    const interaction = userEvent.setup();
    const signIn = vi.fn(() => Promise.reject(new AuthConnectionError("network")));
    render(<LoginView signIn={signIn} onSignedIn={vi.fn()} />);

    await interaction.type(screen.getByLabelText("Usuario o email"), "santi@example.com");
    await interaction.type(screen.getByLabelText("Contraseña"), "clave");
    await interaction.click(screen.getByRole("button", { name: "Ingresar" }));

    expect((await screen.findByRole("alert")).textContent).toBe(
      "No pudimos conectarnos. Revisa tu conexión y reintenta.",
    );
  });

  it("disables the submit button while signing in and notifies on success", async () => {
    const interaction = userEvent.setup();
    let resolveSignIn: () => void = () => {};
    const signIn = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSignIn = resolve;
        }),
    );
    const onSignedIn = vi.fn();
    render(<LoginView signIn={signIn} onSignedIn={onSignedIn} />);

    await interaction.type(screen.getByLabelText("Usuario o email"), "santi@example.com");
    await interaction.type(screen.getByLabelText("Contraseña"), "clave");
    await interaction.click(screen.getByRole("button", { name: "Ingresar" }));

    expect((screen.getByRole("button", { name: "Ingresando..." }) as HTMLButtonElement).disabled).toBe(true);

    resolveSignIn();

    await vi.waitFor(() => expect(onSignedIn).toHaveBeenCalledTimes(1));
    expect(signIn).toHaveBeenCalledWith("santi@example.com", "clave");
  });
});
