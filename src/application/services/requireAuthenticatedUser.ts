import type { AuthRepository } from "@/application/ports/authRepository";

export async function requireAuthenticatedUser(authRepository: AuthRepository) {
  const user = await authRepository.getCurrentUser();

  if (!user) {
    throw new Error("Authenticated user required");
  }

  return user;
}
