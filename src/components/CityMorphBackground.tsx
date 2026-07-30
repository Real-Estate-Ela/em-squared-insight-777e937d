import { useEffect, useRef } from "react";

const VIEW_W = 1200;
const VIEW_H = 600;
const PTS = 30;

const PROFILES: number[][] = [
  // Istanbul: Galata spike, Bosphorus bridge catenary, Hagia Sophia dome, minarets
  [0.70,0.64,0.56,0.45,0.32,0.18,0.32,0.48,0.58,0.64,0.70,0.72,0.68,0.60,0.55,0.60,0.68,0.55,0.35,0.22,0.35,0.52,0.40,0.18,0.40,0.56,0.64,0.72,0.78,0.82],
  // Ankara: steppe plateau, Anitkabir flat-top, Atakule needle
  [0.84,0.80,0.76,0.70,0.62,0.52,0.42,0.36,0.36,0.36,0.36,0.42,0.50,0.46,0.36,0.26,0.16,0.10,0.16,0.30,0.46,0.56,0.64,0.70,0.74,0.78,0.82,0.84,0.86,0.88],
  // Izmir: coastal flat, Clock Tower spike, harbor curve
  [0.78,0.72,0.66,0.58,0.50,0.40,0.28,0.16,0.28,0.44,0.54,0.60,0.56,0.50,0.46,0.50,0.56,0.52,0.48,0.44,0.40,0.44,0.50,0.56,0.64,0.70,0.74,0.78,0.82,0.84],
  // Konya: flat steppe, Mevlana conical dome
  [0.86,0.84,0.80,0.76,0.70,0.62,0.52,0.40,0.28,0.18,0.28,0.40,0.52,0.60,0.66,0.70,0.74,0.70,0.66,0.60,0.64,0.68,0.74,0.78,0.80,0.82,0.84,0.86,0.88,0.88],
  // Adana: Stone Bridge arches, Sabanci dome + minaret
  [0.80,0.76,0.70,0.60,0.56,0.62,0.68,0.62,0.55,0.62,0.68,0.58,0.46,0.34,0.24,0.16,0.24,0.38,0.26,0.14,0.26,0.46,0.56,0.64,0.70,0.74,0.78,0.82,0.84,0.86],
  // Eskisehir: Fairy Tale Castle turrets
  [0.84,0.78,0.70,0.60,0.50,0.40,0.34,0.26,0.34,0.28,0.24,0.18,0.24,0.28,0.20,0.16,0.20,0.28,0.36,0.46,0.54,0.60,0.66,0.72,0.76,0.80,0.82,0.84,0.86,0.88],
  // Denizli: Pamukkale terraced cascades
  [0.86,0.82,0.78,0.74,0.74,0.70,0.66,0.66,0.62,0.58,0.58,0.54,0.50,0.46,0.46,0.42,0.38,0.34,0.30,0.26,0.26,0.32,0.40,0.48,0.56,0.64,0.70,0.76,0.82,0.86],
  // Mersin: marina masts, gentle harbor
  [0.82,0.78,0.74,0.70,0.66,0.64,0.60,0.56,0.52,0.50,0.46,0.34,0.46,0.50,0.40,0.26,0.40,0.50,0.54,0.56,0.54,0.50,0.46,0.50,0.58,0.66,0.72,0.78,0.82,0.85],
];

const NAMES = [
  "İstanbul", "Ankara", "İzmir", "Konya",
  "Adana", "Eskişehir", "Denizli", "Mersin",
];

const LAYERS = [
  { opacity: 0.05, width: 1, yOff: -60, yScale: 0.5, parallax: 0.08 },
  { opacity: 0.10, width: 1.5, yOff: -5, yScale: 0.75, parallax: 0.22 },
  { opacity: 0.20, width: 2, yOff: 30, yScale: 1.0, parallax: 0.4 },
];

const COLOR_STOPS: [number, number, number][] = [
  [0.55, 0.22, 265],
  [0.50, 0.18, 305],
  [0.52, 0.14, 195],
  [0.58, 0.16, 55],
];

