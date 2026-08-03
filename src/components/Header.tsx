import { Link, useMatches } from "@tanstack/react-router";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { EmSquareMark, Wordmark } from "./Logo";
import { UserMenu, AuthButtons } from "./auth/UserMenu";
import { useI18n } from "@/lib/i18n";

const NAV_KEYS = ["home", "packages", "about", "contact"] as const;
const NAV_ROUTES = ["/", "/paketler", "/hakkimizda", "/iletisim"] as const;

function Hamburger({ open }: { open: boolean }) {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const base = "block h-0.5 w-5 rounded-full bg-current";
  const transition = reduced ? "" : "transition-all duration-300 ease-out";
  return (
    <span className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]" aria-hidden="true">
      <span className={`${base} ${transition} ${open ? "translate-y-[7px] rotate-45" : ""}`} />
      <span className={`${base} ${transition} ${open ? "scale-x-0 opacity-0" : ""}`} />
      <span className={`${base} ${transition} ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
    </span>
  );
}

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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

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

  useLayoutEffect(() => {
    positionIndicator();
  }, [activePath, positionIndicator]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const ro = new ResizeObserver(() => positionIndicator());
    ro.observe(nav);
    return () => ro.disconnect();
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

        <nav
          ref={navRef}
          className="relative hidden items-center gap-7 md:flex"
          aria-label="Ana menü"
        >
          {links.map((l) => {
            const isActive = activePath === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                aria-current={isActive ? "page" : undefined}
                className="group relative text-sm transition-all duration-200 ease-out"
                style={{
                  color: isActive
                    ? "var(--header-fg)"
                    : "color-mix(in srgb, var(--header-fg) 62%, transparent)",
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[220ms] ease-out group-hover:scale-x-100"
                />
              </Link>
            );
          })}

          <Link
            to="/"
            hash="analiz"
            className="group relative text-sm transition-all duration-200 ease-out"
            style={{
              color: "color-mix(in srgb, var(--header-fg) 62%, transparent)",
              fontWeight: 500,
            }}
          >
            {t.nav.analyse}
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-[220ms] ease-out group-hover:scale-x-100"
            />
          </Link>

          <UserMenu />

          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-1 left-0 h-0.5 w-[1px] origin-left rounded-full opacity-0"
            style={{
              backgroundColor: "var(--primary)",
              transition: "transform 250ms ease-out, opacity 250ms ease-out",
            }}
          />
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t.nav.menu}
          aria-expanded={open}
          className="flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-muted/50 md:hidden"
        >
          <Hamburger open={open} />
        </button>
      </div>

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
