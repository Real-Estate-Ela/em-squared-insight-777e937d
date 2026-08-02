import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        const redirect = sessionStorage.getItem("auth_redirect");
        sessionStorage.removeItem("auth_redirect");
        if (redirect) {
          window.location.href = redirect;
        } else {
          navigate({ to: "/" });
        }
      }
    });
  }, [navigate]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Giriş yapılıyor...</p>
      </div>
    </div>
  );
}
