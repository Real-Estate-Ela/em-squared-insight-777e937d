import { Link, useMatches } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Globe } from "lucide-react";
import { EmSquareMark, Wordmark } from "./Logo";
import { useI18n, type Locale } from "@/lib/i18n";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { to: "/", label: t("nav.home") },
    { to: "/hakkimizda", label: t("nav.about") },
    { to: "/iletisim", label: t("nav.contact") },
  ] as const;

  const isActive = (to: string) => {
    if (to === "/") return currentPath === "/";
    return currentPath.startsWith(to);
  };

  const toggleLocale = () => setLocale(locale === "tr" ? "en" : "tr");

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        backgroundColor: scrolled
          ? "color-mix(in oklab, var(--background) 85%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.6)" : "none",
        boxShadow: scrolled ? "0 4px 30px oklch(0 0 0 / 3%)" : "none",
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <EmSquareMark className="h-8 w-8 text-[1.1rem]" />
          <Wordmark className="truncate text-xl md:text-2xl" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`relative text-sm transition-colors duration-200 ${
                isActive(l.to)
                  ? "font-semibold text-foreground"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              {l.label}
              {isActive(l.to) && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          <Link
            to="/"
            hash="analiz"
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-all duration-200 hover:opacity-90"
          >
            {t("nav.analyze")}
          </Link>

          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-lg border border-border/60 px-3 py-2 text-xs font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
            aria-label={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
          >
            <Globe className="h-3.5 w-3.5" />
            {locale === "tr" ? "EN" : "TR"}
          </button>
        </nav>

        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-1 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground/70"
            aria-label={locale === "tr" ? "Switch to English" : "Türkçe'ye geç"}
          >
            <Globe className="h-3.5 w-3.5" />
            {locale === "tr" ? "EN" : "TR"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="px-2 pb-4 pt-1 md:hidden"
          style={{
            backgroundColor: "color-mix(in oklab, var(--background) 95%, transparent)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-4 py-3 text-sm transition-colors ${
                isActive(l.to)
                  ? "font-semibold text-foreground bg-muted/50"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="analiz"
            onClick={() => setOpen(false)}
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background"
          >
            {t("nav.analyze")}
          </Link>
        </nav>
      )}
    </header>
  );
}
