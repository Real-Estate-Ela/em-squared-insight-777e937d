// ============================================================
// emlakmetric — CityScene
//
// Drop-in 3D city backdrop. Renders 20 Turkish cities as
// flat-shaded volumes that rise out of the ground, hold, then
// hand over to the next city along a wave travelling left to
// right. Software projection onto canvas 2D: no WebGL, no
// dependencies, ~600 faces a frame.
//
//   <CityScene className="absolute inset-0" />
//
// Colour comes from four CSS custom properties if they are set
// on the element (--primary, --positive, --risk, --foreground),
// otherwise from the fallbacks below.
// ============================================================
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
} from "react";
import { CITIES, CITY_NAMES, type City, type Vec3 } from "./model";

export type CityPhase = "model" | "transition";

export interface CitySceneProps {
  className?: string;
  style?: CSSProperties;
  /** Horizontal centre of the city, 0–1. Push it right of a left-aligned headline with ~0.58. */
  anchorX?: number;
  /** Horizon line height, 0–1. */
  horizon?: number;
  /** Seconds each city is held still. */
  hold?: number;
  /** Seconds the hand-off wave takes. */
  sweep?: number;
  /** Set false to freeze on the first city. */
  animate?: boolean;
  /**
   * Explicit hex colours. Falls back to the --primary / --positive / --risk /
   * --foreground custom properties on the element, then to the brand defaults.
   * Pass these if your tokens are declared in oklch rather than hex.
   */
  colors?: { primary?: string; positive?: string; risk?: string; ink?: string };
  /** Called every frame with the city currently on screen. */
  onCity?: (city: City, phase: CityPhase, progress: number, index: number) => void;
}

export interface CitySceneHandle {
  /** Jump straight to a city by index. */
  goTo: (index: number) => void;
  names: string[];
}

export { CITY_NAMES, CITIES };
export type { City };

// --- colour ---------------------------------------------------------
const FALLBACK = {
  primary: "#1B4DFF",
  positive: "#00875A",
  risk: "#E23D28",
  ink: "#0E1116",
};

const WHITE: Vec3 = [255, 255, 255];
const SUN: Vec3 = (() => {
  const v: Vec3 = [-0.52, 0.7, 0.49];
  const m = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / m, v[1] / m, v[2] / m];
})();

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
const easeIO = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
/** Volumes overshoot slightly, then settle — they land with weight. */
const backOut = (t: number) => {
  const u = clamp01(t) - 1;
  const c1 = 1.34;
  return 1 + (c1 + 1) * u * u * u + c1 * u * u;
};

const hex = (h: string): Vec3 => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mix3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const css = (c: Vec3) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
const cssa = (c: Vec3, a: number) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

interface Ramp {
  id: number;
  shade: Vec3;
  bounce: Vec3;
  mid: Vec3;
  light: Vec3;
  top: Vec3;
}

// --- one-time geometry prep ------------------------------------------
let prepared = false;
function prepare() {
  if (prepared) return;
  prepared = true;
  for (const c of CITIES) {
    c.structures.sort((a, b) => a.x - b.x);
    let x0 = 1e9;
    let x1 = -1e9;
    for (const s of c.structures) {
      if (s.x < x0) x0 = s.x;
      if (s.x > x1) x1 = s.x;
    }
    c.x0 = x0;
    c.x1 = x1;
    for (const s of c.structures) {
      s.u = x1 > x0 ? (s.x - x0) / (x1 - x0) : 0.5;
      s.hv = 0;
      s.hvV = 0;
      let top = 0;
      let ax0 = 1e9;
      let ax1 = -1e9;
      let az0 = 1e9;
      let az1 = -1e9;
      const scan = (v: Vec3) => {
        if (v[1] > top) top = v[1];
        if (v[0] < ax0) ax0 = v[0];
        if (v[0] > ax1) ax1 = v[0];
        if (v[2] < az0) az0 = v[2];
        if (v[2] > az1) az1 = v[2];
      };
      for (const f of s.solid.faces) for (const v of f) scan(v);
      for (const l of s.solid.lines) for (const v of l) scan(v);
      s.top = top;
      s.cx = (ax0 + ax1) / 2;
      s.cz = (az0 + az1) / 2;
      for (const f of s.solid.faces) {
        const [a, b, d] = f;
        const ux = b[0] - a[0];
        const uy = b[1] - a[1];
        const uz = b[2] - a[2];
        const vx = d[0] - a[0];
        const vy = d[1] - a[1];
        const vz = d[2] - a[2];
        const nx = uy * vz - uz * vy;
        const ny = uz * vx - ux * vz;
        const nz = ux * vy - uy * vx;
        const m = Math.hypot(nx, ny, nz) || 1;
        f.n = [nx / m, ny / m, nz / m];
        let ay = 0;
        for (const v of f) ay += v[1];
        f.ay = ay / f.length;
      }
    }
  }
}

