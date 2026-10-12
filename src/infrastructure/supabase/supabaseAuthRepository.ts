import type { AuthRepository } from "@/application/ports/authRepository";
import { supabase } from "@/infrastructure/supabase/supabaseClient";

export const supabaseAuthRepository: AuthRepository = {
  async signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw error;
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

    return {
      id: data.user.id,
      displayName: null,
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
