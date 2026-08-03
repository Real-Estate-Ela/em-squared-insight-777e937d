import { Link, useMatches } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { EmSquareMark, Wordmark } from "./Logo";
import { UserMenu, AuthButtons } from "./auth/UserMenu";
import { useI18n } from "@/lib/i18n";

const NAV_KEYS = ["home", "packages", "about", "contact"] as const;
const NAV_ROUTES = ["/", "/paketler", "/hakkimizda", "/iletisim"] as const;

export function Header() {
  const { t } = useI18n();
  const matches = useMatches();
  const activePath = matches[matches.length - 1]?.fullPath ?? "/";

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [headerTheme, setHeaderTheme] = useState<"light" | "dark">("light");

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // --- scroll shadow + progress ---
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- lock body scroll when mobile menu open ---
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // --- IntersectionObserver for data-header sections ---
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const headerHeight = header.offsetHeight;

    const sections = document.querySelectorAll<HTMLElement>("[data-header]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const theme = (entry.target as HTMLElement).dataset.header as "light" | "dark";
            if (theme) setHeaderTheme(theme);
          }
        }
      },
      {
        rootMargin: `-${headerHeight}px 0px -${window.innerHeight - headerHeight - 1}px 0px`,
        threshold: 0,
      },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // --- active link indicator (desktop) ---
  const positionIndicator = useCallback(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const activeLink = nav.querySelector<HTMLAnchorElement>("[aria-current='page']");
    if (!activeLink) {
      indicator.style.opacity = "0";
      return;
    }
    const navRect = nav.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    indicator.style.transform = `translateX(${left}px) scaleX(${linkRect.width})`;
    indicator.style.opacity = "1";
  }, []);

  useEffect(() => {
    positionIndicator();
  }, [activePath, positionIndicator]);

  useEffect(() => {
    window.addEventListener("resize", positionIndicator);
    return () => window.removeEventListener("resize", positionIndicator);
  }, [positionIndicator]);

  const isDark = headerTheme === "dark";

  const links = NAV_KEYS.map((key, i) => ({
    to: NAV_ROUTES[i],
    label: t.nav[key],
  }));

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50"
      style={{
        ["--header-fg" as string]: isDark
          ? "rgba(255,255,255,.92)"
          : "var(--foreground)",
        backgroundColor: "color-mix(in srgb, var(--background) 72%, transparent)",
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        boxShadow: scrolled
          ? "0 1px 2px rgba(14,17,22,.04), 0 8px 24px rgba(14,17,22,.04)"
          : "none",
        transition: "box-shadow 350ms ease-out, color 400ms ease-out",
        color: "var(--header-fg)",
      }}
    >
      {/* reading progress bar */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left"
        style={{
          backgroundColor: "var(--primary)",
          transform: `scaleX(${scrollProgress})`,
          transition: "transform 80ms linear",
        }}
      />

      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <EmSquareMark className="h-8 w-8 text-[1.1rem]" />
          <Wordmark className="truncate text-xl md:text-2xl" />
        </Link>

        {/* desktop nav */}
        <nav
          ref={navRef}
          className="relative hidden items-center gap-7 md:flex"
          aria-label="Ana menü"
        >
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "!opacity-100" }}
              aria-current={activePath === l.to ? "page" : undefined}
              className="text-sm font-medium opacity-70 transition-opacity duration-200 ease-out hover:opacity-100"
              style={{ color: "var(--header-fg)" }}
            >
              {l.label}
            </Link>
          ))}

          <Link
            to="/"
            hash="analiz"
            className="text-sm font-medium opacity-70 transition-opacity duration-200 ease-out hover:opacity-100"
            style={{ color: "var(--header-fg)" }}
          >
            {t.nav.analyse}
          </Link>

          <UserMenu />

          {/* active indicator */}
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-[1px] origin-left rounded-full bg-current opacity-0"
            style={{
              transition: "transform 250ms ease-out, opacity 250ms ease-out",
            }}
          />
        </nav>

        {/* mobile hamburger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t.nav.menu}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-muted/50 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* mobile panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 top-[var(--header-h,56px)] bg-black/20 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed inset-x-0 top-[var(--header-h,56px)] z-50 max-h-[calc(100dvh-var(--header-h,56px))] overflow-y-auto border-t border-border/40 md:hidden"
            style={{
              backgroundColor: "color-mix(in srgb, var(--background) 92%, transparent)",
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            }}
            aria-label="Mobil menü"
          >
            <div className="mx-auto max-w-6xl px-5 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  aria-current={activePath === l.to ? "page" : undefined}
                  className="block rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/"
                hash="analiz"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t.nav.analyse}
              </Link>

              <div className="mt-3 border-t border-border/40 pt-3">
                <AuthButtons variant="stack" />
              </div>

              <div className="mt-3 flex justify-center pb-2">
                <UserMenu />
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
