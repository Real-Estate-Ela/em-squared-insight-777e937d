import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric ekibine ulaşın: kurumsal paket, API entegrasyonu ve özel bölge raporu için iletişim formu.",
      },
      { property: "og:title", content: "İletişim — emlakmetric" },
      {
        property: "og:description",
        content:
          "Kurumsal paket, API entegrasyonu, toplu ilan analizi veya özel bölge raporu talebi.",
      },
    ],
  }),
  component: Iletisim,
});

const labelStyle: React.CSSProperties = {
  display: "block",
  font: "400 10px 'Space Mono', monospace",
  letterSpacing: ".2em",
  color: "rgba(14,17,22,.45)",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  border: 0,
  borderBottom: "1px solid rgba(14,17,22,.28)",
  outline: "none",
  padding: "11px 0",
  font: "400 14px 'Space Mono', monospace",
  color: "#0E1116",
};

const infoLabelStyle: React.CSSProperties = {
  font: "400 10px 'Space Mono', monospace",
  letterSpacing: ".22em",
  color: "rgba(14,17,22,.45)",
  marginBottom: 10,
};

const subjects = [
  "KURUMSAL PAKET",
  "API ENTEGRASYONU",
  "BÖLGE RAPORU",
  "DESTEK",
];

function Iletisim() {
  const [selected, setSelected] = useState<string[]>([]);
  const [sent, setSent] = useState(false);

  const toggle = (s: string) =>
    setSelected((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  if (sent) {
    return (
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(80px, 10vw, 160px)",
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              font: "700 clamp(38px, 7.5vw, 80px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.88,
              marginBottom: 24,
            }}
          >
            Mesaj iletildi<span style={{ color: "#00875A" }}>.</span>
          </div>
          <p
            style={{
              margin: 0,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.62)",
              maxWidth: 420,
            }}
          >
            Aynı iş günü içinde dönüyoruz. İlk görüşmeye örnek raporla
            geliyoruz.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div>
      <style>{`
        .em-contact-input:focus { border-bottom-color: #1B4DFF; }
        .em-contact-chip { transition: background 160ms linear, color 160ms linear; }
        .em-contact-chip:hover { background: rgba(14,17,22,.08); }
        .em-contact-send { transition: background 160ms linear, border-color 160ms linear; }
        .em-contact-send:hover { background: #0E1116; border-color: #0E1116; }
        .em-contact-link { transition: color 160ms linear; text-decoration: none; }
        .em-contact-link:hover { color: #1B4DFF !important; }
      `}</style>

      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(50px, 6vw, 90px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 20,
            }}
          >
            İLETİŞİM · İSTANBUL
          </div>
          <h1
            style={{
              margin: "0 0 clamp(26px, 4vw, 48px)",
              font: "700 clamp(38px, 7.5vw, 128px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.88,
              animation: "em-rise-in 1s both",
            }}
          >
            Sayıyı
            <br />
            konuşalım<span style={{ color: "#E23D28" }}>.</span>
          </h1>

          <div
            className="em-col-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1.25fr 1fr",
              gap: "clamp(30px, 5vw, 80px)",
              borderTop: "1px solid rgba(14,17,22,.16)",
              paddingTop: "clamp(30px, 4vw, 54px)",
            }}
          >
            {/* Form */}
            <div>
              <p
                style={{
                  margin: "0 0 clamp(26px, 3vw, 40px)",
                  maxWidth: 520,
                  font: "400 13px 'Space Mono', monospace",
                  lineHeight: 1.85,
                  color: "rgba(14,17,22,.62)",
                }}
              >
                Kurumsal paket, API entegrasyonu, toplu ilan analizi veya
                özel bölge raporu için formu doldur. Aynı iş günü içinde
                dönüyoruz; ilk görüşmeye örnek raporla geliyoruz.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
              >
                <div
                  className="em-col-1"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "22px 26px",
                    marginBottom: 22,
                  }}
                >
                  <label style={{ display: "block" }}>
                    <span style={labelStyle}>AD SOYAD</span>
                    <input
                      placeholder="Ad Soyad"
                      required
                      className="em-contact-input"
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={labelStyle}>ŞİRKET</span>
                    <input
                      placeholder="Şirket / bağımsız"
                      className="em-contact-input"
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={labelStyle}>E-POSTA</span>
                    <input
                      type="email"
                      placeholder="ad@sirket.com"
                      required
                      className="em-contact-input"
                      style={inputStyle}
                    />
                  </label>
                  <label style={{ display: "block" }}>
                    <span style={labelStyle}>TELEFON</span>
                    <input
                      placeholder="+90"
                      className="em-contact-input"
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: 22 }}>
                  <span
                    style={{
                      display: "block",
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".2em",
                      color: "rgba(14,17,22,.45)",
                      marginBottom: 10,
                    }}
                  >
                    KONU
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {subjects.map((s) => {
                      const active = selected.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggle(s)}
                          className="em-contact-chip"
                          style={{
                            background: active ? "#0E1116" : "transparent",
                            color: active ? "#fff" : "#0E1116",
                            border: "1px solid rgba(14,17,22,.28)",
                            padding: "9px 14px",
                            font: "400 11px 'Space Mono', monospace",
                            letterSpacing: ".12em",
                            cursor: "pointer",
                          }}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label style={{ display: "block", marginBottom: 26 }}>
                  <span style={labelStyle}>MESAJ</span>
                  <textarea
                    rows={4}
                    required
                    placeholder="Kaç ilan analiz etmek istiyorsun, hangi bölgede?"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "1px solid rgba(14,17,22,.28)",
                      outline: "none",
                      padding: 14,
                      font: "400 13px 'Space Mono', monospace",
                      lineHeight: 1.7,
                      color: "#0E1116",
                      resize: "vertical",
                    }}
                  />
                </label>

                <div
                  className="em-stack"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                  }}
                >
                  <button
                    type="submit"
                    className="em-contact-send"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#1B4DFF",
                      color: "#fff",
                      border: "1px solid #1B4DFF",
                      padding: "19px 30px",
                      font: "700 12px 'Space Mono', monospace",
                      letterSpacing: ".24em",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <span>GÖNDER</span>
                    <span
                      style={{
                        display: "inline-block",
                        animation:
                          "em-arrow-loop 1.6s ease-in-out infinite",
                      }}
                    >
                      →
                    </span>
                  </button>
                  <span
                    style={{
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".14em",
                      color: "rgba(14,17,22,.45)",
                      lineHeight: 1.7,
                    }}
                  >
                    KVKK kapsamında yalnızca bu talebi yanıtlamak için
                    kullanılır.
                  </span>
                </div>
              </form>
            </div>

            {/* Info panel */}
            <div>
              <div style={{ border: "1px solid rgba(14,17,22,.16)" }}>
                <div
                  style={{
                    padding: 22,
                    borderBottom: "1px solid rgba(14,17,22,.14)",
                  }}
                >
                  <div style={infoLabelStyle}>E-POSTA</div>
                  <a
                    href="mailto:merhaba@emlakmetric.com"
                    className="em-contact-link"
                    style={{
                      font: "500 clamp(16px, 1.6vw, 21px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.04em",
                      color: "#1B4DFF",
                    }}
                  >
                    merhaba@emlakmetric.com
                  </a>
                </div>
                <div
                  style={{
                    padding: 22,
                    borderBottom: "1px solid rgba(14,17,22,.14)",
                  }}
                >
                  <div style={infoLabelStyle}>TELEFON</div>
                  <a
                    href="tel:+902125550142"
                    className="em-contact-link"
                    style={{
                      font: "500 clamp(16px, 1.6vw, 21px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.04em",
                      color: "#0E1116",
                    }}
                  >
                    +90 212 555 01 42
                  </a>
                </div>
                <div
                  style={{
                    padding: 22,
                    borderBottom: "1px solid rgba(14,17,22,.14)",
                  }}
                >
                  <div style={infoLabelStyle}>OFİS</div>
                  <p
                    style={{
                      margin: 0,
                      font: "400 12px 'Space Mono', monospace",
                      lineHeight: 1.8,
                      color: "rgba(14,17,22,.7)",
                    }}
                  >
                    Kolektif House Levent
                    <br />
                    Esentepe, Şişli / İstanbul
                  </p>
                </div>
                <div style={{ padding: 22 }}>
                  <div style={infoLabelStyle}>ÇALIŞMA SAATLERİ</div>
                  <p
                    style={{
                      margin: 0,
                      font: "400 12px 'Space Mono', monospace",
                      lineHeight: 1.8,
                      color: "rgba(14,17,22,.7)",
                    }}
                  >
                    Hafta içi 09:00 – 18:30
                    <br />
                    <span style={{ color: "#E23D28" }}>
                      Hafta sonu yalnızca e-posta
                    </span>
                  </p>
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  border: "1px solid rgba(14,17,22,.16)",
                  borderTop: 0,
                  background: "rgba(14,17,22,.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    color: "rgba(14,17,22,.3)",
                  }}
                >
                  HARİTA / OFİS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
