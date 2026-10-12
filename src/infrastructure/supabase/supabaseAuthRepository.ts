import {
  AuthApiError,
  type AuthError,
} from "@supabase/supabase-js";
import {
  AuthConnectionError,
  AuthCredentialsError,
  type AuthRepository,
} from "@/application/ports/authRepository";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

export const supabaseAuthRepository: AuthRepository = {
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw toSignInError(error);
    }
  },


  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return null;
    }

    const metadata = data.user.user_metadata;
    const name = [metadata.name, metadata.full_name].find(
      (value): value is string => typeof value === "string" && value.trim() !== "",
    );

    return {
      id: data.user.id,
      displayName: name?.trim() ?? null,
      email: data.user.email ?? null,
    };
  },

  async hasActiveSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data.session !== null;
  },
};

function toSignInError(error: AuthError): Error {
  const isRejected = error instanceof AuthApiError && error.status >= 400 && error.status < 500;

  return isRejected
    ? new AuthCredentialsError(error.message)
    : new AuthConnectionError(error.message);
}
