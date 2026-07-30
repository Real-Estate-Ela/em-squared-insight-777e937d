import { useEffect, useRef, useState, type ReactNode } from "react";

type Variant = "fade-up" | "slide-left" | "slide-right" | "scale" | "blur" | "fade";

const variantClass: Record<Variant, { hidden: string; shown: string }> = {
  "fade-up": { hidden: "reveal", shown: "reveal-in" },
  "slide-left": { hidden: "reveal-slide-l", shown: "reveal-slide-l-in" },
  "slide-right": { hidden: "reveal-slide-r", shown: "reveal-slide-r-in" },
  scale: { hidden: "reveal-scale", shown: "reveal-scale-in" },
  blur: { hidden: "reveal-blur", shown: "reveal-blur-in" },
  fade: { hidden: "reveal-fade", shown: "reveal-fade-in" },
};

export function Reveal({
  children,
  delay = 0,
  variant = "fade-up",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  variant?: Variant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const vc = variantClass[variant];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
      className={`${shown ? vc.shown : vc.hidden} ${className}`}
    >
      {children}
    </div>
  );
}

/** Returns true once the element has entered the viewport. */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, inView } as const;
}
