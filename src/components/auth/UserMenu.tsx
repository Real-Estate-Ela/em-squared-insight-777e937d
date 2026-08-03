import { Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { LogOut, User, Crown, Shield } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { signOut } from "@/lib/supabase/auth";
import { useI18n } from "@/lib/i18n";

export function AuthButtons({ variant = "row" }: { variant?: "row" | "stack" }) {
  const { t } = useI18n();
  const isStack = variant === "stack";
  return (
    <div className={isStack ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      <Link
        to="/giris"
        className={`text-sm font-medium text-[var(--header-fg,var(--muted-foreground))] transition-colors hover:opacity-80 ${isStack ? "block rounded-lg px-4 py-3 hover:bg-muted" : "rounded-lg px-4 py-2"}`}
      >
        {t.nav.signIn}
      </Link>
      <MagneticSignUp label={t.nav.signUp} className={isStack ? "w-full text-center" : ""} />
    </div>
  );
}

function MagneticSignUp({ label, className = "" }: { label: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarse || reducedMotion) return;

    const link = el.querySelector("a");

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const threshold = 40;
      if (dist < threshold) {
        const pull = (1 - dist / threshold) * 8;
        const angle = Math.atan2(dy, dx);
        el.style.transform = `translate(${Math.cos(angle) * pull}px, ${Math.sin(angle) * pull}px)`;
      } else {
        el.style.transform = "";
      }
    };
    const onLeave = () => { el.style.transform = ""; };

    const onLinkMove = (e: MouseEvent) => {
      if (!link) return;
      const rect = link.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      link.style.setProperty("--mx", `${mx}px`);
      link.style.setProperty("--my", `${my}px`);
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    el.addEventListener("mouseleave", onLeave);
    if (link) link.addEventListener("mousemove", onLinkMove, { passive: true });

    return () => {
      document.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (link) link.removeEventListener("mousemove", onLinkMove);
    };
  }, []);

  return (
    <span ref={ref} className="inline-block" style={{ willChange: "transform", transition: "transform 200ms ease-out" }}>
      <Link
        to="/kayit"
        className={`magnetic-cta inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 ${className}`}
      >
        {label}
      </Link>
    </span>
  );
}

export function UserMenu() {
  const { user, profile, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return <AuthButtons />;
  }

  if (!user) {
    return <AuthButtons />;
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() ?? "U";

  const roleIcon =
    profile?.role === "admin" ? (
      <Shield className="h-3.5 w-3.5 text-destructive" />
    ) : profile?.role === "premium" ? (
      <Crown className="h-3.5 w-3.5 text-chart-4" />
    ) : null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        aria-label="Kullanıcı menüsü"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div className="glass absolute right-0 top-full mt-2 w-56 rounded-xl p-1.5 shadow-xl">
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-foreground">
                {profile?.full_name ?? "Kullanıcı"}
              </p>
              {roleIcon}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/profil"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              Profilim
            </Link>
          </div>

          <div className="border-t border-border pt-1">
            <button
              type="button"
              onClick={async () => {
                await signOut();
                setOpen(false);
                window.location.href = "/";
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
