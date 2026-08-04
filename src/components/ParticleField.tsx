import { useEffect, useRef, useCallback } from "react";

interface ParticleFieldProps {
  light?: boolean;
  orbCount?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function ParticleField({ light = false, orbCount = 190, className, style }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clientRef = useRef({ x: -9999, y: -9999 });
  const stateRef = useRef<{ stopped: boolean } | null>(null);

  const startField = useCallback((c: HTMLCanvasElement) => {
    if (!c || !c.isConnected) return;
    if (stateRef.current) stateRef.current.stopped = true;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0;
    let pts: Array<{ x: number; y: number; tx: number; ty: number; s: number; r: boolean; g: boolean }> = [];
    let orbs: Array<{ a: number; rad: number; rr: number; sp: number; sz: number; o: number; red: boolean }> = [];

    const build = () => {
      const r = c.getBoundingClientRect();
      W = r.width; H = r.height;
      if (!W || !H) { requestAnimationFrame(build); return; }
      c.width = W * dpr; c.height = H * dpr;

      const off = document.createElement("canvas");
      off.width = Math.round(W); off.height = Math.round(H);
      const o = off.getContext("2d")!;
      o.fillStyle = "#000";
      o.textAlign = "left"; o.textBaseline = "middle";
      const probe = 100;
      o.font = `700 ${probe}px 'Space Grotesk', sans-serif`;
      const emRatio = o.measureText("em").width / probe;
      o.font = `700 ${probe * 0.33}px 'Space Grotesk', sans-serif`;
      const supRatio = o.measureText("2").width / probe;
      const target = Math.min(W * 0.66, H * 1.6);
      const size = target / (emRatio + supRatio + 0.02);
      const markW = size * (emRatio + supRatio + 0.02);
      const cx = (W - markW) / 2, cy = H * 0.5;
      o.font = `700 ${size}px 'Space Grotesk', sans-serif`;
      o.fillText("em", cx, cy);
      o.font = `700 ${size * 0.33}px 'Space Grotesk', sans-serif`;
      o.fillText("2", cx + size * (emRatio + 0.015), cy - size * 0.27);
      const d = o.getImageData(0, 0, off.width, off.height).data;
      const step = W > 1400 ? 4 : 3;
      pts = [];
      const rMax = Math.min(W, H) * 0.52;
      orbs = Array.from({ length: orbCount }, () => {
        const rad = rMax * (0.42 + Math.random() * 0.78);
        return {
          a: Math.random() * Math.PI * 2,
          rad,
          rr: rad * (0.58 + Math.random() * 0.42),
          sp: (Math.random() < 0.5 ? -1 : 1) * (0.00012 + Math.random() * 0.00042),
          sz: Math.random() < 0.12 ? 2.4 : 1.4,
          o: 0.12 + Math.random() * 0.4,
          red: Math.random() < 0.05,
        };
      });
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < off.width; x += step) {
          if (d[(y * off.width + x) * 4 + 3] > 130) {
            pts.push({
              x: Math.random() * W,
              y: Math.random() * H,
              tx: x + (Math.random() - 0.5) * 2,
              ty: y + (Math.random() - 0.5) * 2,
              s: 0.5 + Math.random() * 0.6,
              r: Math.random() < 0.04,
              g: Math.random() < 0.3,
            });
          }
        }
      }
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    const ctx = c.getContext("2d")!;
    const st = { stopped: false };
    stateRef.current = st;

    const tick = (t: number) => {
      if (st.stopped || !c.isConnected) return;
      const rb = c.getBoundingClientRect();
      if (rb.width && Math.abs(rb.width - W) > 2) build();
      const mx = clientRef.current.x - rb.left;
      const my = clientRef.current.y - rb.top;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += (p.tx - p.x) * 0.055 + Math.sin(t / 1400 + i) * 0.16;
        p.y += (p.ty - p.y) * 0.055 + Math.cos(t / 1600 + i) * 0.16;
        const dx = p.x - mx, dy = p.y - my, dist = Math.hypot(dx, dy);
        let px = p.x, py = p.y;
        if (dist < 150) { const k = (1 - dist / 150) * 46; px += (dx / dist) * k; py += (dy / dist) * k; }
        ctx.fillStyle = p.r
          ? (light ? "rgba(255,255,255,.95)" : "rgba(226,61,40,.8)")
          : light
            ? `rgba(255,255,255,${(0.45 + p.s * 0.5).toFixed(3)})`
            : p.g
              ? `rgba(14,17,22,${(0.3 + p.s * 0.3).toFixed(3)})`
              : `rgba(27,77,255,${(0.34 + p.s * 0.42).toFixed(3)})`;
        ctx.fillRect(px, py, 2, 2);
      }

      const ox = W / 2, oy = H / 2;
      for (let i = 0; i < orbs.length; i++) {
        const b = orbs[i];
        const a = b.a + t * b.sp;
        let bx = ox + Math.cos(a) * b.rad, by = oy + Math.sin(a) * b.rr;
        const dx = bx - mx, dy = by - my, dd = Math.hypot(dx, dy);
        if (dd < 130) { const k = (1 - dd / 130) * 40; bx += (dx / dd) * k; by += (dy / dd) * k; }
        ctx.fillStyle = light
          ? `rgba(255,255,255,${(b.o + 0.15).toFixed(2)})`
          : b.red
            ? `rgba(226,61,40,${(b.o + 0.2).toFixed(2)})`
            : `rgba(27,77,255,${b.o.toFixed(2)})`;
        ctx.fillRect(bx, by, b.sz, b.sz);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      st.stopped = true;
      window.removeEventListener("resize", onResize);
    };
  }, [light, orbCount]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    const onPointer = (e: PointerEvent) => {
      clientRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Wait for fonts
    const init = () => startField(c);
    if (document.fonts?.ready) {
      document.fonts.ready.then(init);
    } else {
      init();
    }

    return () => {
      if (stateRef.current) stateRef.current.stopped = true;
      window.removeEventListener("pointermove", onPointer);
    };
  }, [startField]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", pointerEvents: "none", ...style }}
    />
  );
}
