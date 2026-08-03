import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Loader2,
  MapPin,
  BarChart3,
  Shield,
  Link2,
  Cpu,
  FileCheck,
  AlertTriangle,
  Sparkles,
  Crown,
  Zap,
  Building2,
} from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { MouseCard } from "@/components/MouseCard";
import { BillingRepository, BillingService, Plan, QuotaExhaustedError, NotAuthenticatedError, type Entitlements } from "@/lib/billing/billing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthProvider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "emlakmetric — Fiyat tek başına bir şey söylemez" },
      {
        name: "description",
        content:
          "Bir ilanın rakamları, ancak mahallesinin rakamlarıyla yan yana konduğunda anlam kazanır. Konut, arsa ve ticari mülk için mahalle bazlı karşılaştırmalı analiz.",
      },
      {
        property: "og:title",
        content: "emlakmetric — Fiyat tek başına bir şey söylemez",
      },
      {
        property: "og:description",
        content:
          "Bir ilanın rakamları, ancak mahallesinin rakamlarıyla yan yana konduğunda anlam kazanır. Mahalle bazlı karşılaştırmalı analiz.",
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

const FALLBACK_PLANS = [
  new Plan("free", "Free", 0, "TRY", 3, 3, false, 1),
  new Plan("pro", "Pro", 0, "TRY", 100, 100, true, 2),
  new Plan("enterprise", "Enterprise", 0, "TRY", 1000, 1000, false, 3),
];

const beforeAfter = [
  { label: "m² fiyat", before: "28.500 ₺", after: "41.200 ₺", change: "+%44", positive: true },
  { label: "Ortalama kira", before: "14.000 ₺", after: "22.500 ₺", change: "+%60", positive: true },
  { label: "Satış süresi", before: "62 gün", after: "28 gün", change: "−%55", positive: true },
  { label: "Arz (aktif ilan)", before: "340", after: "520", change: "+%52", positive: false },
];

function Home() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>(tabs[0]);
  const [url, setUrl] = useState("emlakjet.com/ilan/9931-daire");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(true);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [quotaError, setQuotaError] = useState<"analysis" | "report" | null>(null);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    try {
      const db = getSupabaseBrowserClient();
      const service = new BillingService(new BillingRepository(db));
      service.listPlans().then(p => setPlans(p.length ? p : FALLBACK_PLANS)).catch(() => {});
      service.entitlements().then(setEnt).catch(() => {});
    } catch {
      // Supabase env vars not set — keep fallback plans
    }
  }, []);

  const runAnalysis = async () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setQuotaError(null);
    setAuthPrompt(false);

    if (!user) {
      setAuthPrompt(true);
      return;
    }

    try {
      const db = getSupabaseBrowserClient();
      const service = new BillingService(new BillingRepository(db));
      const kind = tab === "Arsa" ? "arsa" as const : tab === "Dükkan/Ticari" ? "ticari" as const : "konut" as const;
      await service.analyse(url, kind);
    } catch (err) {
      if (err instanceof QuotaExhaustedError) {
        setQuotaError(err.resource);
        return;
      }
      if (err instanceof NotAuthenticatedError) {
        setAuthPrompt(true);
        return;
      }
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
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 60%)",
        }}
      >
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-36 lg:py-44">
          <div className="mx-auto max-w-2xl text-center">
            <Reveal delay={100}>
              <h1 className="text-[clamp(2rem,6vw,4.75rem)] font-extrabold leading-[1.08] tracking-tight">
                {t.hero.titleBefore}{" "}
                <span className="text-primary">{t.hero.titleHighlight}</span>
              </h1>
            </Reveal>

            <Reveal delay={200} variant="fade">
              <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
                {t.hero.subtitle}
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
                {t.hero.cta}
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ===== PRODUCT PREVIEW ===== */}
      <section>
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

      {/* ===== ANALYSIS INPUT ===== */}
      <section
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
            {authPrompt && (
              <div
                className="mb-4 flex flex-col items-start gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                style={{
                  borderColor: "color-mix(in oklab, var(--primary) 30%, transparent)",
                  backgroundColor: "color-mix(in oklab, var(--primary) 6%, transparent)",
                }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    {t.auth.loginRequired}
                  </p>
                </div>
                <Link
                  to="/giris"
                  search={{ redirect: "/#analiz" }}
                  className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
                >
                  {t.auth.loginToAnalyze}
                </Link>
              </div>
            )}

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
                <button
                  type="button"
                  onClick={() => document.getElementById("paketler")?.scrollIntoView({ behavior: "smooth" })}
                  className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-all hover:-translate-y-0.5"
                >
                  {t.quota.viewPlans}
                </button>
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

      {/* ===== PRICING ===== */}
      {plans.length > 0 && (
        <section id="paketler">
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <Reveal variant="blur">
              <div className="text-center">
                <p className="label-mono">{t.pricing.title}</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  {t.pricing.subtitle}
                </h2>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {plans.map((plan, i) => {
                const isCurrent = ent?.planCode === plan.code;
                const Icon = plan.code === "enterprise" ? Building2 : plan.code === "pro" ? Crown : Sparkles;
                const color = plan.code === "enterprise" ? "var(--positive)" : plan.code === "pro" ? "var(--primary)" : "var(--muted-foreground)";
                const desc = t.pricing.planDescriptions[plan.code];
                const features = t.pricing.planFeatures[plan.code];

                return (
                  <Reveal key={plan.code} delay={i * 100} variant="scale">
                    <MouseCard
                      className={`glass relative flex h-full flex-col rounded-2xl p-6 ${plan.isFeatured ? "ring-2 ring-primary/30" : ""}`}
                      glowColor={color}
                      tiltMax={6}
                      glowOpacity={0.08}
                    >
                      {plan.isFeatured && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
                          {t.pricing.badge}
                        </span>
                      )}

                      {isCurrent && (
                        <span className="absolute -top-3 right-4 rounded-full bg-positive px-3 py-1 text-xs font-bold text-white shadow-md">
                          {t.pricing.currentPlan}
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)` }}
                        >
                          <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <h3 className="text-lg font-bold">{plan.name}</h3>
                      </div>

                      <div className="mt-4">
                        <span className="text-3xl font-extrabold">
                          {plan.formatPrice(locale === "en" ? "en-US" : "tr-TR")}
                        </span>
                        {!plan.isFree && (
                          <span className="ml-1 text-sm text-muted-foreground">{t.pricing.perMonth}</span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{desc}</p>

                      <div className="mt-5 space-y-2.5 rounded-xl bg-muted/30 p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 shrink-0" style={{ color }} />
                          <span className="text-sm font-semibold">
                            {plan.analysisQuota} {t.pricing.monthlyAnalysisCount}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 shrink-0" style={{ color }} />
                          <span className="text-sm font-semibold">
                            {plan.reportQuota} {t.pricing.monthlyReportCount}
                          </span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2.5">
                        {features.map((f) => (
                          <div key={f} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
                            <span className="text-sm text-muted-foreground">{f}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-6">
                        {plan.code === "enterprise" ? (
                          <Link
                            to="/iletisim"
                            className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-current px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                            style={{ color }}
                          >
                            {t.pricing.contactSales}
                          </Link>
                        ) : isCurrent ? (
                          <button
                            type="button"
                            disabled
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-positive/10 px-6 py-3 text-sm font-semibold text-positive"
                          >
                            <Check className="h-4 w-4" />
                            {t.pricing.currentPlan}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
                          >
                            {plan.isFree ? t.pricing.getStarted : t.pricing.upgrade}
                          </button>
                        )}
                      </div>
                    </MouseCard>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ===== DECISION ===== */}
      <section id="karar">
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
                        const db = getSupabaseBrowserClient();
                        const svc = new BillingService(new BillingRepository(db));
                        await svc.downloadReport("placeholder", "pdf");
                      } catch (err) {
                        if (err instanceof QuotaExhaustedError) {
                          setQuotaError(err.resource);
                          document.getElementById("analiz")?.scrollIntoView({ behavior: "smooth" });
                        }
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
      <section>
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
      <section>
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
              <span className="text-lg text-primary">•</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-xs">Analiz</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-lg text-primary">•</span>
              <span className="h-px w-16 bg-border" />
              <span className="text-xs">Karar</span>
              <span className="h-px w-20 bg-border" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section
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
