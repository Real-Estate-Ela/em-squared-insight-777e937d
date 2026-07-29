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
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start", duration: 32 });
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
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s) => (
            <article
              key={s.title}
              className="group relative min-w-0 shrink-0 grow-0 basis-full border border-border md:basis-1/2 lg:basis-1/3"
            >
              <div className="relative overflow-hidden">
                <img
                  src={s.img}
                  alt={s.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
                />
                <span
                  className="absolute left-0 top-0 h-1 w-full origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{
                    backgroundColor: s.positive ? "var(--positive)" : "var(--risk)",
                  }}
                />
                <span
                  className={`status-pill absolute bottom-3 left-3 ${
                    s.positive ? "bg-positive-soft text-positive" : "bg-risk-soft text-risk"
                  }`}
                >
                  <span className="status-dot" />
                  {s.status}
                </span>
              </div>
              <div className="p-5">
                <p className="label-mono">{s.type}</p>
                <h3 className="mt-2 text-lg">{s.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{s.note}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="label-mono">5 yıl roi</span>
                  <span className={s.positive ? "text-positive" : "text-risk"}>{s.roi}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-1">
          {slides.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`${i + 1}. analiz`}
              onClick={() => embla?.scrollTo(i)}
              className="h-1 flex-1 transition-colors duration-300"
              style={{
                backgroundColor:
                  i === selected
                    ? s.positive
                      ? "var(--positive)"
                      : "var(--risk)"
                    : "var(--grid)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={prev} aria-label="Önceki" className="btn-tactile px-3 py-3">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={next} aria-label="Sonraki" className="btn-tactile px-3 py-3">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}