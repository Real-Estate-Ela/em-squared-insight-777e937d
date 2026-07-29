import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, TrendChart } from "@/components/Charts";


export const Route = createFileRoute("/gorseller")({
  head: () => ({
    meta: [
      { title: "Görseller — Mülk Galerisi | emlakmetric" },
      {
        name: "description",
        content:
          "Analiz edilen konut, arsa ve ticari mülklerin görselleri, harita görünümü ve çevre analizi grafikleri.",
      },
      { property: "og:title", content: "Mülk Galerisi — emlakmetric" },
      {
        property: "og:description",
        content: "Analiz edilen mülkler, harita görünümü ve çevre analizi grafikleri.",
      },
    ],
  }),
  component: Visuals,
});

const items = [
  { img: prop1, type: "Konut", title: "3+1 Daire — Ataşehir", roi: "%38", status: "Olumlu", positive: true, wide: true },
  { img: prop2, type: "Arsa", title: "İmarlı Parsel — Çekmeköy", roi: "%52", status: "Olumlu", positive: true, wide: false },
  { img: prop3, type: "Dükkan", title: "Cadde Üstü Dükkan — Kadıköy", roi: "%17", status: "Riskli", positive: false, wide: false },
  { img: mapView, type: "Harita", title: "Çevre yoğunluk haritası — Anadolu Yakası", roi: "%29", status: "Olumlu", positive: true, wide: true },
];

const filters = ["Tümü", "Konut", "Arsa", "Dükkan", "Harita"] as const;

const bars = [
  { k: "kira getirisi", v: 64, tone: "positive" as const },
  { k: "bölge fiyat artışı", v: 38, tone: "positive" as const },
  { k: "5 yıl roi", v: 41, tone: "primary" as const },
  { k: "arz yoğunluğu", v: 22, tone: "risk" as const },
];

function Visuals() {
  const [filter, setFilter] = useState<string>("Tümü");
  const list = items.filter((i) => filter === "Tümü" || i.type === filter);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal>
            <p className="label-mono flex items-center gap-3">
              <span className="status-dot text-positive" />
              Görseller
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] md:text-5xl">
              Analiz edilen mülkler ve <span className="text-positive">çevre görünümleri</span>.
            </h1>
            <div className="mt-8 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`border px-4 py-2 text-xs uppercase tracking-[0.14em] transition-all duration-200 ${
                    filter === f
                      ? "border-primary bg-primary text-primary-foreground shadow-[3px_3px_0_0_var(--foreground)]"
                      : "border-border text-muted-foreground hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-px bg-border md:grid-cols-2">
            {list.map((it, i) => (
              <Reveal
                key={it.title}
                delay={i * 80}
                className={`bg-background ${it.wide ? "md:col-span-2" : ""}`}
              >
                <figure className="group hover-lift h-full bg-background">
                  <div className="relative overflow-hidden">
                    <img
                      src={it.img}
                      alt={it.title}
                      loading="lazy"
                      width={1024}
                      height={768}
                      className={`w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105 ${
                        it.wide ? "aspect-[21/9]" : "aspect-[4/3]"
                      }`}
                    />
                    <span
                      className="absolute bottom-0 left-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{
                        backgroundColor: it.positive ? "var(--positive)" : "var(--risk)",
                      }}
                    />
                  </div>
                  <figcaption className="flex items-center justify-between gap-4 p-5">
                    <span className="min-w-0">
                      <span className="label-mono block">{it.type}</span>
                      <span className="mt-1 block text-sm">{it.title}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span
                        className={`status-pill ${
                          it.positive ? "bg-positive-soft text-positive" : "bg-risk-soft text-risk"
                        }`}
                      >
                        <span className="status-dot" />
                        {it.status}
                      </span>
                      <span className={`text-sm ${it.positive ? "text-positive" : "text-risk"}`}>
                        {it.roi}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">Çevre Analizi Grafiği</p>
            <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — mahalle kesiti</h2>
            <div className="mt-8 grid gap-12 md:grid-cols-2">
              <Bars data={bars} />
              <TrendChart
                points={[21, 24, 23, 29, 34, 33, 39, 44, 47, 52, 55, 61]}
                tone="positive"
                label="m² fiyat trendi — 24 ay"
                value="+%38"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
