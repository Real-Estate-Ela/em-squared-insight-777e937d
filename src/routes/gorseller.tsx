import { createFileRoute } from "@tanstack/react-router";
import prop1 from "@/assets/property-1.jpg";
import prop2 from "@/assets/property-2.jpg";
import prop3 from "@/assets/property-3.jpg";
import mapView from "@/assets/map-view.jpg";

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
  { img: prop1, type: "Konut", title: "3+1 Daire — Ataşehir", roi: "%38", status: "Olumlu", tone: "text-positive", soft: "bg-positive-soft", wide: true },
  { img: prop2, type: "Arsa", title: "İmarlı Parsel — Çekmeköy", roi: "%52", status: "Olumlu", tone: "text-positive", soft: "bg-positive-soft", wide: false },
  { img: prop3, type: "Dükkan", title: "Cadde Üstü Dükkan — Kadıköy", roi: "%17", status: "Riskli", tone: "text-risk", soft: "bg-risk-soft", wide: false },
  { img: mapView, type: "Harita", title: "Çevre yoğunluk haritası — Anadolu Yakası", roi: "—", status: "Nötr", tone: "text-muted-foreground", soft: "bg-muted", wide: true },
];

const bars = [
  { k: "kira getirisi", v: 64, tone: "positive" },
  { k: "bölge fiyat artışı", v: 38, tone: "positive" },
  { k: "5 yıl roi", v: 41, tone: "positive" },
  { k: "arz yoğunluğu", v: 22, tone: "risk" },
];

function Visuals() {
  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <p className="label-mono">Görseller</p>
          <h1 className="mt-5 max-w-2xl text-4xl leading-[1.05] md:text-5xl">
            Analiz edilen mülkler ve çevre görünümleri.
          </h1>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid gap-px bg-border md:grid-cols-2">
            {items.map((it) => (
              <figure
                key={it.title}
                className={`bg-background ${it.wide ? "md:col-span-2" : ""}`}
              >
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className={`w-full object-cover ${it.wide ? "aspect-[21/9]" : "aspect-[4/3]"}`}
                />
                <figcaption className="flex items-center justify-between gap-4 p-5">
                  <span className="min-w-0">
                    <span className="label-mono block">{it.type}</span>
                    <span className="mt-1 block text-sm">{it.title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className={`status-pill ${it.soft} ${it.tone}`}>
                      <span className="status-dot" />
                      {it.status}
                    </span>
                    <span className={`text-sm ${it.tone}`}>{it.roi}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="label-mono">Çevre Analizi Grafiği</p>
          <h2 className="mt-3 text-2xl md:text-3xl">Ataşehir — mahalle kesiti</h2>
          <div className="mt-8">
            {bars.map((b) => (
              <div key={b.k} className="border-t border-border py-5 last:border-b">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{b.k}</span>
                  <span className={b.tone === "risk" ? "text-risk" : "text-positive"}>
                    %{String(b.v).replace(".", ",")}
                  </span>
                </div>
                <div className="mt-3 h-1 w-full bg-grid">
                  <div
                    className={`h-1 ${b.tone === "risk" ? "bg-risk" : "bg-positive"}`}
                    style={{ width: `${b.v}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
