import { useEffect, useRef } from "react";

const VIEW_W = 1400;
const VIEW_H = 440;

const C_BLUE = "#1B4DFF";
const C_GREEN = "#00875A";
const C_RED = "#E23D28";
const C_GRAPHITE = "#0E1116";

interface CityData {
  name: string;
  paths: string[];
  accents: [number, number, number][];
}

const CITIES: CityData[] = [
  {
    name: "İstanbul",
    paths: [
      "M60,380 L60,260 M60,260 Q200,220 340,260 M340,260 L340,380",
      "M60,275 Q200,240 340,275",
      "M60,290 Q200,260 340,290",
      "M430,380 L430,280 L440,270 L450,250 L460,240 L470,250 L480,270 L490,280 L490,380",
      "M435,280 L485,280 M430,310 L490,310 M430,340 L490,340",
      "M450,240 L460,215 L470,240",
      "M560,380 L560,300 Q600,290 640,250 Q680,210 720,250 Q760,290 800,300 L800,380",
      "M640,250 L640,210 L650,195 L660,210 L660,250",
      "M580,300 L580,340 M780,300 L780,340",
      "M600,290 Q680,230 760,290",
      "M870,380 L870,290 Q920,240 970,210 Q1020,240 1070,290 L1070,380",
      "M850,380 L850,260 L855,230 L860,260 L860,380",
      "M1080,380 L1080,260 L1085,230 L1090,260 L1090,380",
      "M900,290 L900,250 L905,225 L910,250 L910,290",
      "M1030,290 L1030,250 L1035,225 L1040,250 L1040,290",
      "M920,240 Q970,195 1020,240",
      "M1130,380 L1130,300 L1150,300 L1150,280 L1170,280 L1170,260 L1190,260 L1190,300 L1210,300 L1210,320 L1230,320 L1230,380",
      "M1160,280 L1160,245 L1165,230 L1170,245",
    ],
    accents: [[200, 235, -15], [680, 200, 10], [970, 200, -5], [1170, 250, 20]],
  },
  {
    name: "Ankara",
    paths: [
      "M120,380 L120,360 L100,360 L100,340 L80,340 L80,320 L80,270 L400,270 L400,320 L400,340 L380,340 L380,360 L360,360 L360,380",
      "M80,270 L400,270",
      "M110,270 L110,340 M155,270 L155,340 M200,270 L200,340 M245,270 L245,340 M290,270 L290,340 M335,270 L335,340 M380,270 L380,340",
      "M60,380 L60,370 L420,370 L420,380 M50,380 L430,380",
      "M600,380 L600,220 M600,220 L595,210 L590,200 Q600,170 610,200 L605,210 L600,220",
      "M570,230 L630,230 M575,235 L625,235",
      "M580,240 Q600,245 620,240",
      "M595,235 L595,380 M605,235 L605,380",
      "M720,380 L720,290 L800,290 L800,310 L820,310 L820,280 L900,280 L900,310 L920,310 L920,290 L1000,290 L1000,380",
      "M720,290 L1000,290 M720,320 L1000,320 M720,350 L1000,350",
      "M860,280 L860,250 L862,240 L860,250",
      "M1060,380 L1060,320 L1080,310 L1100,280 L1120,270 L1140,280 L1160,310 L1180,320 L1180,380",
      "M1100,280 L1100,260 L1105,250 L1110,260 L1110,280",
    ],
    accents: [[240, 260, 0], [600, 180, -10], [860, 270, 15], [1120, 260, -8]],
  },
  {
    name: "İzmir",
    paths: [
      "M180,380 L180,260 L185,255 L190,230 L195,220 L200,200 L205,195 L210,200 L215,220 L220,230 L225,255 L230,260 L230,380",
      "M185,260 L225,260 M188,280 L222,280 M190,300 L220,300 M188,320 L222,320",
      "M200,200 L200,180 L205,170 L210,180 L210,200",
      "M320,380 L320,310 Q310,290 300,280 Q310,275 320,285 Q330,275 340,280 Q330,290 320,310",
      "M400,380 L400,320 Q390,300 380,290 Q390,285 400,295 Q410,285 420,290 Q410,300 400,320",
      "M60,350 Q200,340 400,350 Q550,360 700,350 Q850,330 1000,340 Q1100,350 1200,355",
      "M60,360 Q200,350 400,360 Q550,370 700,360",
      "M550,380 L550,290 L560,280 L570,260 L580,280 L590,290 L590,380",
      "M555,290 L585,290 M560,310 L580,310",
      "M570,260 L570,240 L573,235 L570,240",
      "M700,380 L700,310 L720,310 L720,290 L780,290 L780,310 L800,310 L800,380",
      "M830,380 L830,300 L850,300 L850,280 L890,280 L890,300 L910,300 L910,380",
      "M980,380 L980,340 L1000,330 L1060,330 L1080,340 L1080,380",
      "M1000,330 L1010,310 L1020,305 L1030,300 L1040,305 L1050,310 L1060,330",
    ],
    accents: [[200, 185, -10], [570, 245, 5], [860, 275, -12], [1030, 295, 8]],
  },
  {
    name: "Konya",
    paths: [
      "M40,370 Q150,365 300,368 Q400,370 500,368",
      "M520,380 L520,300 Q560,290 600,260 Q620,240 640,220 Q660,200 680,220 Q700,240 720,260 Q760,290 800,300 L800,380",
      "M640,220 L640,180 L645,170 L650,160 L655,170 L660,180 L660,220",
      "M560,300 L760,300 M570,320 L750,320 M580,340 L740,340 M590,360 L730,360",
      "M540,300 Q550,290 560,300 M580,300 Q590,290 600,300 M720,300 Q730,290 740,300 M760,300 Q770,290 780,300",
      "M870,380 L870,310 Q900,280 930,260 Q960,280 990,310 L990,380",
      "M855,380 L855,270 L858,250 L861,270 L861,380",
      "M999,380 L999,270 L1002,250 L1005,270 L1005,380",
      "M900,280 Q930,250 960,280",
      "M1040,370 Q1080,350 1120,340 Q1160,330 1200,335 Q1260,340 1300,350 L1350,360",
    ],
    accents: [[660, 170, -8], [930, 250, 12], [1120, 335, -3]],
  },
  {
    name: "Adana",
    paths: [
      "M100,380 L100,340 M100,340 Q140,310 180,340 Q220,310 260,340 Q300,310 340,340 Q380,310 420,340 Q460,310 500,340 L500,380",
      "M100,340 L500,340",
      "M100,350 L500,350",
      "M40,370 Q150,375 300,372 Q450,370 600,373 Q750,375 900,372",
      "M600,380 L600,300 Q660,270 720,240 Q760,220 800,200 Q840,220 880,240 Q940,270 1000,300 L1000,380",
      "M720,240 Q800,185 880,240",
      "M800,200 L800,170 L805,155 L810,170 L810,200",
      "M590,380 L590,260 L594,235 L598,260 L598,380",
      "M1002,380 L1002,260 L1006,235 L1010,260 L1010,380",
      "M640,300 L640,260 L643,245 L646,260 L646,300",
      "M954,300 L954,260 L957,245 L960,260 L960,300",
      "M1060,380 L1060,320 L1080,320 L1080,290 L1100,290 L1100,310 L1120,310 L1120,280 L1140,280 L1140,320 L1160,320 L1160,380",
    ],
    accents: [[300, 310, 5], [800, 165, -10], [1100, 275, 18]],
  },
  {
    name: "Eskişehir",
    paths: [
      "M40,365 Q200,358 400,362 Q600,368 800,360 Q1000,355 1200,362",
      "M200,380 L200,300 L210,290 L215,260 L220,240 L225,220 L230,240 L235,260 L240,290 L250,300 L250,380",
      "M280,380 L280,310 L285,300 L290,270 L295,250 L300,270 L305,300 L310,310 L310,380",
      "M340,380 L340,290 L345,280 L350,250 L355,230 L360,210 L365,230 L370,250 L375,280 L380,290 L380,380",
      "M410,380 L410,300 L415,290 L420,265 L425,250 L430,265 L435,290 L440,300 L440,380",
      "M250,310 L280,310 M310,300 L340,300 M380,300 L410,310",
      "M200,340 L440,340",
      "M220,280 Q225,275 230,280 M345,270 Q350,265 355,270 M290,290 Q295,285 300,290 M420,285 Q425,280 430,285",
      "M560,380 L560,310 L580,310 L580,290 L600,290 L600,310 L620,310 L620,290 L640,290 L640,310 L660,310 L660,380",
      "M580,290 L578,280 L590,270 L602,280 L600,290",
      "M620,290 L618,280 L630,270 L642,280 L640,290",
      "M760,380 L760,330 L790,330 L790,300 L820,300 L820,310 L850,310 L850,280 L880,280 L880,330 L910,330 L910,380",
    ],
    accents: [[225, 225, -12], [360, 215, 8], [630, 270, -5], [850, 275, 15]],
  },
  {
    name: "Denizli",
    paths: [
      "M200,200 Q350,200 500,205 M180,200 L180,220",
      "M160,230 Q350,225 540,230 M140,230 L140,250",
      "M120,260 Q370,252 600,260 M100,260 L100,285",
      "M80,290 Q380,280 660,290 M60,290 L60,320",
      "M50,325 Q380,312 720,325 M40,325 L40,355",
      "M30,360 Q400,345 780,360",
      "M350,205 Q355,215 360,230 Q365,245 360,260 Q355,275 360,290 Q365,310 360,325 Q355,345 360,360",
      "M450,205 Q455,218 450,230 Q445,245 450,260 Q455,278 450,290 Q445,312 450,325 Q455,345 450,360",
      "M850,380 L850,310 L870,310 L870,290 L890,290 L890,310 L910,310 L910,380",
      "M870,290 L870,270 L880,260 L890,270 L890,290",
      "M940,380 L940,300 L945,290 L950,300 L950,380 M970,380 L970,310 L975,300 L980,310 L980,380 M1000,380 L1000,300 L1005,290 L1010,300 L1010,380",
      "M1060,380 Q1100,340 1140,320 Q1200,300 1260,310 Q1300,320 1340,340 L1380,360",
    ],
    accents: [[350, 240, 85], [450, 270, 85], [880, 265, -10], [1200, 305, 5]],
  },
  {
    name: "Mersin",
    paths: [
      "M30,365 Q200,355 400,360 Q600,365 800,358 Q1000,352 1200,358 Q1300,362 1380,365",
      "M180,380 L180,280 M180,300 L160,310 M180,300 L200,310",
      "M230,380 L230,290 M230,310 L210,320 M230,310 L250,320",
      "M280,380 L280,270 M280,290 L260,300 M280,290 L300,300",
      "M330,380 L330,285 M330,305 L310,315 M330,305 L350,315",
      "M380,380 L380,275 M380,295 L360,305 M380,295 L400,305",
      "M160,370 Q180,360 200,370 M210,370 Q230,360 250,370 M260,370 Q280,360 300,370 M310,370 Q330,360 350,370 M360,370 Q380,360 400,370",
      "M520,380 L520,260 L560,260 L560,380 M520,260 L480,300 M560,260 L600,300",
      "M640,380 L640,270 L680,270 L680,380 M640,270 L600,310 M680,270 L720,310",
      "M850,375 L850,320 L860,310 L870,295 L880,290 L890,295 L900,310 L910,320 L910,375",
      "M855,320 L905,320 M860,340 L900,340",
      "M880,290 L880,270 L883,260 L886,270 L886,290",
      "M1000,380 L1000,310 L1020,310 L1020,290 L1040,290 L1040,270 L1060,270 L1060,290 L1080,290 L1080,300 L1100,300 L1100,320 L1120,320 L1120,380",
    ],
    accents: [[280, 270, -15], [540, 255, 10], [880, 265, -8], [1060, 268, 12]],
  },
  {
    name: "Hatay",
    paths: [
      "M100,380 Q120,350 160,320 Q200,290 260,270 Q320,260 380,265 Q440,270 480,290 Q520,320 560,350 L580,380",
      "M220,310 L220,280 Q260,260 300,270 L300,310",
      "M240,280 Q260,268 280,276",
      "M260,270 L260,255 L265,248 L270,255 L270,270",
      "M245,310 Q260,295 275,310",
      "M620,380 L620,320 L640,310 L660,320 L660,380 M680,380 L680,310 L700,300 L720,310 L720,380 M740,380 L740,315 L760,305 L780,315 L780,380",
      "M840,380 L840,300 Q870,270 900,250 Q930,270 960,300 L960,380",
      "M820,380 L820,270 L824,250 L828,270 L828,380",
      "M900,250 L900,230 L905,220 L910,230 L910,250",
      "M1000,380 Q1040,350 1080,330 Q1140,310 1200,300 Q1260,310 1300,330 Q1340,350 1380,370",
    ],
    accents: [[260, 252, -8], [700, 298, 5], [900, 225, -12], [1200, 298, 8]],
  },
  {
    name: "Balıkesir",
    paths: [
      "M30,370 Q100,360 200,355 Q350,348 500,355 Q650,362 800,358 Q950,352 1100,358",
      "M300,380 L300,260 L305,255 L310,240 L315,230 L320,210 L325,200 L330,210 L335,230 L340,240 L345,255 L350,260 L350,380",
      "M305,260 L345,260 M308,280 L342,280 M310,300 L340,300 M308,320 L342,320 M310,340 L340,340",
      "M320,200 L320,185 L325,175 L330,185 L330,200",
      "M550,380 L550,320 L560,310 L580,310 L580,320 L600,320 L600,300 L610,290 L630,290 L630,300 L650,300 L650,320 L670,320 L670,380",
      "M610,290 L610,275 L620,268 L630,275 L630,290",
      "M720,380 L720,310 Q740,290 760,270 Q780,290 800,310 L800,380",
      "M760,270 L760,250 L765,240 L770,250 L770,270",
      "M900,380 L900,350 Q890,340 885,330 Q890,322 900,325 Q910,322 915,330 Q910,340 900,350",
      "M960,380 L960,345 Q950,335 945,325 Q950,318 960,320 Q970,318 975,325 Q970,335 960,345",
      "M1020,380 L1020,348 Q1010,338 1005,328 Q1010,320 1020,323 Q1030,320 1035,328 Q1030,338 1020,348",
    ],
    accents: [[325, 185, -10], [620, 272, 8], [760, 245, -5]],
  },
  {
    name: "Sakarya",
    paths: [
      "M30,360 Q200,350 400,348 Q600,345 800,350 Q1000,355 1200,352",
      "M250,380 L250,290 M250,290 Q400,260 550,290 M550,290 L550,380",
      "M250,300 Q400,275 550,300",
      "M250,310 Q400,290 550,310",
      "M250,320 Q400,305 550,320",
      "M300,295 L300,340 M350,280 L350,340 M400,273 L400,340 M450,280 L450,340 M500,295 L500,340",
      "M230,340 L570,340",
      "M620,380 Q640,360 660,350 Q680,340 700,342 Q720,345 740,350 Q760,358 780,365 L780,380",
      "M800,380 Q830,350 860,340 Q900,330 940,335 Q970,340 1000,355 L1000,380",
      "M1020,380 Q1060,340 1100,310 Q1140,290 1180,300 Q1220,310 1260,330 Q1300,350 1340,365 L1380,380",
      "M1070,340 L1070,330 Q1075,325 1080,330 L1080,340 M1120,315 L1120,305 Q1125,300 1130,305 L1130,315 M1170,305 L1170,295 Q1175,290 1180,295 L1180,305",
    ],
    accents: [[400, 268, -8], [700, 340, 5], [1140, 295, -12]],
  },
  {
    name: "Manisa",
    paths: [
      "M60,380 Q120,340 200,300 Q300,260 400,240 Q500,230 600,235 Q700,245 800,280 Q900,320 1000,350 L1050,370",
      "M200,300 Q300,275 400,260",
      "M500,232 Q520,228 540,232",
      "M400,380 L400,310 Q440,280 480,260 Q520,280 560,310 L560,380",
      "M440,280 Q480,250 520,280",
      "M480,260 L480,240 L483,230 L486,240 L486,260",
      "M385,380 L385,280 L388,260 L391,280 L391,380",
      "M569,380 L569,280 L572,260 L575,280 L575,380",
      "M650,380 L650,320 L670,310 L690,320 L690,380 M710,380 L710,310 L730,300 L750,310 L750,380",
      "M780,380 L780,330 L800,330 L800,310 L830,310 L830,330 L850,330 L850,380",
      "M1080,380 Q1100,350 1120,330 Q1150,310 1180,315 Q1200,320 1220,340 L1240,370 L1250,380",
      "M1150,315 L1155,300 Q1160,295 1165,300 L1170,315",
    ],
    accents: [[480, 235, -10], [730, 298, 8], [1150, 300, -5]],
  },
];

