import { Link } from "@tanstack/react-router";
import { useAuth } from "./auth/AuthProvider";
import { useI18n } from "@/lib/i18n";
import { openCookieSettings } from "./CookieConsent";
import { signOut } from "@/lib/supabase/auth";

const linkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.75)",
  textDecoration: "none",
};

const columnStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  font: "400 11px 'Space Mono', monospace",
  letterSpacing: ".14em",
};

const headingStyle: React.CSSProperties = {
  color: "rgba(255,255,255,.35)",
  letterSpacing: ".22em",
};

export function Footer() {
  const { user, profile, loading } = useAuth();
  const { t } = useI18n();
  const isAuthed = !loading && !!user;

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <footer
      data-bg="dark"
      style={{
        background: "#0E1116",
        color: "#fff",
        padding: "clamp(52px, 7vw, 96px) clamp(16px, 4vw, 44px) 34px",
      }}
    >
      <style>{`
        .em-footer-link { transition: color 150ms ease; }
        .em-footer-link:hover { color: #1B4DFF !important; }
        .em-footer-link--contact:hover { color: #E23D28 !important; }
        .em-footer-btn-ghost { transition: border-color 150ms ease, color 150ms ease; }
        .em-footer-btn-ghost:hover { border-color: #fff; }
        .em-footer-btn-solid { transition: background 150ms ease, border-color 150ms ease; }
        .em-footer-btn-solid:hover { background: #1640d6; border-color: #1640d6; }
      `}</style>
      <div style={{ maxWidth: 1560, width: "100%", margin: "0 auto" }}>
        <div
          className="em-col-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr 1fr",
            gap: "clamp(26px, 4vw, 56px)",
            paddingBottom: "clamp(36px, 5vw, 68px)",
            borderBottom: "1px solid rgba(255,255,255,.14)",
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
                width: "fit-content",
                textDecoration: "none",
                color: "#fff",
              }}
            >
              <span
                style={{
                  width: 38,
                  height: 38,
                  border: "1px solid #fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  font: "700 16px 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                }}
              >
                em<sup style={{ fontSize: 9 }}>2</sup>
              </span>
              <span
                style={{ font: "700 22px 'Space Grotesk', sans-serif", letterSpacing: "-0.06em" }}
              >
                emlakmetric
              </span>
            </Link>
            <p
              style={{
                margin: "0 0 20px",
                maxWidth: 340,
                font: "400 12px 'Space Mono', monospace",
                lineHeight: 1.85,
                color: "rgba(255,255,255,.5)",
              }}
            >
              Gayrimenkul analiz terminali. İlan ve konum verisini metrekareye indirir. Değerleme
              veya ekspertiz hizmeti değildir.
            </p>
            {isAuthed ? (
              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  to="/profil"
                  className="em-footer-btn-ghost"
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.4)",
                    padding: "12px 18px",
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                  }}
                >
                  {(profile?.full_name ?? user?.email ?? "PROFİLİM").toUpperCase()}
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="em-footer-btn-solid"
                  style={{
                    background: "#1B4DFF",
                    color: "#fff",
                    border: "1px solid #1B4DFF",
                    padding: "12px 18px",
                    font: "700 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    cursor: "pointer",
                  }}
                >
                  ÇIKIŞ YAP
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <Link
                  to="/giris"
                  className="em-footer-btn-ghost"
                  style={{
                    background: "transparent",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.4)",
                    padding: "12px 18px",
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                  }}
                >
                  GİRİŞ YAP
                </Link>
                <Link
                  to="/kayit"
                  className="em-footer-btn-solid"
                  style={{
                    background: "#1B4DFF",
                    color: "#fff",
                    border: "1px solid #1B4DFF",
                    padding: "12px 18px",
                    font: "700 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    textDecoration: "none",
                  }}
                >
                  KAYIT OL
                </Link>
              </div>
            )}
          </div>

          {/* ÜRÜN column */}
          <div style={columnStyle}>
            <span style={headingStyle}>ÜRÜN</span>
            <Link to="/" hash="analiz" className="em-footer-link" style={linkStyle}>
              İlan analizi
            </Link>
            <Link to="/" hash="analiz" className="em-footer-link" style={linkStyle}>
              Konum sorgusu
            </Link>
            <Link to="/" hash="araclar" className="em-footer-link" style={linkStyle}>
              Karşılaştırma
            </Link>
            <Link to="/paketler" className="em-footer-link" style={linkStyle}>
              Paketler
            </Link>
          </div>

          {/* BÖLGE column */}
          <div style={columnStyle}>
            <span style={headingStyle}>BÖLGE</span>
            <Link to="/" hash="bolge" className="em-footer-link" style={linkStyle}>
              İstanbul m² fiyatları
            </Link>
            <Link to="/" hash="bolge" className="em-footer-link" style={linkStyle}>
              Ankara m² fiyatları
            </Link>
            <Link to="/" hash="bolge" className="em-footer-link" style={linkStyle}>
              İzmir m² fiyatları
            </Link>
            <Link to="/" hash="bolge" className="em-footer-link" style={linkStyle}>
              Arsa emsal analizi
            </Link>
          </div>

          {/* KURUM column */}
          <div style={columnStyle}>
            <span style={headingStyle}>KURUM</span>
            <Link to="/" hash="veri" className="em-footer-link" style={linkStyle}>
              Metodoloji
            </Link>
            <Link to="/sss" className="em-footer-link" style={linkStyle}>
              Sıkça sorulanlar
            </Link>
            <Link
              to="/iletisim"
              className="em-footer-link em-footer-link--contact"
              style={linkStyle}
            >
              İletişim
            </Link>
            <a href="mailto:info@emlakmetric.com" className="em-footer-link" style={linkStyle}>
              info@emlakmetric.com
            </a>
          </div>

          {/* YASAL column */}
          <div style={columnStyle}>
            <span style={headingStyle}>YASAL</span>
            <Link to="/gizlilik-politikasi" className="em-footer-link" style={linkStyle}>
              {t.legal.privacy}
            </Link>
            <Link to="/kullanim-kosullari" className="em-footer-link" style={linkStyle}>
              {t.legal.terms}
            </Link>
            <Link to="/cerez-politikasi" className="em-footer-link" style={linkStyle}>
              {t.legal.cookies}
            </Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className="em-footer-link"
              style={{
                ...linkStyle,
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                font: "inherit",
                letterSpacing: "inherit",
                textAlign: "left",
              }}
            >
              {t.cookie.footerSettings}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="em-stack"
          style={{
            display: "flex",
            gap: 14,
            paddingTop: 26,
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".2em",
            color: "rgba(255,255,255,.35)",
          }}
        >
          <span>HER M² BİR SAYIDIR.</span>
          <span className="em-hide" style={{ marginLeft: "auto" }}>
            © 2026 EMLAKMETRIC
          </span>
          <span className="em-hide">[0.4.12]</span>
        </div>
      </div>
    </footer>
  );
}
