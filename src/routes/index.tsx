import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, Loader2, TrendingUp, Shield, MapPin, BarChart3, Link2, Cpu, FileCheck, MessageSquareQuote } from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, Gauge, TrendChart } from "@/components/Charts";
import { AnalysisSlider, type Slide } from "@/components/AnalysisSlider";
import { IstanbulSkyline } from "@/components/IstanbulSkyline";
import { Testimonials } from "@/components/Testimonials";

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
  { icon: BarChart3, label: "Karşılaştırma", desc: "3 platformdan fiyat", color: "var(--purple)" },
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
        <IstanbulSkyline className="absolute bottom-0 left-0 right-0 hidden h-auto w-full text-foreground opacity-[0.06] md:block" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full bg-positive/10 px-3 py-1.5 text-sm font-medium text-positive">
              <span className="live-dot" style={{ width: 6, height: 6 }} />
              Analiz platformu aktif
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] md:text-6xl">
              İlan linkini yapıştır,{" "}
              <span className="bg-gradient-to-r from-primary to-cyan bg-clip-text text-transparent">
                yatırım kararını
              </span>{" "}
              20 saniyede al.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Konut, arsa ve ticari mülk için getiri analizi, çevre değerlendirmesi ve risk skoru.
            </p>
          </Reveal>

          <Reveal delay={90}>
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

            <p className="mt-3 text-sm text-muted-foreground">
              Desteklenen kaynaklar: sahibinden.com · hepsiemlak.com · emlakjet.com
            </p>
          </Reveal>
        </div>

        {/* Feature highlights */}
        <div className="border-y border-border bg-card/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
            {highlights.map((h, i) => (
              <div
                key={h.label}
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
            ))}
          </div>
        </div>
      </section>

      {/* Decision card */}
      <section id="karar">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">Karar Raporu</p>
            <div
              className="mt-6 grid gap-10 overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm md:grid-cols-2 md:p-10"
              style={{
                borderLeft: "4px solid var(--positive)",
              }}
            >
              <div>
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
            </div>
          </Reveal>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <Reveal className="md:col-span-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <TrendChart
                  points={trend}
                  tone="positive"
                  label="m² fiyat trendi — 24 ay"
                  value="+%38"
                />
              </div>
              <div className="mt-4 rounded-xl border border-border bg-card p-6">
                <TrendChart
                  points={riskTrend}
                  tone="risk"
                  height={110}
                  label="Ortalama satış süresi (gün)"
                  value="−26 gün"
                />
              </div>
            </Reveal>
            <Reveal delay={120} className="grid grid-cols-2 gap-6 self-center md:grid-cols-1">
              <div className="flex items-center justify-center rounded-xl border border-border bg-card p-6">
                <Gauge value={41} tone="positive" caption="5 Yıl ROI" />
              </div>
              <div className="flex items-center justify-center rounded-xl border border-border bg-card p-6">
                <Gauge value={22} tone="risk" caption="Risk Skoru" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-warm) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">Platform Karşılaştırması</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Aynı mülk, farklı platformlar</h2>
            <div className="mt-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
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
            </div>
          </Reveal>
        </div>
      </section>

      {/* Slider */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">Yakın Çevre Analizi</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Çevredeki arsa, konut ve dükkanlar</h2>
            <div className="mt-8">
              <AnalysisSlider slides={slides} />
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
          <Reveal>
            <p className="label-mono">Mahalle Kesiti</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — metrik dağılımı</h2>
            <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm">
              <Bars data={bars} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono text-center">Nasıl Çalışır?</p>
            <h2 className="mt-3 text-center text-2xl md:text-3xl">3 adımda yatırım kararı</h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Link2, title: "İlan linkini yapıştır", desc: "Sahibinden, Hepsiemlak veya Emlakjet'ten herhangi bir ilan linkini yapıştır.", color: "var(--primary)", step: "1" },
              { icon: Cpu, title: "AI analiz etsin", desc: "Fiyat, kira getirisi, amortisman, çevre analizi ve risk skoru saniyeler içinde hesaplanır.", color: "var(--cyan)", step: "2" },
              { icon: FileCheck, title: "Karar raporunu al", desc: "Al/satma/bekle kararı, karşılaştırma tablosu ve detaylı rapor oluşturulur.", color: "var(--positive)", step: "3" },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="relative flex flex-col items-center rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
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
                </div>
              </Reveal>
            ))}
          </div>
          {/* Connecting arrows (desktop only) */}
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
        </div>
      </section>

      {/* Testimonials */}
      <section
        style={{
          background: "linear-gradient(180deg, var(--surface-warm) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <div className="flex items-center justify-center gap-2">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
              <p className="label-mono">Kullanıcı Yorumları</p>
            </div>
            <h2 className="mt-3 text-center text-2xl md:text-3xl">
              Yatırımcılar ne diyor?
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="mt-10">
              <Testimonials />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-border bg-card/50">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
          <Reveal>
            <p className="text-center text-sm text-muted-foreground">
              Verilerimiz resmi ve güvenilir kaynaklardan beslenmektedir
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {[
                { name: "TCMB", desc: "Merkez Bankası" },
                { name: "TÜİK", desc: "İstatistik Kurumu" },
                { name: "TKGM", desc: "Tapu Kadastro" },
                { name: "SPK", desc: "Sermaye Piyasası" },
                { name: "BDDK", desc: "Bankacılık Düzenleme" },
              ].map((b) => (
                <span
                  key={b.name}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-sm transition-colors hover:bg-muted"
                  title={b.desc}
                >
                  <Shield className="h-3.5 w-3.5 text-positive" />
                  <span className="font-semibold">{b.name}</span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {b.desc}
                  </span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-4">
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
