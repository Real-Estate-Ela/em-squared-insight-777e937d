import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
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
      className="sticky top-0 z-50 border-b border-border transition-all duration-300"
      style={{
        backgroundColor: scrolled
          ? "color-mix(in oklab, var(--background) 88%, transparent)"
          : "var(--background)",
        backdropFilter: scrolled ? "blur(12px) saturate(1.4)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px) saturate(1.4)" : "none",
      }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 md:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <EmSquareMark className="h-7 w-7 text-[1rem]" />
          <Wordmark className="truncate text-xl md:text-2xl" />
          <span className="ml-1 flex items-center gap-1.5 rounded-none border border-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-positive">
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            beta
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-foreground border-primary" }}
              className="border-b-2 border-transparent pb-0.5 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="analiz"
            className="btn-tactile btn-tactile-primary px-4 py-2.5"
          >
            İlan Analiz Et
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
          className="md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border px-5 py-3 text-xs uppercase tracking-[0.14em] text-muted-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="analiz"
            onClick={() => setOpen(false)}
            className="btn-tactile btn-tactile-primary m-4 w-[calc(100%-2rem)]"
          >
            İlan Analiz Et
          </Link>
        </nav>
      )}
    </header>
  );
}
