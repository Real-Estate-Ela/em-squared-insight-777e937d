export type UserRole = "admin" | "premium" | "user";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  terms_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}
