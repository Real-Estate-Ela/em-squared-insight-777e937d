import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { EmSquareMark, Wordmark } from "./Logo";

const links = [
  { to: "/", label: "Ana Sayfa" },
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/iletisim", label: "İletişim" },
  { to: "/gorseller", label: "Görseller" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "color-mix(in oklab, var(--background) 85%, transparent)"
          : "var(--background)",
        backdropFilter: scrolled ? "blur(16px) saturate(1.5)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px) saturate(1.5)" : "none",
        boxShadow: scrolled ? "0 1px 0 var(--border), 0 4px 20px oklch(0 0 0 / 4%)" : "none",
        borderBottom: scrolled ? "none" : "2px solid var(--risk)",
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <EmSquareMark className="h-8 w-8 text-[1.1rem]" />
          <Wordmark className="truncate text-xl md:text-2xl" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="analiz"
            className="group flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: "var(--risk)", boxShadow: "0 4px 14px color-mix(in oklab, var(--risk) 30%, transparent)" }}
          >
            Analiz Et
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
          className="rounded-lg p-2 transition-colors hover:bg-muted md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border px-2 pb-3 pt-1 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="analiz"
            onClick={() => setOpen(false)}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--risk)" }}
          >
            Analiz Et
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </header>
  );
}
