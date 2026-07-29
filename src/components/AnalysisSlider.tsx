import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export type Slide = {
  img: string;
  type: string;
  title: string;
  roi: string;
  status: string;
  positive: boolean;
  note: string;
};

export function AnalysisSlider({ slides }: { slides: Slide[] }) {
  const [emblaRef, embla] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 45,
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    const id = setInterval(() => embla.scrollNext(), 5200);
    return () => {
      clearInterval(id);
      embla.off("select", onSelect);
    };
  }, [embla]);

  const prev = useCallback(() => embla?.scrollPrev(), [embla]);
  const next = useCallback(() => embla?.scrollNext(), [embla]);

  return (
    <div>
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <div className="-ml-4 flex">
          {slides.map((s, idx) => (
            <article
              key={s.title}
              className="group relative min-w-0 shrink-0 grow-0 basis-full pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="relative overflow-hidden">
                  <img
                    src={s.img}
                    alt={s.title}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span
                    className={`status-pill absolute bottom-3 left-3 backdrop-blur-sm ${
                      s.positive
                        ? "bg-positive/20 text-white"
                        : "bg-risk/20 text-white"
                    }`}
                  >
                    <span className="status-dot" />
                    {s.status}
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground backdrop-blur-sm">
                    {s.type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.note}
                  </p>
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      5 Yıl ROI
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{
                        color: s.positive ? "var(--positive)" : "var(--risk)",
                      }}
                    >
                      {s.roi}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`${i + 1}. analiz`}
              onClick={() => embla?.scrollTo(i)}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor:
                  i === selected
                    ? s.positive
                      ? "var(--positive)"
                      : "var(--risk)"
                    : "var(--grid)",
                transform: i === selected ? "scaleY(1.3)" : "scaleY(1)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki"
            className="rounded-lg border border-border p-2.5 transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Sonraki"
            className="rounded-lg border border-border p-2.5 transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
