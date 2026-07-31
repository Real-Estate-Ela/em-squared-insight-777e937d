import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getUserProfile } from "@/lib/supabase/auth";
import type { UserProfile } from "@/lib/supabase/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  session: null,
  loading: false,
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    try {
      const p = await getUserProfile(user.id);
      setProfile(p);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        const { data: { session: s } } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          getUserProfile(s.user.id).then((p) => !cancelled && setProfile(p)).catch(() => {});
        }
        setLoading(false);

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
          if (cancelled) return;
          setSession(s);
          setUser(s?.user ?? null);
          if (s?.user) {
            getUserProfile(s.user.id).then((p) => !cancelled && setProfile(p)).catch(() => {});
          } else {
            setProfile(null);
          }
          setLoading(false);
        });

        return () => subscription.unsubscribe();
      } catch {
        if (!cancelled) setLoading(false);
      }
    };

    const cleanup = init();
    const timeout = setTimeout(() => { if (!cancelled) setLoading(false); }, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      cleanup?.then((unsub) => unsub?.());
    };
  }, []);

  return (
    <AuthContext value={{ user, profile, session, loading, refreshProfile }}>
      {children}
    </AuthContext>
  );
}
