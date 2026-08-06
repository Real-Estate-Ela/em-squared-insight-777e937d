import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  BillingRepository,
  BillingService,
  type Entitlements,
  type Analysis,
} from "@/lib/billing/billing";

export const Route = createFileRoute("/panel")({
  head: () => ({
    meta: [
      { title: "Panel — emlakmetric" },
      {
        name: "description",
        content: "emlakmetric analiz paneli. İlan analizi, kullanım bilgileri ve geçmiş sorgular.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PanelPage,
});

function PanelPage() {
  return (
    <AuthGuard>
      <PanelContent />
    </AuthGuard>
  );
}

const eyebrow: React.CSSProperties = {
  font: "400 11px 'Space Mono', monospace",
  letterSpacing: ".28em",
  color: "#1B4DFF",
  marginBottom: 20,
};

const cardBase: React.CSSProperties = {
  border: "1px solid rgba(14,17,22,.14)",
  padding: "clamp(22px, 3vw, 32px)",
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const labelMono: React.CSSProperties = {
  font: "400 10px 'Space Mono', monospace",
  letterSpacing: ".22em",
  color: "rgba(14,17,22,.45)",
};

const valueBig: React.CSSProperties = {
  font: "700 clamp(28px, 3vw, 42px) 'Space Grotesk', sans-serif",
  letterSpacing: "-0.06em",
  lineHeight: 1,
};

function PanelContent() {
  const { profile, user } = useAuth();
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [quotaError, setQuotaError] = useState<"analysis" | "report" | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const refreshEntitlements = useCallback(() => {
    const db = getSupabaseBrowserClient();
    new BillingService(new BillingRepository(db))
      .entitlements()
      .then(setEnt)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const db = getSupabaseBrowserClient();
    const service = new BillingService(new BillingRepository(db));

    Promise.all([
      service.entitlements().catch(() => null),
      db
        .from("analyses")
        .select("id, listing_url, kind, result, created_at")
        .order("created_at", { ascending: false })
        .limit(20)
        .then(({ data }) =>
          (data ?? []).map((r: { id: string; listing_url: string; kind: string; result: unknown; created_at: string }) =>
            Analysis.fromRow(r),
          ),
        )
        .catch(() => [] as Analysis[]),
    ]).then(([e, a]) => {
      setEnt(e);
      setAnalyses(a);
      setLoading(false);
    });
  }, []);

  const handleDownloadReport = useCallback(async (analysisId: string) => {
    setQuotaError(null);
    setDownloadingId(analysisId);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, format: "pdf" }),
      });
      if (res.status === 429) {
        setQuotaError("report");
        refreshEntitlements();
        return;
      }
      if (!res.ok) throw new Error("api_error");
      refreshEntitlements();
    } finally {
      setDownloadingId(null);
    }
  }, [refreshEntitlements]);

  const greeting = profile?.full_name
    ? profile.full_name.split(" ")[0]
    : user?.email?.split("@")[0] ?? "";

  const kindLabel = (k: string) =>
    k === "arsa" ? "Arsa" : k === "ticari" ? "Ticari" : "Konut";

  const formatDate = (d: Date) =>
    d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  const extractDomain = (url: string) => {
    try {
      return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace("www.", "");
    } catch {
      return url.slice(0, 30);
    }
  };

  return (
    <div>
      <style>{`
        .em-panel-row:hover { background: rgba(27,77,255,.04); }
        .em-panel-bar { transition: width 800ms cubic-bezier(.16,1,.3,1); }
        .em-panel-btn { transition: background 160ms linear, color 160ms linear, border-color 160ms linear; }
        .em-panel-btn:hover { background: #0E1116; color: #fff; }
        .em-panel-link { transition: color 160ms linear; }
        .em-panel-link:hover { color: #1B4DFF !important; }
        @media (max-width: 900px) {
          .em-panel-grid { grid-template-columns: 1fr 70px 60px 90px 70px !important; font-size: 10px !important; }
        }
        @media (max-width: 600px) {
          .em-panel-grid { grid-template-columns: 1fr 60px 50px !important; }
          .em-panel-grid > :nth-child(4),
          .em-panel-grid > :nth-child(5) { display: none; }
        }
      `}</style>

      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding: "clamp(120px, 14vw, 170px) clamp(16px, 4vw, 44px) clamp(30px, 4vw, 50px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div style={eyebrow}>PANEL</div>
          <h1
            style={{
              margin: "0 0 10px",
              font: "700 clamp(30px, 5vw, 56px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
              animation: "em-rise-in .8s both",
            }}
          >
            Merhaba, {greeting}
            <span style={{ color: "#1B4DFF" }}>.</span>
          </h1>
          <p
            style={{
              margin: 0,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.55)",
            }}
          >
            İlan analizi yap, geçmiş sorgularını gör.
          </p>
        </div>
      </section>

      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding: "clamp(20px, 3vw, 40px) clamp(16px, 4vw, 44px) clamp(40px, 5vw, 70px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          {/* Usage cards */}
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 40,
                font: "400 12px 'Space Mono', monospace",
                color: "rgba(14,17,22,.4)",
                letterSpacing: ".14em",
              }}
            >
              YÜKLENİYOR...
            </div>
          ) : ent ? (
            <>
              <div
                className="em-col-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 1,
                  background: "rgba(14,17,22,.14)",
                  border: "1px solid rgba(14,17,22,.14)",
                  marginBottom: "clamp(30px, 4vw, 50px)",
                }}
              >
                {/* Plan */}
                <div style={cardBase}>
                  <span style={labelMono}>PAKET</span>
                  <div style={valueBig}>
                    {ent.planName}
                  </div>
                  <span
                    style={{
                      font: "400 11px 'Space Mono', monospace",
                      color: "rgba(14,17,22,.45)",
                    }}
                  >
                    {formatDate(ent.periodEnd)} tarihine kadar
                  </span>
                  <Link
                    to="/paketler"
                    className="em-panel-link"
                    style={{
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".16em",
                      color: "rgba(14,17,22,.45)",
                      textDecoration: "none",
                    }}
                  >
                    PAKETLERİ GÖR →
                  </Link>
                </div>

                {/* Analyses */}
                <div style={{ ...cardBase, background: "#fff" }}>
                  <span style={labelMono}>İLAN ANALİZİ</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={valueBig}>{ent.analysesUsed}</span>
                    <span
                      style={{
                        font: "400 14px 'Space Mono', monospace",
                        color: "rgba(14,17,22,.35)",
                      }}
                    >
                      / {ent.analysisQuota}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(14,17,22,.08)",
                      position: "relative",
                    }}
                  >
                    <div
                      className="em-panel-bar"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${Math.min(100, Math.round(ent.analysisRatio * 100))}%`,
                        background:
                          ent.analysisRatio >= 0.9 ? "#E23D28" : "#1B4DFF",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      font: "400 11px 'Space Mono', monospace",
                      color: ent.analysesLeft > 0 ? "#00875A" : "#E23D28",
                    }}
                  >
                    {ent.analysesLeft > 0
                      ? `${ent.analysesLeft} analiz hakkı kaldı`
                      : "Hak doldu"}
                  </span>
                </div>

                {/* Reports */}
                <div style={{ ...cardBase, background: "#fff" }}>
                  <span style={labelMono}>RAPOR</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={valueBig}>{ent.reportsUsed}</span>
                    <span
                      style={{
                        font: "400 14px 'Space Mono', monospace",
                        color: "rgba(14,17,22,.35)",
                      }}
                    >
                      / {ent.reportQuota}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(14,17,22,.08)",
                      position: "relative",
                    }}
                  >
                    <div
                      className="em-panel-bar"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${Math.min(100, Math.round(ent.reportRatio * 100))}%`,
                        background:
                          ent.reportRatio >= 0.9 ? "#E23D28" : "#00875A",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      font: "400 11px 'Space Mono', monospace",
                      color: ent.reportsLeft > 0 ? "#00875A" : "#E23D28",
                    }}
                  >
                    {ent.reportsLeft > 0
                      ? `${ent.reportsLeft} rapor hakkı kaldı`
                      : "Hak doldu"}
                  </span>
                </div>

                {/* Quick stat */}
                <div style={{ ...cardBase, background: "#0E1116", color: "#fff" }}>
                  <span style={{ ...labelMono, color: "rgba(255,255,255,.45)" }}>
                    TOPLAM ANALİZ
                  </span>
                  <div style={valueBig}>{analyses.length}</div>
                  <span
                    style={{
                      font: "400 11px 'Space Mono', monospace",
                      color: "rgba(255,255,255,.45)",
                    }}
                  >
                    {analyses.length > 0
                      ? `Son: ${formatDate(analyses[0].createdAt)}`
                      : "Henüz analiz yok"}
                  </span>
                  <Link
                    to="/profil"
                    className="em-panel-link"
                    style={{
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".16em",
                      color: "rgba(255,255,255,.45)",
                      textDecoration: "none",
                    }}
                  >
                    PROFİLİM →
                  </Link>
                </div>
              </div>

              {/* Recent analyses table */}
              <div
                style={{
                  borderTop: "1px solid rgba(14,17,22,.14)",
                  paddingTop: "clamp(26px, 3vw, 42px)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "clamp(18px, 2vw, 28px)",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      font: "700 clamp(22px, 2.5vw, 36px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.05em",
                    }}
                  >
                    Son analizler
                  </h2>
                  <span
                    style={{
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".16em",
                      color: ent.analysesLeft > 0 ? "#00875A" : "#E23D28",
                    }}
                  >
                    {ent.analysesLeft > 0
                      ? `${ent.analysesLeft} HAK KALDI`
                      : "HAK DOLDU"}
                  </span>
                </div>

                {quotaError && (
                  <div
                    style={{
                      border: "1px solid #E23D28",
                      padding: "clamp(24px, 3vw, 36px)",
                      marginBottom: "clamp(18px, 2vw, 28px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        font: "700 clamp(18px, 2vw, 24px) 'Space Grotesk', sans-serif",
                        letterSpacing: "-0.04em",
                        color: "#E23D28",
                      }}
                    >
                      Bu dönemki {quotaError === "report" ? "rapor" : "analiz"} hakkınız doldu<span style={{ color: "#1B4DFF" }}>.</span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        font: "400 12px 'Space Mono', monospace",
                        lineHeight: 1.85,
                        color: "rgba(14,17,22,.55)",
                      }}
                    >
                      Paketinizi yükselterek daha fazla {quotaError === "report" ? "rapor" : "analiz"} hakkı kazanabilirsiniz.
                    </p>
                    <Link
                      to="/paketler"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#1B4DFF",
                        color: "#fff",
                        border: "1px solid #1B4DFF",
                        padding: "12px 24px",
                        font: "700 11px 'Space Mono', monospace",
                        letterSpacing: ".18em",
                        textDecoration: "none",
                      }}
                    >
                      PAKETLERİ GÖR →
                    </Link>
                  </div>
                )}

                {analyses.length === 0 ? (
                  <div
                    style={{
                      border: "1px solid rgba(14,17,22,.14)",
                      padding: "clamp(40px, 5vw, 70px) 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        font: "700 clamp(24px, 3vw, 38px) 'Space Grotesk', sans-serif",
                        letterSpacing: "-0.05em",
                        marginBottom: 12,
                      }}
                    >
                      Henüz analiz yok<span style={{ color: "#1B4DFF" }}>.</span>
                    </div>
                    <p
                      style={{
                        margin: "0 0 24px",
                        font: "400 13px 'Space Mono', monospace",
                        lineHeight: 1.85,
                        color: "rgba(14,17,22,.55)",
                      }}
                    >
                      Sahibinden, Hepsiemlak veya Emlakjet linkini yapıştır, mahallesine
                      göre konumlandıralım.
                    </p>
                    <Link
                      to="/"
                      hash="analiz"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#1B4DFF",
                        color: "#fff",
                        border: "1px solid #1B4DFF",
                        padding: "15px 28px",
                        font: "700 12px 'Space Mono', monospace",
                        letterSpacing: ".2em",
                        textDecoration: "none",
                      }}
                    >
                      ANALİZ YAP →
                    </Link>
                  </div>
                ) : (
                  <div style={{ border: "1px solid rgba(14,17,22,.14)" }}>
                    {/* Table header */}
                    <div
                      className="em-panel-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 100px 80px 120px 90px",
                        background: "#0E1116",
                        color: "#fff",
                        font: "400 10px 'Space Mono', monospace",
                        letterSpacing: ".18em",
                      }}
                    >
                      <span style={{ padding: "13px 16px" }}>İLAN</span>
                      <span style={{ padding: "13px 16px" }}>TÜR</span>
                      <span style={{ padding: "13px 16px", textAlign: "right" }}>
                        SKOR
                      </span>
                      <span style={{ padding: "13px 16px", textAlign: "right" }}>
                        TARİH
                      </span>
                      <span style={{ padding: "13px 16px", textAlign: "center" }}>
                        RAPOR
                      </span>
                    </div>

                    {/* Rows */}
                    {analyses.map((a) => {
                      const result = a.result as {
                        score?: number;
                        delta?: number;
                      } | null;
                      const score = result?.score;

                      return (
                        <div
                          key={a.id}
                          className="em-panel-row em-panel-grid"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 100px 80px 120px 90px",
                            borderBottom: "1px solid rgba(14,17,22,.08)",
                            font: "400 12px 'Space Mono', monospace",
                            transition: "background 120ms linear",
                          }}
                        >
                          <span
                            style={{
                              padding: "14px 16px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#0E1116",
                            }}
                            title={a.listingUrl}
                          >
                            {extractDomain(a.listingUrl)}
                          </span>
                          <span
                            style={{
                              padding: "14px 16px",
                              color: "rgba(14,17,22,.55)",
                            }}
                          >
                            {kindLabel(a.kind)}
                          </span>
                          <span
                            style={{
                              padding: "14px 16px",
                              textAlign: "right",
                              fontWeight: 600,
                              color:
                                score !== undefined
                                  ? score >= 62
                                    ? "#00875A"
                                    : score >= 40
                                      ? "#0E1116"
                                      : "#E23D28"
                                  : "rgba(14,17,22,.35)",
                            }}
                          >
                            {score !== undefined ? `${score}/100` : "—"}
                          </span>
                          <span
                            style={{
                              padding: "14px 16px",
                              textAlign: "right",
                              color: "rgba(14,17,22,.45)",
                              fontSize: 11,
                            }}
                          >
                            {formatDate(a.createdAt)}
                            <br />
                            {formatTime(a.createdAt)}
                          </span>
                          <span
                            style={{
                              padding: "10px 16px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <button
                              type="button"
                              className="em-panel-btn"
                              onClick={() => handleDownloadReport(a.id)}
                              disabled={downloadingId === a.id}
                              style={{
                                background: "transparent",
                                color: "#1B4DFF",
                                border: "1px solid #1B4DFF",
                                padding: "6px 14px",
                                font: "700 9px 'Space Mono', monospace",
                                letterSpacing: ".14em",
                                cursor: downloadingId === a.id ? "default" : "pointer",
                                opacity: downloadingId === a.id ? 0.5 : 1,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {downloadingId === a.id ? "..." : "PDF"}
                            </button>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                border: "1px solid rgba(14,17,22,.14)",
                padding: "clamp(30px, 4vw, 50px) 24px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: 0,
                  font: "400 13px 'Space Mono', monospace",
                  lineHeight: 1.85,
                  color: "rgba(14,17,22,.55)",
                }}
              >
                Kullanım bilgileri yüklenemedi. Lütfen daha sonra tekrar
                deneyin.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
