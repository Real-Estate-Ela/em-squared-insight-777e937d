import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Loader2, TrendingUp, MapPin, BarChart3, Shield, Link2, Cpu, FileCheck, Calculator, Search } from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { IstanbulSkyline } from "@/components/IstanbulSkyline";
import { MouseCard, CountUp } from "@/components/MouseCard";
import { PriceCalculator } from "@/components/PriceCalculator";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "emlakmetric — İlan linkiyle 20 saniyede yatırım analizi" },
      {
        name: "description",
        content:
          "İlan linkini yapıştır; kira getirisi, amortisman, 5 yıl ROI ve çevre analizini saniyeler içinde gör. Konut, arsa ve ticari mülk için veri odaklı analiz.",
      },
      { property: "og:title", content: "emlakmetric — Gayrimenkul analiz platformu" },
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
  { label: "Arz yoğunluğu riski", value: "Yüksek", tone: "text-risk" },
];

const highlights = [
  { icon: TrendingUp, label: "ROI Analizi", desc: "5 yıllık getiri tahmini", color: "var(--positive)" },
  { icon: MapPin, label: "Çevre Analizi", desc: "Mahalle bazlı veri", color: "var(--cyan)" },
  { icon: Shield, label: "Risk Skoru", desc: "Arz ve talep dengesi", color: "var(--amber)" },
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
  { k: "Bölge fiyat artışı", v: 38, tone: "cyan" as const },
  { k: "Likidite (satış hızı)", v: 55, tone: "amber" as const },
  { k: "Arz yoğunluğu", v: 22, tone: "risk" as const },
];

const beforeAfter = [
  { label: "m² fiyat", before: "28.500 ₺", after: "41.200 ₺", change: "+%44", positive: true },
  { label: "Ortalama kira", before: "14.000 ₺", after: "22.500 ₺", change: "+%60", positive: true },
  { label: "Satış süresi", before: "62 gün", after: "28 gün", change: "−%55", positive: true },
  { label: "Arz (aktif ilan)", before: "340", after: "520", change: "+%52", positive: false },
];

