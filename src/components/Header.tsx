import { Link, useMatches } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./auth/AuthProvider";
import { signOut } from "@/lib/supabase/auth";

type Theme = "light" | "dark" | "blue";

export function Header() {
  const matches = useMatches();
  const activePath = matches[matches.length - 1]?.fullPath ?? "/";
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !authLoading && !!user;

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  const detectTheme = useCallback(() => {
    const stack = document.elementsFromPoint(
      Math.round(window.innerWidth * 0.5),
      54,
    );
    for (const el of stack) {
      const sec = el.closest?.("[data-bg]");
      if (sec) {
        setTheme(sec.getAttribute("data-bg") as Theme);
        return;
      }
    }
    document.querySelectorAll<HTMLElement>("[data-bg]").forEach((s) => {
      const b = s.getBoundingClientRect();
      if (b.top <= 54 && b.bottom > 54)
        setTheme(s.getAttribute("data-bg") as Theme);
    });
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      detectTheme();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [detectTheme]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isDark = theme === "dark";
  const isBlue = theme === "blue";
  const fg = isBlue || isDark ? "#FFFFFF" : "#0E1116";
  const bg = isBlue
    ? `rgba(27,77,255,${scrolled ? ".5" : ".3"})`
    : isDark
      ? `rgba(14,17,22,${scrolled ? ".45" : ".28"})`
      : `rgba(255,255,255,${scrolled ? ".6" : ".4"})`;

  const navLinks = [
    { href: "#analiz", label: "ANALİZ", to: "/" as const, hash: "analiz" },
    { href: "#veri", label: "VERİ", to: "/" as const, hash: "veri" },
    { href: "#bolge", label: "BÖLGE", to: "/" as const, hash: "bolge" },
    { href: "#paketler", label: "PAKETLER", to: "/paketler" as const, hash: undefined },
    { href: "#iletisim", label: "İLETİŞİM", to: "/iletisim" as const, hash: undefined },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 90,
          color: fg,
          transition:
            "color 240ms linear, padding 240ms linear",
          padding: `${scrolled ? "10px" : "17px"} clamp(16px, 4vw, 44px)`,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: bg,
            backdropFilter: "blur(20px) saturate(130%)",
            WebkitBackdropFilter: "blur(20px) saturate(130%)",
            maskImage:
              "linear-gradient(180deg, #000 62%, rgba(0,0,0,.45) 86%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(180deg, #000 62%, rgba(0,0,0,.45) 86%, transparent 100%)",
            transition: "background 240ms linear",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              width: 30,
              height: 30,
              border: "1px solid currentColor",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "700 13px 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
            }}
          >
            em
            <sup style={{ fontSize: 8, marginLeft: 1 }}>2</sup>
          </span>
          <span
            style={{
              font: "700 18px 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
            }}
          >
            emlakmetric
          </span>
        </Link>

        <nav
          className="em-hide"
          style={{
            display: "flex",
            gap: 24,
            marginLeft: "auto",
            font: "400 11px 'Space Mono', monospace",
            letterSpacing: ".18em",
          }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              hash={l.hash}
              style={{
                color: "inherit",
                opacity: activePath === l.to && !l.hash ? 1 : 0.7,
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div
          className="em-hide"
          style={{ display: "flex", alignItems: "center", gap: 10 }}
        >
          {isAuthed ? (
            <>
              <Link
                to="/panel"
                style={{
                  background: "#1B4DFF",
                  color: "#fff",
                  border: "1px solid #1B4DFF",
                  padding: "10px 18px",
                  font: "700 11px 'Space Mono', monospace",
                  letterSpacing: ".18em",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "background 160ms linear, color 160ms linear",
                }}
              >
                PANELİM
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  window.location.href = "/";
                }}
                style={{
                  background: "transparent",
                  color: "inherit",
                  border: "1px solid currentColor",
                  padding: "10px 18px",
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".18em",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "background 160ms linear, color 160ms linear",
                }}
              >
                ÇIKIŞ
              </button>
            </>
          ) : (
            <>
              <Link
                to="/giris"
                style={{
                  background: "transparent",
                  color: "inherit",
                  border: "1px solid currentColor",
                  padding: "10px 18px",
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".18em",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "background 160ms linear, color 160ms linear",
                }}
              >
                GİRİŞ YAP
              </Link>
              <Link
                to="/kayit"
                style={{
                  background: "#1B4DFF",
                  color: "#fff",
                  border: "1px solid #1B4DFF",
                  padding: "10px 18px",
                  font: "700 11px 'Space Mono', monospace",
                  letterSpacing: ".18em",
                  whiteSpace: "nowrap",
                  textDecoration: "none",
                  transition: "background 160ms linear, color 160ms linear",
                }}
              >
                KAYIT OL
              </Link>
            </>
          )}
        </div>

        <button
          className="em-show"
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "none",
            marginLeft: "auto",
            background: "transparent",
            border: "1px solid currentColor",
            color: "inherit",
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
            font: "400 13px 'Space Mono', monospace",
            cursor: "pointer",
          }}
        >
          {open ? "✕" : "≡"}
        </button>
      </header>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 95,
            background: "#0E1116",
            color: "#fff",
            padding: "92px 24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            animation: "em-fade-in 200ms both",
          }}
        >
          {["Analiz", "Veri", "Bölge", "Paketler", "İletişim"].map(
            (label, i) => {
              const tos = ["/", "/", "/", "/paketler", "/iletisim"] as const;
              const hashes = ["analiz", "veri", "bolge", undefined, undefined];
              return (
                <Link
                  key={label}
                  to={tos[i]}
                  hash={hashes[i]}
                  onClick={() => setOpen(false)}
                  style={{
                    color: i === 4 ? "#1B4DFF" : "#fff",
                    font: "500 30px 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.05em",
                    padding: "13px 0",
                    borderBottom: "1px solid rgba(255,255,255,.12)",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              );
            },
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            {isAuthed ? (
              <>
                <Link
                  to="/panel"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    background: "#1B4DFF",
                    color: "#fff",
                    border: "1px solid #1B4DFF",
                    padding: 16,
                    font: "700 11px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  PANELİM
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    setOpen(false);
                    await signOut();
                    window.location.href = "/";
                  }}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.4)",
                    padding: 16,
                    font: "400 11px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                >
                  ÇIKIŞ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/giris"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.4)",
                    padding: 16,
                    font: "400 11px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  GİRİŞ YAP
                </Link>
                <Link
                  to="/kayit"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    background: "#1B4DFF",
                    color: "#fff",
                    border: "1px solid #1B4DFF",
                    padding: 16,
                    font: "700 11px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  KAYIT OL
                </Link>
              </>
            )}
          </div>
          <span
            style={{
              marginTop: "auto",
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".24em",
              color: "rgba(255,255,255,.4)",
            }}
          >
            HER M² BİR SAYIDIR.
          </span>
        </div>
      )}
    </>
  );
}