// --- Animation timing ---
const DRAW_TIME = 2.6;
const HOLD_TIME = 3.8;
const TRANSITION_TIME = 3.4;
const STAGGER_RANGE = 0.55;

const NUM_ARROWS = 8;
const ARROW_TRAVERSE_TIME = 3.5;

const MAX_PATHS = Math.max(...CITIES.map((c) => c.paths.length));

function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function CityMorphBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const glowEls = useRef<(SVGPathElement | null)[]>([]);
  const arrowEls = useRef<(SVGGElement | null)[]>([]);
  const labelEl = useRef<SVGTextElement | null>(null);
  const mouseGlowEl = useRef<SVGCircleElement | null>(null);
  const mouse = useRef({ x: -9999, y: -9999, active: false });
  const visible = useRef(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(el);

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        mouse.current.x = ((e.clientX - r.left) / r.width) * VIEW_W;
        mouse.current.y = ((e.clientY - r.top) / r.height) * VIEW_H;
        mouse.current.active = true;
      } else {
        mouse.current.active = false;
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let raf: number;
    let prevTime = 0;

    // Phase: 0 = initial draw, 1 = holding, 2 = transition (wave retract/draw)
    let phase = 0;
    let phaseTime = 0;
    let cityIdx = 0;
    const pathLengths: number[] = new Array(MAX_PATHS).fill(0);
    const pathSwitched: boolean[] = new Array(MAX_PATHS).fill(false);
    const arrowProgress: number[] = [];
    const arrowPathAssignment: number[] = [];

    for (let i = 0; i < NUM_ARROWS; i++) {
      arrowProgress.push(i / NUM_ARROWS);
      arrowPathAssignment.push(0);
    }

    function loadCityPaths(idx: number) {
      const city = CITIES[idx];
      for (let i = 0; i < MAX_PATHS; i++) {
        const pel = pathEls.current[i];
        const gel = glowEls.current[i];
        if (!pel) continue;

        if (i < city.paths.length) {
          pel.setAttribute("d", city.paths[i]);
          if (gel) gel.setAttribute("d", city.paths[i]);
          const len = pel.getTotalLength();
          pathLengths[i] = len;
          pel.setAttribute("stroke-dasharray", `${len}`);
          pel.setAttribute("stroke-dashoffset", `${len}`);
          pel.setAttribute("stroke", C_BLUE);
          pel.setAttribute("opacity", "0");
          if (gel) {
            gel.setAttribute("stroke-dasharray", `${len}`);
            gel.setAttribute("stroke-dashoffset", `${len}`);
            gel.setAttribute("stroke", C_BLUE);
            gel.setAttribute("opacity", "0");
          }
        } else {
          pel.setAttribute("d", "");
          pel.setAttribute("opacity", "0");
          if (gel) {
            gel.setAttribute("d", "");
            gel.setAttribute("opacity", "0");
          }
          pathLengths[i] = 0;
        }
      }

      const validPaths: number[] = [];
      for (let i = 0; i < city.paths.length; i++) validPaths.push(i);
      for (let i = 0; i < NUM_ARROWS; i++) {
        arrowPathAssignment[i] =
          validPaths[Math.floor((i / NUM_ARROWS) * validPaths.length)];
      }
    }

    function switchSinglePath(pathIdx: number, newCityIdx: number) {
      const city = CITIES[newCityIdx];
      const pel = pathEls.current[pathIdx];
      const gel = glowEls.current[pathIdx];
      if (!pel) return;

      if (pathIdx < city.paths.length) {
        pel.setAttribute("d", city.paths[pathIdx]);
        if (gel) gel.setAttribute("d", city.paths[pathIdx]);
        const len = pel.getTotalLength();
        pathLengths[pathIdx] = len;
        pel.setAttribute("stroke-dasharray", `${len}`);
        pel.setAttribute("stroke-dashoffset", `${len}`);
        if (gel) {
          gel.setAttribute("stroke-dasharray", `${len}`);
          gel.setAttribute("stroke-dashoffset", `${len}`);
        }
      } else {
        pel.setAttribute("d", "");
        pel.setAttribute("opacity", "0");
        if (gel) {
          gel.setAttribute("d", "");
          gel.setAttribute("opacity", "0");
        }
        pathLengths[pathIdx] = 0;
      }
    }

    function setPathVisibility(
      pathIdx: number,
      drawFraction: number,
      opacity: number,
    ) {
      const pel = pathEls.current[pathIdx];
      const gel = glowEls.current[pathIdx];
      if (!pel || pathLengths[pathIdx] === 0) return;

      const len = pathLengths[pathIdx];
      const offset = len * (1 - drawFraction);

      pel.setAttribute("stroke-dashoffset", `${offset}`);
      pel.setAttribute("opacity", `${opacity}`);

      if (gel) {
        gel.setAttribute("stroke-dashoffset", `${offset}`);
        gel.setAttribute("opacity", `${Math.min(opacity * 0.4, 0.18)}`);
      }
    }

    function staggeredT(
      globalProgress: number,
      pathIdx: number,
      total: number,
    ): number {
      const stagger = (pathIdx / Math.max(total - 1, 1)) * STAGGER_RANGE;
      const available = 1 - STAGGER_RANGE;
      const local = (globalProgress - stagger) / available;
      return Math.max(0, Math.min(1, local));
    }

    function updateArrows(dt: number) {
      for (let ai = 0; ai < NUM_ARROWS; ai++) {
        const gel = arrowEls.current[ai];
        if (!gel) continue;

        const pi = arrowPathAssignment[ai];
        const pel = pathEls.current[pi];
        if (!pel || pathLengths[pi] === 0) {
          gel.setAttribute("opacity", "0");
          continue;
        }

        arrowProgress[ai] =
          (arrowProgress[ai] + dt / ARROW_TRAVERSE_TIME) % 1;
        const len = pathLengths[pi];
        const pos = arrowProgress[ai] * len;

        const currentOpacity = parseFloat(
          pel.getAttribute("opacity") || "0",
        );
        const currentOffset = parseFloat(
          pel.getAttribute("stroke-dashoffset") || `${len}`,
        );
        const visibleLen = len - currentOffset;
        const arrowVisible =
          pos <= visibleLen && currentOpacity > 0.05;

        if (!arrowVisible) {
          gel.setAttribute("opacity", "0");
          continue;
        }

        try {
          const pt = pel.getPointAtLength(pos);
          const pt2 = pel.getPointAtLength(Math.min(pos + 3, len));
          const angle =
            (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;

          gel.setAttribute(
            "transform",
            `translate(${pt.x.toFixed(1)},${pt.y.toFixed(1)}) rotate(${angle.toFixed(1)})`,
          );

          const color =
            ai % 4 === 0 ? C_GREEN : ai % 4 === 2 ? C_RED : C_BLUE;
          const arrowLine = gel.querySelector("line");
          const arrowHead = gel.querySelector("polygon");
          if (arrowLine) arrowLine.setAttribute("stroke", color);
          if (arrowHead) {
            arrowHead.setAttribute("fill", color);
            arrowHead.setAttribute("stroke", color);
          }

          gel.setAttribute("opacity", "0.4");
        } catch {
          gel.setAttribute("opacity", "0");
        }
      }
    }

    loadCityPaths(0);

    function tick(now: number) {
      if (!visible.current) {
        prevTime = 0;
        raf = requestAnimationFrame(tick);
        return;
      }

      const dt = prevTime
        ? Math.min((now - prevTime) / 1000, 0.05)
        : 0.016;
      prevTime = now;

      if (reducedMotion) {
        const city = CITIES[cityIdx];
        for (let i = 0; i < MAX_PATHS; i++) {
          if (i < city.paths.length) {
            setPathVisibility(i, 1, 0.45);
          }
        }
        if (labelEl.current) {
          labelEl.current.textContent =
            CITIES[cityIdx].name.toLocaleUpperCase("tr-TR");
          labelEl.current.setAttribute("opacity", "0.08");
        }
        raf = requestAnimationFrame(tick);
        return;
      }

      phaseTime += dt;

      const city = CITIES[cityIdx];
      const pathCount = city.paths.length;

      if (phase === 0) {
        // Initial draw
        const progress = Math.min(phaseTime / DRAW_TIME, 1);

        for (let i = 0; i < MAX_PATHS; i++) {
          if (i >= pathCount) continue;
          const raw = staggeredT(progress, i, pathCount);
          const eased = easeInOutQuart(raw);
          setPathVisibility(i, eased, 0.45 * eased);
        }

        updateArrows(dt);

        if (progress >= 1) {
          phase = 1;
          phaseTime = 0;
        }
      } else if (phase === 1) {
        // Holding — all visible, arrows flow
        for (let i = 0; i < pathCount; i++) {
          setPathVisibility(i, 1, 0.45);
        }

        updateArrows(dt);

        if (phaseTime >= HOLD_TIME) {
          phase = 2;
          phaseTime = 0;
          pathSwitched.fill(false);
        }
      } else if (phase === 2) {
        // Wave transition: retract old → draw new per path
        const progress = Math.min(phaseTime / TRANSITION_TIME, 1);
        const nextCityIdx = (cityIdx + 1) % CITIES.length;
        const nextPathCount = CITIES[nextCityIdx].paths.length;
        const maxCount = Math.max(pathCount, nextPathCount);

        for (let i = 0; i < MAX_PATHS; i++) {
          if (i >= maxCount) {
            setPathVisibility(i, 0, 0);
            continue;
          }

          const raw = staggeredT(progress, i, maxCount);

          if (raw <= 0) {
            // Not started — still old city, fully visible
            if (i < pathCount) {
              setPathVisibility(i, 1, 0.45);
            }
          } else if (raw < 0.5) {
            // Retracting old city path
            const retractT = raw * 2;
            const eased = easeInOutQuart(retractT);
            if (i < pathCount) {
              setPathVisibility(i, 1 - eased, 0.45 * (1 - eased));
            } else {
              setPathVisibility(i, 0, 0);
            }
          } else {
            // Switch to new city if not done
            if (!pathSwitched[i]) {
              switchSinglePath(i, nextCityIdx);
              pathSwitched[i] = true;
            }

            // Drawing new city path
            const drawT = (raw - 0.5) * 2;
            const eased = easeInOutQuart(drawT);
            if (i < nextPathCount) {
              setPathVisibility(i, eased, 0.45 * eased);
            } else {
              setPathVisibility(i, 0, 0);
            }
          }
        }

        updateArrows(dt);

        if (progress >= 1) {
          cityIdx = nextCityIdx;
          // Reassign arrows for new city
          const validPaths: number[] = [];
          for (let j = 0; j < CITIES[cityIdx].paths.length; j++)
            validPaths.push(j);
          for (let j = 0; j < NUM_ARROWS; j++) {
            arrowPathAssignment[j] =
              validPaths[
                Math.floor((j / NUM_ARROWS) * validPaths.length)
              ];
          }

          phase = 1;
          phaseTime = 0;
        }
      }

      // City name label
      if (labelEl.current) {
        let labelOpacity = 0.08;
        if (phase === 0) {
          labelOpacity =
            0.08 * easeOutCubic(Math.min(phaseTime / DRAW_TIME, 1));
        } else if (phase === 2) {
          const p = Math.min(phaseTime / TRANSITION_TIME, 1);
          if (p < 0.45) {
            labelOpacity = 0.08 * (1 - easeInOutQuart(p / 0.45));
          } else if (p < 0.55) {
            labelOpacity = 0;
          } else {
            labelOpacity =
              0.08 * easeInOutQuart((p - 0.55) / 0.45);
          }
        }

        const displayCityIdx =
          phase === 2 &&
          phaseTime / TRANSITION_TIME > 0.5
            ? (cityIdx + 1) % CITIES.length
            : cityIdx;
        labelEl.current.textContent =
          CITIES[displayCityIdx].name.toLocaleUpperCase("tr-TR");
        labelEl.current.setAttribute(
          "opacity",
          `${labelOpacity.toFixed(4)}`,
        );
      }

      // Mouse glow
      if (mouseGlowEl.current) {
        if (mouse.current.active) {
          mouseGlowEl.current.setAttribute(
            "cx",
            `${mouse.current.x.toFixed(0)}`,
          );
          mouseGlowEl.current.setAttribute(
            "cy",
            `${mouse.current.y.toFixed(0)}`,
          );
          mouseGlowEl.current.setAttribute("opacity", "1");
        } else {
          mouseGlowEl.current.setAttribute("opacity", "0");
        }
      }

      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
      style={{
        height: "75%",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 92%, transparent 100%)",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 12%, black 92%, transparent 100%)",
      }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 150 ${VIEW_W} 290`}
        preserveAspectRatio="xMidYMax meet"
        className="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <filter
            id="em-glow"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter
            id="em-glow-soft"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="em-mouse-glow">
            <stop offset="0%" stopColor={C_BLUE} stopOpacity="0.06" />
            <stop offset="60%" stopColor={C_BLUE} stopOpacity="0.02" />
            <stop offset="100%" stopColor={C_BLUE} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Analytical grid */}
        {[0.35, 0.5, 0.65, 0.8, 0.92].map((g) => (
          <line
            key={`h${g}`}
            x1={0}
            y1={VIEW_H * g}
            x2={VIEW_W}
            y2={VIEW_H * g}
            stroke={C_BLUE}
            strokeWidth="0.5"
            opacity={0.05}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={VIEW_W * ((i + 1) / 13)}
            y1={VIEW_H * 0.3}
            x2={VIEW_W * ((i + 1) / 13)}
            y2={VIEW_H}
            stroke={C_BLUE}
            strokeWidth="0.5"
            opacity={0.03}
          />
        ))}

        {/* Glow layer */}
        {Array.from({ length: MAX_PATHS }, (_, i) => (
          <path
            key={`glow${i}`}
            ref={(r) => {
              glowEls.current[i] = r;
            }}
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#em-glow-soft)"
            opacity={0}
          />
        ))}

        {/* Main landmark paths */}
        {Array.from({ length: MAX_PATHS }, (_, i) => (
          <path
            key={`path${i}`}
            ref={(r) => {
              pathEls.current[i] = r;
            }}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#em-glow)"
            opacity={0}
          />
        ))}

        {/* Flowing analytical arrows */}
        {Array.from({ length: NUM_ARROWS }, (_, i) => (
          <g
            key={`arrow${i}`}
            ref={(r) => {
              arrowEls.current[i] = r;
            }}
            opacity={0}
          >
            <line
              x1={-10}
              y1={0}
              x2={10}
              y2={0}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <polygon
              points="10,0 5,-3 5,3"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Mouse interaction glow */}
        <circle
          ref={(r) => {
            mouseGlowEl.current = r;
          }}
          r={120}
          fill="url(#em-mouse-glow)"
          opacity={0}
        />

        {/* City name watermark */}
        <text
          ref={(r) => {
            labelEl.current = r;
          }}
          x={VIEW_W / 2}
          y={410}
          textAnchor="middle"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.3em",
          }}
          fill={C_GRAPHITE}
          opacity={0}
        />
      </svg>
    </div>
  );
}