const DOT_IDX = [4, 9, 14, 19, 24];
const CONN_IDX = [6, 12, 18, 24];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function ease(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function cycleColor(t: number) {
  const n = COLOR_STOPS.length;
  const s = (((t % 1) + 1) % 1) * n;
  const i = Math.floor(s) % n;
  const f = s - Math.floor(s);
  const a = COLOR_STOPS[i];
  const b = COLOR_STOPS[(i + 1) % n];
  let h0 = a[2], h1 = b[2];
  if (Math.abs(h1 - h0) > 180) {
    if (h1 > h0) h0 += 360; else h1 += 360;
  }
  const l = lerp(a[0], b[0], f);
  const c = lerp(a[1], b[1], f);
  const h = lerp(h0, h1, f) % 360;
  return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;
}

function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return "";
  const r = (n: number) => n.toFixed(1);
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(i - 2, 0)];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[Math.min(i + 1, pts.length - 1)];
    const cx1 = p1[0] + (p2[0] - p0[0]) / 6;
    const cy1 = p1[1] + (p2[1] - p0[1]) / 6;
    const cx2 = p2[0] - (p3[0] - p1[0]) / 6;
    const cy2 = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${r(cx1)},${r(cy1)} ${r(cx2)},${r(cy2)} ${r(p2[0])},${r(p2[1])}`;
  }
  return d;
}

export function CityMorphBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const areaEl = useRef<SVGPathElement | null>(null);
  const dotEls = useRef<(SVGCircleElement | null)[]>([]);
  const connEls = useRef<(SVGLineElement | null)[]>([]);
  const labelEl = useRef<SVGTextElement | null>(null);
  const mouse = useRef({ x: VIEW_W / 2, y: VIEW_H / 2, on: false });
  const state = useRef({ cityIdx: 0, morphT: 0, colorT: 0 });
  const visible = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const io = new IntersectionObserver(
      ([entry]) => { visible.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    io.observe(el);

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      if (
        e.clientX >= r.left && e.clientX <= r.right &&
        e.clientY >= r.top && e.clientY <= r.bottom
      ) {
        mouse.current.x = ((e.clientX - r.left) / r.width) * VIEW_W;
        mouse.current.y = ((e.clientY - r.top) / r.height) * VIEW_H;
        mouse.current.on = true;
      } else {
        mouse.current.on = false;
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf: number;
    let prevTime = 0;
    const layerPts: [number, number][][] = [[], [], []];

    function tick(now: number) {
      if (!visible.current) {
        prevTime = 0;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = prevTime ? Math.min((now - prevTime) / 1000, 0.05) : 0.016;
      prevTime = now;
      const s = state.current;

      if (!reducedMotion) {
        s.morphT += dt * 0.075;
        if (s.morphT >= 1) {
          s.morphT -= 1;
          s.cityIdx = (s.cityIdx + 1) % PROFILES.length;
        }
        s.colorT += dt * 0.025;
      }

      const from = PROFILES[s.cityIdx];
      const to = PROFILES[(s.cityIdx + 1) % PROFILES.length];
      const t = ease(s.morphT);

      for (let li = 0; li < LAYERS.length; li++) {
        const cfg = LAYERS[li];
        const pts: [number, number][] = [];

        for (let i = 0; i < PTS; i++) {
          const x = (i / (PTS - 1)) * VIEW_W;
          const raw = lerp(from[i], to[i], t);
          let y = raw * cfg.yScale * VIEW_H * 0.6 + VIEW_H * 0.1 + cfg.yOff;

          if (!reducedMotion) {
            y += Math.sin(i * 7.3 + now * 0.0008) * 2.5;
          }

          y += scrollY * cfg.parallax * 0.08;

          if (mouse.current.on && !reducedMotion) {
            const dx = x - mouse.current.x;
            const dy = y - mouse.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150 && dist > 1) {
              const force = ((1 - dist / 150) ** 2) * 18;
              y += (dy / dist) * force;
            }
          }

          pts.push([x, y]);
        }

        layerPts[li] = pts;

        const path = pathEls.current[li];
        if (path) {
          const d = smoothPath(pts);
          path.setAttribute("d", d);
          path.setAttribute("stroke", cycleColor(s.colorT + li * 0.1));
        }
      }

      if (areaEl.current && layerPts[2].length) {
        const d = smoothPath(layerPts[2]);
        areaEl.current.setAttribute(
          "d",
          `${d} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`,
        );
        areaEl.current.setAttribute("fill", cycleColor(s.colorT + 0.2));
      }

      const frontColor = cycleColor(s.colorT + 0.2);
      DOT_IDX.forEach((pi, di) => {
        const dot = dotEls.current[di];
        const pt = layerPts[2]?.[pi];
        if (dot && pt) {
          dot.setAttribute("cx", pt[0].toFixed(1));
          dot.setAttribute("cy", pt[1].toFixed(1));
          dot.setAttribute("fill", frontColor);
          const pulse = reducedMotion
            ? 0.18
            : 0.14 + Math.sin(now * 0.003 + di * 1.2) * 0.08;
          dot.setAttribute("opacity", pulse.toFixed(3));
        }
      });

      CONN_IDX.forEach((pi, ci) => {
        const line = connEls.current[ci];
        const p1 = layerPts[1]?.[pi];
        const p2 = layerPts[2]?.[pi];
        if (line && p1 && p2) {
          line.setAttribute("x1", p1[0].toFixed(1));
          line.setAttribute("y1", p1[1].toFixed(1));
          line.setAttribute("x2", p2[0].toFixed(1));
          line.setAttribute("y2", p2[1].toFixed(1));
          line.setAttribute("stroke", cycleColor(s.colorT + 0.15));
        }
      });

      if (labelEl.current) {
        const fade =
          s.morphT < 0.12
            ? s.morphT / 0.12
            : s.morphT > 0.88
              ? (1 - s.morphT) / 0.12
              : 1;
        labelEl.current.textContent = NAMES[s.cityIdx].toLocaleUpperCase(
          "tr-TR",
        );
        labelEl.current.setAttribute("opacity", (fade * 0.07).toFixed(3));
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        {[0.2, 0.35, 0.5, 0.65, 0.8].map((g) => (
          <line
            key={g}
            x1={0}
            y1={VIEW_H * g}
            x2={VIEW_W}
            y2={VIEW_H * g}
            stroke="var(--primary)"
            strokeWidth="0.5"
            opacity={0.03}
          />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={VIEW_W * ((i + 1) / 11)}
            y1={0}
            x2={VIEW_W * ((i + 1) / 11)}
            y2={VIEW_H}
            stroke="var(--primary)"
            strokeWidth="0.5"
            opacity={0.02}
          />
        ))}

        {LAYERS.slice(0, 2).map((cfg, i) => (
          <path
            key={i}
            ref={(el) => { pathEls.current[i] = el; }}
            fill="none"
            strokeWidth={cfg.width}
            opacity={cfg.opacity}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        <path
          ref={(el) => { areaEl.current = el; }}
          fill="var(--primary)"
          opacity={0.025}
        />

        {CONN_IDX.map((_, i) => (
          <line
            key={`c${i}`}
            ref={(el) => { connEls.current[i] = el; }}
            strokeWidth="0.5"
            opacity={0.04}
            strokeDasharray="4 6"
          />
        ))}

        <path
          ref={(el) => { pathEls.current[2] = el; }}
          fill="none"
          strokeWidth={LAYERS[2].width}
          opacity={LAYERS[2].opacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {DOT_IDX.map((_, i) => (
          <circle
            key={`d${i}`}
            ref={(el) => { dotEls.current[i] = el; }}
            r={3}
            opacity={0.18}
          />
        ))}

        <text
          ref={(el) => { labelEl.current = el; }}
          x={VIEW_W / 2}
          y={VIEW_H * 0.93}
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.2em",
          }}
          fill="var(--foreground)"
          opacity={0.07}
        />
      </svg>
    </div>
  );
}
