import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { ParticleField } from "@/components/ParticleField";
import { HeroCity } from "@/components/hero/HeroCity";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { BillingRepository, BillingService, type Entitlements } from "@/lib/billing/billing";
import {
  getDefaultRegions,
  getRegionsForCity,
  formatPrice,
  formatChange,
  formatYield,
  type RegionMetric,
} from "@/lib/analysis/regions";
import { useUserCity } from "@/hooks/useUserCity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "emlakmetric | sahibinden ilan analizi, m² fiyat ve kira getirisi sorgulama",
      },
      {
        name: "description",
        content:
          "Emlakmetric değerleme yapmaz: sahibinden.com ilan verisini ve konum verisini okuyup sayıya çevirir. m² fiyatı, mahalle medyanı sapması, kira getirisi ve amortisman süresi.",
      },
      {
        property: "og:title",
        content:
          "emlakmetric | sahibinden ilan analizi, m² fiyat ve kira getirisi sorgulama",
      },
      {
        property: "og:description",
        content:
          "Emlakmetric değerleme yapmaz: sahibinden.com ilan verisini ve konum verisini okuyup sayıya çevirir.",
      },
      {
        name: "keywords",
        content:
          "sahibinden ilan analizi, m2 fiyat sorgulama, konuma göre ev değeri, kira getirisi hesaplama, amortisman süresi, gayrimenkul analiz, bölge m2 raporu, arsa emsal analizi, emlak paketleri",
      },
    ],
  }),
  component: Home,
});

const DEMO_LINE = "sahibinden.com/ilan/9931-daire";
const SRC_NAMES = [
  "sahibinden.com",
  "tapu bölge serisi",
  "kiralık emsal",
  "tüik endeksi",
];
const LOG_LINES = [
  "ilan çözümlendi · 128 m² · 3+1 · 1999",
  "312 emsal ilan okundu · 90 gün",
  "mahalle medyanı kuruldu · 78.500 ₺/m²",
  "kira emsali · 48.900 ₺/ay",
  "sonuç hazır · 00:00,16",
];

const DEFAULT_REGIONS = getDefaultRegions();

function fmt(n: number) {
  return n.toFixed(1).replace(".", ",");
}

