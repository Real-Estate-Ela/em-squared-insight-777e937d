import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, Maximize2, TrendingUp, TrendingDown } from "lucide-react";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";
import { Reveal } from "@/components/Reveal";
import { Bars, TrendChart } from "@/components/Charts";
import { MouseCard } from "@/components/MouseCard";

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
        content:
          "Analiz edilen mülkler, harita görünümü ve çevre analizi grafikleri.",
      },
    ],
  }),
  component: Visuals,
});

const items = [
  {
    img: prop1,
    type: "Konut",
    title: "3+1 Daire — Ataşehir",
    roi: "%38",
    status: "Olumlu",
    positive: true,
    wide: true,
    specs: ["112 m²", "3+1", "5. Kat"],
  },
  {
    img: prop2,
    type: "Arsa",
    title: "İmarlı Parsel — Çekmeköy",
    roi: "%52",
    status: "Olumlu",
    positive: true,
    wide: false,
    specs: ["620 m²", "Konut imarlı"],
  },
  {
    img: prop3,
    type: "Dükkan",
    title: "Cadde Üstü Dükkan — Kadıköy",
    roi: "%17",
    status: "Riskli",
    positive: false,
    wide: false,
    specs: ["85 m²", "Zemin kat"],
  },
  {
    img: mapView,
    type: "Harita",
    title: "Çevre yoğunluk haritası — Anadolu Yakası",
    roi: "%29",
    status: "Olumlu",
    positive: true,
    wide: true,
    specs: ["Bölge analizi"],
  },
];

const filters = ["Tümü", "Konut", "Arsa", "Dükkan", "Harita"] as const;

const bars = [
  { k: "Kira getirisi", v: 64, tone: "positive" as const },
  { k: "Bölge fiyat artışı", v: 38, tone: "primary" as const },
  { k: "5 yıl ROI", v: 41, tone: "primary" as const },
  { k: "Arz yoğunluğu", v: 22, tone: "risk" as const },
];

function Visuals() {
  const [filter, setFilter] = useState<string>("Tümü");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const list = items.filter((i) => filter === "Tümü" || i.type === filter);

  return (
    <div style={{ background: "linear-gradient(180deg, var(--page-gallery) 0%, var(--background) 40%)" }}>
      {/* Lightbox overlay */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl">
            <img
              src={items[lightbox].img}
              alt={items[lightbox].title}
              className="h-full w-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-lg font-semibold text-white">
                {items[lightbox].title}
              </p>
              <p className="mt-1 text-sm text-white/70">
                {items[lightbox].type} — ROI {items[lightbox].roi}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <section
        style={{
          background:
            "linear-gradient(180deg, var(--surface-cool) 0%, transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Reveal variant="blur">
            <p className="label-mono flex items-center gap-3">
              <Eye className="h-3.5 w-3.5" />
              Görseller
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl leading-[1.08] md:text-5xl">
              Analiz edilen{" "}
              <span className="text-risk font-bold">
                mülkler
              </span>
            </h1>
            <p className="mt-4 max-w-lg text-muted-foreground">
              Konut, arsa ve ticari mülk görünümleri ile çevre analizi
              grafikleri.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    filter === f
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Gallery grid */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-6 md:grid-cols-2">
            {list.map((it, i) => (
              <Reveal
                key={it.title}
                delay={i * 80}
                className={it.wide ? "md:col-span-2" : ""}
              >
                <MouseCard
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                  glowColor={it.positive ? "var(--positive)" : "var(--risk)"}
                  tiltMax={5}
                  glowOpacity={0.07}
                >
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <button
                      type="button"
                      onClick={() => {
                        const idx = items.indexOf(it);
                        if (idx >= 0) setLightbox(idx);
                      }}
                      className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white/90 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-white"
                      aria-label="Büyüt"
                    >
                      <Maximize2 className="h-4 w-4 text-foreground" />
                    </button>
                    <span className="absolute left-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-sm">
                      {it.type}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold">{it.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {it.specs.map((sp) => (
                            <span
                              key={sp}
                              className="rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className="flex items-center gap-1 text-sm font-bold"
                          style={{
                            color: it.positive
                              ? "var(--positive)"
                              : "var(--risk)",
                          }}
                        >
                          {it.positive ? (
                            <TrendingUp className="h-3.5 w-3.5" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5" />
                          )}
                          {it.roi}
                        </span>
                        <span
                          className={`status-pill text-xs ${
                            it.positive
                              ? "bg-positive/10 text-positive"
                              : "bg-risk/10 text-risk"
                          }`}
                        >
                          <span className="status-dot" />
                          {it.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </MouseCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Charts */}
      <section
        style={{
          background:
            "linear-gradient(180deg, var(--surface-mint) 0%, var(--background) 100%)",
        }}
      >
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Reveal>
            <p className="label-mono">Çevre Analizi</p>
            <h2 className="mt-3 text-2xl md:text-3xl">
              Ataşehir — mahalle kesiti
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <MouseCard className="rounded-xl border border-border bg-card p-6 shadow-sm" glowColor="var(--primary)" tiltMax={4}>
                <Bars data={bars} />
              </MouseCard>
              <MouseCard className="rounded-xl border border-border bg-card p-6 shadow-sm" glowColor="var(--positive)" tiltMax={4}>
                <TrendChart
                  points={[21, 24, 23, 29, 34, 33, 39, 44, 47, 52, 55, 61]}
                  tone="positive"
                  label="m² fiyat trendi — 24 ay"
                  value="+%38"
                />
              </MouseCard>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
