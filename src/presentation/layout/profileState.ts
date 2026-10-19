import type { AuthenticatedUser } from "@/application/ports/authRepository";

export type ProfileState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "success"; name: string; email: string | null; initials: string };

export function toProfileState(user: AuthenticatedUser | null): ProfileState {
  const name = user?.displayName ?? user?.email;

  if (!name) {
    return { status: "unavailable" };
  }

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return { status: "success", name, email: user?.email ?? null, initials };
}