function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isAuthed = !authLoading && !!user;

  const requireAuth = useCallback(() => {
    if (!isAuthed) {
      navigate({ to: "/giris", search: { redirect: "/#analiz" } });
      return true;
    }
    return false;
  }, [isAuthed, navigate]);

  const [tab, setTab] = useState<"link" | "konum">("link");
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<"idle" | "scan" | "done" | "quota">("idle");
  const [step, setStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [kira, setKira] = useState(0);
  const [amort, setAmort] = useState(0);
  const [sapma, setSapma] = useState(0);
  const [skor, setSkor] = useState(0);
  const [typed, setTyped] = useState("");
  const [quotaResource, setQuotaResource] = useState<"analysis" | "report">("analysis");
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const userCity = useUserCity();
  const [regions, setRegions] = useState<RegionMetric[]>(DEFAULT_REGIONS);

  useEffect(() => {
    if (userCity) setRegions(getRegionsForCity(userCity));
  }, [userCity]);

  useEffect(() => {
    if (!isAuthed) { setEnt(null); return; }
    const db = getSupabaseBrowserClient();
    new BillingService(new BillingRepository(db))
      .entitlements()
      .then(setEnt)
      .catch(() => {});
  }, [isAuthed]);

  const analizRef = useRef<HTMLElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef<number>(0);
  const autoDoneRef = useRef(false);

  const refreshEntitlements = useCallback(() => {
    if (!isAuthed) return;
    const db = getSupabaseBrowserClient();
    new BillingService(new BillingRepository(db))
      .entitlements()
      .then(setEnt)
      .catch(() => {});
  }, [isAuthed]);

  const run = useCallback(() => {
    if (phase === "scan") return;
    if (requireAuth()) return;
    setPhase("scan");
    setStep(0);
    setKira(0);
    setAmort(0);
    setSapma(0);
    setSkor(0);
    setLogs([]);
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const kind = tab === "link" ? "konut" : "konut";
    const url = query.trim() || "https://sahibinden.com/ilan/ornek";

    [1, 2, 3, 4].forEach((s, i) =>
      timers.current.push(setTimeout(() => setStep(s), 380 * (i + 1))),
    );
    LOG_LINES.forEach((l, i) =>
      timers.current.push(
        setTimeout(
          () => setLogs((prev) => [...prev, l].slice(-4)),
          340 + 380 * i,
        ),
      ),
    );

    fetch("/api/analyse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, kind }),
    })
      .then(async (res) => {
        if (res.status === 429) {
          const body = await res.json().catch(() => ({}));
          timers.current.forEach(clearTimeout);
          timers.current = [];
          setQuotaResource(body.resource ?? "analysis");
          setPhase("quota");
          refreshEntitlements();
          return;
        }
        if (!res.ok) throw new Error("api_error");
        const body = await res.json();
        const r = body.result as { score?: number; kira_getirisi?: number; amortisman?: number; sapma?: number } | null;

        timers.current.push(
          setTimeout(() => {
            setPhase("done");
            refreshEntitlements();
            const t0 = performance.now();
            const targetKira = r?.kira_getirisi ?? 6.4;
            const targetAmort = r?.amortisman ?? 15.6;
            const targetSapma = r?.sapma ?? 9;
            const targetSkor = r?.score ?? 78;
            const tick = () => {
              const p = Math.min(1, (performance.now() - t0) / 1100);
              const e = 1 - Math.pow(1 - p, 3);
              setKira(targetKira * e);
              setAmort(targetAmort * e);
              setSapma(targetSapma * e);
              setSkor(Math.round(targetSkor * e));
              if (p < 1) rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
          }, 2050),
        );
      })
      .catch(() => {
        timers.current.push(
          setTimeout(() => {
            setPhase("done");
            const t0 = performance.now();
            const tick = () => {
              const p = Math.min(1, (performance.now() - t0) / 1100);
              const e = 1 - Math.pow(1 - p, 3);
              setKira(6.4 * e);
              setAmort(15.6 * e);
              setSapma(9 * e);
              setSkor(Math.round(78 * e));
              if (p < 1) rafRef.current = requestAnimationFrame(tick);
            };
            rafRef.current = requestAnimationFrame(tick);
          }, 2050),
        );
      });
  }, [phase, requireAuth, tab, query, refreshEntitlements]);

  useEffect(() => {
    let i = 0;
    let dir = 1;
    const typer = setInterval(() => {
      i += dir;
      if (i > DEMO_LINE.length) {
        dir = -1;
        i = DEMO_LINE.length;
      }
      if (i < 0) {
        dir = 1;
        i = 0;
      }
      setTyped(DEMO_LINE.slice(0, i));
    }, 95);
    return () => clearInterval(typer);
  }, []);

  useEffect(() => {
    const el = analizRef.current;
    if (!el || autoDoneRef.current || !isAuthed) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !autoDoneRef.current) {
          autoDoneRef.current = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [run, isAuthed]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onMapMove = useCallback((e: React.MouseEvent) => {
    const m = mapRef.current;
    if (!m) return;
    for (let i = 0; i < m.children.length; i++) {
      const c = m.children[i] as HTMLElement;
      const b = c.getBoundingClientRect();
      const t = Math.max(
        0,
        1 -
          Math.hypot(
            b.left + b.width / 2 - e.clientX,
            b.top + b.height / 2 - e.clientY,
          ) /
            320,
      );
      c.style.background =
        t > 0.02
          ? `rgba(27,77,255,${(t * t * 0.85).toFixed(3)})`
          : "transparent";
    }
  }, []);


  const gaugeOffset = (239 * (1 - skor / 100)).toFixed(1);
  const sources = SRC_NAMES.map((name, i) => {
    const ok = step > i || phase === "done";
    return {
      name,
      state: ok ? "OK" : "okunuyor…",
      color: ok ? "#00875A" : "#1B4DFF",
      pct: ok ? "100%" : `${18 + i * 6}%`,
    };
  });

  return (
    <div
      style={{
        background: "#FFFFFF",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
        color: "#0E1116",
        position: "relative",
      }}
    >
      {/* ═══ HERO ═══ */}
      <section
        id="top"
        data-bg="light"
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "#FFFFFF",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "104px clamp(16px, 4vw, 44px) 0",
        }}
      >
        <HeroCity />
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: 1560,
            width: "100%",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              font: "700 clamp(32px, 6.2vw, 118px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.86,
            }}
          >
            <span
              style={{
                display: "block",
                animation:
                  "em-line-in 1.15s .15s cubic-bezier(.2,.8,.2,1) both",
              }}
            >
              MAHALLE KONUŞUR,
            </span>
            <span
              style={{
                display: "block",
                color: "#1B4DFF",
                animation:
                  "em-line-in 1.15s .38s cubic-bezier(.2,.8,.2,1) both",
              }}
            >
              RAKAM KARAR VERİR
              <span style={{ color: "#E23D28" }}>.</span>
            </span>
          </h1>
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: "clamp(24px, 5vw, 90px)",
              alignItems: "flex-end",
              marginTop: "clamp(26px, 4vw, 54px)",
              paddingBottom: 20,
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: 480,
                font: "400 clamp(13px, 1.1vw, 16px) 'Space Mono', monospace",
                lineHeight: 1.8,
                color: "rgba(14,17,22,.6)",
                animation:
                  "em-line-in 1.1s .95s cubic-bezier(.2,.8,.2,1) both",
              }}
            >
              Her ilanın gerçek değerini{" "}
              <span style={{ color: "#0E1116" }}>mahallesinin verileri</span>{" "}
              belirler. m² fiyatı, kira getirisi, amortisman ve likiditeyi tek
              ekranda karşılaştır.
            </p>
            <a
              href="#analiz"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById("analiz");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 16,
                background: "#1B4DFF",
                color: "#fff",
                padding: "21px 32px",
                font: "700 12px 'Space Mono', monospace",
                letterSpacing: ".24em",
                border: "1px solid #1B4DFF",
                whiteSpace: "nowrap",
                textDecoration: "none",
                animation:
                  "em-line-in 1.1s 1.15s cubic-bezier(.2,.8,.2,1) both",
              }}
            >
              <span>ANALİZ ET</span>
              <span
                style={{
                  display: "inline-block",
                  animation: "em-arrow-loop 1.6s ease-in-out infinite",
                }}
              >
                ↓
              </span>
            </a>
          </div>
          <div
            className="em-stack"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderTop: "1px solid rgba(14,17,22,.16)",
              padding: "18px 0 20px",
              animation:
                "em-line-in 1.1s 1.4s cubic-bezier(.2,.8,.2,1) both",
            }}
          >
            <span
              style={{
                font: "400 11px 'Space Mono', monospace",
                letterSpacing: ".2em",
                color: "#1B4DFF",
                whiteSpace: "nowrap",
              }}
            >
              &gt; ŞİMDİ DENE
            </span>
            <span
              style={{
                font: "400 clamp(12px, 1.2vw, 17px) 'Space Mono', monospace",
                color: "rgba(14,17,22,.75)",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {typed}
              <span
                style={{
                  color: "#E23D28",
                  animation: "em-pulse-dot 1.15s steps(1) infinite",
                }}
              >
                ▌
              </span>
            </span>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 12,
            justifyContent: "center",
            padding: "20px 0 16px",
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".3em",
            color: "rgba(14,17,22,.35)",
          }}
        >
          AŞAĞI KAYDIR{" "}
          <span
            style={{
              display: "inline-block",
              animation: "em-arrow-loop 1.8s ease-in-out infinite",
            }}
          >
            ↓
          </span>
        </div>
      </section>

      {/* ═══ STICKY LAYERS ═══ */}
      <div style={{ position: "relative" }}>
        <StickyLayer
          bg="#FFFFFF"
          color="#0E1116"
          dataBg="light"
          num="01"
          label="İLAN"
          tag="GİRDİ"
          lineBorder="rgba(14,17,22,.16)"
          lineColor="rgba(14,17,22,.16)"
          labelColor="#1B4DFF"
        >
          <StickyTitle words={["İlan", "metnini", "değil,", "verisini", "oku"]} blueFrom={3} blueTo={4} redDot />
          <p
            style={{
              margin: 0,
              maxWidth: 560,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.6)",
            }}
          >
            &ldquo;Ferah, yatırıma uygun, emsalsiz&rdquo; bir cümledir. 71.400
            ₺/m² bir ölçüdür. Terminal ilan metnine bakmaz; fiyatı, alanı, katı
            ve yaşı okur, mahalledeki emsal ilanlarla karşılaştırır.
          </p>
        </StickyLayer>

        <StickyLayer
          bg="#1B4DFF"
          color="#FFFFFF"
          dataBg="blue"
          num="02"
          label="EMSAL"
          tag="KARŞILAŞTIRMA"
          lineBorder="rgba(255,255,255,.4)"
          lineColor="rgba(255,255,255,.4)"
          labelColor="rgba(255,255,255,.8)"
          scanline
        >
          <StickyTitle words={["312", "komşu", "ilan,", "tek", "medyan"]} blueFrom={3} blueTo={4} darkBlue redDot />
          <p
            style={{
              margin: 0,
              maxWidth: 520,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(255,255,255,.85)",
            }}
          >
            Kopya ilan ayıklanır, aykırı fiyat filtrelenir. Kalan set mahallenin
            gerçek m² medyanını verir. İlanın o çizginin ne kadar altında
            olduğunu tek satırda görürsün.
          </p>
        </StickyLayer>

        <StickyLayer
          bg="#0E1116"
          color="#fff"
          dataBg="dark"
          num="03"
          label="SAYI"
          tag="ÇIKTI"
          lineBorder="rgba(255,255,255,.22)"
          lineColor="rgba(255,255,255,.22)"
          labelColor="rgba(255,255,255,.75)"
        >
          <h2
            style={{
              margin: "0 0 clamp(24px, 3vw, 44px)",
              font: "700 clamp(34px, 7.4vw, 124px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.88,
            }}
          >
            Dört sayı.{" "}
            <span style={{ color: "#1B4DFF" }}>Bir yön.</span>
          </h2>
          <div
            className="em-col-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid rgba(255,255,255,.18)",
            }}
          >
            {[
              { val: "%6,4", label: "KİRA GETİRİSİ" },
              { val: "15,6 yıl", label: "AMORTİSMAN" },
              { val: "−%9", label: "MEDYANA SAPMA" },
              { val: "78/100", label: "LİKİDİTE" },
            ].map((m, i) => (
              <div
                key={m.label}
                style={{
                  padding: "20px 18px 0",
                  borderRight:
                    i < 3 ? "1px solid rgba(255,255,255,.18)" : undefined,
                }}
              >
                <div
                  style={{
                    font: "500 clamp(22px, 2.6vw, 40px) 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {m.val}
                </div>
                <div
                  style={{
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    opacity: 0.7,
                    marginTop: 8,
                  }}
                >
                  {m.label}
                </div>
              </div>
            ))}
          </div>
        </StickyLayer>
      </div>

      {/* ═══ ANALIZ TERMINAL ═══ */}
      <section
        id="analiz"
        data-bg="dark"
        ref={analizRef}
        style={{
          background: "#00875A",
          color: "#FFFFFF",
          padding:
            "clamp(64px, 8vw, 130px) clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 30,
              alignItems: "flex-end",
              marginBottom: "clamp(26px, 4vw, 52px)",
            }}
          >
            <div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".28em",
                  color: "rgba(255,255,255,.85)",
                  marginBottom: 18,
                }}
              >
                01 · ANALİZ ET
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(32px, 5.6vw, 96px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                  lineHeight: 0.9,
                  maxWidth: "16ch",
                }}
              >
                Yapıştır.{" "}
                <span style={{ color: "#0E1116" }}>Üç saniye.</span> Sonuç
                ekranda
                <span style={{ color: "#0E1116" }}>.</span>
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 6px auto",
                maxWidth: 380,
                font: "400 13px 'Space Mono', monospace",
                lineHeight: 1.8,
                color: "rgba(255,255,255,.8)",
              }}
            >
              İlan linki, mahalle ya da harita noktası ver. Terminal aynı
              formatta yanıt verir. Kaynaklar tek tek açılır, sayılar yerine
              oturur.
            </p>
          </div>

          <div
            style={{
              border: "1px solid rgba(14,17,22,.18)",
              background: "#FFFFFF",
              color: "#0E1116",
            }}
          >
            <div
              className="em-stack"
              style={{
                display: "flex",
                alignItems: "stretch",
                borderBottom: "1px solid rgba(14,17,22,.14)",
              }}
            >
              <div style={{ display: "flex" }}>
                <button
                  onClick={() => setTab("link")}
                  style={{
                    background: tab === "link" ? "#1B4DFF" : "transparent",
                    color: tab === "link" ? "#fff" : "rgba(14,17,22,.5)",
                    border: 0,
                    borderRight: "1px solid rgba(14,17,22,.14)",
                    padding: "16px 24px",
                    font: "700 11px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  İLAN LİNKİ
                </button>
                <button
                  onClick={() => setTab("konum")}
                  style={{
                    background: tab === "konum" ? "#1B4DFF" : "transparent",
                    color: tab === "konum" ? "#fff" : "rgba(14,17,22,.5)",
                    border: 0,
                    borderRight: "1px solid rgba(14,17,22,.14)",
                    padding: "16px 24px",
                    font: "700 11px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                  }}
                >
                  KONUM
                </button>
              </div>
              <div
                className="em-hide"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginLeft: "auto",
                  padding: "0 20px",
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  color: "rgba(14,17,22,.45)",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    background: "#00875A",
                    animation: "em-pulse-dot 2s ease-in-out infinite",
                  }}
                />
                KAYNAKLAR CANLI · SON TARAMA 00:04
              </div>
              {isAuthed && ent && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px",
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".16em",
                    color: ent.analysesLeft > 0 ? "#00875A" : "#E23D28",
                  }}
                >
                  {ent.analysesUsed}/{ent.analysisQuota} ANALİZ
                </div>
              )}
            </div>

            <div
              className="em-stack"
              style={{ display: "flex", alignItems: "stretch" }}
            >
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 0 0 clamp(16px, 2vw, 28px)",
                  font: "400 15px 'Space Mono', monospace",
                  color: "#1B4DFF",
                }}
              >
                &gt;
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") run();
                }}
                placeholder={
                  tab === "link"
                    ? "sahibinden.com/ilan/9931-daire"
                    : "Kadıköy, Fikirtepe veya mahalle adı"
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "transparent",
                  border: 0,
                  outline: "none",
                  color: "#0E1116",
                  font: "400 clamp(13px, 1.4vw, 19px) 'Space Mono', monospace",
                  padding: "clamp(20px, 2.6vw, 34px) 14px",
                }}
              />
              <button
                onClick={run}
                style={{
                  background: "#1B4DFF",
                  color: "#fff",
                  border: 0,
                  padding:
                    "clamp(18px, 2.4vw, 30px) clamp(24px, 3vw, 46px)",
                  font: "700 clamp(11px, 1.1vw, 13px) 'Space Mono', monospace",
                  letterSpacing: ".24em",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                }}
              >
                {phase === "scan"
                  ? "TARANIYOR…"
                  : phase === "done" || phase === "quota"
                    ? "TEKRAR ÇALIŞTIR"
                    : "ANALİZ ET"}
              </button>
            </div>

            {phase === "quota" && (
              <div
                style={{
                  borderTop: "1px solid rgba(14,17,22,.14)",
                  padding: "clamp(30px, 4vw, 50px) clamp(16px, 2vw, 28px)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    font: "700 clamp(20px, 2.5vw, 30px) 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.04em",
                    marginBottom: 12,
                    color: "#E23D28",
                  }}
                >
                  Bu dönemki {quotaResource === "report" ? "rapor" : "analiz"} hakkınız doldu<span style={{ color: "#1B4DFF" }}>.</span>
                </div>
                <p
                  style={{
                    margin: "0 0 24px",
                    font: "400 13px 'Space Mono', monospace",
                    lineHeight: 1.85,
                    color: "rgba(14,17,22,.55)",
                  }}
                >
                  Paketinizi yükselterek daha fazla {quotaResource === "report" ? "rapor" : "analiz"} hakkı kazanabilirsiniz.
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
                    padding: "15px 28px",
                    font: "700 12px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    textDecoration: "none",
                  }}
                >
                  PAKETLERİ GÖR →
                </Link>
              </div>
            )}

            {phase !== "idle" && phase !== "quota" && (
              <>
                <div
                  className="em-col-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    borderTop: "1px solid rgba(14,17,22,.14)",
                  }}
                >
                  {sources.map((s, i) => (
                    <div
                      key={s.name}
                      style={{
                        padding: "20px clamp(14px, 2vw, 26px)",
                        borderRight:
                          i < 3
                            ? "1px solid rgba(14,17,22,.14)"
                            : undefined,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          font: "400 10px 'Space Mono', monospace",
                          letterSpacing: ".16em",
                          color: "rgba(14,17,22,.55)",
                        }}
                      >
                        <span>{s.name}</span>
                        <span style={{ color: s.color }}>{s.state}</span>
                      </div>
                      <div
                        style={{
                          height: 2,
                          background: "rgba(14,17,22,.14)",
                          marginTop: 14,
                        }}
                      >
                        <div
                          style={{
                            height: 2,
                            width: s.pct,
                            background: s.color,
                            transition: "width 420ms linear",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {phase === "scan" && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(14,17,22,.14)",
                      padding: "16px clamp(16px, 2vw, 28px)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 7,
                      font: "400 11px 'Space Mono', monospace",
                      color: "rgba(14,17,22,.5)",
                      minHeight: 96,
                    }}
                  >
                    {logs.map((l, i) => (
                      <span
                        key={i}
                        style={{
                          animation:
                            "em-rise-in 320ms cubic-bezier(.2,.8,.2,1) both",
                        }}
                      >
                        <span style={{ color: "#1B4DFF" }}>&gt;</span> {l}
                      </span>
                    ))}
                  </div>
                )}

                {phase === "done" && <AnalysisResult kira={kira} amort={amort} sapma={sapma} skor={skor} gaugeOffset={gaugeOffset} />}
              </>
            )}
          </div>

          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 16,
              marginTop: 16,
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".16em",
              color: "rgba(255,255,255,.75)",
            }}
          >
            <span>DEĞERLEME DEĞİL · İLAN VE KONUM VERİSİ OKUMASI</span>
            <span className="em-hide" style={{ marginLeft: "auto" }}>
              ÖRNEK: SAHİBİNDEN.COM/İLAN/9931 · KADIKÖY FİKİRTEPE
            </span>
          </div>
        </div>
      </section>

      {/* ═══ VERİ ═══ */}
      <section
        id="veri"
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding: "0 clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.16)",
            paddingTop: "clamp(36px, 5vw, 68px)",
          }}
        >
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 30,
              alignItems: "flex-end",
              marginBottom: "clamp(26px, 4vw, 48px)",
            }}
          >
            <div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".28em",
                  color: "#1B4DFF",
                  marginBottom: 18,
                }}
              >
                02 · VERİ
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(28px, 4.4vw, 70px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.055em",
                  lineHeight: 0.96,
                  maxWidth: "20ch",
                }}
              >
                Tahmin{" "}
                <span style={{ color: "#E23D28" }}>üretmiyoruz.</span> Veriyi
                okuyup sayıya çeviriyoruz.
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 6px auto",
                maxWidth: 340,
                font: "400 12px 'Space Mono', monospace",
                lineHeight: 1.85,
                color: "rgba(14,17,22,.6)",
              }}
            >
              Her ilan aynı hattan geçer: toplama, normalizasyon, sayı. Rakamın
              kaç ilandan çıktığı her zaman raporun üstünde yazar.
            </p>
          </div>
          <div
            className="em-col-1"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              borderTop: "1px solid rgba(14,17,22,.16)",
            }}
          >
            {[
              {
                num: "01",
                title: "TOPLAMA",
                h: "İlan ve konum",
                p: "Sahibinden.com ilan sayfasındaki fiyat, net/brüt alan, oda sayısı, kat, bina yaşı ve konum alanları olduğu gibi okunur. İlan yoksa girdiğin adres koordinata çevrilir.",
                lines: [
                  "> fiyat · alan · oda · kat · yaş",
                  "> mahalle · cadde · koordinat",
                  "> 312 emsal ilan",
                ],
              },
              {
                num: "02",
                title: "NORMALİZASYON",
                h: "Aynı birime indir",
                p: "Her ilan tek ortak birime, metrekareye indirilir. Tekrarlanan ilanlar, aykırı fiyatlar ve alan hataları ayıklanır; kalan set üzerinden mahalle medyanı kurulur.",
                lines: [
                  "> kopya ilan ayıklama",
                  "> aykırı değer filtresi",
                  "> mahalle · ilçe medyanı",
                ],
                redLine: 1,
              },
              {
                num: "03",
                title: "SAYI",
                h: "Dört metrik, bir yön",
                p: "Kira getirisi, amortisman süresi, medyana sapma ve likidite skoru hesaplanır. Yön yalnızca sayıdan çıkar: al, bekle veya riskli.",
                lines: [
                  "> kira getirisi %",
                  "> amortisman yıl",
                  "> likidite skoru /100",
                ],
              },
            ].map((col, ci) => (
              <div
                key={col.num}
                style={{
                  padding: `clamp(24px, 3vw, 42px) ${ci === 2 ? "0" : "clamp(20px, 2.5vw, 36px)"} clamp(28px, 4vw, 52px) ${ci === 0 ? "0" : "clamp(20px, 2.5vw, 36px)"}`,
                  borderRight:
                    ci < 2 ? "1px solid rgba(14,17,22,.16)" : undefined,
                }}
              >
                <div
                  style={{
                    font: "400 11px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    color: "#1B4DFF",
                    marginBottom: 24,
                  }}
                >
                  {col.num} · {col.title}
                </div>
                <h3
                  style={{
                    margin: "0 0 14px",
                    font: "500 clamp(21px, 2.1vw, 30px) 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.05em",
                  }}
                >
                  {col.h}
                </h3>
                <p
                  style={{
                    margin: "0 0 20px",
                    font: "400 13px 'Space Mono', monospace",
                    lineHeight: 1.8,
                    color: "rgba(14,17,22,.62)",
                  }}
                >
                  {col.p}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    font: "400 11px 'Space Mono', monospace",
                    color: "rgba(14,17,22,.45)",
                  }}
                >
                  {col.lines.map((l, li) => (
                    <span
                      key={li}
                      style={
                        col.redLine === li
                          ? { color: "#E23D28" }
                          : undefined
                      }
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ BÖLGE ═══ */}
      <section
        id="bolge"
        data-bg="dark"
        onMouseMove={onMapMove}
        style={{
          background: "#0E1116",
          color: "#fff",
          padding: "clamp(64px, 8vw, 130px) clamp(16px, 4vw, 44px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 28,
              alignItems: "flex-end",
              marginBottom: "clamp(28px, 4vw, 52px)",
            }}
          >
            <div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".28em",
                  color: "#1B4DFF",
                  marginBottom: 18,
                }}
              >
                03 · BÖLGE
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(28px, 4.4vw, 70px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.055em",
                  lineHeight: 0.96,
                  maxWidth: "18ch",
                }}
              >
                Konumu seç, m² fiyatını{" "}
                <span style={{ color: "#1B4DFF" }}>gör.</span>
              </h2>
            </div>
            <div style={{ margin: "0 0 6px auto", maxWidth: 340 }}>
              {userCity && (
                <div
                  style={{
                    font: "700 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    color: "#1B4DFF",
                    marginBottom: 10,
                  }}
                >
                  📍 {userCity.toLocaleUpperCase("tr")} BÖLGESİ
                </div>
              )}
              <p
                style={{
                  margin: 0,
                  font: "400 12px 'Space Mono', monospace",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,.55)",
                }}
              >
                {userCity
                  ? `${userCity} ve çevresi için bölge bazlı medyan m² fiyatı, son 12 aylık değişim ve kira getirisi.`
                  : "Mahalle bazlı m² medyanı, son 12 aylık değişim ve kira getirisi bandı. Konum izni verirsen bölgen öne çıkar."}
              </p>
            </div>
          </div>
          <div
            ref={mapRef}
            className="em-col-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid rgba(255,255,255,.14)",
              borderLeft: "1px solid rgba(255,255,255,.14)",
            }}
          >
            {regions.map((r) => (
              <div
                key={`${r.city}-${r.district}`}
                style={{
                  padding: "clamp(18px, 2vw, 28px)",
                  borderRight: "1px solid rgba(255,255,255,.14)",
                  borderBottom: "1px solid rgba(255,255,255,.14)",
                  transition: "background 260ms linear",
                }}
              >
                <div
                  style={{
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".2em",
                    color: "rgba(255,255,255,.42)",
                  }}
                >
                  {r.city.toLocaleUpperCase("tr")}
                </div>
                <div
                  style={{
                    font: "500 clamp(19px, 2vw, 27px) 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.05em",
                    margin: "10px 0 14px",
                  }}
                >
                  {r.district}
                </div>
                <div
                  style={{
                    font: "400 12px 'Space Mono', monospace",
                    marginBottom: 6,
                  }}
                >
                  {formatPrice(r.medianM2)}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    font: "400 11px 'Space Mono', monospace",
                  }}
                >
                  <span style={{ color: r.change12m >= 0 ? "#00875A" : "#E23D28" }}>
                    {formatChange(r.change12m)}
                  </span>
                  <span style={{ color: "rgba(255,255,255,.55)" }}>
                    {formatYield(r.yieldPct)} getiri
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 18,
              marginTop: 16,
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".16em",
              color: "rgba(255,255,255,.4)",
            }}
          >
            <span>MEDYAN M² SATIŞ FİYATI · KİRA GETİRİSİ</span>
            <span className="em-hide" style={{ marginLeft: "auto" }}>
              YEŞİL: ARTIŞ · KIRMIZI: DÜŞÜŞ
            </span>
          </div>
        </div>
      </section>

      {/* ═══ ARAÇLAR ═══ */}
      <section
        id="araclar"
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(64px, 8vw, 130px) clamp(16px, 4vw, 44px) clamp(40px, 5vw, 70px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 18,
            }}
          >
            04 · ARAÇLAR
          </div>
          <h2
            style={{
              margin: "0 0 clamp(30px, 4vw, 56px)",
              font: "700 clamp(28px, 4.4vw, 70px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.055em",
              lineHeight: 0.96,
              maxWidth: "18ch",
            }}
          >
            Bir ilan, iki ilan, bütün{" "}
            <span style={{ color: "#1B4DFF" }}>portföy.</span>
          </h2>
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
            {[
              {
                tag: "KARŞILAŞTIR",
                tagColor: "#1B4DFF",
                h: "İki ilanı yan yana koy",
                p: "Aynı bütçedeki iki konutu m² fiyatı, kira getirisi, amortisman ve likidite üzerinden karşılaştır. Fark tabloda tek satırda görünür.",
              },
              {
                tag: "PORTFÖY",
                tagColor: "#1B4DFF",
                h: "Takip ettiğin ilanlar",
                p: "İlanı kaydet; fiyat değişince, ilan kapanınca veya mahalle medyanı kayınca bildirim gelir. Pazarlık payı geçmişi saklanır.",
              },
              {
                tag: "BÖLGE RAPORU",
                tagColor: "#E23D28",
                h: "Mahalle raporu indir",
                p: "Seçtiğin mahalle için m² dağılımı, kira getirisi bandı, arsa emsali ve 24 aylık seri. Tek sayfa, yazdırılabilir.",
              },
            ].map((card) => (
              <ToolCard key={card.tag} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ KULLANICILAR ═══ */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "0 clamp(16px, 4vw, 44px) clamp(56px, 7vw, 110px)",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.16)",
            paddingTop: "clamp(36px, 5vw, 68px)",
          }}
        >
          <div
            className="em-stack"
            style={{
              display: "flex",
              gap: 28,
              alignItems: "flex-end",
              marginBottom: "clamp(28px, 4vw, 50px)",
            }}
          >
            <div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".28em",
                  color: "#E23D28",
                  marginBottom: 18,
                }}
              >
                06 · KULLANANLAR
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(28px, 4.4vw, 70px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.055em",
                  lineHeight: 0.96,
                  maxWidth: "20ch",
                }}
              >
                Pazarlığı sayıyla{" "}
                <span style={{ color: "#1B4DFF" }}>yapanlar.</span>
              </h2>
            </div>
            <p
              style={{
                margin: "0 0 6px auto",
                maxWidth: 330,
                font: "400 12px 'Space Mono', monospace",
                lineHeight: 1.85,
                color: "rgba(14,17,22,.6)",
              }}
            >
              Yatırımcı, danışman ve ilk evini alan kullanıcılar aynı ekranı
              kullanıyor. Aşağıdaki cümleler kendi sorgularından çıktı.
            </p>
          </div>
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
            {[
              {
                num: "01",
                type: "YATIRIMCI",
                color: "#1B4DFF",
                hoverBg: "#0E1116",
                quote:
                  "“Beğendiğim daire mahalle medyanının %14 üstündeydi. İlanı kapattım, iki sokak öteki 68.900’a aldım.”",
                name: "Murat Ş. · 9 konut portföyü",
                loc: "Kadıköy, İstanbul",
              },
              {
                num: "02",
                type: "DANIŞMAN",
                color: "#E23D28",
                hoverBg: "#E23D28",
                quote:
                  "“Müşteriye ‘bence uygun’ demeyi bıraktım. Amortisman 15,6 yıl diyorum, tartışma bitiyor.”",
                name: "Elif D. · gayrimenkul danışmanı",
                loc: "Çankaya, Ankara",
              },
              {
                num: "03",
                type: "İLK EV",
                color: "#1B4DFF",
                hoverBg: "#1B4DFF",
                quote:
                  "“Konumu yazdım, m² aralığını gördüm. İlk kez emlakçıyla eşit bilgiyle konuştum.”",
                name: "Seda K. · ilk konut alıcısı",
                loc: "Nilüfer, Bursa",
              },
            ].map((t) => (
              <TestimonialCard key={t.num} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEO ═══ */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "0 clamp(16px, 4vw, 44px) clamp(56px, 7vw, 110px)",
        }}
      >
        <div
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.16)",
            paddingTop: "clamp(36px, 5vw, 68px)",
          }}
        >
          <h2
            style={{
              margin: "0 0 20px",
              font: "500 clamp(23px, 2.5vw, 38px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.05em",
              lineHeight: 1.06,
            }}
          >
            Sahibinden ilan analizi ve konuma göre m² fiyat sorgulama
          </h2>
          <div
            className="em-col-1"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
              gap: "clamp(26px, 5vw, 80px)",
            }}
          >
            <p
              style={{
                margin: 0,
                font: "400 13px 'Space Mono', monospace",
                lineHeight: 1.9,
                color: "rgba(14,17,22,.65)",
              }}
            >
              Emlakmetric bir{" "}
              <strong style={{ fontWeight: 700 }}>
                gayrimenkul analiz terminali
              </strong>
              dir; ekspertiz ya da değerleme raporu üretmez. Sahibinden.com&apos;daki
              satılık ve kiralık ilan verisini okur, aynı mahalledeki emsal
              ilanlarla karşılaştırır ve sonucu tek birime,{" "}
              <strong style={{ fontWeight: 700 }}>m² fiyatına</strong>, indirir.
              İlan linkin yoksa{" "}
              <strong style={{ fontWeight: 700 }}>
                konuma göre ev değeri sorgulama
              </strong>{" "}
              yapabilirsin: il, ilçe, mahalle veya harita noktası girdiğinde o
              noktadaki m² fiyat aralığı,{" "}
              <strong style={{ fontWeight: 700 }}>
                kira getirisi hesaplama
              </strong>{" "}
              sonucu ve{" "}
              <strong style={{ fontWeight: 700 }}>amortisman süresi</strong>{" "}
              aynı formatta gelir.
            </p>
            <p
              style={{
                margin: 0,
                font: "400 13px 'Space Mono', monospace",
                lineHeight: 1.9,
                color: "rgba(14,17,22,.65)",
              }}
            >
              Konut alıcısı, yatırımcı, emlak danışmanı ve portföy yöneticisi
              aynı ekranı kullanır: dört metrik, bir yön. Rakam nereden
              geldiğini söylemeden ekranda durmaz; her sayının altında kaç ilan
              okunduğu ve hangi tarihte tarandığı yazar.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section
        data-bg="blue"
        style={{
          background: "#1B4DFF",
          color: "#fff",
          padding: "clamp(64px, 9vw, 150px) clamp(16px, 4vw, 44px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            className="em-col-1"
            style={{
              display: "grid",
              gridTemplateColumns: "1.15fr .85fr",
              gap: "clamp(24px, 4vw, 64px)",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  font: "400 11px 'Space Mono', monospace",
                  letterSpacing: ".28em",
                  opacity: 0.7,
                  marginBottom: 24,
                }}
              >
                &gt; BAŞLA
              </div>
              <h2
                style={{
                  margin: 0,
                  font: "700 clamp(36px, 6.6vw, 112px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.06em",
                  lineHeight: 0.88,
                }}
              >
                Bir link.
                <br />
                Bir sayı.
              </h2>
            </div>
            <div
              style={{
                position: "relative",
                border: "1px solid rgba(255,255,255,.4)",
                padding: "clamp(14px, 1.6vw, 22px)",
                minWidth: 0,
              }}
            >
              <div
                className="em-hide"
                style={{
                  position: "absolute",
                  top: -30,
                  right: 14,
                  width: 92,
                  height: 92,
                  animation: "em-spin-slow 22s linear infinite",
                }}
              >
                <svg
                  viewBox="0 0 92 92"
                  width="92"
                  height="92"
                  style={{ display: "block", overflow: "visible" }}
                >
                  <defs>
                    <path
                      id="emring"
                      d="M46,46 m-33,0 a33,33 0 1,1 66,0 a33,33 0 1,1 -66,0"
                    />
                  </defs>
                  <circle
                    cx="46"
                    cy="46"
                    r="33"
                    fill="#0E1116"
                    stroke="rgba(255,255,255,.35)"
                    strokeWidth="1"
                  />
                  <text
                    fill="#fff"
                    style={{
                      font: "400 8.5px 'Space Mono', monospace",
                      letterSpacing: ".22em",
                    }}
                  >
                    <textPath href="#emring" startOffset="2%">
                      HER M² BİR SAYIDIR · em² ·
                    </textPath>
                  </text>
                </svg>
              </div>
              <ParticleField
                light
                orbCount={64}
                style={{
                  width: "100%",
                  height: "clamp(180px, 26vh, 280px)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginTop: "clamp(10px, 1.4vw, 18px)",
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  color: "rgba(255,255,255,.75)",
                }}
              >
                <span>İMLECİ GEZDİR → m²</span>
                <span>em² · CANLI</span>
              </div>
            </div>
          </div>
          <div
            className="em-stack"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              borderTop: "1px solid rgba(255,255,255,.35)",
              paddingTop: 24,
              marginTop: "clamp(26px, 4vw, 48px)",
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: 420,
                font: "400 12px 'Space Mono', monospace",
                lineHeight: 1.85,
                color: "rgba(255,255,255,.8)",
              }}
            >
              Kayıt ücretsiz, kart istemiyoruz. İlanı yapıştır, raporu gör;
              sonra portföyünü kur.
            </p>
            <Link
              to="/kayit"
              style={{
                marginLeft: "auto",
                background: "#0E1116",
                color: "#fff",
                border: "1px solid #0E1116",
                padding: "22px 34px",
                font: "700 12px 'Space Mono', monospace",
                letterSpacing: ".24em",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              ÜCRETSİZ KAYIT OL
            </Link>
            <Link
              to="/iletisim"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: "#fff",
                borderBottom: "1px solid rgba(255,255,255,.5)",
                paddingBottom: 4,
                font: "400 12px 'Space Mono', monospace",
                letterSpacing: ".2em",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              İLETİŞİM{" "}
              <span
                style={{
                  display: "inline-block",
                  animation: "em-arrow-loop 1.6s ease-in-out infinite",
                }}
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ═══ SUB-COMPONENTS ═══ */

function StickyLayer({
  bg,
  color,
  dataBg,
  num,
  label,
  tag,
  lineBorder,
  lineColor,
  labelColor,
  scanline,
  children,
}: {
  bg: string;
  color: string;
  dataBg: string;
  num: string;
  label: string;
  tag: string;
  lineBorder: string;
  lineColor: string;
  labelColor: string;
  scanline?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-bg={dataBg}
      style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        background: bg,
        color,
        borderTop: `1px solid ${lineBorder}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding:
          "clamp(70px, 9vw, 120px) clamp(16px, 4vw, 44px)",
      }}
    >
      {scanline && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.75), transparent)",
            animation: "em-scanline-v 3.4s ease-in-out infinite",
          }}
        />
      )}
      <div style={{ maxWidth: 1560, width: "100%", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            font: "400 11px 'Space Mono', monospace",
            letterSpacing: ".26em",
            color: labelColor,
            marginBottom: "clamp(20px, 3vw, 40px)",
          }}
        >
          {num} / {label}{" "}
          <span
            style={{
              flex: 1,
              height: 1,
              background: lineColor,
            }}
          />
          <span style={{ color: `color-mix(in srgb, ${color} 70%, transparent)` }}>
            {tag}
          </span>
        </div>
        {children}
      </div>
    </section>
  );
}

function StickyTitle({
  words,
  blueFrom,
  blueTo,
  darkBlue,
  redDot,
}: {
  words: string[];
  blueFrom: number;
  blueTo: number;
  darkBlue?: boolean;
  redDot?: boolean;
}) {
  return (
    <h2
      style={{
        margin: "0 0 clamp(20px, 3vw, 38px)",
        font: "700 clamp(30px, 6.4vw, 104px) 'Space Grotesk', sans-serif",
        letterSpacing: "-0.06em",
        lineHeight: 0.9,
        maxWidth: "20ch",
      }}
    >
      {words.map((w, i) => {
        const isBlue = i >= blueFrom && i <= blueTo;
        const isLast = i === words.length - 1;
        const blueColor = darkBlue ? "#0E1116" : "#1B4DFF";
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              color: isBlue ? blueColor : undefined,
              animationName: "em-word-in",
              animationDuration: ".9s",
              animationTimingFunction: "cubic-bezier(.2,.8,.2,1)",
              animationFillMode: "both",
              animationTimeline: "view()",
              animationRange: `entry ${4 + i * 5}% cover ${26 + i * 5}%`,
            }}
          >
            {isLast && redDot ? (
              <>
                {w.replace(/\.$/, "")}
                <span style={{ color: "#E23D28" }}>.</span>
              </>
            ) : (
              w
            )}
          </span>
        );
      })}
    </h2>
  );
}

function ToolCard({
  tag,
  tagColor,
  h,
  p,
}: {
  tag: string;
  tagColor: string;
  h: string;
  p: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#0E1116" : "#fff",
        color: hovered ? "#fff" : "#0E1116",
        padding: "clamp(22px, 2.6vw, 38px)",
        transition: "background 200ms linear, color 200ms linear",
      }}
    >
      <div
        style={{
          font: "400 10px 'Space Mono', monospace",
          letterSpacing: ".22em",
          color: tagColor,
          marginBottom: 40,
        }}
      >
        {tag}
      </div>
      <h3
        style={{
          margin: "0 0 12px",
          font: "500 clamp(20px, 2vw, 29px) 'Space Grotesk', sans-serif",
          letterSpacing: "-0.05em",
        }}
      >
        {h}
      </h3>
      <p
        style={{
          margin: 0,
          font: "400 12px 'Space Mono', monospace",
          lineHeight: 1.85,
          opacity: 0.62,
        }}
      >
        {p}
      </p>
    </div>
  );
}

function TestimonialCard({
  num,
  type,
  color,
  hoverBg,
  quote,
  name,
  loc,
}: {
  num: string;
  type: string;
  color: string;
  hoverBg: string;
  quote: string;
  name: string;
  loc: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? hoverBg : "#fff",
        color: hovered ? "#fff" : "#0E1116",
        padding: "clamp(24px, 3vw, 40px)",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        transition:
          "transform 280ms cubic-bezier(.2,.8,.2,1), background 240ms linear, color 240ms linear",
        transform: hovered ? "translateY(-8px)" : undefined,
      }}
    >
      <span
        style={{
          font: "400 11px 'Space Mono', monospace",
          letterSpacing: ".2em",
          color,
          marginBottom: 26,
        }}
      >
        {num} · {type}
      </span>
      <p
        style={{
          margin: "0 0 28px",
          font: "500 clamp(18px, 1.8vw, 26px) 'Space Grotesk', sans-serif",
          letterSpacing: "-0.04em",
          lineHeight: 1.28,
        }}
      >
        {quote}
      </p>
      <div
        style={{
          marginTop: "auto",
          borderTop: hovered
            ? "1px solid rgba(255,255,255,.3)"
            : "1px solid rgba(14,17,22,.14)",
          paddingTop: 16,
          font: "400 11px 'Space Mono', monospace",
          lineHeight: 1.7,
          color: hovered ? "rgba(255,255,255,.7)" : "rgba(14,17,22,.5)",
        }}
      >
        {name}
        <br />
        {loc}
      </div>
    </div>
  );
}

function AnalysisResult({
  kira,
  amort,
  sapma,
  skor,
  gaugeOffset,
}: {
  kira: number;
  amort: number;
  sapma: number;
  skor: number;
  gaugeOffset: string;
}) {
  return (
    <div
      style={{
        borderTop: "1px solid rgba(14,17,22,.14)",
        animation: "em-fade-in 400ms both",
      }}
    >
      <div
        className="em-stack"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "clamp(14px, 3vw, 40px)",
          padding:
            "clamp(20px, 2.4vw, 32px) clamp(16px, 2vw, 28px)",
          borderBottom: "1px solid rgba(14,17,22,.14)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 14,
          }}
        >
          <span
            style={{
              font: "700 clamp(46px, 7vw, 104px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.8,
              color: "#00875A",
            }}
          >
            AL
          </span>
          <span
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".2em",
              color: "rgba(14,17,22,.5)",
            }}
          >
            5 YIL TUT
          </span>
        </div>
        <div
          style={{
            position: "relative",
            width: 84,
            height: 84,
            flex: "none",
          }}
        >
          <svg
            viewBox="0 0 84 84"
            width="84"
            height="84"
            style={{ display: "block", transform: "rotate(-90deg)" }}
          >
            <circle
              cx="42"
              cy="42"
              r="38"
              fill="none"
              stroke="rgba(14,17,22,.14)"
              strokeWidth="3"
            />
            <circle
              cx="42"
              cy="42"
              r="38"
              fill="none"
              stroke="#1B4DFF"
              strokeWidth="3"
              strokeDasharray="239"
              strokeDashoffset={gaugeOffset}
            />
          </svg>
          <span
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: "500 18px 'Space Grotesk', sans-serif",
              letterSpacing: "-0.04em",
              color: "#0E1116",
            }}
          >
            {skor}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".18em",
            color: "rgba(14,17,22,.5)",
          }}
        >
          <span style={{ color: "#E23D28", whiteSpace: "nowrap" }}>
            ▲ 1 RİSK NOTU · BİNA 1999 ÖNCESİ
          </span>
          <span>KADIKÖY / FİKİRTEPE · 3+1 · 128 m² · 9.139.200 ₺</span>
        </div>
        <span
          className="em-hide"
          style={{
            marginLeft: "auto",
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".18em",
            color: "rgba(14,17,22,.42)",
            whiteSpace: "nowrap",
          }}
        >
          312 EMSAL İLAN · 00:00,16
        </span>
      </div>

      <div
        className="em-col-1"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 380px) 1fr",
        }}
      >
        <div style={{ borderRight: "1px solid rgba(14,17,22,.14)" }}>
          {[
            { label: "brüt kira getirisi", val: `%${fmt(kira)}`, color: "#00875A" },
            { label: "amortisman süresi", val: `${fmt(amort)} yıl`, color: undefined },
            { label: "mahalle medyanına sapma", val: `−%${fmt(sapma)}`, color: "#00875A" },
            { label: "likidite skoru · 90 gün", val: `${skor}/100`, color: undefined },
            { label: "bina yaşı riski", val: "1999 · yüksek", color: "#E23D28" },
          ].map((row, i) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "20px clamp(16px, 2vw, 26px)",
                borderBottom:
                  i < 4
                    ? "1px solid rgba(14,17,22,.08)"
                    : undefined,
                font: "400 12px 'Space Mono', monospace",
                animation: `em-rise-in .6s ${(0.06 + i * 0.1).toFixed(2)}s cubic-bezier(.2,.8,.2,1) both`,
              }}
            >
              <span style={{ color: "rgba(14,17,22,.5)" }}>
                {row.label}
              </span>
              <span
                style={{
                  font: "500 20px 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.04em",
                  color: row.color,
                }}
              >
                {row.val}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            padding:
              "clamp(20px, 2.4vw, 32px) clamp(16px, 2.4vw, 32px)",
          }}
        >
          <div
            style={{
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".22em",
              color: "rgba(14,17,22,.42)",
              marginBottom: 22,
            }}
          >
            M² FİYATI · ₺ · İLAN VS EMSAL
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {[
              { label: "bu ilan", val: "71.400", pct: 74, color: "#1B4DFF", delay: ".58s" },
              { label: "mahalle medyanı", val: "78.500", pct: 81, color: "rgba(27,77,255,.14)", delay: ".72s" },
              { label: "ilçe medyanı", val: "96.400", pct: 100, color: "rgba(27,77,255,.14)", delay: ".86s" },
              { label: "12 ay önce · mahalle", val: "58.900", pct: 61, color: "rgba(226,61,40,.55)", delay: "1s" },
            ].map((bar) => (
              <div key={bar.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    font: "400 11px 'Space Mono', monospace",
                    color: "rgba(14,17,22,.7)",
                    marginBottom: 6,
                  }}
                >
                  <span>{bar.label}</span>
                  <span>{bar.val}</span>
                </div>
                <div
                  style={{
                    height: 12,
                    width: `${bar.pct}%`,
                    background: bar.color,
                    transformOrigin: "left",
                    animation: `em-grow-x 900ms ${bar.delay} cubic-bezier(.2,.8,.2,1) both`,
                  }}
                />
              </div>
            ))}
          </div>

          <div
            className="em-stack"
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              marginTop: 30,
              paddingTop: 24,
              borderTop: "1px solid rgba(14,17,22,.14)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".22em",
                  color: "rgba(14,17,22,.42)",
                  marginBottom: 12,
                }}
              >
                MAHALLE M² TRENDİ · 12 AY
              </div>
              <svg
                viewBox="0 0 320 72"
                width="100%"
                height="72"
                preserveAspectRatio="none"
                style={{
                  display: "block",
                  maxWidth: 420,
                  overflow: "visible",
                }}
              >
                <polyline
                  points="0,62 29,58 58,55 87,49 116,50 145,42 174,36 203,33 232,26 261,20 290,14 319,6"
                  fill="none"
                  stroke="#1B4DFF"
                  strokeWidth="2"
                  strokeDasharray="900"
                  style={{
                    animation:
                      "em-draw-line 1.6s 1.15s ease-out both",
                  }}
                />
                <circle cx="319" cy="6" r="3.5" fill="#E23D28" />
              </svg>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  font: "500 clamp(24px, 2.6vw, 38px) 'Space Grotesk', sans-serif",
                  letterSpacing: "-0.05em",
                  color: "#00875A",
                }}
              >
                +%33,3
              </div>
              <div
                style={{
                  font: "400 10px 'Space Mono', monospace",
                  letterSpacing: ".2em",
                  color: "rgba(14,17,22,.42)",
                  marginTop: 6,
                }}
              >
                12 AYLIK DEĞİŞİM
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "16px clamp(16px, 2vw, 28px)",
          borderTop: "1px solid rgba(14,17,22,.14)",
          font: "400 11px 'Space Mono', monospace",
          lineHeight: 1.9,
          color: "rgba(14,17,22,.6)",
        }}
      >
        Kadıköy Fikirtepe&apos;de 128 m² daire için m² fiyatı 71.400 ₺; mahalle
        medyanı 78.500 ₺, ilçe medyanı 96.400 ₺. Brüt kira getirisi %6,4,
        amortisman süresi 15,6 yıl, medyana sapma −%9. Son 90 günde satılan 41
        dairenin medyan pazarlık payı %4,1.{" "}
        <span style={{ color: "#E23D28" }}>Risk notu:</span> bina 1999 öncesi
        yönetmelikle yapılmış; güçlendirme maliyeti ilan fiyatına yansımamış.
      </div>
    </div>
  );
}
