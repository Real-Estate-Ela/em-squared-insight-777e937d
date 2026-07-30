import { useEffect, useRef } from "react";

const DRAW_S = 3.5;
const HOLD_S = 4.0;
const FADE_S = 1.0;
const N_DOTS = 14;
const DOT_SPEED = 0.12;
const BRAND = "#1B4DFF";

function easeIO4(t: number): number {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

type WP = [number, number] | [number, number, true];

function buildPath(wps: WP[]): string {
  const n = wps.length;
  if (n < 2) return "";
  const px = (i: number) => wps[Math.max(0, Math.min(n - 1, i))][0];
  const py = (i: number) => wps[Math.max(0, Math.min(n - 1, i))][1];
  const sp = (i: number) =>
    i >= 0 && i < n && (wps[i] as [number, number, true])[2] === true;
  const rd = (v: number) => Math.round(v * 10) / 10;
  const T = 0.5;

  let d = `M${px(0)},${py(0)}`;
  for (let i = 1; i < n; i++) {
    if (sp(i) || sp(i - 1)) {
      d += `L${px(i)},${py(i)}`;
      continue;
    }
    const x0 = sp(i - 2) ? px(i - 1) : px(i - 2);
    const y0 = sp(i - 2) ? py(i - 1) : py(i - 2);
    const x3 = sp(i + 1) ? px(i) : px(i + 1);
    const y3 = sp(i + 1) ? py(i) : py(i + 1);
    d += `C${rd(px(i - 1) + (T * (px(i) - x0)) / 3)},${rd(py(i - 1) + (T * (py(i) - y0)) / 3)} ${rd(px(i) - (T * (x3 - px(i - 1))) / 3)},${rd(py(i) - (T * (y3 - py(i - 1))) / 3)} ${px(i)},${py(i)}`;
  }
  return d;
}

/* ── City skylines — one continuous analytical path per city ────── */

const CITIES: { name: string; wps: WP[] }[] = [
  {
    name: "İstanbul",
    wps: [
      [0, 360], [60, 357], [110, 350],
      [150, 330], [172, 280], [180, 210, true], [188, 280], [210, 330],
      [260, 352], [320, 356], [370, 348],
      [420, 310], [465, 260], [500, 240], [535, 260], [580, 310],
      [620, 345], [650, 348],
      [680, 310], [694, 240], [700, 202, true], [706, 240], [720, 310],
      [745, 280], [775, 262], [805, 280],
      [825, 275], [855, 258], [885, 275],
      [905, 310], [919, 240], [925, 202, true], [931, 240], [945, 310],
      [985, 348], [1020, 352],
      [1080, 340], [1160, 310], [1230, 298], [1300, 310], [1360, 340],
      [1400, 357],
    ],
  },
  {
    name: "Ankara",
    wps: [
      [0, 360], [80, 357], [160, 352], [230, 345],
      [290, 330], [340, 298],
      [380, 265], [430, 260], [530, 260], [580, 265],
      [620, 298], [670, 340],
      [740, 354], [810, 356], [870, 350],
      [920, 325], [955, 275], [975, 230],
      [985, 215], [992, 208, true], [999, 215],
      [1010, 230], [1030, 275], [1065, 325],
      [1120, 350], [1200, 356], [1300, 358], [1400, 360],
    ],
  },
  {
    name: "İzmir",
    wps: [
      [0, 360], [60, 357], [130, 352],
      [200, 335], [240, 290], [260, 230], [268, 205, true], [276, 230],
      [295, 290], [330, 335],
      [400, 350], [460, 347], [520, 350], [580, 346], [640, 349],
      [710, 345], [790, 328], [870, 305], [950, 285], [1020, 278],
      [1090, 285], [1160, 305], [1240, 328],
      [1320, 350], [1400, 358],
    ],
  },
  {
    name: "Konya",
    wps: [
      [0, 360], [80, 357], [160, 352], [240, 348],
      [310, 335], [370, 305], [430, 260], [480, 225], [490, 218],
      [500, 225], [550, 260], [610, 305], [670, 340],
      [720, 352], [770, 354],
      [830, 330], [858, 265], [866, 210, true], [874, 265], [895, 310],
      [930, 280], [975, 260], [1020, 280],
      [1050, 310], [1068, 265], [1076, 210, true], [1084, 265], [1105, 330],
      [1180, 352], [1280, 357], [1400, 360],
    ],
  },
  {
    name: "Antalya",
    wps: [
      [0, 360], [60, 357], [130, 350],
      [200, 325], [240, 275], [268, 220], [280, 195, true], [292, 220],
      [315, 275], [350, 325],
      [420, 350], [480, 354], [540, 350],
      [600, 338], [640, 312], [670, 300], [700, 312],
      [730, 325], [760, 312], [790, 298], [820, 312],
      [850, 325], [880, 312], [910, 300], [940, 312], [970, 338],
      [1030, 345], [1100, 340], [1160, 343], [1220, 338], [1280, 342],
      [1350, 354], [1400, 358],
    ],
  },
  {
    name: "Bursa",
    wps: [
      [0, 360], [80, 357], [150, 350],
      [230, 330], [320, 290], [420, 252], [520, 290], [610, 330],
      [660, 348], [700, 352],
      [750, 340], [800, 310], [840, 282], [880, 310], [920, 340],
      [970, 348], [1030, 335], [1100, 310], [1180, 280], [1240, 272],
      [1300, 280], [1360, 310], [1400, 340],
    ],
  },
  {
    name: "Adana",
    wps: [
      [0, 360], [50, 357], [100, 352],
      [160, 340], [195, 318], [225, 308], [255, 318],
      [285, 330], [315, 318], [345, 308], [375, 318],
      [405, 330], [435, 318], [465, 308], [495, 318], [525, 340],
      [590, 352], [660, 355], [730, 350],
      [790, 325], [825, 265], [838, 205, true], [851, 265], [880, 310],
      [920, 278], [980, 248], [1040, 278],
      [1075, 310], [1105, 265], [1118, 205, true], [1131, 265], [1165, 325],
      [1240, 350], [1320, 356], [1400, 360],
    ],
  },
  {
    name: "Trabzon",
    wps: [
      [0, 360], [60, 357], [130, 350],
      [200, 335], [260, 305], [310, 268], [350, 235], [380, 220],
      [400, 228], [430, 260], [470, 300],
      [530, 340], [590, 352],
      [650, 345], [710, 325], [760, 298], [800, 285], [840, 298],
      [890, 325], [940, 345],
      [1000, 350], [1060, 340], [1130, 318], [1200, 300], [1260, 308],
      [1320, 330], [1380, 350], [1400, 358],
    ],
  },
];

const PATHS = CITIES.map((c) => buildPath(c.wps));

/* ── Component ───────────────────────────────────────────────────── */

export function CityMorphBackground() {
  const svgRef = useRef<SVGSVGElement>(null);
  const mainRef = useRef<SVGPathElement>(null);
  const a1Ref = useRef<SVGPathElement>(null);
  const a2Ref = useRef<SVGPathElement>(null);
  const curRef = useRef<SVGCircleElement>(null);
  const mglRef = useRef<SVGCircleElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const svg = svgRef.current!;
    const main = mainRef.current!;
    const a1 = a1Ref.current!;
    const a2 = a2Ref.current!;
    const cur = curRef.current!;
    const mgl = mglRef.current!;

    const rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ci = 0;
    let phase = 0;
    let pt = 0;
    let dp = 0;
    let fo = 1;
    let tl = 0;
    let run = true;
    let vis = true;
    let last = 0;
    const dpos = new Float64Array(N_DOTS);
    const dvel = new Float64Array(N_DOTS);

    for (let i = 0; i < N_DOTS; i++) {
      dpos[i] = (i * 0.618) % 1;
      dvel[i] = DOT_SPEED * (0.88 + (i % 5) * 0.06);
    }

    function loadCity(idx: number) {
      const d = PATHS[idx];
      main.setAttribute("d", d);
      a1.setAttribute("d", d);
      a2.setAttribute("d", d);
      tl = main.getTotalLength();
      const s = String(tl);
      main.style.strokeDasharray = s;
      a1.style.strokeDasharray = s;
      a2.style.strokeDasharray = s;
    }

    function setDash(t: number) {
      const o = String(tl * (1 - t));
      main.style.strokeDashoffset = o;
      a1.style.strokeDashoffset = o;
      a2.style.strokeDashoffset = o;
    }

    function setOp(o: number) {
      main.style.opacity = String(o);
      a1.style.opacity = String(o * 0.08);
      a2.style.opacity = String(o * 0.05);
    }

    loadCity(0);
    setDash(0);
    setOp(1);

    if (rmq.matches) {
      setDash(1);
      for (let i = 0; i < N_DOTS; i++) {
        const el = dotRefs.current[i];
        if (!el || !tl) continue;
        const p = main.getPointAtLength(dpos[i] * tl);
        el.setAttribute("cx", String(p.x));
        el.setAttribute("cy", String(p.y));
        el.style.opacity = "0.5";
      }
      return;
    }

    function tick(ts: number) {
      if (!run) return;
      if (!last) {
        last = ts;
        requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min((ts - last) / 1000, 0.1);
      last = ts;
      if (!vis) {
        requestAnimationFrame(tick);
        return;
      }

      pt += dt;

      if (phase === 0) {
        dp = Math.min(1, pt / DRAW_S);
        const ed = easeIO4(dp);
        setDash(ed);
        setOp(1);
        if (tl > 0) {
          const p = main.getPointAtLength(ed * tl);
          cur.setAttribute("cx", String(p.x));
          cur.setAttribute("cy", String(p.y));
          cur.style.opacity =
            dp < 0.96
              ? "0.9"
              : String(0.9 * Math.max(0, 1 - (dp - 0.96) / 0.04));
        }
        if (dp >= 1) {
          phase = 1;
          pt = 0;
          cur.style.opacity = "0";
        }
      } else if (phase === 1) {
        if (pt >= HOLD_S) {
          phase = 2;
          pt = 0;
        }
      } else {
        const fp = Math.min(1, pt / FADE_S);
        fo = 1 - easeIO4(fp);
        setOp(fo);
        if (fp >= 1) {
          ci = (ci + 1) % CITIES.length;
          loadCity(ci);
          dp = 0;
          fo = 1;
          setDash(0);
          setOp(1);
          phase = 0;
          pt = 0;
          for (let i = 0; i < N_DOTS; i++)
            dpos[i] = ((i * 0.618) % 1) * 0.03;
        }
      }

      if (tl > 0) {
        const maxP = phase === 0 ? easeIO4(dp) : 1;
        for (let i = 0; i < N_DOTS; i++) {
          const el = dotRefs.current[i];
          if (!el) continue;
          dpos[i] += dvel[i] * dt;
          if (maxP > 0.03) {
            if (dpos[i] > maxP) dpos[i] = dpos[i] % maxP;
            const p = main.getPointAtLength(dpos[i] * tl);
            el.setAttribute("cx", String(p.x));
            el.setAttribute("cy", String(p.y));
            el.style.opacity = String(
              phase === 2 ? fo * 0.55 : phase === 0 ? 0.4 : 0.6,
            );
          } else {
            el.style.opacity = "0";
          }
        }
      }

      requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(
      ([e]) => {
        vis = e.isIntersecting;
      },
      { threshold: 0.1 },
    );
    io.observe(svg);

    const container = svg.parentElement;
    const onMove = (e: PointerEvent) => {
      const r = svg.getBoundingClientRect();
      mgl.setAttribute("cx", String(((e.clientX - r.left) * 1400) / r.width));
      mgl.setAttribute("cy", String(((e.clientY - r.top) * 400) / r.height));
      mgl.style.opacity = "1";
    };
    const onLeave = () => {
      mgl.style.opacity = "0";
    };
    container?.addEventListener("pointermove", onMove as EventListener);
    container?.addEventListener("pointerleave", onLeave);

    return () => {
      run = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      container?.removeEventListener("pointermove", onMove as EventListener);
      container?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="absolute inset-x-0 bottom-0" style={{ height: "75%" }}>
      <svg
        ref={svgRef}
        className="h-full w-full"
        viewBox="0 0 1400 400"
        preserveAspectRatio="xMidYMax slice"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 35%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 35%)",
        }}
      >
        <defs>
          <filter id="cm-gl" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cm-cg" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="cm-mg" r="0.5">
            <stop offset="0%" stopColor={BRAND} stopOpacity="0.05" />
            <stop offset="100%" stopColor={BRAND} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle ref={mglRef} r="180" fill="url(#cm-mg)" opacity="0" />

        <g transform="translate(0,-5)">
          <path
            ref={a1Ref}
            fill="none"
            stroke={BRAND}
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0"
          />
        </g>
        <g transform="translate(0,7)">
          <path
            ref={a2Ref}
            fill="none"
            stroke={BRAND}
            strokeWidth="0.4"
            strokeLinecap="round"
            opacity="0"
          />
        </g>

        <path
          ref={mainRef}
          fill="none"
          stroke={BRAND}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#cm-gl)"
          opacity="0"
        />

        <circle ref={curRef} r="3.5" fill="#fff" filter="url(#cm-cg)" opacity="0" />

        {Array.from({ length: N_DOTS }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            r={i < 10 ? 2.3 : 1.8}
            fill={i < 10 ? BRAND : i < 12 ? "#00875A" : "#E23D28"}
            opacity="0"
          />
        ))}
      </svg>
    </div>
  );
}
