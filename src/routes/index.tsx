import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  Loader2,
  MapPin,
  Link2,
  Cpu,
  FileCheck,
} from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { MouseCard, CountUp } from "@/components/MouseCard";
import { CitySilhouette } from "@/components/CitySilhouette";
import { useT, useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "emlakmetric — Gayrimenkul analiz platformu" },
      {
        name: "description",
        content:
          "İlan linkini yapıştır; piyasa analizi, çevre değerlendirmesi ve risk skorunu saniyeler içinde gör. Konut, arsa ve ticari mülk için veri odaklı analiz.",
      },
      {
        property: "og:title",
        content: "emlakmetric — Gayrimenkul analiz platformu",
      },
      {
        property: "og:description",
        content:
          "Piyasa analizi ve çevre değerlendirmesi 20 saniyede. Konut, arsa ve dükkan için kapsamlı analiz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const metrics = [
  { key: "metric.rent" as const, value: "%6,4", tone: "text-positive" },
  { key: "metric.amort" as const, value: "15,6 yıl", tone: "" },
  { key: "metric.roi" as const, value: "%41", tone: "text-positive" },
  { key: "metric.supply" as const, value: "Yüksek", tone: "text-risk" },
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

const trend = [18, 22, 21, 27, 31, 29, 36, 42, 40, 48, 54, 61];
const riskTrend = [62, 58, 60, 51, 47, 49, 42, 38, 35, 33, 30, 26];

const beforeAfter = [
  { key: "ba.m2" as const, before: "28.500 ₺", after: "41.200 ₺", change: "+%44", positive: true },
  { key: "ba.rent" as const, before: "14.000 ₺", after: "22.500 ₺", change: "+%60", positive: true },
  { key: "ba.sale" as const, before: "62 gün", after: "28 gün", change: "−%55", positive: true },
  { key: "ba.supply" as const, before: "340", after: "520", change: "+%52", positive: false },
];

function Home() {
  const t = useT();
  const { locale } = useI18n();
  const tabKeys = ["tab.konut", "tab.arsa", "tab.ticari"] as const;
  const [tab, setTab] = useState(0);
  const [url, setUrl] = useState("emlakjet.com/ilan/9931-daire");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stepKeys = [
    "analysis.step1",
    "analysis.step2",
    "analysis.step3",
    "analysis.step4",
  ] as const;

  const barData = [
    { k: t("bar.rent"), v: 64, tone: "positive" as const },
    { k: t("bar.price"), v: 38, tone: "primary" as const },
    { k: t("bar.liquidity"), v: 55, tone: "risk" as const },
    { k: t("bar.supply"), v: 22, tone: "risk" as const },
  ];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const runAnalysis = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDone(false);
    setStep(0);
    stepKeys.forEach((_, i) => {
      timers.current.push(
        setTimeout(() => {
          setStep(i);
          if (i === stepKeys.length - 1) {
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
            "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 80%)",
        }}
      >
        <CitySilhouette className="absolute inset-0 z-0" />

        <div className="relative z-10 mx-auto max-w-6xl px-5 pt-32 pb-20 md:px-8 md:pt-44 md:pb-28 lg:pt-48 lg:pb-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal delay={100}>
              <h1 className="text-4xl font-extrabold leading-[1.06] tracking-tight md:text-6xl lg:text-[72px]">
                {t("hero.line1")}
                <br />
                <span className="text-primary">{t("hero.highlight")}</span>{" "}
                {t("hero.line2")}
              </h1>
            </Reveal>

            <Reveal delay={200} variant="fade">
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {t("hero.sub")}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("analiz")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="btn-glow rounded-xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground transition-transform duration-200 hover:scale-[1.03]"
                >
                  {t("hero.cta")}
                </button>
              </div>
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
                  emlakmetric — Ataşehir 3+1 {t("analysis.label")}
                </span>
              </div>

              <div className="p-4 md:p-6">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
                  <div className="rounded-xl border border-border/50 bg-card/80 p-5">
                    <TrendChart
                      points={trend}
                      tone="positive"
                      label={t("chart.m2.label")}
                      value="+%38"
                    />
                  </div>
                  <div className="flex items-center justify-center rounded-xl border border-border/50 bg-card/80 p-5">
                    <Gauge value={41} tone="positive" caption={t("chart.roi")} />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {metrics.map((m) => (
                    <div
                      key={m.key}
                      className="glass-hover rounded-xl border border-border/50 bg-card/80 p-4 text-center"
                    >
                      <p className={`text-xl font-bold ${m.tone}`}>
                        {m.value}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t(m.key)}
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
                      {t("decision.positive.short")}
                    </span>
                  </div>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    {t("decision.risk.low")}
                  </span>
                </div>
              </div>
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { key: "stats.analyzed" as const, value: 12450, suffix: "+", color: "var(--primary)" },
              { key: "stats.districts" as const, value: 39, suffix: "", color: "var(--primary)" },
              { key: "stats.accuracy" as const, value: 94, suffix: "%", color: "var(--positive)" },
              { key: "stats.users" as const, value: 3200, suffix: "+", color: "var(--risk)" },
            ].map((s, i) => (
              <Reveal key={s.key} delay={i * 80} variant="scale">
                <MouseCard
                  className="glass rounded-xl p-6 text-center"
                  glowColor={s.color}
                  tiltMax={8}
                  glowOpacity={0.06}
                >
                  <p className="text-3xl font-bold" style={{ color: s.color }}>
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(s.key)}
                  </p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
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
              <p className="label-mono">{t("analysis.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("analysis.title")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                {t("analysis.sub")}
              </p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {tabKeys.map((tk, i) => (
                <button
                  key={tk}
                  type="button"
                  onClick={() => setTab(i)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    tab === i
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(tk)}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={200}>
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
                  aria-label={t("analysis.placeholder")}
                  placeholder={t("analysis.placeholder")}
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <div className="border-t border-border/40 p-1.5">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {done ? (
                    t("analysis.button")
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {done ? null : t("analysis.running")}
                </button>
              </div>
            </form>
          </Reveal>

          <Reveal delay={300}>
            <div className="glass mt-5 overflow-hidden rounded-xl">
              {stepKeys.map((sk, i) => {
                const active = !done && step === i;
                const complete = done || step > i;
                return (
                  <div
                    key={sk}
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
                        {t(sk)}
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
                      {complete
                        ? t("analysis.done")
                        : active
                          ? t("analysis.active")
                          : t("analysis.waiting")}
                    </span>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== DECISION ===== */}
      <section id="karar">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">{t("decision.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("decision.title")}
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
                  {t("decision.positive")}
                </span>
                <h2 className="mt-3 text-3xl text-foreground md:text-4xl">
                  {t("decision.buy")}{" "}
                  <span className="text-positive">{t("decision.hold")}</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  {t("decision.desc")}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className="btn-tactile btn-tactile-positive">
                    {t("decision.download")}
                  </button>
                  <button type="button" className="btn-tactile">
                    {t("decision.risks")}
                  </button>
                </div>
              </div>
              <dl className="self-center">
                {metrics.map((m) => (
                  <div
                    key={m.key}
                    className="flex items-baseline justify-between border-t border-border/40 py-4 last:border-b last:border-border/40"
                  >
                    <dt className="text-sm text-muted-foreground">{t(m.key)}</dt>
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
                  label={t("chart.m2.label")}
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
                  label={t("chart.sale.label")}
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
                <Gauge value={41} tone="positive" caption={t("chart.roi")} />
              </MouseCard>
              <MouseCard
                className="glass flex items-center justify-center rounded-xl p-6"
                glowColor="var(--risk)"
                tiltMax={8}
              >
                <Gauge value={22} tone="risk" caption={t("chart.risk")} />
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
              <p className="label-mono">{t("ba.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("ba.title")}
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {beforeAfter.map((item, i) => (
              <Reveal key={item.key} delay={i * 100} variant="scale">
                <MouseCard
                  className="glass rounded-xl p-5"
                  glowColor={
                    item.positive ? "var(--positive)" : "var(--risk)"
                  }
                  tiltMax={10}
                  glowOpacity={0.08}
                >
                  <p className="label-mono">{t(item.key)}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("ba.before")}</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/30">
                        {item.before}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t("ba.after")}</p>
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
              <p className="label-mono">{t("comp.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("comp.title")}
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
                      {["Platform", locale === "tr" ? "İlan" : "Listing", "m²", locale === "tr" ? "Fiyat" : "Price", locale === "tr" ? "Sapma" : "Deviation"].map(
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
                        <td className="px-5 py-4 font-medium">{l.platform}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {l.url}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{l.m2}</td>
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
              <p className="label-mono">{t("slider.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("slider.title")}
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
              <p className="label-mono">{t("bars.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("bars.title")}
              </h2>
            </div>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MouseCard
              className="glass mx-auto mt-10 max-w-3xl rounded-xl p-6"
              glowColor="var(--primary)"
              tiltMax={3}
            >
              <Bars data={barData} />
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <div className="text-center">
              <p className="label-mono">{t("how.label")}</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                {t("how.title")}
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Link2,
                title: t("how.step1"),
                desc: t("how.step1.desc"),
                color: "var(--primary)",
                step: "1",
              },
              {
                icon: Cpu,
                title: t("how.step2"),
                desc: t("how.step2.desc"),
                color: "var(--positive)",
                step: "2",
              },
              {
                icon: FileCheck,
                title: t("how.step3"),
                desc: t("how.step3.desc"),
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
                    <s.icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
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
                {t("cta.line1")}{" "}
                <span className="text-primary">{t("cta.highlight")}</span>{" "}
                {t("cta.line2")}
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                {t("cta.sub")}
              </p>
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById("analiz")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="btn-glow rounded-xl bg-primary px-8 py-4 text-sm font-bold text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  {t("cta.button")}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
