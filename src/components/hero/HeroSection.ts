// ============================================================
// emlakmetric — hero: building cross-section
//
// An architectural section drawing, not a chart. Floors stack;
// the pointer lights one at a time and its price appears in the
// margin, the way a dimension is annotated on a real drawing.
//
// Canvas 2D. Note: canvas will not accept color-mix(), so every
// colour is resolved to rgba() here.
// ============================================================

export interface FloorData {
  label: string;      // "12. kat"
  price: number;      // ₺/m²
  note?: string;      // "cephe: güney"
}

export interface SectionOpts {
  floors?: FloorData[];
  mono?: string;
  unitLabel?: string;       // "₺/m²"
  medianLabel?: string;     // "BİNA MEDYANI"
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => { const t = clamp01(v); return t * t * (3 - 2 * t); };

function rgba(col: string, a: number): string {
  const c = String(col).trim();
  let r = 0, g = 0, b = 0;
  if (c[0] === "#") {
    const s = c.length === 4 ? c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c.slice(1, 7);
    const n = parseInt(s, 16);
    r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
  } else {
    const m = c.match(/-?[\d.]+/g);
    if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
  }
  return `rgba(${r | 0},${g | 0},${b | 0},${a.toFixed(3)})`;
}

export function createSection(canvas: HTMLCanvasElement, opts: SectionOpts = {}) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {} };
  const g = ctx;

  const host = canvas.parentElement || canvas;
  const reduced = typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const floors: FloorData[] = opts.floors ?? [
    { label: "14. kat", price: 172400, note: "teras" },
    { label: "12. kat", price: 164900 },
    { label: "10. kat", price: 158200 },
    { label: "8. kat",  price: 151600 },
    { label: "6. kat",  price: 146300 },
    { label: "4. kat",  price: 141800 },
    { label: "2. kat",  price: 136500 },
    { label: "zemin",   price: 128900, note: "dükkân" },
  ];

  let w = 0, h = 0, dpr = 1, raf = 0, t0 = 0;
  let hoverY = 0.5, hoverT = 0.5, hv = 0;   // pointer position, target, velocity
  let engaged = false;
  let visible = true;

  const token = (n: string) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    return v || null;
  };

  function fit(): boolean {
    const r = host.getBoundingClientRect();
    const W = r.width || (host as HTMLElement).clientWidth || 0;
    const H = r.height || (host as HTMLElement).clientHeight || 0;
    if (W < 2 || H < 2) return false;
    if (Math.abs(W - w) > 0.5 || Math.abs(H - h) > 0.5) {
      w = W; h = H;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    return true;
  }

  const track = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    if (!r.height) return;
    hoverT = clamp01((e.clientY - r.top) / r.height);
    engaged = true;
  };
  host.addEventListener("pointermove", track, { passive: true });
  host.addEventListener("pointerdown", track, { passive: true });
  host.addEventListener("pointerleave", () => { engaged = false; }, { passive: true });
  canvas.style.touchAction = "pan-y";

  let io: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(e => { visible = e[0]?.isIntersecting ?? true; }, { threshold: 0 });
    io.observe(host);
  }

  const fmt = (n: number) => Math.round(n).toLocaleString("tr-TR");

  function draw(now: number) {
    raf = requestAnimationFrame(draw);
    if (!visible || !fit()) return;
    if (!t0) t0 = now;

    const T = reduced ? 1 : clamp01((now - t0) / 2000);
    const primary = token("--primary") || "#1B4DFF";
    const fg = token("--foreground") || token("--fg") || "#0E1116";
    const muted = token("--muted-foreground") || token("--muted") || "#6B7280";
    const bg = token("--background") || token("--bg") || "#FBFBFD";

    // spring-tracked pointer: momentum, then settle
    const target = engaged ? hoverT : 0.5 + Math.sin(now / 3000) * 0.34;
    hv += (target - hoverY) * 0.030 - hv * 0.22;
    hoverY += hv;

    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);

    // ---- drawing frame ----------------------------------------
    const marginR = Math.max(112, w * 0.20);     // annotation gutter
    const padL = Math.max(20, w * 0.05);
    const top = h * 0.09;
    const bot = h * 0.93;
    const bodyR = w - marginR;
    const bodyW = bodyR - padL;
    const n = floors.length;
    const fh = (bot - top) / n;

    // ---- ground line ------------------------------------------
    g.strokeStyle = rgba(fg, 0.30);
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(padL - 14, bot + 0.5);
    g.lineTo(bodyR + 26, bot + 0.5);
    g.stroke();
    // hatching under grade, the way a section marks earth
    g.strokeStyle = rgba(fg, 0.13);
    g.lineWidth = 1;
    for (let x = padL - 12; x < bodyR + 22; x += 9) {
      g.beginPath();
      g.moveTo(x, bot + 2);
      g.lineTo(x - 6, bot + 9);
      g.stroke();
    }

    // ---- which floor is lit -----------------------------------
    const idx = Math.min(n - 1, Math.max(0, Math.floor(hoverY * n)));

    // ---- floors, revealed bottom-up ---------------------------
    for (let i = n - 1; i >= 0; i--) {
      const fromBottom = n - 1 - i;
      const appear = smooth((T - fromBottom * 0.055) / 0.30);
      if (appear <= 0) continue;

      const y0 = top + i * fh;
      const y1 = y0 + fh;
      const lit = i === idx ? 1 : 0;
      // neighbours dim slightly, so the lit floor reads
      const near = Math.abs(i - idx);
      const dim = engaged || !reduced ? (near === 0 ? 1 : near === 1 ? 0.62 : 0.42) : 1;

      // slab: the horizontal line that makes it read as a section
      g.strokeStyle = rgba(fg, (0.22 + 0.30 * lit) * appear * dim);
      g.lineWidth = i === n - 1 ? 1.6 : 1.1;
      g.beginPath();
      g.moveTo(padL, y0 + 0.5);
      g.lineTo(padL + bodyW * appear, y0 + 0.5);
      g.stroke();

      // lit floor fills softly
      if (lit) {
        const grad = g.createLinearGradient(padL, y0, padL + bodyW, y0);
        grad.addColorStop(0, rgba(primary, 0.13));
        grad.addColorStop(1, rgba(primary, 0.03));
        g.fillStyle = grad;
        g.fillRect(padL, y0 + 1, bodyW * appear, fh - 2);
      }

      // interior partitions — thin, irregular, like a real plan
      const seedA = (i * 37) % 5, seedB = (i * 53) % 7;
      g.strokeStyle = rgba(fg, 0.10 * appear * dim);
      g.lineWidth = 0.8;
      [0.34 + seedA * 0.02, 0.66 - seedB * 0.015].forEach(f => {
        const x = padL + bodyW * f * appear;
        if (x <= padL + 2) return;
        g.beginPath();
        g.moveTo(x, y0 + 3);
        g.lineTo(x, y1 - 3);
        g.stroke();
      });

      // windows on the facade edge
      const wCount = 4;
      for (let k = 0; k < wCount; k++) {
        const wx = padL + bodyW * (0.10 + k * 0.20) * appear;
        if (wx <= padL + 2) continue;
        g.fillStyle = rgba(lit ? primary : fg, (lit ? 0.34 : 0.10) * appear * dim);
        g.fillRect(wx, y0 + fh * 0.34, bodyW * 0.055, fh * 0.30);
      }
    }

    // ---- vertical envelope ------------------------------------
    const env = smooth(T / 0.4);
    g.strokeStyle = rgba(fg, 0.34 * env);
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(padL + 0.5, bot);
    g.lineTo(padL + 0.5, bot - (bot - top) * env);
    g.moveTo(padL + bodyW + 0.5, bot);
    g.lineTo(padL + bodyW + 0.5, bot - (bot - top) * env);
    g.stroke();

    // ---- dimension line in the gutter -------------------------
    if (T > 0.55) {
      const a = smooth((T - 0.55) / 0.3);
      const dx = bodyR + 18;
      g.strokeStyle = rgba(muted, 0.42 * a);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(dx, top);
      g.lineTo(dx, bot);
      g.stroke();
      [top, bot].forEach(y => {
        g.beginPath();
        g.moveTo(dx - 4, y);
        g.lineTo(dx + 4, y);
        g.stroke();
      });
    }

    // ---- annotation for the lit floor -------------------------
    if (T > 0.75) {
      const a = smooth((T - 0.75) / 0.25);
      const f = floors[idx];
      const y0 = top + idx * fh;
      const cy = y0 + fh / 2;

      // leader line from the floor into the gutter
      g.strokeStyle = rgba(primary, 0.55 * a);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(padL + bodyW, cy);
      g.lineTo(bodyR + 30, cy);
      g.stroke();
      g.fillStyle = rgba(primary, 0.9 * a);
      g.beginPath();
      g.arc(padL + bodyW, cy, 3, 0, Math.PI * 2);
      g.fill();

      const tx = bodyR + 38;
      const mono = opts.mono || 'ui-monospace, monospace';
      g.save();
      g.globalAlpha = a;

      const ps = Math.max(15, Math.min(21, w * 0.017));
      g.font = `600 ${ps}px ${mono}`;
      g.fillStyle = fg;
      g.textBaseline = "alphabetic";
      g.fillText(fmt(f.price), tx, cy + 2);

      const us = Math.max(9.5, Math.min(11.5, w * 0.0092));
      g.font = `500 ${us}px ${mono}`;
      g.fillStyle = muted;
      g.fillText(opts.unitLabel || "₺/m²", tx + g.measureText("").width, cy + 16);

      g.font = `500 ${us}px ${mono}`;
      g.fillStyle = rgba(fg, 0.7);
      g.fillText(f.label.toUpperCase(), tx, cy - 14);

      if (f.note) {
        g.fillStyle = rgba(muted, 0.9);
        g.fillText(f.note, tx + 44, cy + 16);
      }
      g.restore();
    }

    // ---- median mark, the reference the product is built on ----
    if (T > 0.85) {
      const a = smooth((T - 0.85) / 0.15);
      const sorted = [...floors].map(f => f.price).sort((x, y) => x - y);
      const med = sorted[Math.floor(sorted.length / 2)];
      const lo = sorted[0], hi = sorted[sorted.length - 1];
      const medY = bot - ((med - lo) / (hi - lo || 1)) * (bot - top) * 0.94 - fh * 0.4;

      g.save();
      g.globalAlpha = a;
      g.setLineDash([4, 5]);
      g.strokeStyle = rgba(muted, 0.5);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(padL - 12, medY);
      g.lineTo(padL, medY);
      g.stroke();
      g.setLineDash([]);
      g.font = `500 ${Math.max(9, Math.min(10.5, w * 0.0085))}px ${opts.mono || 'ui-monospace, monospace'}`;
      g.fillStyle = muted;
      g.textAlign = "right";
      g.fillText(opts.medianLabel || "MEDYAN", padL - 16, medY + 3);
      g.textAlign = "left";
      g.restore();
    }
  }

  raf = requestAnimationFrame(draw);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      io?.disconnect();
      host.removeEventListener("pointermove", track);
      host.removeEventListener("pointerdown", track);
    },
  };
}