// --- component --------------------------------------------------------
export const CityScene = forwardRef<CitySceneHandle, CitySceneProps>(
  function CityScene(props, ref) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const apiRef = useRef<{ goTo: (i: number) => void }>({ goTo: () => {} });
    const propsRef = useRef(props);
    propsRef.current = props;

    useImperativeHandle(
      ref,
      () => ({ goTo: (i: number) => apiRef.current.goTo(i), names: CITY_NAMES }),
      [],
    );

    useEffect(() => {
      const hostEl = hostRef.current;
      const canvasEl = canvasRef.current;
      if (!hostEl || !canvasEl) return;
      const ctx2d = canvasEl.getContext("2d");
      if (!ctx2d) return;

      // Narrowing does not reach into the function declarations below, so
      // re-bind once with non-nullable types instead of sprinkling `!`.
      const el: HTMLDivElement = hostEl;
      const cv: HTMLCanvasElement = canvasEl;
      const g: CanvasRenderingContext2D = ctx2d;

      prepare();

      // ---- palette, read from CSS custom properties when present -----
      const given = propsRef.current.colors ?? {};
      const read = (prop: string | undefined, name: string, fallback: string) => {
        if (prop && /^#[0-9a-fA-F]{6}$/.test(prop)) return prop;
        const v = getComputedStyle(el).getPropertyValue(name).trim();
        return /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;
      };
      const INK = hex(read(given.ink, "--foreground", FALLBACK.ink));
      const PRIMARY = hex(read(given.primary, "--primary", FALLBACK.primary));
      const POSITIVE = hex(read(given.positive, "--positive", FALLBACK.positive));
      const RISK = hex(read(given.risk, "--risk", FALLBACK.risk));

      const SKY_TOP = mix3(PRIMARY, WHITE, 0.84);
      const SKY_LOW = mix3(PRIMARY, WHITE, 0.965);
      const GROUND = mix3(PRIMARY, WHITE, 0.87);
      const WATER_NEAR = mix3(PRIMARY, WHITE, 0.52);
      const WATER_FAR = mix3(PRIMARY, WHITE, 0.78);
      const SHADOW = mix3(PRIMARY, INK, 0.55);

      let palId = 0;
      const ramp = (base: Vec3): Ramp => ({
        id: palId++,
        shade: mix3(base, INK, 0.54),
        bounce: mix3(base, INK, 0.26),
        mid: base,
        light: mix3(base, WHITE, 0.28),
        top: mix3(base, WHITE, 0.46),
      });
      const PAL_MASS = ramp(PRIMARY);
      const PAL_ACC = ramp(POSITIVE);
      const COLCACHE: string[] = [];

      const reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // ---- state ------------------------------------------------------
      const cam = { yaw: -0.15, pitch: 0.225, dist: 1600, f: 1000, cx: 0, cy: 0 };
      const spr = {
        yaw: 0, yawV: 0, yawT: 0,
        pit: 0, pitV: 0, pitT: 0,
        dol: 0, dolV: 0, dolT: 0,
      };
      const ptr = { x: -9999, y: -9999, inside: false };
      let cw = 0;
      let ch = 0;
      let dpr = 1;
      let boxW = 0;
      let boxH = 0;
      let t0 = 0;
      let last = 0;
      let tOffset = 0;
      let raf = 0;
      let visible = true;
      let cy_ = 1, sy_ = 0, cp_ = 1, sp_ = 0;
      let SC = 1, LIFT = 0, HS = 1, HCX = 0, HCZ = 0;
      let hovered: (typeof CITIES)[number]["structures"][number] | null = null;
      let hoveredCity: City | null = null;
      let warned = false;

      const clock = () =>
        typeof performance !== "undefined" && performance.now
          ? performance.now()
          : Date.now();

      // ---- sizing: ResizeObserver, with a measured fallback ------------
      const measure = () => {
        const r = el.getBoundingClientRect();
        boxW = r.width || el.clientWidth || 0;
        boxH = r.height || el.clientHeight || 0;
      };
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver((entries) => {
          const e = entries[0];
          if (!e) return;
          const b = e.contentRect;
          boxW = b.width;
          boxH = b.height;
        });
        ro.observe(el);
      }
      measure();

      function fit() {
        if (!boxW || !boxH) measure();
        if (boxW < 2 || boxH < 2) return false;
        if (Math.abs(boxW - cw) > 0.5 || Math.abs(boxH - ch) > 0.5) {
          cw = boxW;
          ch = boxH;
          dpr = Math.min(window.devicePixelRatio || 1, 2);
          cv.width = Math.round(cw * dpr);
          cv.height = Math.round(ch * dpr);
          cv.style.width = "100%";
          cv.style.height = "100%";
        }
        cam.f = (cw < 760 ? 0.8 : 0.46) * cw * 1600 / 900;
        cam.cx = cw * (propsRef.current.anchorX ?? 0.5);
        cam.cy = ch * (propsRef.current.horizon ?? 0.76);
        return true;
      }

      // ---- pointer ------------------------------------------------------
      const onMove = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        if (!r.width || !r.height) return;
        ptr.x = e.clientX - r.left;
        ptr.y = e.clientY - r.top;
        ptr.inside = true;
        spr.yawT = (ptr.x / r.width - 0.5) * 0.46;
        spr.pitT = (ptr.y / r.height - 0.5) * -0.11;
        spr.dolT = (0.5 - Math.abs(ptr.x / r.width - 0.5)) * -180;
      };
      const onLeave = () => {
        ptr.inside = false;
        ptr.x = -9999;
        ptr.y = -9999;
        spr.yawT = 0;
        spr.pitT = 0;
        spr.dolT = 0;
      };
      el.addEventListener("pointermove", onMove, { passive: true });
      el.addEventListener("pointerleave", onLeave, { passive: true });

      // ---- projection ----------------------------------------------------
      function project(v: Vec3, rise: number): Vec3 {
        const y = (v[1] * rise + LIFT) * SC;
        const vx = (HCX + (v[0] - HCX) * HS) * SC;
        const vz = (HCZ + (v[2] - HCZ) * HS) * SC;
        const x = vx * cy_ - vz * sy_;
        const z = vx * sy_ + vz * cy_;
        const y2 = y * cp_ - z * sp_;
        const z2 = cam.dist - (y * sp_ + z * cp_);
        const f = cam.f / (z2 < 80 ? 80 : z2);
        return [cam.cx + x * f, cam.cy - y2 * f, z2];
      }
      /** Drop a point onto the ground along the sun vector. */
      function shadowOf(v: Vec3, rise: number): Vec3 {
        const y = v[1] * rise + LIFT;
        if (y <= 0) return [v[0], 0, v[2]];
        const t = y / SUN[1];
        return [v[0] - SUN[0] * t, 0, v[2] - SUN[2] * t];
      }
      const rotN = (n: Vec3): Vec3 => [
        n[0] * cy_ - n[2] * sy_,
        n[1],
        n[0] * sy_ + n[2] * cy_,
      ];

      interface Item {
        p: Vec3[];
        z: number;
        col: string;
        line?: 1;
      }
      interface Box {
        s: City["structures"][number];
        city: City;
        bx0: number;
        bx1: number;
        by0: number;
        by1: number;
        bz: number;
      }
      const items: Item[] = [];
      const boxes: Box[] = [];

      function collect(city: City, riseOf: (s: City["structures"][number]) => number) {
        SC = city.scale ?? 1;
        for (const s of city.structures) {
          const rise = riseOf(s);
          if (rise < 0.006) continue;
          const pal = s.accent || s.foliage ? PAL_ACC : PAL_MASS;
          const dim = s.far ? 0.55 : 1;
          LIFT = (s.hv ?? 0) * 26;
          HS = s.far ? 1 : 0.86 + 0.14 * (rise > 1.12 ? 1.12 : rise);
          HCX = s.cx ?? 0;
          HCZ = s.cz ?? 0;

          let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9, bz = 1e9;

          for (const f of s.solid.faces) {
            let zs = 0;
            const p: Vec3[] = new Array(f.length);
            for (let i = 0; i < f.length; i++) {
              const t = project(f[i], rise);
              p[i] = t;
              zs += t[2];
              if (t[0] < bx0) bx0 = t[0];
              if (t[0] > bx1) bx1 = t[0];
              if (t[1] < by0) by0 = t[1];
              if (t[1] > by1) by1 = t[1];
              if (t[2] < bz) bz = t[2];
            }
            let A = 0;
            for (let i = 0; i < p.length; i++) {
              const a = p[i];
              const b = p[(i + 1) % p.length];
              A += a[0] * b[1] - b[0] * a[1];
            }
            if (A < 1.4 && A > -1.4) continue; // sub-pixel facet

            const nc = rotN(f.n as Vec3);
            const d = nc[0] * SUN[0] + nc[1] * SUN[1] + nc[2] * SUN[2];
            // hemisphere ambient + ground bounce + sun, occluded near the ground
            const sky = 0.37 + 0.28 * nc[1];
            const bounce = 0.1 * clamp01(-nc[1]);
            const sun = 0.62 * clamp01(d);
            const ao = 0.78 + 0.22 * smooth(((f.ay as number) * rise) / 90);
            const lum = clamp01((sky + bounce + sun) * ao + (s.hv ?? 0) * 0.1);

            const z = zs / f.length;
            const haze = clamp01((z - cam.dist + 250) / 720);
            const fog = clamp01(haze * 0.42 + (1 - dim) * 0.26);

            const lb = lum > 0.999 ? 31 : (lum * 32) | 0;
            const hb = fog > 0.999 ? 15 : (fog * 16) | 0;
            const key = pal.id * 512 + lb * 16 + hb;
            let col = COLCACHE[key];
            if (col === undefined) {
              const q = (lb + 0.5) / 32;
              const g = (hb + 0.5) / 16;
              const tone =
                q < 0.26
                  ? mix3(pal.shade, pal.bounce, q / 0.26)
                  : q < 0.55
                    ? mix3(pal.bounce, pal.mid, (q - 0.26) / 0.29)
                    : q < 0.8
                      ? mix3(pal.mid, pal.light, (q - 0.55) / 0.25)
                      : mix3(pal.light, pal.top, (q - 0.8) / 0.2);
              col = COLCACHE[key] = css(mix3(tone, SKY_LOW, g));
            }
            items.push({ p, z, col });
          }

          for (const l of s.solid.lines) {
            let zs = 0;
            const p: Vec3[] = new Array(l.length);
            for (let i = 0; i < l.length; i++) {
              const t = project(l[i], rise);
              p[i] = t;
              zs += t[2];
            }
            const z = zs / l.length;
            const haze = clamp01((z - cam.dist + 250) / 720);
            items.push({
              p,
              z: z - 10,
              line: 1,
              col: css(mix3(pal.bounce, SKY_LOW, haze * 0.5)),
            });
          }

          if (s.tag && bx1 > bx0) boxes.push({ s, city, bx0, bx1, by0, by1, bz });
          LIFT = 0;
          HS = 1;
          HCX = 0;
          HCZ = 0;
        }
      }

      /** Every face dropped onto the ground, filled as ONE path so
       *  overlapping shadows union instead of stacking up darker. */
      function castShadows(city: City, riseOf: (s: City["structures"][number]) => number) {
        SC = city.scale ?? 1;
        g.beginPath();
        for (const s of city.structures) {
          if (s.far) continue;
          const rise = riseOf(s);
          if (rise < 0.02) continue;
          LIFT = (s.hv ?? 0) * 26;
          HS = 0.86 + 0.14 * (rise > 1.12 ? 1.12 : rise);
          HCX = s.cx ?? 0;
          HCZ = s.cz ?? 0;
          for (const f of s.solid.faces) {
            if ((f.ay as number) < 1) continue;
            const n = f.n as Vec3;
            const d = n[0] * SUN[0] + n[1] * SUN[1] + n[2] * SUN[2];
            if (n[1] < 0.15 && d > 0) continue; // interior to the silhouette
            const q = project(shadowOf(f[0], rise), 1);
            g.moveTo(q[0], q[1]);
            for (let i = 1; i < f.length; i++) {
              const t = project(shadowOf(f[i], rise), 1);
              g.lineTo(t[0], t[1]);
            }
            g.closePath();
          }
          LIFT = 0;
          HS = 1;
          HCX = 0;
          HCZ = 0;
        }
        g.fillStyle = cssa(SHADOW, 0.15);
        g.fill("nonzero");
      }

      function fillQuad(pts: Vec3[], style: string | CanvasGradient) {
        const q = pts.map((v) => project(v, 1));
        g.beginPath();
        g.moveTo(q[0][0], q[0][1]);
        for (let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]);
        g.closePath();
        g.fillStyle = style;
        g.fill();
      }

      function paintBackdrop() {
        const sky = g.createLinearGradient(0, 0, 0, ch * 0.92);
        sky.addColorStop(0, css(SKY_TOP));
        sky.addColorStop(0.62, css(mix3(SKY_TOP, SKY_LOW, 0.72)));
        sky.addColorStop(1, css(SKY_LOW));
        g.fillStyle = sky;
        g.fillRect(0, 0, cw, ch);

        SC = 1;
        LIFT = 0;
        HS = 1;
        HCX = 0;
        HCZ = 0;
        const sp2 = project([SUN[0] * 5200, SUN[1] * 5200, SUN[2] * 5200], 1);
        const R = Math.max(cw, ch) * 0.42;
        const sg = g.createRadialGradient(sp2[0], sp2[1], 0, sp2[0], sp2[1], R);
        sg.addColorStop(0, "rgba(255,255,255,0.85)");
        sg.addColorStop(0.45, "rgba(255,255,255,0.22)");
        sg.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = sg;
        g.fillRect(0, 0, cw, ch);

        const horizonY = cam.cy - cam.f * Math.tan(cam.pitch);
        const gg = g.createLinearGradient(0, horizonY, 0, ch);
        gg.addColorStop(0, css(mix3(GROUND, SKY_LOW, 0.75)));
        gg.addColorStop(1, css(GROUND));
        fillQuad(
          [
            [-2800, 0, -2400],
            [2800, 0, -2400],
            [2800, 0, 1000],
            [-2800, 0, 1000],
          ],
          gg,
        );
      }

      function paintWater(alpha: number) {
        if (alpha < 0.01) return;
        SC = 1;
        LIFT = 0;
        HS = 1;
        HCX = 0;
        HCZ = 0;
        const q: Vec3[] = [
          [-2800, 0, 200],
          [2800, 0, 200],
          [2800, 0, 1000],
          [-2800, 0, 1000],
        ];
        const proj = q.map((v) => project(v, 1));
        const wg = g.createLinearGradient(0, proj[0][1], 0, ch);
        wg.addColorStop(0, cssa(WATER_FAR, alpha * 0.85));
        wg.addColorStop(1, cssa(WATER_NEAR, alpha));
        fillQuad(q, wg);
      }

      /** A soft band of light on the ground, riding the transition front. */
      function paintWaveFront(city: City, front: number, k: number) {
        const fade = Math.sin(clamp01(k) * Math.PI);
        if (fade < 0.02) return;
        SC = city.scale ?? 1;
        LIFT = 0;
        HS = 1;
        HCX = 0;
        HCZ = 0;
        const wx = (city.x0 ?? 0) + ((city.x1 ?? 0) - (city.x0 ?? 0)) * clamp01(front);
        const b = 130;
        const q: Vec3[] = [
          [wx - b, 0, -620],
          [wx + b, 0, -620],
          [wx + b, 0, 640],
          [wx - b, 0, 640],
        ];
        const proj = q.map((v) => project(v, 1));
        const midL = [(proj[0][0] + proj[3][0]) / 2, (proj[0][1] + proj[3][1]) / 2];
        const midR = [(proj[1][0] + proj[2][0]) / 2, (proj[1][1] + proj[2][1]) / 2];
        const band = g.createLinearGradient(midL[0], midL[1], midR[0], midR[1]);
        band.addColorStop(0, "rgba(255,255,255,0)");
        band.addColorStop(0.5, `rgba(255,255,255,${(0.42 * fade).toFixed(3)})`);
        band.addColorStop(1, "rgba(255,255,255,0)");
        fillQuad(q, band);
      }

      function pill(
        x: number,
        y: number,
        label: string,
        value: string | null,
        tone: Vec3,
      ) {
        g.font = '600 11px ui-monospace, "IBM Plex Mono", monospace';
        const w1 = g.measureText(label).width;
        g.font = '500 11px ui-monospace, "IBM Plex Mono", monospace';
        const w2 = value ? g.measureText(value).width : 0;
        const w = w1 + w2 + (value ? 30 : 22);
        const h = 26;
        const px = x - w / 2;
        const py = y - h;
        g.beginPath();
        if (typeof g.roundRect === "function") g.roundRect(px, py, w, h, 13);
        else g.rect(px, py, w, h);
        g.fillStyle = css(tone);
        g.fill();
        g.textBaseline = "middle";
        g.font = '600 11px ui-monospace, "IBM Plex Mono", monospace';
        g.fillStyle = "rgba(255,255,255,0.98)";
        g.fillText(label, px + (value ? 13 : 11), py + h / 2 + 0.5);
        if (value) {
          g.font = '500 11px ui-monospace, "IBM Plex Mono", monospace';
          g.fillStyle = "rgba(255,255,255,0.76)";
          g.fillText(value, px + 13 + w1 + 8, py + h / 2 + 0.5);
        }
        g.beginPath();
        g.moveTo(x, py + h);
        g.lineTo(x, y + 10);
        g.strokeStyle = cssa(tone, 0.5);
        g.lineWidth = 1.5;
        g.stroke();
        g.beginPath();
        g.arc(x, y + 11, 3, 0, Math.PI * 2);
        g.fillStyle = css(tone);
        g.fill();
      }

      function spring(
        s: Record<string, number>,
        key: string,
        k: number,
        d: number,
        dt: number,
      ) {
        const v = key + "V";
        const t = key + "T";
        s[v] += ((s[t] - s[key]) * k - s[v] * d) * dt;
        s[key] += s[v] * dt;
      }

      // ---- frame ----------------------------------------------------------
      function frame(stamp?: number) {
        const now =
          typeof stamp === "number" && isFinite(stamp) ? stamp : clock();
        if (!t0) {
          t0 = now;
          last = now;
        }
        if (!fit()) return;

        const p = propsRef.current;
        const HOLD = Math.max(p.hold ?? 2.6, 0.4);
        const SWEEP = Math.max(p.sweep ?? 1.8, 0.3);
        const CYCLE = HOLD + SWEEP;
        const WAVE = 0.4;
        const still = reduced || p.animate === false;

        const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
        last = now;
        const T = still ? HOLD * 0.5 : Math.max((now - t0) / 1000, 0);
        const n = CITIES.length;
        let loop = (T + tOffset) % (CYCLE * n);
        if (!isFinite(loop) || loop < 0) loop = 0;
        let ci = Math.floor(loop / CYCLE);
        if (!isFinite(ci)) ci = 0;
        ci = ((ci % n) + n) % n;
        const tc = loop % CYCLE;
        const cur = CITIES[ci];
        const nxt = CITIES[(ci + 1) % n];
        if (!cur || !nxt) return;

        const sweeping = tc >= HOLD;
        const k = sweeping ? easeIO((tc - HOLD) / SWEEP) : 0;
        const front = k * (1 + WAVE);
        p.onCity?.(
          k > 0.5 ? nxt : cur,
          sweeping ? "transition" : "model",
          sweeping ? k : tc / HOLD,
          k > 0.5 ? (ci + 1) % n : ci,
        );

        spring(spr as unknown as Record<string, number>, "yaw", 34, 9.5, dt);
        spring(spr as unknown as Record<string, number>, "pit", 30, 9.0, dt);
        spring(spr as unknown as Record<string, number>, "dol", 26, 9.0, dt);
        const drift = sweeping ? Math.sin(k * Math.PI) : 0;
        cam.yaw =
          -0.15 + (still ? 0 : 0.15 * Math.sin(T / 5.0)) + spr.yaw + drift * 0.055;
        cam.pitch =
          0.225 + (still ? 0 : 0.012 * Math.sin(T / 7.3)) + spr.pit - drift * 0.014;
        cam.dist = 1600 + spr.dol - drift * 70;
        cy_ = Math.cos(cam.yaw);
        sy_ = Math.sin(cam.yaw);
        cp_ = Math.cos(cam.pitch);
        sp_ = Math.sin(cam.pitch);

        for (const c of [cur, nxt]) {
          for (const s of c.structures) {
            s.hvT = s === hovered && c === hoveredCity ? 1 : 0;
            s.hvV = (s.hvV ?? 0) + (((s.hvT ?? 0) - (s.hv ?? 0)) * 190 - (s.hvV ?? 0) * 24) * dt;
            s.hv = (s.hv ?? 0) + s.hvV * dt;
            if (s.hv < 0) s.hv = 0;
          }
        }

        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.lineJoin = "round";
        g.lineCap = "round";
        paintBackdrop();
        paintWater(
          sweeping
            ? (1 - k) * (cur.water ? 1 : 0) + k * (nxt.water ? 1 : 0)
            : cur.water
              ? 1
              : 0,
        );

        const riseCur = sweeping
          ? (s: City["structures"][number]) => 1 - smooth((front - (s.u ?? 0)) / WAVE)
          : () => 1;
        const riseNxt = (s: City["structures"][number]) => {
          const v = backOut(clamp01((front - (s.u ?? 0)) / WAVE));
          return v < 0 ? 0 : v;
        };

        castShadows(cur, riseCur);
        if (sweeping) {
          castShadows(nxt, riseNxt);
          paintWaveFront(nxt, front, k);
        }

        items.length = 0;
        boxes.length = 0;
        collect(cur, riseCur);
        if (sweeping) collect(nxt, riseNxt);

        items.sort((a, b) => b.z - a.z);
        for (const it of items) {
          g.beginPath();
          g.moveTo(it.p[0][0], it.p[0][1]);
          for (let i = 1; i < it.p.length; i++) g.lineTo(it.p[i][0], it.p[i][1]);
          if (it.line) {
            g.strokeStyle = it.col;
            g.lineWidth = 1.9;
            g.stroke();
          } else {
            g.closePath();
            g.fillStyle = it.col;
            g.fill();
          }
        }

        // hit test for the next frame — nearest tagged volume under the pointer
        hovered = null;
        hoveredCity = null;
        if (ptr.inside && !sweeping) {
          let best = Infinity;
          for (const b of boxes) {
            if (
              ptr.x < b.bx0 - 6 || ptr.x > b.bx1 + 6 ||
              ptr.y < b.by0 - 6 || ptr.y > b.by1 + 6
            ) continue;
            if (b.bz < best) {
              best = b.bz;
              hovered = b.s;
              hoveredCity = b.city;
            }
          }
        }
        el.style.cursor = hovered ? "pointer" : "";

        let shown:
          | { x: number; y: number; label: string; value: string | null; tone: Vec3; a: number }
          | null = null;
        for (const b of boxes) {
          if (b.s === hovered && (b.s.hv ?? 0) > 0.04) {
            shown = {
              x: (b.bx0 + b.bx1) / 2,
              y: b.by0,
              label: b.s.tag as string,
              value: null,
              tone: POSITIVE,
              a: b.s.hv ?? 0,
            };
          }
        }
        if (!shown && !sweeping && cur.markers.length) {
          const tt = tc / HOLD;
          const a = smooth((tt - 0.1) / 0.18) * (1 - smooth((tt - 0.8) / 0.18));
          if (a > 0.02) {
            SC = cur.scale ?? 1;
            LIFT = 0;
            HS = 1;
            HCX = 0;
            HCZ = 0;
            const m = cur.markers[0];
            const q = project([m.x, m.y, 0], 1);
            shown = {
              x: q[0],
              y: q[1] - 12,
              label: m.t,
              value: m.v,
              a,
              tone:
                m.tone === "positive" ? POSITIVE : m.tone === "risk" ? RISK : PRIMARY,
            };
          }
        }
        if (shown) {
          g.save();
          g.globalAlpha = clamp01(shown.a);
          pill(shown.x, shown.y - 14, shown.label, shown.value, shown.tone);
          g.restore();
        }
      }

      function tick(stamp?: number) {
        try {
          if (visible) frame(stamp);
        } catch (err) {
          if (!warned) {
            warned = true;
            console.warn("CityScene:", (err as Error)?.message);
          }
        }
        raf = requestAnimationFrame(tick);
      }

      // ---- pause when off-screen or in a background tab -----------------
      let io: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? true;
            if (visible) last = clock();
          },
          { threshold: 0 },
        );
        io.observe(el);
      }
      const onVisibility = () => {
        if (!document.hidden) last = clock();
      };
      document.addEventListener("visibilitychange", onVisibility);

      apiRef.current.goTo = (i: number) => {
        const p = propsRef.current;
        const CYCLE = Math.max(p.hold ?? 2.6, 0.4) + Math.max(p.sweep ?? 1.8, 0.3);
        const total = CYCLE * CITIES.length;
        const T = Math.max((clock() - t0) / 1000, 0);
        tOffset = (i * CYCLE + 0.05 - T) % total;
        if (tOffset < 0) tOffset += total;
      };

      raf = requestAnimationFrame(tick);

      return () => {
        cancelAnimationFrame(raf);
        ro?.disconnect();
        io?.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        el.style.cursor = "";
      };
    }, []);

    return (
      <div
        ref={hostRef}
        className={props.className}
        style={props.style}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    );
  },
);

export default CityScene;
