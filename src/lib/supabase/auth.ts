import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./client";
import type { UserProfile } from "./types";

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithGoogle() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/sifre-yenile`,
  });
  return { data, error };
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data as UserProfile;
}
