import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";

type Testimonial = {
  name: string;
  role: string;
  initials: string;
  color: string;
  rating: number;
  text: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Ahmet Yılmaz",
    role: "Gayrimenkul Yatırımcısı",
    initials: "AY",
    color: "var(--positive)",
    rating: 5,
    text: "3 farklı ilana baktım, emlakmetric sayesinde en yüksek ROI'li olanı 10 dakikada tespit ettim. Amortisman hesabı özellikle çok faydalı.",
  },
  {
    name: "Elif Kara",
    role: "Emlak Danışmanı",
    initials: "EK",
    color: "var(--cyan)",
    rating: 5,
    text: "Müşterilerime sunumlarımda kullanıyorum. Çevre analizi ve risk skoru ile profesyonel raporlar hazırlamak çok kolay.",
  },
  {
    name: "Mehmet Demir",
    role: "Bireysel Yatırımcı",
    initials: "MD",
    color: "var(--primary)",
    rating: 4,
    text: "İlk yatırım mülkümü alırken emlakmetric'in karşılaştırma tablosu çok işime yaradı. Medyan fiyatın altında bir ilan buldum.",
  },
  {
    name: "Zeynep Aksoy",
    role: "Portföy Yöneticisi",
    initials: "ZA",
    color: "var(--amber)",
    rating: 5,
    text: "Birden fazla mülkü aynı anda değerlendirmem gerekiyor. Platform karşılaştırması ve mahalle kesiti tam da ihtiyacım olan araçlar.",
  },
  {
    name: "Can Özkan",
    role: "İnşaat Mühendisi",
    initials: "CÖ",
    color: "var(--purple)",
    rating: 5,
    text: "Arsa yatırımı yapıyorum, imar planı revizyonları sonrası değerlenme potansiyelini bu kadar net gösteren başka bir araç yok.",
  },
  {
    name: "Selin Türk",
    role: "Finans Uzmanı",
    initials: "ST",
    color: "var(--positive)",
    rating: 4,
    text: "Kira getirisi ve 5 yıllık ROI hesaplamaları çok doğru. Yatırım kararlarımda güvenle kullanıyorum.",
  },
];

export function Testimonials() {
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
    const id = setInterval(() => embla.scrollNext(), 6000);
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
        <div className="-ml-4 flex">
          {testimonials.map((t) => (
            <article
              key={t.name}
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <div className="flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <div className="flex items-center gap-3">
                  <span
                    className="inline-grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5"
                      fill={i < t.rating ? "var(--amber)" : "none"}
                      stroke={i < t.rating ? "var(--amber)" : "var(--border)"}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  "{t.text}"
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-6">
        <div className="flex flex-1 items-center gap-1.5">
          {testimonials.map((t, i) => (
            <button
              key={t.name}
              type="button"
              aria-label={`${i + 1}. yorum`}
              onClick={() => embla?.scrollTo(i)}
              className="h-1.5 flex-1 rounded-full transition-all duration-500"
              style={{
                backgroundColor:
                  i === selected ? "var(--primary)" : "var(--grid)",
                transform: i === selected ? "scaleY(1.3)" : "scaleY(1)",
              }}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Önceki yorum"
            className="rounded-lg border border-border p-2.5 transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Sonraki yorum"
            className="rounded-lg border border-border p-2.5 transition-all hover:bg-muted hover:-translate-y-0.5"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