function Home() {
  const [tab, setTab] = useState<string>(tabs[0]);
  const [url, setUrl] = useState("emlakjet.com/ilan/9931-daire");
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const runAnalysis = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
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
      {/* Hero */}
      <section
        id="analiz"
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        {/* Technical grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(var(--primary) 1px, transparent 1px),
              linear-gradient(90deg, var(--primary) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
        <IstanbulSkyline className="absolute bottom-0 left-0 right-0 hidden h-auto w-full md:block" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-32">
          <Reveal variant="blur">
            <div className="inline-flex items-center gap-2 rounded-full bg-positive/10 px-4 py-2 text-sm font-semibold text-positive">
              <span className="live-dot" style={{ width: 7, height: 7 }} />
              Analiz platformu aktif
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-7 max-w-4xl text-5xl leading-[1.04] tracking-tight md:text-7xl">
              İlan linkini yapıştır,{" "}
              <span className="bg-gradient-to-r from-primary via-cyan to-positive bg-clip-text text-transparent">
                yatırım kararını
              </span>{" "}
              20 saniyede al.
            </h1>
          </Reveal>
          <Reveal delay={160} variant="fade">
            <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
              Konut, arsa ve ticari mülk için getiri analizi, çevre değerlendirmesi ve risk skoru.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-9 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    tab === t
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAnalysis();
              }}
              className="mt-5 grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/5 transition-shadow duration-200 focus-within:shadow-xl focus-within:shadow-primary/10 sm:grid-cols-[minmax(0,1fr)_auto]"
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
              <button
                type="submit"
                className="m-1.5 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                {done ? "Analiz Et" : <Loader2 className="h-4 w-4 animate-spin" />}
                {done ? null : "Analiz ediliyor"}
              </button>
            </form>

            {/* Analysis progress */}
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
              {steps.map((s, i) => {
                const active = !done && step === i;
                const complete = done || step > i;
                return (
                  <div
                    key={s}
                    className={`flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 text-sm last:border-b-0 transition-colors ${
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
                      <span className={complete ? "text-foreground" : "text-muted-foreground"}>
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

        {/* Feature highlights */}
        <div className="border-y border-border bg-card/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {highlights.map((h, i) => (
              <Reveal key={h.label} delay={i * 60} variant="scale">
                <div
                  className={`flex items-center gap-3 px-5 py-4 ${
                    i < highlights.length - 1 ? "border-r border-border" : ""
                  }`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `color-mix(in oklab, ${h.color} 12%, transparent)` }}
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
      </section>

      {/* Stats strip */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { label: "Analiz edilen mülk", value: 12450, suffix: "+", color: "var(--primary)" },
              { label: "İlçe kapsama", value: 39, suffix: "", color: "var(--cyan)" },
              { label: "Ortalama doğruluk", value: 94, suffix: "%", color: "var(--positive)" },
              { label: "Aktif kullanıcı", value: 3200, suffix: "+", color: "var(--amber)" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 80} variant="scale">
                <MouseCard className="rounded-xl border border-border bg-card p-5 text-center" glowColor={s.color} tiltMax={8} glowOpacity={0.06}>
                  <p className="text-3xl font-bold" style={{ color: s.color }}>
                    <CountUp value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Decision card */}
      <section id="karar">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono">Karar Raporu</p>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MouseCard
              className="mt-6 grid gap-10 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10"
              glowColor="var(--positive)"
              glowOpacity={0.06}
              tiltMax={4}
            >
              <div style={{ borderLeft: "4px solid var(--positive)", paddingLeft: "1.5rem" }}>
                <span className="status-pill bg-positive/10 text-positive">
                  <span className="status-dot" />
                  Olumlu Karar
                </span>
                <h2 className="mt-3 text-3xl text-foreground md:text-4xl">
                  Al — <span className="text-positive">5 yıl tut</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Bölge fiyat artışı son 24 ayda %38. İlan, mahalle medyanının %9 altında
                  listelenmiş. Tek risk kalemi: yüksek arz yoğunluğu.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" className="btn-tactile btn-tactile-positive">
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
                    className="flex items-baseline justify-between border-t border-border py-4 last:border-b"
                  >
                    <dt className="text-sm text-muted-foreground">{m.label}</dt>
                    <dd className={`text-sm font-semibold ${m.tone}`}>{m.value}</dd>
                  </div>
                ))}
              </dl>
            </MouseCard>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <Reveal variant="slide-left" className="md:col-span-2">
              <MouseCard className="rounded-xl border border-border bg-card p-6" glowColor="var(--positive)" tiltMax={3}>
                <TrendChart
                  points={trend}
                  tone="positive"
                  label="m² fiyat trendi — 24 ay"
                  value="+%38"
                />
              </MouseCard>
              <MouseCard className="mt-4 rounded-xl border border-border bg-card p-6" glowColor="var(--risk)" tiltMax={3}>
                <TrendChart
                  points={riskTrend}
                  tone="risk"
                  height={110}
                  label="Ortalama satış süresi (gün)"
                  value="−26 gün"
                />
              </MouseCard>
            </Reveal>
            <Reveal delay={120} variant="slide-right" className="grid grid-cols-2 gap-6 self-center md:grid-cols-1">
              <MouseCard className="flex items-center justify-center rounded-xl border border-border bg-card p-6" glowColor="var(--positive)" tiltMax={8}>
                <Gauge value={41} tone="positive" caption="5 Yıl ROI" />
              </MouseCard>
              <MouseCard className="flex items-center justify-center rounded-xl border border-border bg-card p-6" glowColor="var(--risk)" tiltMax={8}>
                <Gauge value={22} tone="risk" caption="Risk Skoru" />
              </MouseCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Before/After Comparison */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono">Öncesi / Sonrası</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — 24 aylık değişim</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {beforeAfter.map((item, i) => (
              <Reveal key={item.label} delay={i * 100} variant="scale">
                <MouseCard
                  className="rounded-xl border border-border bg-card p-5 shadow-sm"
                  glowColor={item.positive ? "var(--positive)" : "var(--risk)"}
                  tiltMax={10}
                  glowOpacity={0.08}
                >
                  <p className="label-mono">{item.label}</p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Önce</p>
                      <p className="mt-1 text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/30">{item.before}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Şimdi</p>
                      <p className="mt-1 text-sm font-bold">{item.after}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-center rounded-lg py-2" style={{ backgroundColor: item.positive ? "color-mix(in oklab, var(--positive) 8%, transparent)" : "color-mix(in oklab, var(--risk) 8%, transparent)" }}>
                    <span className={`text-lg font-bold ${item.positive ? "text-positive" : "text-risk"}`}>
                      {item.change}
                    </span>
                  </div>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-warm) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-right">
            <p className="label-mono">Platform Karşılaştırması</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Aynı mülk, farklı platformlar</h2>
          </Reveal>
          <Reveal delay={100} variant="scale">
            <MouseCard className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm" glowColor="var(--amber)" tiltMax={2}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Platform", "İlan", "m²", "Fiyat", "Sapma"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listings.map((l) => (
                      <tr
                        key={l.platform}
                        className="group border-b border-border transition-colors duration-200 last:border-b-0 hover:bg-muted/30"
                      >
                        <td className="px-5 py-4 font-medium">{l.platform}</td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            {l.url}
                            <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                          </span>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">{l.m2}</td>
                        <td className="px-5 py-4 font-medium">{l.price}</td>
                        <td className={`px-5 py-4 font-medium ${l.positive ? "text-positive" : "text-risk"}`}>
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

      {/* Slider */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono">Yakın Çevre Analizi</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Çevredeki arsa, konut ve dükkanlar</h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8">
              <AnalysisSlider slides={slides} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Price Calculator */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-right">
            <p className="label-mono flex items-center gap-2">
              <Calculator className="h-3.5 w-3.5" />
              Yatırım Hesaplayıcı
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl">Kredi ve getiri hesabı</h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">
              Mülk fiyatı, peşinat, faiz oranı ve kira geliri ile yatırım getirisini hesaplayın.
            </p>
          </Reveal>
          <Reveal delay={100} variant="scale">
            <div className="mt-8">
              <PriceCalculator />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bars */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-mint) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono">Mahalle Kesiti</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — metrik dağılımı</h2>
          </Reveal>
          <Reveal delay={80} variant="scale">
            <MouseCard className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm" glowColor="var(--cyan)" tiltMax={3}>
              <Bars data={bars} />
            </MouseCard>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="blur">
            <p className="label-mono text-center">Nasıl Çalışır?</p>
            <h2 className="mt-3 text-center text-2xl md:text-3xl">3 adımda yatırım kararı</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Link2, title: "İlan linkini yapıştır", desc: "Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linkini yapıştır.", color: "var(--primary)", step: "1" },
              { icon: Cpu, title: "AI analiz etsin", desc: "Fiyat, kira getirisi, amortisman, çevre analizi ve risk skoru saniyeler içinde hesaplanır.", color: "var(--cyan)", step: "2" },
              { icon: FileCheck, title: "Karar raporunu al", desc: "Al/satma/bekle kararı, karşılaştırma tablosu ve detaylı rapor oluşturulur.", color: "var(--positive)", step: "3" },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 120} variant="slide-right">
                <MouseCard
                  className="relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm"
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
                    style={{ backgroundColor: `color-mix(in oklab, ${s.color} 12%, transparent)` }}
                  >
                    <s.icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </MouseCard>
              </Reveal>
            ))}
          </div>
          {/* Connecting arrows (desktop only) */}
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

      {/* Empty State Demo */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal variant="slide-left">
            <p className="label-mono flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Aramanızı Başlatın
            </p>
            <h2 className="mt-3 text-2xl md:text-3xl">Henüz analiz yapmadınız mı?</h2>
          </Reveal>
          <Reveal delay={100} variant="blur">
            <MouseCard className="mt-8 rounded-xl border border-border bg-card shadow-sm" glowColor="var(--primary)" tiltMax={2} glowOpacity={0.04}>
              <EmptyState
                title="İlk analizinizi başlatın"
                description="Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linkini yapıştırarak mülk analizi başlatın. Getiri, risk ve çevre verilerini saniyeler içinde alın."
                cta="Analiz Et"
                onAction={() => {
                  document.getElementById("analiz")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </MouseCard>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
