import type { AuthRepository } from "@/application/ports/authRepository";

export class AuthService {
  private readonly authRepository: AuthRepository;

  constructor(authRepository: AuthRepository) {
    this.authRepository = authRepository;
  }

  signIn(email: string, password: string): Promise<void> {
    return this.authRepository.signIn(email, password);
  }

  signOut(): Promise<void> {
    return this.authRepository.signOut();
  }

  getCurrentUser() {
    return this.authRepository.getCurrentUser();
  }

  hasActiveSession(): Promise<boolean> {
    return this.authRepository.hasActiveSession();
  }
}