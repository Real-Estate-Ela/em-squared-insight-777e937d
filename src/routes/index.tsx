import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Loader2,
  TrendingUp,
  MapPin,
  BarChart3,
  Shield,
  Link2,
  Cpu,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { MouseCard, CountUp } from "@/components/MouseCard";
import { useI18n } from "@/lib/i18n";

type AnalyseErrorResponse = { error: string; resource?: "analysis" | "report" };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "emlakmetric — İlan linkiyle 20 saniyede yatırım analizi" },
      {
        name: "description",
        content:
          "İlan linkini yapıştır; kira getirisi, amortisman, 5 yıl ROI ve çevre analizini saniyeler içinde gör. Konut, arsa ve ticari mülk için veri odaklı analiz.",
      },
      {
        property: "og:title",
        content: "emlakmetric — Gayrimenkul analiz platformu",
      },
      {
        property: "og:description",
        content:
          "Getiri, çevre analizi ve yatırım kararı 20 saniyede. Konut, arsa ve dükkan için ROI hesabı.",
      },
    ],
  }),
  component: Home,
});

const tabs = ["Konut", "Arsa", "Dükkan/Ticari"] as const;

const metrics = [
  { label: "Kira getirisi", value: "%6,4", tone: "text-positive" },
  { label: "Amortisman", value: "15,6 yıl", tone: "" },
  { label: "5 yıl ROI", value: "%41", tone: "text-positive" },
  { label: "Arz riski", value: "Yüksek", tone: "text-risk" },
];

const highlights = [
  { icon: TrendingUp, label: "ROI Analizi", desc: "5 yıllık getiri tahmini", color: "var(--positive)" },
  { icon: MapPin, label: "Çevre Analizi", desc: "Mahalle bazlı veri", color: "var(--primary)" },
  { icon: Shield, label: "Risk Skoru", desc: "Arz ve talep dengesi", color: "var(--risk)" },
  { icon: BarChart3, label: "Karşılaştırma", desc: "3 platformdan fiyat", color: "var(--primary)" },
];

const listings = [
  { platform: "sahibinden", url: "sahibinden.com/ilan/8842-daire", price: "4.150.000 ₺", m2: "112 m²", delta: "medyan +%3", positive: false },
  { platform: "hepsiemlak", url: "hepsiemlak.com/ilan/5510-daire", price: "3.890.000 ₺", m2: "108 m²", delta: "medyan −%4", positive: true },
  { platform: "emlakjet", url: "emlakjet.com/ilan/9931-daire", price: "3.725.000 ₺", m2: "115 m²", delta: "medyan −%9", positive: true },
];

const slides: Slide[] = [
  { img: prop1, type: "Konut", title: "3+1 Daire — Ataşehir", roi: "%38", status: "Olumlu", positive: true, note: "Mahalle medyanının %9 altında; kira çarpanı bölge ortalamasının üstünde." },
  { img: prop2, type: "Arsa", title: "İmarlı Parsel — Çekmeköy", roi: "%52", status: "Olumlu", positive: true, note: "İmar planı revizyonu sonrası emsal artışı; 24 ayda %52 değerlenme öngörüsü." },
  { img: prop3, type: "Dükkan", title: "Cadde Üstü Dükkan — Kadıköy", roi: "%17", status: "Riskli", positive: false, note: "Yüksek giriş fiyatı ve dalgalı kira talebi; amortisman 28 yılın üzerinde." },
  { img: mapView, type: "Harita", title: "Yoğunluk Kesiti — Anadolu Yakası", roi: "%29", status: "Olumlu", positive: true, note: "Ulaşım hattı yatırımı çevresinde metrekare fiyatı 18 ayda %29 arttı." },
];

const steps = [
  "İlan verisi çekiliyor",
  "Mahalle medyanı hesaplanıyor",
  "Kira çarpanı & amortisman",
  "Çevre analizi ve karar",
];

const trend = [18, 22, 21, 27, 31, 29, 36, 42, 40, 48, 54, 61];
const riskTrend = [62, 58, 60, 51, 47, 49, 42, 38, 35, 33, 30, 26];

