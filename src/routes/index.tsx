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
import { BillingRepository, BillingService, Plan, type Entitlements } from "@/lib/billing/billing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import heroCity1920WebP from "@/assets/hero/hero-city-1920.webp";
import heroCity1280WebP from "@/assets/hero/hero-city-1280.webp";
import heroCity768WebP from "@/assets/hero/hero-city-768.webp";
import heroCity1920Jpg from "@/assets/hero/hero-city-1920.jpg";
import heroCity1280Jpg from "@/assets/hero/hero-city-1280.jpg";
import heroCity768Jpg from "@/assets/hero/hero-city-768.jpg";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthProvider";
import { NeighborhoodSwarm } from "@/components/analysis/NeighborhoodSwarm";
import { derive } from "@/lib/analysis/derive";

type AnalyseErrorResponse = { error: string; resource?: "analysis" | "report" };

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

function mulberry32(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _r = mulberry32(42);
const _base = 36800;
const demoComps: number[] = [];
for (let i = 0; i < 90; i++) {
  const g = (_r() + _r() + _r() + _r() - 2) / 2;
  demoComps.push(
    Math.max(_base * 0.4, Math.round(_base * (1 + g * 0.28))),
  );
}
demoComps.sort((a, b) => a - b);
const demoMedian = demoComps[Math.floor(demoComps.length * 0.5)];
const demoQ1 = demoComps[Math.floor(demoComps.length * 0.25)];
const demoQ3 = demoComps[Math.floor(demoComps.length * 0.75)];
const demoListingPrice = Math.round(demoMedian * 0.91);
const demoArea = 115;
const demoRent = demoListingPrice * demoArea * 0.0044;
const demoNoise = 1.8;
const demoBase = derive(demoListingPrice, demoMedian, demoArea, demoRent, demoNoise);

const SPINE_LABELS = ["VERİ", "MEDYAN", "GETİRİ", "KARAR"] as const;
const SPINE_LABELS_SHORT = ["VERİ", "MDY", "GTR", "KRR"] as const;

function SlotNumber({ text, animate }: { text: string; animate: boolean }) {
  const [display, setDisplay] = useState(text);
  const didAnimate = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!animate || didAnimate.current) {
      setDisplay(text);
      return;
    }

    didAnimate.current = true;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) {
      setDisplay(text);
      return;
    }

    const chars = text.split("");
    const duration = 1100;
    const perChar = duration / chars.length;
    const start = performance.now();

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - start;
      const settledCount = Math.min(chars.length, Math.floor(elapsed / perChar));

      if (settledCount >= chars.length) {
        setDisplay(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      const result = chars.map((ch, i) => {
        if (i < settledCount) return ch;
        if (/\d/.test(ch)) return String(Math.floor(Math.random() * 10));
        return ch;
      });
      setDisplay(result.join(""));
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [animate, text]);

  return (
    <span aria-label={text} className="slot-number">
      {display}
    </span>
  );
}

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
  const [animateResults, setAnimateResults] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const textWrapRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [downPct, setDownPct] = useState(30);
  const [termYears, setTermYears] = useState(10);
  const [monthlyRate, setMonthlyRate] = useState(2.5);
  const [barsVisible, setBarsVisible] = useState(false);
  const barsFirstRender = useRef(true);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    const hero = heroRef.current;
    const imgWrap = imgWrapRef.current;
    const textWrap = textWrapRef.current;
    if (!hero || !imgWrap || !textWrap) return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mql.matches) return;

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = hero.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      imgWrap.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
      textWrap.style.transform = `translate(${x * 4}px, ${y * 4}px)`;
    };
    const onLeave = () => {
      imgWrap.style.transform = "";
      textWrap.style.transform = "";
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

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

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsVisible(true);
          io.disconnect();
          setTimeout(() => { barsFirstRender.current = false; }, 1300);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
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
    setAnimateResults(false);
    setStep(0);
    steps.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          if (i === steps.length - 1) {
            timers.current.push(
              setTimeout(() => {
                setDone(true);
                setAnimateResults(true);
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

  const bargainPrice = Math.round(demoListingPrice * (1 - discount / 100));
  const derived = derive(bargainPrice, demoMedian, demoArea, demoRent, demoNoise);
  const scoreDiff = derived.score - demoBase.score;

  const liveMetrics = [
    { label: "Kira getirisi", value: `%${derived.yieldPct.toFixed(1).replace(".", ",")}`, tone: "text-positive" },
    { label: "Amortisman", value: `${derived.payback.toFixed(1).replace(".", ",")} yıl`, tone: "" },
    { label: "Medyan farkı", value: `%${derived.delta.toFixed(1).replace(".", ",")}`, tone: derived.delta <= 0 ? "text-positive" : "text-risk" },
    { label: "Skor", value: `${derived.score}/96`, tone: derived.score >= 60 ? "text-positive" : derived.score >= 40 ? "" : "text-risk" },
  ];

  const scoreParts = [
    { key: "base", label: t.analysis.partBase, value: derived.parts.base, pct: Math.min(Math.abs(derived.parts.base) / 34 * 100, 100), color: "var(--muted-foreground)", tone: "" },
    { key: "price", label: t.analysis.partPrice, value: derived.parts.fiyat, pct: Math.min(Math.abs(derived.parts.fiyat) / 34 * 100, 100), color: derived.parts.fiyat >= 0 ? "var(--positive)" : "var(--risk)", tone: derived.parts.fiyat >= 0 ? "text-positive" : "text-risk" },
    { key: "yield", label: t.analysis.partYield, value: derived.parts.getiri, pct: Math.min(Math.abs(derived.parts.getiri) / 34 * 100, 100), color: derived.parts.getiri >= 0 ? "var(--positive)" : "var(--risk)", tone: derived.parts.getiri >= 0 ? "text-positive" : "text-risk" },
    { key: "market", label: t.analysis.partMarket, value: derived.parts.piyasa, pct: Math.min(Math.abs(derived.parts.piyasa) / 34 * 100, 100), color: derived.parts.piyasa >= 0 ? "var(--positive)" : "var(--risk)", tone: derived.parts.piyasa >= 0 ? "text-positive" : "text-risk" },
  ];

  const fmtLocale = locale === "en" ? "en-US" : "tr-TR";
  const mortgageLoan = derived.total * (1 - downPct / 100);
  const mortgageN = termYears * 12;
  const mortgageI = monthlyRate / 100;
  const mortgagePayment = mortgageI > 0
    ? mortgageLoan * mortgageI * Math.pow(1 + mortgageI, mortgageN) / (Math.pow(1 + mortgageI, mortgageN) - 1)
    : mortgageLoan / mortgageN;
  const coveragePct = mortgagePayment > 0 ? (demoRent / mortgagePayment) * 100 : 0;
  const mortgageTotalPayment = mortgagePayment * mortgageN;
  const mortgageTotalRatio = derived.total > 0 ? mortgageTotalPayment / derived.total : 0;
  const coverageColor = coveragePct >= 100 ? "var(--positive)" : coveragePct >= 60 ? "var(--primary)" : "var(--risk)";
  const coverageTone = coveragePct >= 100 ? "text-positive" : coveragePct >= 60 ? "text-primary" : "text-risk";

  return (
    <div>
      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        data-header="dark"
        className="relative -mt-14 overflow-hidden"
        style={{ height: "min(100svh, 880px)" }}
      >
        <div className="absolute -inset-3 overflow-hidden">
          <div ref={imgWrapRef} className="h-[calc(100%+24px)] w-[calc(100%+24px)]">
            <picture>
              <source
                type="image/webp"
                srcSet={`${heroCity768WebP} 768w, ${heroCity1280WebP} 1280w, ${heroCity1920WebP} 1920w`}
                sizes="100vw"
              />
              <img
                src={heroCity1920Jpg}
                srcSet={`${heroCity768Jpg} 768w, ${heroCity1280Jpg} 1280w, ${heroCity1920Jpg} 1920w`}
                sizes="100vw"
                alt=""
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="hero-img h-full w-full object-cover"
                style={{ objectPosition: "center 78%" }}
              />
            </picture>
          </div>
        </div>

        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.52) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.46) 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.30) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-center px-5 pt-14 md:px-8">
          <div ref={textWrapRef} className="max-w-[34rem]">
            <p
              className="hero-entrance flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.70)" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-positive" />
              {t.hero.badge}
            </p>

            <h1
              className="hero-entrance mt-5 font-bold leading-[1.08] tracking-tight text-white"
              style={{ fontSize: "clamp(2.6rem, 5.6vw, 4.4rem)", animationDelay: "80ms" }}
            >
              {t.hero.titleBefore}{" "}
              <span style={{ color: "#7C9BFF" }}>{t.hero.titleHighlight}</span>
            </h1>

            <p
              className="hero-entrance mt-6 leading-relaxed"
              style={{ fontSize: "clamp(15px, 1.6vw, 18px)", color: "rgba(255,255,255,0.78)", animationDelay: "160ms" }}
            >
              {t.hero.subtitle}
            </p>

            <div
              className="hero-entrance mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
              style={{ animationDelay: "240ms" }}
            >
              <button
                type="button"
                onClick={() => document.getElementById("analiz")?.scrollIntoView({ behavior: "smooth" })}
                className="hero-btn-filled"
              >
                {t.hero.ctaPrimary}
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("nasil-calisir")?.scrollIntoView({ behavior: "smooth" })}
                className="hero-btn-glass"
              >
                {t.hero.ctaSecondary}
              </button>
            </div>

          </div>
        </div>
      </section>

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
            <div className="mt-8 px-2" role="progressbar" aria-valuenow={done ? 4 : step + 1} aria-valuemin={0} aria-valuemax={4}>
              <div className="relative flex items-center justify-between">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-border/40" />
                <div
                  className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-positive transition-all duration-500 ease-out"
                  style={{ width: `${done ? 100 : step >= 0 ? (step / (steps.length - 1)) * 100 : 0}%` }}
                />
                {steps.map((_, i) => {
                  const active = !done && step === i;
                  const complete = done || step > i;
                  return (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`relative flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300 ${
                          complete
                            ? "bg-positive"
                            : active
                              ? "spine-active bg-primary"
                              : "bg-border/40"
                        }`}
                      >
                        {complete && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span
                        className={`mt-2.5 font-mono text-[10.5px] font-medium uppercase transition-opacity duration-300 ${
                          complete || active ? "opacity-100" : "opacity-50"
                        }`}
                        style={{ letterSpacing: ".06em" }}
                      >
                        <span className="hidden sm:inline">{SPINE_LABELS[i]}</span>
                        <span className="sm:hidden">{SPINE_LABELS_SHORT[i]}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
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

          <Reveal delay={60}>
            <div className="glass mt-10 overflow-hidden rounded-2xl p-5 md:p-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="font-mono text-[10.5px] font-medium uppercase tracking-[.06em] text-muted-foreground">
                  Mahalle m² Dağılımı — 90 emsal
                </span>
              </div>
              <NeighborhoodSwarm
                comps={demoComps}
                median={demoMedian}
                q1={demoQ1}
                q3={demoQ3}
                price={bargainPrice}
              />

              {/* Bargain slider */}
              <div className="mt-6 rounded-xl border border-border/40 bg-muted/20 p-4 md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label
                    htmlFor="bargain-slider"
                    className="font-mono text-[10.5px] font-medium uppercase tracking-[.06em] text-muted-foreground"
                  >
                    İndirim
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="min-w-[3.5rem] text-right font-mono text-sm font-semibold tabular-nums text-foreground">
                      %{discount.toFixed(1).replace(".", ",")}
                    </span>
                    {discount > 0 && (
                      <button
                        type="button"
                        onClick={() => setDiscount(0)}
                        className="rounded-md border border-border/60 bg-background px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>
                <input
                  id="bargain-slider"
                  type="range"
                  min={0}
                  max={25}
                  step={0.5}
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  aria-label={`İndirim: %${discount.toFixed(1)} — Yeni fiyat: ${bargainPrice.toLocaleString("tr-TR")} ₺/m²`}
                  aria-valuetext={`Yüzde ${discount.toFixed(1)} indirim, ${bargainPrice.toLocaleString("tr-TR")} lira metrekare`}
                  className="bargain-range mt-3 w-full"
                  style={{ touchAction: "none" }}
                />
                {discount > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    %{discount.toFixed(1).replace(".", ",")} indirim skoru{" "}
                    <span className={scoreDiff > 0 ? "font-semibold text-positive" : "font-semibold text-risk"}>
                      {scoreDiff > 0 ? "+" : ""}{scoreDiff} puan
                    </span>{" "}
                    değiştirdi.
                  </p>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} variant="scale">
            <MouseCard
              className="glass mt-6 grid gap-10 overflow-hidden rounded-2xl p-6 md:grid-cols-2 md:p-10"
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
              <dl className="self-center" aria-live="polite">
                {liveMetrics.map((m, i) => (
                  <div
                    key={m.label}
                    className={`flex items-baseline justify-between border-t border-border/40 py-4 last:border-b last:border-border/40 ${animateResults ? "card-entrance" : ""}`}
                    style={animateResults ? { animationDelay: `${i * 100}ms` } : undefined}
                  >
                    <dt className="text-sm text-muted-foreground">
                      {m.label}
                    </dt>
                    <dd className={`text-sm font-semibold ${m.tone}`}>
                      <SlotNumber text={m.value} animate={animateResults} />
                    </dd>
                  </div>
                ))}
              </dl>
            </MouseCard>
          </Reveal>

          {/* ===== SCORE BREAKDOWN & MORTGAGE ===== */}
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Reveal delay={180} variant="scale">
              <div className="glass h-full rounded-2xl p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[.06em] text-muted-foreground">
                    {t.analysis.scoreBreakdown}
                  </span>
                </div>
                <div ref={barsRef} className="space-y-3">
                  {scoreParts.map((part, i) => (
                    <div key={part.key} className="flex items-center gap-3">
                      <span className="w-28 shrink-0 text-xs text-muted-foreground">{part.label}</span>
                      <div className="relative h-5 flex-1 overflow-hidden rounded-sm bg-muted/30">
                        <div
                          className="score-bar h-full rounded-sm"
                          style={{
                            width: barsVisible ? `${part.pct}%` : "0%",
                            backgroundColor: part.color,
                            transitionTimingFunction: barsFirstRender.current ? "cubic-bezier(.16,1,.3,1)" : "ease",
                            transitionDuration: barsFirstRender.current ? "900ms" : "200ms",
                            transitionDelay: barsFirstRender.current ? `${i * 90}ms` : "0ms",
                          }}
                        />
                      </div>
                      <span className={`w-12 shrink-0 text-right font-mono text-xs font-semibold tabular-nums ${part.tone}`}>
                        {part.key === "base"
                          ? part.value.toFixed(1).replace(".", locale === "en" ? "." : ",")
                          : `${part.value > 0 ? "+" : ""}${part.value.toFixed(1).replace(".", locale === "en" ? "." : ",")}`}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
                  <span className="text-sm font-medium text-muted-foreground">{t.analysis.totalScore}</span>
                  <span className="text-lg font-bold text-primary">{derived.score}/96</span>
                </div>
                {discount > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    %{discount.toFixed(1).replace(".", ",")} indirim skoru{" "}
                    <span className={scoreDiff > 0 ? "font-semibold text-positive" : "font-semibold text-risk"}>
                      {scoreDiff > 0 ? "+" : ""}{scoreDiff} puan
                    </span>{" "}
                    değiştirdi.
                  </p>
                )}
              </div>
            </Reveal>

            <Reveal delay={240} variant="scale">
              <div className="glass h-full rounded-2xl p-5 md:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-mono text-[10.5px] font-medium uppercase tracking-[.06em] text-muted-foreground">
                    {t.analysis.mortgageVsRent}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="down-pct" className="text-xs text-muted-foreground">{t.analysis.downPayment}</label>
                      <span className="font-mono text-sm font-semibold tabular-nums">%{downPct}</span>
                    </div>
                    <input
                      id="down-pct"
                      type="range"
                      min={0}
                      max={80}
                      step={5}
                      value={downPct}
                      onChange={(e) => setDownPct(Number(e.target.value))}
                      className="bargain-range mt-1.5 w-full"
                      style={{ touchAction: "none" }}
                      aria-label={`${t.analysis.downPayment}: %${downPct}`}
                      aria-valuetext={`%${downPct}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="term-years" className="text-xs text-muted-foreground">{t.analysis.term}</label>
                      <span className="font-mono text-sm font-semibold tabular-nums">{termYears} {t.analysis.years}</span>
                    </div>
                    <input
                      id="term-years"
                      type="range"
                      min={1}
                      max={20}
                      step={1}
                      value={termYears}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      className="bargain-range mt-1.5 w-full"
                      style={{ touchAction: "none" }}
                      aria-label={`${t.analysis.term}: ${termYears} ${t.analysis.years}`}
                      aria-valuetext={`${termYears} ${t.analysis.years}`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="monthly-rate" className="text-xs text-muted-foreground">{t.analysis.monthlyInterest}</label>
                      <span className="font-mono text-sm font-semibold tabular-nums">%{monthlyRate.toFixed(1).replace(".", ",")}</span>
                    </div>
                    <input
                      id="monthly-rate"
                      type="range"
                      min={0.5}
                      max={5}
                      step={0.1}
                      value={monthlyRate}
                      onChange={(e) => setMonthlyRate(Number(e.target.value))}
                      className="bargain-range mt-1.5 w-full"
                      style={{ touchAction: "none" }}
                      aria-label={`${t.analysis.monthlyInterest}: %${monthlyRate.toFixed(1)}`}
                      aria-valuetext={`%${monthlyRate.toFixed(1).replace(".", ",")}`}
                    />
                  </div>
                </div>
                <div className="mt-5 space-y-2.5 border-t border-border/40 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">{t.analysis.monthlyPayment}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {Math.round(mortgagePayment).toLocaleString(fmtLocale)} ₺
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground">{t.analysis.monthlyRent}</span>
                    <span className="font-mono text-sm font-semibold tabular-nums">
                      {Math.round(demoRent).toLocaleString(fmtLocale)} ₺
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">{t.analysis.rentCoverage}</span>
                      <span className={`font-mono text-sm font-semibold tabular-nums ${coverageTone}`}>
                        %{Math.min(coveragePct, 999).toFixed(0)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted/30">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${coveragePct >= 100 ? "coverage-glow" : ""}`}
                        style={{
                          width: `${Math.min(coveragePct, 100)}%`,
                          backgroundColor: coverageColor,
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-border/40 pt-2.5">
                    <span className="text-xs text-muted-foreground">{t.analysis.totalPayment}</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-semibold tabular-nums">
                        {Math.round(mortgageTotalPayment).toLocaleString(fmtLocale)} ₺
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({t.analysis.timesPrice.replace("{x}", mortgageTotalRatio.toFixed(1).replace(".", locale === "en" ? "." : ","))})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Reveal variant="slide-left" className="md:col-span-2">
              <MouseCard
                className={`glass rounded-xl p-6 ${animateResults ? "card-entrance" : ""}`}
                glowColor="var(--positive)"
                tiltMax={3}
                style={animateResults ? { animationDelay: "0ms" } : undefined}
              >
                <TrendChart
                  points={trend}
                  tone="positive"
                  label="m² fiyat trendi — 24 ay"
                  value="+%38"
                />
              </MouseCard>
              <MouseCard
                className={`glass mt-4 rounded-xl p-6 ${animateResults ? "card-entrance" : ""}`}
                glowColor="var(--risk)"
                tiltMax={3}
                style={animateResults ? { animationDelay: "100ms" } : undefined}
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
                className={`glass flex items-center justify-center rounded-xl p-6 ${animateResults ? "card-entrance" : ""}`}
                glowColor="var(--positive)"
                tiltMax={8}
                style={animateResults ? { animationDelay: "200ms" } : undefined}
              >
                <Gauge value={41} tone="positive" caption="5 Yıl ROI" />
              </MouseCard>
              <MouseCard
                className={`glass flex items-center justify-center rounded-xl p-6 ${animateResults ? "card-entrance" : ""}`}
                glowColor="var(--risk)"
                tiltMax={8}
                style={animateResults ? { animationDelay: "300ms" } : undefined}
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
      <section data-header="light" id="nasil-calisir">
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
        data-header="light"
        style={{
          background: "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
          <Reveal variant="blur">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t.cta.titleBefore}{" "}
                <span className="text-primary">{t.cta.titleHighlight}</span>{" "}
                {t.cta.titleAfter}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t.cta.subtitle}
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("analiz")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="btn-glow flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  {t.cta.button}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
