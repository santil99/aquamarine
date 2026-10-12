export interface AuthenticatedUser {
  id: string;
  displayName: string | null;
  email: string | null;
}

export interface AuthRepository {
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<AuthenticatedUser | null>;
  hasActiveSession(): Promise<boolean>;
}