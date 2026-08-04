import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Paketler — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric analiz paketleri: Başlangıç (ücretsiz), Analist (₺349/ay) ve Kurumsal (₺1.490/ay). Yıllık ödemede iki ay ücretsiz.",
      },
      { property: "og:title", content: "Paketler — emlakmetric" },
      {
        property: "og:description",
        content:
          "Analiz başına ödeme yok. Aylık analiz hakkına göre üç paket.",
      },
    ],
  }),
  component: Paketler,
});

const featureFont: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  font: "400 12px 'Space Mono', monospace",
  lineHeight: 1.6,
  borderTop: "1px solid rgba(14,17,22,.14)",
  paddingTop: 22,
};

const featureFontDark: React.CSSProperties = {
  ...featureFont,
  color: "rgba(255,255,255,.78)",
  borderTopColor: "rgba(255,255,255,.16)",
};

const tableRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
  borderBottom: "1px solid rgba(14,17,22,.1)",
  font: "400 12px 'Space Mono', monospace",
};

function Paketler() {
  return (
    <div>
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(40px, 5vw, 70px)",
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
            PAKETLER · AYLIK
          </div>
          <h1
            style={{
              margin: "0 0 clamp(20px, 3vw, 36px)",
              font: "700 clamp(38px, 7.5vw, 128px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.88,
              animation: "em-rise-in 1s both",
            }}
          >
            Analiz başına
            <br />
            ödeme yok<span style={{ color: "#E23D28" }}>.</span>
          </h1>
          <p
            style={{
              margin: "0 0 clamp(30px, 4vw, 54px)",
              maxWidth: 620,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.62)",
            }}
          >
            Aylık analiz hakkına göre üç paket. Yıllık ödemede iki ay
            ücretsiz. Kurumsal pakette API ve toplu ilan yükleme açılır.
          </p>

          <style>{`
            .em-plan-btn { transition: background 160ms linear, color 160ms linear, border-color 160ms linear; }
            .em-plan-btn--ghost:hover { background: #0E1116; color: #fff; }
            .em-plan-btn--blue:hover { background: #E23D28; border-color: #E23D28; }
            .em-plan-btn--outline:hover { background: #E23D28; color: #fff; border-color: #E23D28; }
          `}</style>

          <div
            className="em-col-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "rgba(14,17,22,.16)",
              border: "1px solid rgba(14,17,22,.16)",
            }}
          >
            {/* BAŞLANGIÇ */}
            <div
              style={{
                background: "#fff",
                padding: "clamp(24px, 3vw, 40px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".22em",
                  color: "rgba(14,17,22,.45)",
                }}
              >
                01 · BAŞLANGIÇ
              </div>
              <div
                style={{
                  margin: "26px 0 6px",
                  font: "700 clamp(38px, 4vw, 62px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                }}
              >
                ₺0
              </div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".16em",
                  color: "rgba(14,17,22,.45)",
                  marginBottom: 28,
                }}
              >
                SÜRESİZ ÜCRETSİZ
              </div>
              <div style={{ ...featureFont, color: "rgba(14,17,22,.7)" }}>
                <span>+ 5 ilan analizi / ay</span>
                <span>+ mahalle medyanı karşılaştırması</span>
                <span>+ 12 aylık m² trendi</span>
                <span style={{ color: "#E23D28" }}>− portföy takibi yok</span>
                <span style={{ color: "#E23D28" }}>
                  − PDF bölge raporu yok
                </span>
              </div>
              <Link
                to="/kayit"
                className="em-plan-btn em-plan-btn--ghost"
                style={{
                  marginTop: 34,
                  width: "100%",
                  background: "transparent",
                  color: "#0E1116",
                  border: "1px solid #0E1116",
                  padding: 17,
                  font: "700 11px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                ÜCRETSİZ BAŞLA
              </Link>
            </div>

            {/* ANALİST */}
            <div
              style={{
                background: "#0E1116",
                color: "#fff",
                padding: "clamp(24px, 3vw, 40px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".22em",
                    color: "rgba(255,255,255,.5)",
                  }}
                >
                  02 · ANALİST
                </span>
                <span
                  style={{
                    background: "#1B4DFF",
                    color: "#fff",
                    font: "700 9px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    padding: "5px 8px",
                    whiteSpace: "nowrap",
                  }}
                >
                  EN ÇOK SEÇİLEN
                </span>
              </div>
              <div
                style={{
                  margin: "26px 0 6px",
                  font: "700 clamp(38px, 4vw, 62px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                }}
              >
                ₺349
              </div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".16em",
                  color: "rgba(255,255,255,.5)",
                  marginBottom: 28,
                }}
              >
                AY / KDV DAHİL
              </div>
              <div style={featureFontDark}>
                <span>+ 250 ilan analizi / ay</span>
                <span>+ sınırsız konum sorgusu</span>
                <span>+ ilan karşılaştırma</span>
                <span>+ 50 ilanlık portföy takibi</span>
                <span>+ PDF bölge raporu</span>
                <span style={{ color: "#E23D28" }}>− API erişimi yok</span>
              </div>
              <Link
                to="/kayit"
                className="em-plan-btn em-plan-btn--blue"
                style={{
                  marginTop: 34,
                  width: "100%",
                  background: "#1B4DFF",
                  color: "#fff",
                  border: "1px solid #1B4DFF",
                  padding: 17,
                  font: "700 11px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                14 GÜN DENE
              </Link>
            </div>

            {/* KURUMSAL */}
            <div
              style={{
                background: "#fff",
                padding: "clamp(24px, 3vw, 40px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".22em",
                  color: "rgba(14,17,22,.45)",
                }}
              >
                03 · KURUMSAL
              </div>
              <div
                style={{
                  margin: "26px 0 6px",
                  font: "700 clamp(38px, 4vw, 62px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                }}
              >
                ₺1.490
              </div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".16em",
                  color: "rgba(14,17,22,.45)",
                  marginBottom: 28,
                }}
              >
                AY / 10 KULLANICI
              </div>
              <div style={{ ...featureFont, color: "rgba(14,17,22,.7)" }}>
                <span>+ sınırsız analiz</span>
                <span>+ API erişimi · 10.000 çağrı / ay</span>
                <span>+ CSV ile toplu ilan yükleme</span>
                <span>+ özel bölge raporu</span>
                <span>+ hesap yöneticisi</span>
                <span>+ tek oturum (SSO)</span>
              </div>
              <Link
                to="/iletisim"
                className="em-plan-btn em-plan-btn--outline"
                style={{
                  marginTop: 34,
                  width: "100%",
                  background: "transparent",
                  color: "#0E1116",
                  border: "1px solid #0E1116",
                  padding: 17,
                  font: "700 11px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  cursor: "pointer",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                TEKLİF İSTE
              </Link>
            </div>
          </div>

          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 16,
              marginTop: 16,
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".16em",
              color: "rgba(14,17,22,.45)",
            }}
          >
            <span>YILLIK ÖDEMEDE İKİ AY ÜCRETSİZ</span>
            <span className="em-hide" style={{ marginLeft: "auto" }}>
              İSTEDİĞİN ZAMAN İPTAL · KART SAKLANMAZ
            </span>
          </div>
        </div>
      </section>

      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(40px, 5vw, 70px) clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.16)",
            paddingTop: "clamp(30px, 4vw, 52px)",
          }}
        >
          <h2
            style={{
              margin: "0 0 clamp(24px, 3vw, 40px)",
              font: "700 clamp(24px, 3.2vw, 48px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.055em",
            }}
          >
            Satır satır fark.
          </h2>
          <div style={{ border: "1px solid rgba(14,17,22,.16)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
                background: "#0E1116",
                color: "#fff",
                font: "400 10px 'Space Mono', monospace",
                letterSpacing: ".18em",
              }}
            >
              <span style={{ padding: "14px 16px" }}>ÖZELLİK</span>
              <span style={{ padding: "14px 16px" }}>BAŞLANGIÇ</span>
              <span style={{ padding: "14px 16px", color: "#1B4DFF" }}>
                ANALİST
              </span>
              <span style={{ padding: "14px 16px" }}>KURUMSAL</span>
            </div>
            {[
              ["aylık ilan analizi", "5", "250", "sınırsız"],
              ["konum sorgusu", "10", "sınırsız", "sınırsız"],
              [
                "portföy takibi",
                { text: "✕", color: "#E23D28" },
                "50 ilan",
                "sınırsız",
              ],
              [
                "PDF bölge raporu",
                { text: "✕", color: "#E23D28" },
                { text: "✓", color: "#00875A" },
                { text: "✓", color: "#00875A" },
              ],
              [
                "API erişimi",
                { text: "✕", color: "#E23D28" },
                { text: "✕", color: "#E23D28" },
                { text: "10.000 / ay", color: "#00875A" },
              ],
              ["kullanıcı sayısı", "1", "3", "10+"],
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  ...tableRow,
                  borderBottom:
                    i < 5 ? "1px solid rgba(14,17,22,.1)" : "none",
                }}
              >
                {row.map((cell, j) => {
                  const isObj = typeof cell === "object" && cell !== null;
                  return (
                    <span
                      key={j}
                      style={{
                        padding: "15px 16px",
                        color:
                          j === 0
                            ? "rgba(14,17,22,.65)"
                            : isObj
                              ? (cell as { color: string }).color
                              : undefined,
                      }}
                    >
                      {isObj ? (cell as { text: string }).text : cell}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
