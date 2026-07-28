import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";

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
  { label: "kira getirisi", value: "%6,4", tone: "" },
  { label: "amortisman", value: "15,6 yıl", tone: "" },
  { label: "5 yıl roi", value: "%41", tone: "text-positive" },
];

const listings = [
  { platform: "sahibinden", url: "sahibinden.com/ilan/8842-daire", price: "4.150.000 ₺", m2: "112 m²", delta: "medyan +%3", tone: "text-risk" },
  { platform: "hepsiemlak", url: "hepsiemlak.com/ilan/5510-daire", price: "3.890.000 ₺", m2: "108 m²", delta: "medyan −%4", tone: "text-positive" },
  { platform: "emlakjet", url: "emlakjet.com/ilan/9931-daire", price: "3.725.000 ₺", m2: "115 m²", delta: "medyan −%9", tone: "text-positive" },
];

const nearby = [
  { img: prop1, type: "Konut", title: "3+1 Daire — Ataşehir", dist: "480 m", roi: "%38", status: "Olumlu", tone: "text-positive", soft: "bg-positive-soft" },
  { img: prop2, type: "Arsa", title: "İmarlı Parsel — Çekmeköy", dist: "2,1 km", roi: "%52", status: "Olumlu", tone: "text-positive", soft: "bg-positive-soft" },
  { img: prop3, type: "Dükkan", title: "Cadde Üstü Dükkan — Kadıköy", dist: "1,3 km", roi: "%17", status: "Riskli", tone: "text-risk", soft: "bg-risk-soft" },
];

function Home() {
  const [tab, setTab] = useState<string>(tabs[0]);
  const [url, setUrl] = useState("emlakjet.com/ilan/9931-daire");

  return (
    <div>
      {/* Hero */}
      <section id="analiz" className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="label-mono">01 — Analiz Terminali</p>
          <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] md:text-6xl">
            İlan linkini yapıştır. Getiri, çevre analizi ve yatırım kararı 20
            saniyede.
          </h1>

          <div className="mt-9 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors ${
                  tab === t
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-5 grid grid-cols-1 border border-foreground sm:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div className="flex min-w-0 items-center gap-3 px-4 py-4">
              <span className="text-muted-foreground">&gt;</span>
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
              className="bg-primary px-6 py-4 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              Analiz Et
            </button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Desteklenen kaynaklar: sahibinden.com · hepsiemlak.com · emlakjet.com
          </p>
        </div>
      </section>

      {/* Decision card */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="label-mono">02 — Örnek Karar Çıktısı</p>
          <div className="mt-6 grid gap-10 border border-border border-l-2 border-l-positive p-6 md:grid-cols-2 md:p-10">
            <div>
              <span className="status-pill bg-positive-soft text-positive">
                <span className="status-dot" />
                Karar — Olumlu
              </span>
              <h2 className="mt-2 text-3xl text-positive md:text-4xl">
                AL — 5 yıl tut
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Bölge fiyat artışı son 24 ayda %38. İlan, mahalle medyanının %9
                altında listelenmiş.
              </p>
            </div>
            <dl className="self-center">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="flex items-baseline justify-between border-t border-border py-4 last:border-b"
                >
                  <dt className="text-sm text-muted-foreground">{m.label}</dt>
                  <dd className={`text-sm ${m.tone}`}>{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="label-mono">03 — Platform Karşılaştırması</p>
          <h2 className="mt-3 text-2xl md:text-3xl">
            Aynı mülk, farklı platformlar
          </h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-y border-border">
                  {["platform", "ilan", "m²", "fiyat", "sapma"].map((h) => (
                    <th
                      key={h}
                      className="label-mono py-3 text-left font-normal"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.platform} className="border-b border-border">
                    <td className="py-4 pr-4">{l.platform}</td>
                    <td className="py-4 pr-4 text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {l.url}
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-muted-foreground">{l.m2}</td>
                    <td className="py-4 pr-4">{l.price}</td>
                    <td className={`py-4 ${l.tone}`}>
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
      </section>

      {/* Nearby */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="label-mono">04 — Yakın Çevre Analizi</p>
          <h2 className="mt-3 text-2xl md:text-3xl">
            Çevredeki arsa, konut ve dükkanlar
          </h2>
          <div className="mt-8 grid gap-px bg-border md:grid-cols-3">
            {nearby.map((n) => (
              <article key={n.title} className="bg-background">
                <img
                  src={n.img}
                  alt={n.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-5">
                  <p className="label-mono">
                    {n.type} · {n.dist}
                  </p>
                  <h3 className="mt-2 text-lg">{n.title}</h3>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
                    <span className={`status-pill ${n.soft} ${n.tone}`}>
                      <span className="status-dot" />
                      {n.status}
                    </span>
                    <span className="flex items-baseline gap-2">
                      <span className="label-mono">5 yıl roi</span>
                      <span className={n.tone}>{n.roi}</span>
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
