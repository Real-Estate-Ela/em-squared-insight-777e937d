import { useAuth } from "./AuthProvider";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import type { UserRole } from "@/lib/supabase/types";

interface AuthGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate({ to: "/giris", search: { redirect: undefined } });
      return;
    }

    if (requiredRole && profile) {
      const roleHierarchy: Record<UserRole, number> = {
        user: 0,
        premium: 1,
        admin: 2,
      };
      if (roleHierarchy[profile.role] < roleHierarchy[requiredRole]) {
        navigate({ to: "/" });
      }
    }
  }, [user, profile, loading, requiredRole, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
