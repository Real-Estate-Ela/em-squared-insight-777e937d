import { useCallback, useRef, type ReactNode } from "react";

export function MouseCard({
  children,
  className = "",
  tiltMax = 6,
  glowColor = "var(--primary)",
  glowOpacity = 0.08,
  style: styleProp,
}: {
  children: ReactNode;
  className?: string;
  tiltMax?: number;
  glowColor?: string;
  glowOpacity?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * tiltMax;
      const rotX = (0.5 - y) * tiltMax;
      el.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01,1.01,1.01)`;
      el.style.setProperty("--glow-x", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--glow-y", `${(y * 100).toFixed(1)}%`);
      el.style.setProperty("--glow-opacity", `${glowOpacity}`);
    },
    [tiltMax, glowOpacity],
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.setProperty("--glow-opacity", "0");
  }, []);

  return (
    <div
      ref={ref}
      className={`mouse-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        {
          "--glow-color": glowColor,
          "--glow-x": "50%",
          "--glow-y": "50%",
          "--glow-opacity": "0",
          ...styleProp,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const animated = useRef(false);

  const startAnim = useCallback(() => {
    if (animated.current || !ref.current) return;
    animated.current = true;
    const el = ref.current;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      const current = Math.round(value * ease);
      el.textContent = `${prefix}${current.toLocaleString("tr-TR")}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, prefix, suffix, duration]);

  const ioRef = useRef<IntersectionObserver | null>(null);
  const setRef = useCallback(
    (node: HTMLSpanElement | null) => {
      if (ioRef.current) ioRef.current.disconnect();
      (ref as React.MutableRefObject<HTMLSpanElement | null>).current = node;
      if (!node) return;
      ioRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            startAnim();
            ioRef.current?.disconnect();
          }
        },
        { threshold: 0.3 },
      );
      ioRef.current.observe(node);
    },
    [startAnim],
  );

  return (
    <span ref={setRef} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
