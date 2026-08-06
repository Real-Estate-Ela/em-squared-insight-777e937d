import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@/lib/i18n";

const STORAGE_KEY = "emlakmetric-cookie-consent";
const EXPIRY_MS = 365.25 * 24 * 60 * 60 * 1000;

interface ConsentState {
  functional: boolean;
  analytics: boolean;
  ts: number;
}

function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (Date.now() - parsed.ts > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(state: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setLoaded(true);
  }, []);

  const accept = useCallback((state: ConsentState) => {
    saveConsent(state);
    setConsent(state);
  }, []);

  return { consent, loaded, accept };
}

export function openCookieSettings() {
  window.dispatchEvent(new CustomEvent("emlakmetric:cookie-settings"));
}

export function CookieConsent() {
  const { consent, loaded, accept } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [functional, setFunctional] = useState(true);
  const [analytics, setAnalytics] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const handler = () => {
      const current = readConsent();
      setFunctional(current?.functional ?? true);
      setAnalytics(current?.analytics ?? true);
      setShowSettings(true);
    };
    window.addEventListener("emlakmetric:cookie-settings", handler);
    return () => window.removeEventListener("emlakmetric:cookie-settings", handler);
  }, []);

  if (!loaded) return null;
  if (consent && !showSettings) return null;

  const handleAcceptAll = () => {
    accept({ functional: true, analytics: true, ts: Date.now() });
    setShowSettings(false);
  };

  const handleRejectOptional = () => {
    accept({ functional: false, analytics: false, ts: Date.now() });
    setShowSettings(false);
  };

  const handleSaveSettings = () => {
    accept({ functional, analytics, ts: Date.now() });
    setShowSettings(false);
  };

  if (showSettings) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(14,17,22,.5)",
          padding: 16,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
      >
        <div
          style={{
            background: "#FFFFFF",
            maxWidth: 480,
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto",
            border: "1px solid rgba(14,17,22,.14)",
          }}
        >
          <div style={{ padding: "24px 24px 0" }}>
            <div style={{
              font: "700 18px 'Space Grotesk', sans-serif",
              letterSpacing: "-0.04em",
              marginBottom: 6,
            }}>
              {t.cookie.settingsTitle}
            </div>
            <p style={{
              margin: "0 0 20px",
              font: "400 12px 'Space Mono', monospace",
              lineHeight: 1.7,
              color: "rgba(14,17,22,.6)",
            }}>
              {t.cookie.settingsDesc}
            </p>
          </div>

          {/* Categories */}
          {[
            { id: "required", label: t.cookie.required, desc: t.cookie.requiredDesc, checked: true, disabled: true },
            { id: "functional", label: t.cookie.functional, desc: t.cookie.functionalDesc, checked: functional, disabled: false, onChange: setFunctional },
            { id: "analytics", label: t.cookie.analytics, desc: t.cookie.analyticsDesc, checked: analytics, disabled: false, onChange: setAnalytics },
          ].map((cat) => (
            <div key={cat.id} style={{
              padding: "16px 24px",
              borderTop: "1px solid rgba(14,17,22,.1)",
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  font: "500 13px 'Space Grotesk', sans-serif",
                  marginBottom: 4,
                }}>
                  {cat.label}
                </div>
                <div style={{
                  font: "400 11px 'Space Mono', monospace",
                  lineHeight: 1.6,
                  color: "rgba(14,17,22,.55)",
                }}>
                  {cat.desc}
                </div>
              </div>
              <label style={{
                position: "relative",
                display: "inline-block",
                width: 42,
                height: 24,
                flexShrink: 0,
                marginTop: 2,
                cursor: cat.disabled ? "not-allowed" : "pointer",
                opacity: cat.disabled ? 0.5 : 1,
              }}>
                <input
                  type="checkbox"
                  checked={cat.checked}
                  disabled={cat.disabled}
                  onChange={cat.onChange ? (e) => cat.onChange!(e.target.checked) : undefined}
                  style={{ display: "none" }}
                />
                <span style={{
                  position: "absolute",
                  inset: 0,
                  background: cat.checked ? "#1B4DFF" : "rgba(14,17,22,.18)",
                  transition: "background 200ms",
                }}>
                  <span style={{
                    position: "absolute",
                    top: 3,
                    left: cat.checked ? 21 : 3,
                    width: 18,
                    height: 18,
                    background: "#fff",
                    transition: "left 200ms",
                  }} />
                </span>
              </label>
            </div>
          ))}

          <div style={{
            padding: "16px 24px 24px",
            borderTop: "1px solid rgba(14,17,22,.1)",
            display: "flex",
            gap: 10,
          }}>
            <button
              type="button"
              onClick={handleSaveSettings}
              style={{
                flex: 1,
                background: "#1B4DFF",
                color: "#fff",
                border: "1px solid #1B4DFF",
                padding: "14px 16px",
                font: "700 10px 'Space Mono', monospace",
                letterSpacing: ".18em",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              {t.cookie.save}
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              style={{
                background: "transparent",
                color: "#0E1116",
                border: "1px solid rgba(14,17,22,.28)",
                padding: "14px 16px",
                font: "400 10px 'Space Mono', monospace",
                letterSpacing: ".18em",
                cursor: "pointer",
                minHeight: 44,
              }}
            >
              {t.cookie.close}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "#0E1116",
        borderTop: "1px solid rgba(255,255,255,.14)",
        padding: "clamp(16px, 3vw, 24px) clamp(16px, 4vw, 44px)",
      }}
    >
      <div
        className="em-stack"
        style={{
          maxWidth: 1560,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "clamp(16px, 3vw, 32px)",
        }}
      >
        <p style={{
          margin: 0,
          flex: 1,
          font: "400 12px 'Space Mono', monospace",
          lineHeight: 1.7,
          color: "rgba(255,255,255,.75)",
        }}>
          {t.cookie.bannerText}{" "}
          <a
            href="/cerez-politikasi"
            style={{ color: "#1B4DFF", textDecoration: "none" }}
          >
            {t.cookie.learnMore}
          </a>
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleAcceptAll}
            style={{
              background: "#1B4DFF",
              color: "#fff",
              border: "1px solid #1B4DFF",
              padding: "12px 18px",
              font: "700 10px 'Space Mono', monospace",
              letterSpacing: ".18em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 44,
              minWidth: 44,
            }}
          >
            {t.cookie.acceptAll}
          </button>
          <button
            type="button"
            onClick={handleRejectOptional}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1px solid rgba(255,255,255,.4)",
              padding: "12px 18px",
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".18em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 44,
              minWidth: 44,
            }}
          >
            {t.cookie.requiredOnly}
          </button>
          <button
            type="button"
            onClick={() => {
              setFunctional(true);
              setAnalytics(true);
              setShowSettings(true);
            }}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,.6)",
              border: "1px solid rgba(255,255,255,.2)",
              padding: "12px 18px",
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".18em",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minHeight: 44,
              minWidth: 44,
            }}
          >
            {t.cookie.settings}
          </button>
        </div>
      </div>
    </div>
  );
}
