import { useEffect, useRef } from "react";

export interface SwarmProps {
  comps: number[];
  median: number;
  q1: number;
  q3: number;
  price: number;
}

function resolveToken(name: string): string {
  const el = document.createElement("div");
  el.style.color = `var(${name})`;
  document.body.appendChild(el);
  const c = getComputedStyle(el).color;
  el.remove();
  return c;
}

function withAlpha(rgb: string, a: number): string {
  const m = rgb.match(/[\d.]+/g);
  if (!m || m.length < 3) return rgb;
  return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
}

function niceAxis(lo: number, hi: number, maxTicks: number): number[] {
  const range = hi - lo;
  if (range <= 0) return [lo];
  const rough = range / maxTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const step =
    norm < 1.5 ? mag : norm < 3 ? 2 * mag : norm < 7 ? 5 * mag : 10 * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
  return ticks;
}

function rrect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

export function NeighborhoodSwarm({
  comps,
  median,
  q1,
  q3,
  price,
}: SwarmProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafId = useRef(0);
  const isVisible = useRef(false);
  const animStartTs = useRef(0);
  const hovIdx = useRef(-1);
  const dims = useRef({ w: 0, h: 0 });
  const hitPoints = useRef<{ x: number; y: number; val: number }[]>([]);
  const scheduleRef = useRef<(() => void) | null>(null);
  const priceRef = useRef(price);
  const colorsRef = useRef<Record<string, string> | null>(null);

  const sorted = useRef<number[]>([]);
  const jitters = useRef<number[]>([]);

  useEffect(() => {
    sorted.current = [...comps].sort((a, b) => a - b);
    jitters.current = comps.map((_, i) => {
      const h = Math.sin(i * 12345.6789 + 1.23) * 43758.5453;
      return (h - Math.floor(h)) * 2 - 1;
    });
  }, [comps]);

  useEffect(() => {
    priceRef.current = price;
    scheduleRef.current?.();
  }, [price]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tokenNames = [
      "--primary",
      "--positive",
      "--risk",
      "--foreground",
      "--muted-foreground",
      "--border",
      "--background",
    ];
    const probe = document.createElement("div");
    document.body.appendChild(probe);
    const resolved: Record<string, string> = {};
    for (const name of tokenNames) {
      probe.style.color = `var(${name})`;
      resolved[name] = getComputedStyle(probe).color;
    }
    probe.remove();
    colorsRef.current = resolved;

    const dpr = window.devicePixelRatio || 1;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const PAD = { top: 38, right: 20, bottom: 34, left: 16 };

    function render(now: number) {
      const { w, h } = dims.current;
      const c = colorsRef.current;
      if (!w || !h || !ctx || !c) return;

      const s = sorted.current;
      if (!s.length) return;

      const dataMin = s[0];
      const dataMax = s[s.length - 1];
      const pad = (dataMax - dataMin) * 0.08;
      const xMin = dataMin - pad;
      const xMax = dataMax + pad;
      const xRange = xMax - xMin;
      const toX = (v: number) =>
        PAD.left + ((v - xMin) / xRange) * (w - PAD.left - PAD.right);

      if (!animStartTs.current && isVisible.current) animStartTs.current = now;
      const elapsed = animStartTs.current ? now - animStartTs.current : 0;
      const dotT = reducedMotion ? 1 : Math.min(elapsed / 1400, 1);
      const pinT = reducedMotion
        ? 1
        : Math.max(0, Math.min((elapsed - 1400) / 400, 1));
      const allDone = dotT >= 1 && pinT >= 1;

      ctx.clearRect(0, 0, w * dpr, h * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      const plotH = h - PAD.top - PAD.bottom;
      const midY = PAD.top + plotH / 2;
      const medX = toX(median);

      // --- Q1-Q3 box ---
      const bx1 = toX(q1);
      const bx3 = toX(q3);
      ctx.fillStyle = withAlpha(c["--primary"], 0.07);
      rrect(ctx, bx1, PAD.top + 4, bx3 - bx1, plotH - 8, 4);
      ctx.fill();

      // --- Median dashed line ---
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = withAlpha(c["--muted-foreground"], 0.4);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(medX, PAD.top);
      ctx.lineTo(medX, h - PAD.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // --- Comparable dots ---
      const maxDist =
        Math.max(medX - PAD.left, w - PAD.right - medX) || 1;
      const pts: { x: number; y: number; val: number }[] = [];

      for (let i = 0; i < s.length; i++) {
        const targetX = toX(s[i]);
        const distNorm = Math.abs(targetX - medX) / maxDist;
        const delay = distNorm * 0.6;
        const dt = Math.max(
          0,
          Math.min((dotT - delay) / Math.max(0.01, 1 - delay), 1),
        );
        const eased = 1 - Math.pow(1 - dt, 3);

        const x = medX + (targetX - medX) * eased;
        const jy = (jitters.current[i] || 0) * plotH * 0.34;
        const y = midY + jy;
        pts.push({ x, y, val: s[i] });

        const hov = hovIdx.current === i;
        const r = hov ? 5.5 : 3;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = hov
          ? withAlpha(c["--primary"], 0.85)
          : withAlpha(c["--primary"], 0.28);
        ctx.fill();
      }
      hitPoints.current = pts;

      // --- Pin (listing price) ---
      const curPrice = priceRef.current;
      if (pinT > 0) {
        const px = toX(curPrice);
        const ease = 1 - Math.pow(1 - pinT, 3);

        if (pinT < 1 && !reducedMotion) {
          const ringR = pinT * 36;
          ctx.beginPath();
          ctx.arc(px, midY, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = withAlpha(c["--risk"], 0.35 * (1 - pinT));
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(px, midY, 7 * ease, 0, Math.PI * 2);
        ctx.fillStyle = c["--risk"];
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, midY, 3 * ease, 0, Math.PI * 2);
        ctx.fillStyle = c["--background"];
        ctx.fill();

        if (ease > 0.3) {
          const alpha = Math.min(1, (ease - 0.3) * 1.5);
          const label = `${Math.round(curPrice).toLocaleString("tr-TR")} ₺/m²`;
          const fs = Math.max(10, Math.min(13, w * 0.011));
          ctx.font = `600 ${fs}px "Space Grotesk", system-ui`;
          ctx.textAlign = "center";

          const tw = ctx.measureText(label).width;
          ctx.fillStyle = withAlpha(c["--risk"], 0.12 * alpha);
          rrect(ctx, px - tw / 2 - 8, midY - 34, tw + 16, 22, 4);
          ctx.fill();

          ctx.fillStyle = withAlpha(c["--risk"], alpha);
          ctx.fillText(label, px, midY - 18);
        }
      }

      // --- Hover tooltip ---
      if (hovIdx.current >= 0 && allDone) {
        const pt = pts[hovIdx.current];
        if (pt) {
          const deltaVal = ((pt.val - median) / median) * 100;
          const absD = Math.abs(deltaVal).toFixed(1);
          const line1 = `${Math.round(pt.val).toLocaleString("tr-TR")} ₺/m²`;
          const line2 =
            deltaVal >= 0 ? `medyan +%${absD}` : `medyan −%${absD}`;

          const fs = Math.max(10, Math.min(12, w * 0.01));
          ctx.font = `500 ${fs}px "Space Grotesk", system-ui`;
          const tw1 = ctx.measureText(line1).width;
          const tw2 = ctx.measureText(line2).width;
          const tooltipW = Math.max(tw1, tw2) + 20;
          const tooltipH = 44;

          let tx = pt.x - tooltipW / 2;
          let ty = pt.y - tooltipH - 12;
          tx = Math.max(2, Math.min(w - tooltipW - 2, tx));
          if (ty < 2) ty = pt.y + 14;

          ctx.fillStyle = withAlpha(c["--foreground"], 0.92);
          rrect(ctx, tx, ty, tooltipW, tooltipH, 6);
          ctx.fill();

          ctx.textAlign = "left";
          ctx.font = `600 ${fs}px "Space Grotesk", system-ui`;
          ctx.fillStyle = c["--background"];
          ctx.fillText(line1, tx + 10, ty + 18);
          ctx.font = `400 ${fs - 1}px "Space Grotesk", system-ui`;
          ctx.fillStyle = withAlpha(c["--background"], 0.65);
          ctx.fillText(line2, tx + 10, ty + 34);
        }
      }

      // --- Axis ---
      const maxTicks = w < 400 ? 3 : w < 700 ? 5 : 7;
      const ticks = niceAxis(xMin, xMax, maxTicks);
      const axFs = Math.max(8, Math.min(10, w * 0.009));
      ctx.font = `500 ${axFs}px "Space Mono", monospace`;
      ctx.fillStyle = withAlpha(c["--muted-foreground"], 0.6);
      ctx.textAlign = "center";
      for (const v of ticks) {
        const x = toX(v);
        ctx.fillText(`${(v / 1000).toFixed(0)}K`, x, h - PAD.bottom + 16);
        ctx.beginPath();
        ctx.moveTo(x, h - PAD.bottom);
        ctx.lineTo(x, h - PAD.bottom + 4);
        ctx.strokeStyle = withAlpha(c["--border"], 0.4);
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // --- Median label ---
      ctx.font = `600 ${Math.max(8, Math.min(9, w * 0.008))}px "Space Mono", monospace`;
      ctx.fillStyle = withAlpha(c["--muted-foreground"], 0.55);
      ctx.textAlign = "center";
      ctx.fillText("MEDYAN", medX, PAD.top - 8);

      ctx.restore();

      if (!allDone && isVisible.current) {
        rafId.current = requestAnimationFrame(render);
      }
    }

    function scheduleFrame() {
      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(render);
    }

    scheduleRef.current = scheduleFrame;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      dims.current = { w: width, h: height };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      scheduleFrame();
    });
    ro.observe(container);

    const io = new IntersectionObserver(
      (entries) => {
        isVisible.current = entries[0]?.isIntersecting ?? false;
        if (isVisible.current) scheduleFrame();
      },
      { threshold: 0.1 },
    );
    io.observe(container);

    function findNearest(cx: number, cy: number): number {
      let best = -1;
      let bestDist = 20;
      for (let i = 0; i < hitPoints.current.length; i++) {
        const p = hitPoints.current[i];
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      return best;
    }

    function onMouseMove(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const idx = findNearest(
        e.clientX - rect.left,
        e.clientY - rect.top,
      );
      if (idx !== hovIdx.current) {
        hovIdx.current = idx;
        canvas.style.cursor = idx >= 0 ? "pointer" : "default";
        scheduleFrame();
      }
    }

    function onMouseLeave() {
      if (hovIdx.current !== -1) {
        hovIdx.current = -1;
        canvas.style.cursor = "default";
        scheduleFrame();
      }
    }

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      if (!t) return;
      const rect = canvas.getBoundingClientRect();
      const idx = findNearest(t.clientX - rect.left, t.clientY - rect.top);
      if (idx >= 0 && idx !== hovIdx.current) {
        hovIdx.current = idx;
        scheduleFrame();
      }
    }

    function onTouchEnd() {
      if (hovIdx.current !== -1) {
        hovIdx.current = -1;
        scheduleFrame();
      }
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      cancelAnimationFrame(rafId.current);
      ro.disconnect();
      io.disconnect();
      scheduleRef.current = null;
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, [comps, median, q1, q3]);

  return (
    <div
      ref={containerRef}
      className="swarm-wrap relative w-full"
      style={{ touchAction: "pan-y" }}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        aria-hidden="true"
      />
      <span className="sr-only">
        Mahalle m² fiyat dağılımı — {comps.length} emsal. Medyan:{" "}
        {Math.round(median).toLocaleString("tr-TR")} ₺/m². İlan fiyatı:{" "}
        {Math.round(price).toLocaleString("tr-TR")} ₺/m².
      </span>
    </div>
  );
}