const bars = [
  { k: "Kira getirisi", v: 64, tone: "positive" as const },
  { k: "Bölge fiyat artışı", v: 38, tone: "primary" as const },
  { k: "Likidite (satış hızı)", v: 55, tone: "risk" as const },
  { k: "Arz yoğunluğu", v: 22, tone: "risk" as const },
];

const beforeAfter = [
  { label: "m² fiyat", before: "28.500 ₺", after: "41.200 ₺", change: "+%44", positive: true },
  { label: "Ortalama kira", before: "14.000 ₺", after: "22.500 ₺", change: "+%60", positive: true },
  { label: "Satış süresi", before: "62 gün", after: "28 gün", change: "−%55", positive: true },
  { label: "Arz (aktif ilan)", before: "340", after: "520", change: "+%52", positive: false },
];

function Home() {
  const { t } = useI18n();
  const [tab, setTab] = useState<string>(tabs[0]);
  const [url, setUrl] = useState("emlakjet.com/ilan/9931-daire");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(true);
  const [quotaError, setQuotaError] = useState<"analysis" | "report" | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const runAnalysis = async () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setQuotaError(null);

    const kind = tab === "Arsa" ? "arsa" : tab === "Dükkan/Ticari" ? "ticari" : "konut";

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, kind }),
      });

      if (!res.ok) {
        const body: AnalyseErrorResponse = await res.json();
        if (res.status === 429 && body.resource) {
          setQuotaError(body.resource);
          return;
        }
        if (res.status === 401) {
          window.location.href = "/giris";
          return;
        }
      }
    } catch {
      return;
    }

    setDone(false);
    setStep(0);
    steps.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          if (i === steps.length - 1) {
            timers.current.push(
              setTimeout(() => {
                setDone(true);
                document
                  .getElementById("karar")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 700),
            );
          }
        }, i * 650),
      );
    });
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section
        data-header="light"
        className="relative overflow-hidden md:min-h-[560px]"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 60%)",
        }}
      >
        
        {/* Left veil for text readability */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.6) 45%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-5 py-32 md:px-8 md:py-40 lg:py-48">
          <div className="text-center md:text-left md:max-w-xl">
            <Reveal delay={100}>
              <h1 className="text-4xl font-extrabold leading-[1.04] tracking-tight md:text-6xl lg:text-[76px]">
                İlan linkini yapıştır,
                <br />
                <span className="text-primary">yatırım kararını</span> saniyede
                al.
              </h1>
            </Reveal>

            <Reveal delay={200} variant="fade">
              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Konut, arsa ve ticari mülk için getiri analizi, çevre
                değerlendirmesi ve risk skoru.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("analiz")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-glow mt-10 inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-transform duration-200 hover:scale-[1.03]"
              >
                Hemen Başla
                <ArrowRight className="h-5 w-5" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== FEATURE HIGHLIGHTS ===== */}
      <div className="glass border-y-0 rounded-none">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
          {highlights.map((h, i) => (
            <Reveal key={h.label} delay={i * 60} variant="scale">
              <div
                className={`flex items-center gap-3 px-5 py-4 ${
                  i < highlights.length - 1
                    ? "border-r border-border/40"
                    : ""
                }`}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${h.color} 12%, transparent)`,
                  }}
                >
                  <h.icon className="h-4 w-4" style={{ color: h.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{h.label}</p>
                  <p className="text-xs text-muted-foreground">{h.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ===== PRODUCT PREVIEW ===== */}
      <section data-header="light">
        <div className="mx-auto max-w-5xl px-5 py-16 md:px-8">
          <Reveal variant="scale">
            <MouseCard
              className="glass overflow-hidden rounded-2xl"
              glowColor="var(--primary)"
              tiltMax={3}
              glowOpacity={0.04}
            >
              <div className="flex items-center gap-3 border-b px-5 py-3" style={{ borderColor: "color-mix(in oklab, var(--border) 40%, transparent)" }}>
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-risk/50" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                  <span className="h-2.5 w-2.5 rounded-full bg-positive/50" />
                </span>
                <span className="text-xs text-muted-foreground">
                  emlakmetric — Ataşehir 3+1 Analizi
                </span>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="rounded-xl border border-border/50 bg-card/80 p-5">
                    <TrendChart
                      points={trend}
                      tone="positive"
                      label="m² fiyat trendi — 24 ay"
                      value="+%38"
                    />
                  </div>
                  <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/80 p-5">
                    <Gauge value={41} tone="positive" caption="5 Yıl ROI" />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="glass-hover rounded-xl border border-border/50 bg-card/80 p-4 text-center"
                    >
                      <p className={`text-xl font-bold ${m.tone}`}>
                        {m.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div
                  className="mt-4 flex items-center justify-between rounded-xl bg-positive/5 px-5 py-3"
                  style={{
                    border:
                      "1px solid color-mix(in oklab, var(--positive) 20%, transparent)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-positive" />
                    <span className="text-sm font-semibold text-positive">
                      Olumlu Karar — Al, 5 yıl tut
                    </span>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    Risk: Düşük
                  </span>
                </div>
              </div>
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section data-header="light">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Analiz edilen mülk", value: 12450, suffix: "+", color: "var(--primary)" },
              { label: "İlçe kapsama", value: 39, suffix: "", color: "var(--primary)" },
              { label: "Ortalama doğruluk", value: 94, suffix: "%", color: "var(--positive)" },
              { label: "Aktif kullanıcı", value: 3200, suffix: "+", color: "var(--risk)" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} variant="scale">
                <MouseCard
                  className="glass rounded-xl p-6 text-center"
                  glowColor={s.color}
                  tiltMax={8}
                  glowOpacity={0.06}
                >
                  <p
                    className="text-3xl font-bold"
                    style={{ color: s.color }}
                  >
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ANALYSIS INPUT ===== */}
      <section
        data-header="light"
        id="analiz"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Analiz</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                İlan linkini yapıştır
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan
                linki.
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    tab === t
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
            {quotaError && (
              <div
                className="mb-4 flex flex-col items-start gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderColor: "color-mix(in oklab, var(--risk) 30%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--risk) 6%, transparent)",
                }}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-risk" />
                  <p className="text-sm font-medium text-foreground">
                    {quotaError === "analysis"
                      ? t.quota.analysisExhausted
                      : t.quota.reportExhausted}
                  </p>
                </div>
                <Link
                  to="/paketler"
                  className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
                >
                  {t.quota.viewPlans}
                </Link>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAnalysis();
              }}
              className="glass mt-5 overflow-hidden rounded-xl transition-shadow duration-200 focus-within:shadow-xl focus-within:shadow-primary/10"
            >
              <div className="flex min-w-0 items-center gap-3 px-5 py-4">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-label="İlan linki"
                  placeholder="sahibinden.com / hepsiemlak / emlakjet ilan linki"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="border-t border-border/40 p-1.5">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {done ? (
                    "Analiz Et"
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {done ? null : "Analiz ediliyor"}
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal delay={300}>
            <div className="glass mt-5 overflow-hidden rounded-xl">
              {steps.map((s, i) => {
                const active = !done && step === i;
                const complete = done || step > i;
                return (
                  <div
                    key={s}
                    className={`flex items-center justify-between gap-4 border-b border-border/40 px-5 py-3.5 text-sm last:border-b-0 transition-colors ${
                      active ? "bg-positive/5" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`inline-grid h-5 w-5 place-items-center rounded-full transition-colors ${
                          complete
                            ? "bg-positive text-white"
                            : active
                              ? "border-2 border-primary text-primary"
                              : "border border-border text-muted-foreground"
                        }`}
                      >
                        {complete ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span
                        className={
                          complete
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }
                      >
                        {s}
                      </span>
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        complete
                          ? "text-positive"
                          : active
                            ? "text-primary"
                            : "text-muted-foreground"
                      }`}
                    >
                      {complete ? "Tamam" : active ? "Çalışıyor..." : "Bekliyor"}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== DECISION ===== */}
      <section data-header="light" id="karar">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Karar Raporu</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Yatırım analiz sonucu
              </h2>
            </div>
          </Reveal>

          <Reveal delay={80} variant="scale">
            <MouseCard
              className="glass mt-10 grid gap-10 overflow-hidden rounded-2xl p-6 md:grid-cols-2 md:p-10"
              glowColor="var(--positive)"
              glowOpacity={0.06}
              tiltMax={4}
            >
              <div
                style={{
                  borderLeft: "4px solid var(--positive)",
                  paddingLeft: "1.5rem",
                }}
              >
                <span className="status-pill bg-positive/10 text-positive">
                  <span className="status-dot" />
                  Olumlu Karar
                </span>
                <h2 className="mt-3 text-3xl text-foreground md:text-4xl">
                  Al — <span className="text-positive">5 yıl tut</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Bölge fiyat artışı son 24 ayda %38. İlan, mahalle medyanının
                  %9 altında listelenmiş. Tek risk kalemi: yüksek arz
                  yoğunluğu.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-tactile btn-tactile-positive"
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/report", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ analysisId: "placeholder", format: "pdf" }),
                        });
                        if (!res.ok) {
                          const body: AnalyseErrorResponse = await res.json();
                          if (res.status === 429 && body.resource) {
                            setQuotaError(body.resource);
                            document.getElementById("analiz")?.scrollIntoView({ behavior: "smooth" });
                          }
                          if (res.status === 401) {
                            window.location.href = "/giris";
                          }
                        }
                      } catch {
                        // network error — silently ignore
                      }
                    }}
                  >
                    Raporu indir
                  </button>
                  <button type="button" className="btn-tactile">
                    Riskleri gör
                  </button>
                </div>
              </div>
              <dl className="self-center">
                {metrics.map((m) => (
                  <div
                    key={m.label}
                    className="flex items-baseline justify-between border-t border-border/40 py-4 last:border-b last:border-border/40"
                  >
                    <dt className="text-sm text-muted-foreground">
                      {m.label}
                    </dt>
                    <dd className={`text-sm font-semibold ${m.tone}`}>
                      {m.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </MouseCard>
          </Reveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal variant="slide-left" className="md:col-span-2">
              <MouseCard
                className="glass rounded-xl p-6"
                glowColor="var(--positive)"
                tiltMax={3}
              >
                <TrendChart
                  points={trend}
                  tone="positive"
                  label="m² fiyat trendi — 24 ay"
                  value="+%38"
                />
              </MouseCard>
              <MouseCard
                className="glass mt-4 rounded-xl p-6"
                glowColor="var(--risk)"
                tiltMax={3}
              >
                <TrendChart
                  points={riskTrend}
                  tone="risk"
                  height={110}
                  label="Ortalama satış süresi (gün)"
                  value="−26 gün"
                />
              </MouseCard>
            </Reveal>
            <Reveal
              delay={120}
              variant="slide-right"
              className="grid grid-cols-2 gap-6 self-center md:grid-cols-1"
            >
              <MouseCard
                className="glass flex items-center justify-center rounded-xl p-6"
                glowColor="var(--positive)"
                tiltMax={8}
              >
                <Gauge value={41} tone="positive" caption="5 Yıl ROI" />
              </MouseCard>
              <MouseCard
                className="glass flex items-center justify-center rounded-xl p-6"
                glowColor="var(--risk)"
                tiltMax={8}
              >
                <Gauge value={22} tone="risk" caption="Risk Skoru" />
              </MouseCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== BEFORE / AFTER ===== */}
      <section
        data-header="light"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Öncesi / Sonrası</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Ataşehir — 24 aylık değişim
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {beforeAfter.map((item, i) => (
              <Reveal key={item.label} delay={i * 100} variant="scale">
                <MouseCard
                  className="glass rounded-xl p-5"
                  glowColor={
                    item.positive ? "var(--positive)" : "var(--risk)"
                  }
                  tiltMax={10}
                  glowOpacity={0.08}
                >
                  <p className="label-mono">{item.label}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Önce</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/30">
                        {item.before}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Şimdi</p>
                      <p className="mt-1 text-sm font-bold">{item.after}</p>
                    </div>
                  </div>
                  <div
                    className="mt-3 flex items-center justify-center rounded-lg py-2"
                    style={{
                      backgroundColor: item.positive
                        ? "color-mix(in oklab, var(--positive) 8%, transparent)"
                        : "color-mix(in oklab, var(--risk) 8%, transparent)",
                    }}
                  >
                    <span
                      className={`text-lg font-bold ${item.positive ? "text-positive" : "text-risk"}`}
                    >
                      {item.change}
                    </span>
                  </div>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMPARISON TABLE ===== */}
      <section
        data-header="light"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-warm) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Platform Karşılaştırması</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Aynı mülk, farklı platformlar
              </h2>
            </div>
          </Reveal>
          <Reveal delay={100} variant="scale">
            <MouseCard
              className="glass mt-10 overflow-hidden rounded-xl"
              glowColor="var(--primary)"
              tiltMax={2}
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-muted/20">
                      {["Platform", "İlan", "m²", "Fiyat", "Sapma"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr
                        key={l.platform}
                        className="group border-b border-border/40 transition-colors duration-200 last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="px-5 py-4 font-medium">
                          {l.platform}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {l.url}
                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {l.m2}
                        </td>
                        <td className="px-5 py-4 font-medium">{l.price}</td>
                        <td
                          className={`px-5 py-4 font-medium ${l.positive ? "text-positive" : "text-risk"}`}
                        >
                          <span className="inline-flex items-center gap-2">
                            <span className="status-dot" />
                            {l.delta}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* ===== SLIDER ===== */}
      <section data-header="light">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Yakın Çevre Analizi</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Çevredeki arsa, konut ve dükkanlar
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-10">
              <AnalysisSlider slides={slides} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== BARS ===== */}
      <section
        data-header="light"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-mint) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Mahalle Kesiti</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Ataşehir — metrik dağılımı
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MouseCard
              className="glass mx-auto mt-10 max-w-3xl rounded-xl p-6"
              glowColor="var(--primary)"
              tiltMax={3}
            >
              <Bars data={bars} />
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section data-header="light">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">Nasıl Çalışır?</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                3 adımda yatırım kararı
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Link2,
                title: "İlan linkini yapıştır",
                desc: "Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linki.",
                color: "var(--primary)",
                step: "1",
              },
              {
                icon: Cpu,
                title: "AI analiz etsin",
                desc: "Fiyat, kira getirisi, amortisman ve risk skoru saniyeler içinde.",
                color: "var(--positive)",
                step: "2",
              },
              {
                icon: FileCheck,
                title: "Karar raporunu al",
                desc: "Al/satma/bekle kararı ve detaylı rapor oluşturulur.",
                color: "var(--positive)",
                step: "3",
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 120} variant="slide-right">
                <MouseCard
                  className="glass relative flex flex-col items-center rounded-xl p-8 text-center"
                  glowColor={s.color}
                  tiltMax={10}
                  glowOpacity={0.1}
                >
                  <span
                    className="absolute -top-4 inline-grid h-8 w-8 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.step}
                  </span>
                  <div
                    className="mt-2 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor: `color-mix(in oklab, ${s.color} 12%, transparent)`,
                    }}
                  >
                    <s.icon
                      className="h-6 w-6"
                      style={{ color: s.color }}
                    />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
          <Reveal delay={400} variant="fade">
            <div className="mt-4 hidden items-center justify-center gap-2 text-muted-foreground md:flex">
              <span className="h-px w-20 bg-border" />
              <span className="text-xs">Link</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-lg">→</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-xs">Analiz</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-lg">→</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-xs">Karar</span>
              <span className="h-px w-20 bg-border" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
        data-header="light"
        style={{
          background: "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal variant="blur">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Yatırım kararınızı{" "}
                <span className="text-primary">veriye</span> dayandırın.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                İlan linkini yapıştırın, 20 saniyede kira getirisi, ROI ve
                çevre analizini görün.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("analiz")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  Hemen Analiz Et
                  <ArrowUpRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Kredi kartı gerekmez
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
