import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { LogoWatermark } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "emlakmetric — İlan linkiyle 20 saniyede yatırım analizi" },
      {
        name: "description",
        content:
          "İlan linkini yapıştır; kira getirisi, amortisman, 5 yıl ROI ve çevre analizini saniyeler içinde gör. Konut, arsa ve ticari mülk için veri odaklı analiz terminali.",
      },
      { property: "og:title", content: "emlakmetric — Gayrimenkul analiz terminali" },
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
  { label: "kira getirisi", value: "%6,4", tone: "text-positive" },
  { label: "amortisman", value: "15,6 yıl", tone: "" },
  { label: "5 yıl roi", value: "%41", tone: "text-positive" },
  { label: "arz yoğunluğu riski", value: "yüksek", tone: "text-risk" },
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
  "ilan verisi çekiliyor",
  "mahalle medyanı hesaplanıyor",
  "kira çarpanı & amortisman",
  "çevre analizi ve karar",
];

const trend = [18, 22, 21, 27, 31, 29, 36, 42, 40, 48, 54, 61];
const riskTrend = [62, 58, 60, 51, 47, 49, 42, 38, 35, 33, 30, 26];

const bars = [
  { k: "kira getirisi", v: 64, tone: "positive" as const },
  { k: "bölge fiyat artışı", v: 38, tone: "positive" as const },
  { k: "likidite (satış hızı)", v: 55, tone: "primary" as const },
  { k: "arz yoğunluğu", v: 22, tone: "risk" as const },
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
      <section id="analiz" className="relative overflow-hidden border-b border-border">
        <LogoWatermark className="absolute -right-16 -top-16 hidden h-80 w-80 text-foreground opacity-[0.05] md:block" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <p className="label-mono flex items-center gap-3">
              <span className="status-dot text-positive" />
              01 — Analiz Terminali
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
              İlan linkini yapıştır. Getiri, çevre analizi ve yatırım kararı{" "}
              <span className="text-positive">20 saniyede</span>.
            </h1>
          </Reveal>

          <Reveal delay={90}>
            <div className="mt-9 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all duration-200 ${
                    tab === t
                      ? "border-primary bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                      : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
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
              className="mt-5 grid grid-cols-1 border border-foreground transition-shadow duration-200 focus-within:shadow-[5px_5px_0_0_var(--positive)] sm:grid-cols-[minmax(0,1fr)_auto]"
            >
              <div className="flex min-w-0 items-center gap-3 px-4 py-4">
                <span className="text-positive">&gt;</span>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  aria-label="İlan linki"
                  placeholder="sahibinden.com / hepsiemlak / emlakjet ilan linki"
                  className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
              <button type="submit" className="btn-tactile btn-tactile-primary rounded-none">
                {done ? "Analiz Et" : <Loader2 className="h-4 w-4 animate-spin" />}
                {done ? null : "Analiz ediliyor"}
              </button>
            </form>

            {/* Analysis progress */}
            <div className="mt-5 border border-border">
              {steps.map((s, i) => {
                const active = !done && step === i;
                const complete = done || step > i;
                return (
                  <div
                    key={s}
                    className={`flex items-center justify-between gap-4 border-b border-border px-4 py-3 text-xs last:border-b-0 ${
                      active ? "scanline bg-positive-soft" : ""
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`inline-grid h-4 w-4 place-items-center border ${
                          complete
                            ? "border-positive bg-positive text-background"
                            : active
                              ? "border-primary text-primary"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {complete ? <Check className="h-3 w-3" /> : null}
                      </span>
                      <span className={complete ? "text-foreground" : "text-muted-foreground"}>
                        {s}
                      </span>
                    </span>
                    <span className="label-mono">
                      {complete ? "tamam" : active ? "çalışıyor" : "bekliyor"}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Desteklenen kaynaklar: sahibinden.com · hepsiemlak.com · emlakjet.com
            </p>
          </Reveal>
        </div>

        {/* Marquee ticker */}
        <div className="overflow-hidden border-t border-border bg-muted py-2">
          <div className="marquee-track">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex shrink-0 items-center gap-8 pr-8">
                {[
                  ["ataşehir", "+%38", true],
                  ["çekmeköy arsa", "+%52", true],
                  ["kadıköy dükkan", "−%6", false],
                  ["ümraniye", "+%21", true],
                  ["beylikdüzü", "−%3", false],
                  ["maltepe", "+%14", true],
                ].map(([k, v, ok]) => (
                  <span key={String(k) + dup} className="label-mono flex items-center gap-2">
                    {k}
                    <span className={ok ? "text-positive" : "text-risk"}>{v}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Decision card */}
      <section id="karar" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">02 — Karar Çıktısı</p>
            <div className="mt-6 grid gap-10 border border-border border-l-4 border-l-positive p-6 transition-colors duration-300 hover:bg-positive-soft md:grid-cols-2 md:p-10">
              <div>
                <span className="status-pill bg-positive-soft text-positive">
                  <span className="status-dot" />
                  Karar — Olumlu
                </span>
                <h2 className="mt-2 text-3xl text-positive md:text-4xl">AL — 5 yıl tut</h2>
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
                    className="flex items-baseline justify-between border-t border-border py-4 transition-colors last:border-b hover:bg-background"
                  >
                    <dt className="text-sm text-muted-foreground">{m.label}</dt>
                    <dd className={`text-sm ${m.tone}`}>{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <Reveal className="md:col-span-2">
              <TrendChart
                points={trend}
                tone="positive"
                label="m² fiyat trendi — 24 ay"
                value="+%38"
              />
              <div className="mt-8">
                <TrendChart
                  points={riskTrend}
                  tone="risk"
                  height={110}
                  label="ortalama satış süresi (gün)"
                  value="−26 gün"
                />
              </div>
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-2 gap-6 self-center md:grid-cols-1">
              <Gauge value={41} tone="positive" caption="5 yıl roi" />
              <Gauge value={22} tone="risk" caption="risk skoru" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">03 — Platform Karşılaştırması</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Aynı mülk, farklı platformlar</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-border">
                    {["platform", "ilan", "m²", "fiyat", "sapma"].map((h) => (
                      <th key={h} className="label-mono py-3 text-left font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr
                      key={l.platform}
                      className={`group border-b border-border transition-colors duration-200 ${
                        l.positive ? "hover:bg-positive-soft" : "hover:bg-risk-soft"
                      }`}
                    >
                      <td
                        className={`border-l-2 py-4 pl-3 pr-4 transition-colors ${
                          l.positive
                            ? "border-l-transparent group-hover:border-l-positive"
                            : "border-l-transparent group-hover:border-l-risk"
                        }`}
                      >
                        {l.platform}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          {l.url}
                          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">{l.m2}</td>
                      <td className="py-4 pr-4">{l.price}</td>
                      <td className={`py-4 ${l.positive ? "text-positive" : "text-risk"}`}>
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
          </Reveal>
        </div>
      </section>

      {/* Slider */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">04 — Yakın Çevre Analizi</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Çevredeki arsa, konut ve dükkanlar</h2>
            <div className="mt-8">
              <AnalysisSlider slides={slides} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bars */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">05 — Mahalle Kesiti</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — metrik dağılımı</h2>
            <div className="mt-8">
              <Bars data={bars} />
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <button type="button" className="btn-tactile btn-tactile-primary">
                İlan analiz et
              </button>
              <button type="button" className="btn-tactile btn-tactile-risk">
                Riskli bölgeleri filtrele
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
