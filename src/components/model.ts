// ============================================================
// emlakmetric — 3D city model
// 30 parametric volume generators + 20 city compositions
// covering all seven regions of Türkiye.
//
// Pure data and geometry: no DOM, no canvas, no React.
// The renderer (CityScene.tsx) owns colour, light and motion.
// ============================================================

/**
 * A point or vector in model space: [x, y, z].
 * Deliberately `number[]` and not a tuple — the generators build thousands of
 * these as array literals, and tuple assertions at every site would add far
 * more noise than they would catch.
 */
export type Vec3 = number[];
export type Face = Vec3[] & { n?: Vec3; ay?: number };
export type TowerCap = "flat" | "tapered" | "pyramid" | "slant";

export interface Solid {
  faces: Face[];
  lines: Vec3[][];
}

export interface MosqueOpts {
  depth?: number;
  domeR?: number;
  domeH?: number;
  drum?: number;
  n?: number;
  halfDomes?: boolean;
  halfR?: number;
  minarets?: number;
  minaretH?: number;
  minaretSpread?: number;
  minaretZ?: number;
  balconies?: number;
}

export interface DomeGridOpts {
  minaretH?: number;
}

export interface Structure {
  x: number;
  solid: Solid;
  tag?: string | null;
  /** Painted in the accent colour. */
  accent?: number;
  /** Painted as planting. */
  foliage?: number;
  /** Background terrain: dimmer, hazier, no cast shadow. */
  far?: number;
  // filled in by the renderer on first run
  u?: number; top?: number; cx?: number; cz?: number;
  hv?: number; hvV?: number; hvT?: number;
}

export interface Marker {
  x: number;
  y: number;
  t: string;
  v: string;
  tone: "primary" | "positive" | "risk";
}

export interface City {
  name: string;
  region: string;
  /** Uniform scale so low-rise cities still fill the frame. */
  scale?: number;
  water: boolean;
  structures: Structure[];
  markers: Marker[];
  // filled in by the renderer on first run
  x0?: number; x1?: number;
}


export function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const S = (faces: Face[], lines: Vec3[][] = []): Solid => ({ faces, lines });

/** Merge several solids into one. */
export function merge(...solids: (Solid | null | undefined)[]): Solid {
  const faces = [], lines = [];
  for (const s of solids) { if (!s) continue; faces.push(...s.faces); lines.push(...s.lines); }
  return S(faces, lines);
}

// --- BOX --------------------------------------------------------
export function box(x: number, z: number, w: number, d: number, h: number, y0: number = 0): Solid {
  const a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2, y1 = y0 + h;
  return S([
    [[a, y1, c], [b, y1, c], [b, y1, e], [a, y1, e]],
    [[a, y0, e], [b, y0, e], [b, y1, e], [a, y1, e]],
    [[b, y0, e], [b, y0, c], [b, y1, c], [b, y1, e]],
    [[b, y0, c], [a, y0, c], [a, y1, c], [b, y1, c]],
    [[a, y0, c], [a, y0, e], [a, y1, e], [a, y1, c]],
  ]);
}

// --- PRISM (n-gon cylinder) ------------------------------------
export function prism(x: number, z: number, r: number, h: number, n: number = 14, y0: number = 0, rot: number = 0, r2: number | null = null): Solid {
  const rt = r2 === null ? r : r2;
  const ring = (rr: number, y: number) => Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n;
    return [x + rr * Math.cos(a), y, z + rr * Math.sin(a)];
  });
  const lo = ring(r, y0), hi = ring(rt, y0 + h);
  const faces = [hi];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    faces.push([lo[i], lo[j], hi[j], hi[i]]);
  }
  return S(faces);
}

// --- CONE -------------------------------------------------------
export function cone(x: number, z: number, r: number, h: number, n: number = 14, y0: number = 0, rot: number = 0): Solid {
  const apex = [x, y0 + h, z];
  const lo = Array.from({ length: n }, (_, i) => {
    const a = rot + (i * 2 * Math.PI) / n;
    return [x + r * Math.cos(a), y0, z + r * Math.sin(a)];
  });
  const faces = [];
  for (let i = 0; i < n; i++) faces.push([lo[i], lo[(i + 1) % n], apex]);
  return S(faces);
}

// --- DOME (Ottoman profile: full shoulders, flatter crown) ------
export function dome(x: number, z: number, r: number, h: number, n: number = 18, bands: number = 4, y0: number = 0, pow: number = 0.82): Solid {
  const ringAt = (u: number) => {
    const a = (u * Math.PI) / 2;
    const rr = r * Math.cos(a), yy = y0 + h * Math.pow(Math.sin(a), pow);
    return Array.from({ length: n }, (_, i) => {
      const t = (i * 2 * Math.PI) / n;
      return [x + rr * Math.cos(t), yy, z + rr * Math.sin(t)];
    });
  };
  const rings = [];
  for (let b = 0; b <= bands; b++) rings.push(ringAt(b / bands));
  const faces = [];
  for (let b = 0; b < bands - 1; b++) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      faces.push([rings[b][i], rings[b][j], rings[b + 1][j], rings[b + 1][i]]);
    }
  }
  const apex = [x, y0 + h, z], last = rings[bands - 1];
  for (let i = 0; i < n; i++) faces.push([last[i], last[(i + 1) % n], apex]);
  return S(faces);
}

// --- PITCHED ROOF HOUSE (Odunpazarı / Kaleiçi / Muğla) ----------
export function house(x: number, z: number, w: number, d: number, h: number, roofH: number, y0: number = 0, eave: number = 0.12): Solid {
  const body = box(x, z, w, d, h, y0);
  const ov = 1 + eave;
  const a = x - (w * ov) / 2, b = x + (w * ov) / 2;
  const c = z - (d * ov) / 2, e = z + (d * ov) / 2;
  const yb = y0 + h, yt = yb + roofH;
  const roof = S([
    [[a, yb, c], [b, yb, c], [b, yt, z], [a, yt, z]],
    [[a, yb, e], [a, yt, z], [b, yt, z], [b, yb, e]],
    [[a, yb, c], [a, yt, z], [a, yb, e]],
    [[b, yb, c], [b, yb, e], [b, yt, z]],
  ]);
  return merge(body, roof);
}

// --- MINARET ----------------------------------------------------
export function minaret(x: number, z: number, h: number, sides: number = 8): Solid {
  const r = h * 0.026;
  const m = merge(
    prism(x, z, r * 2.2, h * 0.11, sides),
    prism(x, z, r, h * 0.47, sides, h * 0.11),
    prism(x, z, r * 2.0, h * 0.05, sides, h * 0.58),
    prism(x, z, r * 0.85, h * 0.17, sides, h * 0.63),
    cone(x, z, r * 1.05, h * 0.18, sides, h * 0.80),
  );
  return m;
}

// --- MOSQUE (body, drum, dome, half-domes, minarets) -----------
export function mosque(x: number, z: number, w: number, d: number, h: number, o: MosqueOpts = {}): Solid {
  const domeR = w * (o.domeR ?? 0.30);
  const domeH = h * (o.domeH ?? 0.62);
  const bodyH = h;
  const parts = [box(x, z, w, d, bodyH)];

  if (o.halfDomes !== false) {
    const hr = domeR * (o.halfR ?? 0.72);
    for (const s of [-1, 1]) {
      parts.push(dome(x + s * (domeR + hr * 0.42), z, hr, domeH * 0.60, 14, 3, bodyH * 0.96));
    }
  }
  parts.push(box(x, z, domeR * 1.72, d * 0.62, h * (o.drum ?? 0.16), bodyH));
  parts.push(dome(x, z, domeR, domeH, o.n ?? 20, 4, bodyH + h * (o.drum ?? 0.16)));

  const mh = o.minaretH ?? h * 1.9;
  const sp = o.minaretSpread ?? w * 0.52;
  const zs = o.minaretZ ?? d * 0.40;
  const count = o.minarets ?? 2;
  if (count >= 2) { parts.push(minaret(x - sp, z + zs, mh), minaret(x + sp, z + zs, mh)); }
  if (count >= 4) { parts.push(minaret(x - sp, z - zs, mh * 0.94), minaret(x + sp, z - zs, mh * 0.94)); }
  if (count >= 6) { parts.push(minaret(x - sp * 0.42, z + zs * 0.4, mh * 0.8), minaret(x + sp * 0.42, z + zs * 0.4, mh * 0.8)); }
  return merge(...parts);
}

// --- TOWER (modern high-rise, several crowns) -------------------
export function tower(x: number, z: number, w: number, d: number, h: number, cap: TowerCap = "flat", bands: boolean = false): Solid {
  const parts = [box(x, z, w * 1.5, d * 1.5, h * 0.045)];
  if (cap === "tapered") {
    parts.push(box(x, z, w, d, h * 0.70, h * 0.045));
    parts.push(box(x, z, w * 0.80, d * 0.80, h * 0.16, h * 0.745));
    parts.push(box(x, z, w * 0.56, d * 0.56, h * 0.09, h * 0.905));
    parts.push(prism(x, z, w * 0.03, h * 0.10, 4, h * 0.995));
  } else if (cap === "pyramid") {
    parts.push(box(x, z, w, d, h * 0.84, h * 0.045));
    parts.push(cone(x, z, w * 0.72, h * 0.14, 4, h * 0.885, Math.PI / 4));
  } else if (cap === "slant") {
    const a = x - w / 2, b = x + w / 2, c = z - d / 2, e = z + d / 2;
    const y0 = h * 0.045, lo = h * 0.72, hi = h;
    parts.push(S([
      [[a, lo, c], [b, hi, c], [b, hi, e], [a, lo, e]],
      [[a, y0, e], [b, y0, e], [b, hi, e], [a, lo, e]],
      [[b, y0, e], [b, y0, c], [b, hi, c], [b, hi, e]],
      [[b, y0, c], [a, y0, c], [a, lo, c], [b, hi, c]],
      [[a, y0, c], [a, y0, e], [a, lo, e], [a, lo, c]],
    ]));
  } else {
    parts.push(box(x, z, w, d, h * 0.92, h * 0.045));
    parts.push(box(x, z, w * 0.92, d * 0.92, h * 0.04, h * 0.962));
  }

  const solid = merge(...parts);
  if (bands) {
    const a = x - w / 2, b = x + w / 2, e = z + d / 2, c = z - d / 2;
    for (let f = 0.10; f < 0.78; f += 0.075) {
      const y = h * f;
      solid.lines.push([[a, y, e], [b, y, e]], [[b, y, e], [b, y, c]]);
    }
  }
  return solid;
}

// --- NEEDLE TOWER (Atakule) -------------------------------------
export function needle(x: number, z: number, h: number): Solid {
  return merge(
    prism(x, z, h * 0.055, h * 0.04, 8),
    prism(x, z, h * 0.026, h * 0.60, 8, h * 0.04),
    prism(x, z, h * 0.105, h * 0.055, 16, h * 0.62),
    prism(x, z, h * 0.088, h * 0.05, 16, h * 0.675, 0, h * 0.055),
    cone(x, z, h * 0.055, h * 0.09, 12, h * 0.725),
    prism(x, z, h * 0.008, h * 0.18, 4, h * 0.815),
  );
}

// --- FLUTED CONE TOWER (Mevlana Kubbe-i Hadra) ------------------
export function flutedTower(x: number, z: number, r: number, h: number, y0: number = 0): Solid {
  const solid = merge(
    prism(x, z, r, h * 0.30, 16, y0),
    cone(x, z, r * 1.02, h * 0.62, 16, y0 + h * 0.30),
    prism(x, z, r * 0.10, h * 0.10, 4, y0 + h * 0.92),
  );
  return solid;
}

// --- CRENELLATED WALL / CASTLE ----------------------------------
export function castle(x: number, z: number, w: number, d: number, h: number, towers: number = 4, y0: number = 0): Solid {
  const parts = [box(x, z, w, d, h, y0)];
  const n = Math.max(4, Math.round(w / 26));
  for (let i = 0; i < n; i++) {
    const bx = x - w / 2 + (w / n) * (i + 0.5);
    parts.push(box(bx, z + d / 2 - 3, (w / n) * 0.5, 6, h * 0.16, y0 + h));
    parts.push(box(bx, z - d / 2 + 3, (w / n) * 0.5, 6, h * 0.16, y0 + h));
  }
  const tw = w * 0.13;
  const spots = towers >= 4
    ? [[-1, -1], [1, -1], [-1, 1], [1, 1]]
    : [[-1, 1], [1, 1]];
  for (const [sx, sz] of spots) {
    parts.push(prism(x + sx * w * 0.46, z + sz * d * 0.45, tw * 0.55, h * 1.35, 8, y0));
    parts.push(cone(x + sx * w * 0.46, z + sz * d * 0.45, tw * 0.62, h * 0.42, 8, y0 + h * 1.35));
  }
  return merge(...parts);
}

// --- COLONNADE (Anıtkabir) --------------------------------------
export function colonnade(x: number, z: number, w: number, d: number, h: number): Solid {
  const parts = [
    box(x, z, w * 1.22, d * 1.30, h * 0.10),
    box(x, z, w * 1.12, d * 1.18, h * 0.09, h * 0.10),
    box(x, z, w, d, h * 0.06, h * 0.19),
  ];
  const cols = Math.round(w / 26);
  for (let i = 0; i <= cols; i++) {
    const cx = x - w / 2 + (w * i) / cols;
    parts.push(prism(cx, z + d / 2 - 5, w * 0.011, h * 0.58, 8, h * 0.25));
    parts.push(prism(cx, z - d / 2 + 5, w * 0.011, h * 0.58, 8, h * 0.25));
  }
  parts.push(box(x, z, w * 1.06, d * 1.06, h * 0.17, h * 0.83));
  return merge(...parts);
}

// --- SUSPENSION BRIDGE ------------------------------------------
export function bridge(x0: number, x1: number, z: number, deckY: number, towerH: number, d: number = 26): Solid {
  const span = x1 - x0;
  const tL = x0 + span * 0.16, tR = x1 - span * 0.16;
  const parts = [box((x0 + x1) / 2, z, span, d, 5, deckY)];
  for (const tx of [tL, tR]) {
    for (const sz of [-1, 1]) parts.push(box(tx, z + sz * (d / 2 - 3), 7, 6, towerH));
    parts.push(box(tx, z, 7, d, 5, towerH - 8));
  }
  const solid = merge(...parts);
  const sag = (towerH - deckY) * 0.55;
  for (const sz of [-1, 1]) {
    const zz = z + sz * (d / 2 - 3);
    const cable = [];
    for (let i = 0; i <= 26; i++) {
      const t = i / 26, cx = tL + (tR - tL) * t;
      cable.push([cx, towerH - sag * 4 * t * (1 - t), zz]);
    }
    solid.lines.push(cable);
    solid.lines.push([[x0, deckY + 6, zz], [tL, towerH, zz]]);
    solid.lines.push([[x1, deckY + 6, zz], [tR, towerH, zz]]);
    for (let i = 2; i < 26; i += 3) {
      const t = i / 26, cx = tL + (tR - tL) * t;
      solid.lines.push([[cx, towerH - sag * 4 * t * (1 - t), zz], [cx, deckY + 5, zz]]);
    }
  }
  return solid;
}

// --- PORT CRANE (Mersin) ----------------------------------------
export function crane(x: number, z: number, h: number, reach: number = 90): Solid {
  const solid = merge(
    box(x, z, 22, 22, h * 0.06),
    prism(x - 8, z, 2.6, h * 0.86, 4, h * 0.06),
    prism(x + 8, z, 2.6, h * 0.86, 4, h * 0.06),
    box(x, z, 26, 20, h * 0.10, h * 0.86),
  );
  const top = h * 0.94;
  solid.lines.push(
    [[x - 10, top, z], [x + reach, top + 26, z]],
    [[x - 10, top, z], [x - reach * 0.45, top + 16, z]],
    [[x + reach, top + 26, z], [x + reach * 0.5, h * 0.62, z]],
    [[x - reach * 0.45, top + 16, z], [x - 10, h * 0.7, z]],
  );
  return solid;
}

// --- WINDMILL (Bodrum) ------------------------------------------
export function windmill(x: number, z: number, r: number, h: number): Solid {
  const solid = merge(
    prism(x, z, r, h, 12, 0, 0, r * 0.82),
    cone(x, z, r * 0.92, h * 0.32, 12, h),
  );
  const cx = x, cy = h * 0.86, cz = z + r * 0.9;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + 0.4, L = r * 1.9;
    solid.lines.push([[cx, cy, cz], [cx + L * Math.cos(a), cy + L * Math.sin(a), cz]]);
  }
  return solid;
}

// --- PALM -------------------------------------------------------
export function palm(x: number, z: number, h: number, seed: number = 1): Solid {
  const rnd = mulberry32(seed);
  const solid = merge(prism(x, z, h * 0.028, h * 0.72, 6, 0, 0, h * 0.02));
  const top = [x, h * 0.72, z];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6 + rnd() * 0.5, L = h * (0.34 + rnd() * 0.14);
    const f = [top];
    for (let k = 1; k <= 4; k++) {
      const t = k / 4;
      f.push([x + Math.cos(a) * L * t, h * 0.72 + L * 0.42 * t - L * 0.62 * t * t, z + Math.sin(a) * L * t]);
    }
    solid.lines.push(f);
  }
  return solid;
}

// --- TERRAIN RIDGE ----------------------------------------------
export function ridge(x0: number, x1: number, z: number, h: number, seed: number, segs: number = 16, depth: number = 220): Solid {
  const rnd = mulberry32(seed);
  const p1 = 0.7 + rnd(), p2 = 2.1 + rnd() * 1.4, o1 = rnd() * 6, o2 = rnd() * 6;
  const crest = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, x = x0 + (x1 - x0) * t;
    const env = Math.pow(Math.sin(Math.PI * t), 0.6);
    const n = 0.66 * Math.sin(t * Math.PI * p1 + o1) + 0.28 * Math.sin(t * Math.PI * p2 + o2);
    crest.push([x, h * env * (0.55 + 0.45 * (n * 0.5 + 0.5)), z]);
  }
  const faces = [];
  for (let i = 0; i < segs; i++) {
    faces.push([
      [crest[i][0], 0, z], [crest[i + 1][0], 0, z],
      [crest[i + 1][0], crest[i + 1][1], z], [crest[i][0], crest[i][1], z],
    ]);
    faces.push([
      [crest[i][0], crest[i][1], z], [crest[i + 1][0], crest[i + 1][1], z],
      [crest[i + 1][0], 0, z - depth], [crest[i][0], 0, z - depth],
    ]);
  }
  return S(faces);
}

// --- BLOCK CLUSTER (generic urban fill) -------------------------
export function blocks(x0: number, x1: number, z: number, lo: number, hi: number, seed: number, n: number, depth: number = 46): Solid {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t + (rnd() - 0.5) * ((x1 - x0) / n) * 0.5;
    const zz = z + (rnd() - 0.5) * depth;
    const w = ((x1 - x0) / n) * (0.5 + rnd() * 0.4);
    parts.push(box(x, zz, w, w * (0.7 + rnd() * 0.6), lo + rnd() * (hi - lo)));
  }
  return merge(...parts);
}

// ================================================================
// Additions for the 20-city set
// ================================================================

/** Bursa Ulu Camii: a grid of small domes over one hall. */
export function domeGrid(x: number, z: number, w: number, d: number, h: number, cols: number = 4, rows: number = 3, o: DomeGridOpts = {}): Solid {
  const parts = [box(x, z, w, d, h)];
  const rx = w / cols, rz = d / rows;
  const r = Math.min(rx, rz) * 0.46;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const cx = x - w / 2 + rx * (i + 0.5), cz = z - d / 2 + rz * (j + 0.5);
      parts.push(prism(cx, cz, r * 1.06, h * 0.06, 8, h));
      parts.push(dome(cx, cz, r, r * 0.86, 8, 2, h + h * 0.06));
    }
  }
  const mh = o.minaretH ?? h * 2.4;
  parts.push(minaret(x - w * 0.42, z + d * 0.54, mh), minaret(x + w * 0.42, z + d * 0.54, mh * 0.92));
  return merge(...parts);
}

/** Gaziantep Kalesi: circular curtain on a mound. */
export function roundCastle(x: number, z: number, r: number, h: number, y0: number = 0): Solid {
  const parts = [
    prism(x, z, r * 1.34, y0 * 0.9 + 1, 18, 0, 0, r * 1.08),
    prism(x, z, r, h, 18, y0),
  ];
  for (let i = 0; i < 12; i++) {
    const a = (i * 2 * Math.PI) / 12;
    parts.push(prism(x + r * 0.96 * Math.cos(a), z + r * 0.96 * Math.sin(a), r * 0.14, h * 0.34, 8, y0 + h * 0.9));
  }
  parts.push(prism(x, z, r * 0.30, h * 0.34, 10, y0 + h));
  return merge(...parts);
}

/** Diyarbakır surları: long basalt wall with round bastions. */
export function wallRun(x0: number, x1: number, z: number, h: number, bastions: number = 5, d: number = 26): Solid {
  const parts = [box((x0 + x1) / 2, z, x1 - x0, d, h)];
  const n = Math.max(6, Math.round((x1 - x0) / 40));
  for (let i = 0; i < n; i++) {
    const bx = x0 + ((x1 - x0) / n) * (i + 0.5);
    parts.push(box(bx, z, ((x1 - x0) / n) * 0.46, d + 3, h * 0.13, h));
  }
  for (let i = 0; i < bastions; i++) {
    const bx = x0 + ((x1 - x0) / (bastions - 1)) * i;
    parts.push(prism(bx, z + d * 0.20, d * 0.72, h * 1.22, 12));
    parts.push(prism(bx, z + d * 0.20, d * 0.80, h * 0.10, 12, h * 1.22));
  }
  return merge(...parts);
}

/** Selçuklu kümbet: polygonal drum under a conical cap. */
export function kumbet(x: number, z: number, r: number, h: number, y0: number = 0, sides: number = 8): Solid {
  return merge(
    prism(x, z, r * 1.18, h * 0.14, sides, y0),
    prism(x, z, r, h * 0.56, sides, y0 + h * 0.14),
    prism(x, z, r * 1.10, h * 0.05, sides, y0 + h * 0.70),
    cone(x, z, r * 1.12, h * 0.30, sides, y0 + h * 0.75),
  );
}

/** Erzurum Çifte Minareli: portal façade carrying two minarets. */
export function twinPortal(x: number, z: number, w: number, d: number, h: number): Solid {
  return merge(
    box(x, z, w, d, h * 0.62),
    box(x, z + d * 0.30, w * 0.44, d * 0.42, h * 0.86),
    minaret(x - w * 0.20, z + d * 0.34, h * 1.34),
    minaret(x + w * 0.20, z + d * 0.34, h * 1.34),
  );
}

/** Samsun Bandırma Vapuru: hull, deckhouse, funnel, masts. */
export function ship(x: number, z: number, len: number, h: number): Solid {
  const w = len * 0.22;
  const hull = S([
    [[x - len / 2, h * 0.30, z - w / 2], [x + len * 0.44, h * 0.30, z - w / 2],
     [x + len / 2, h * 0.52, z], [x + len * 0.44, h * 0.30, z + w / 2],
     [x - len / 2, h * 0.30, z + w / 2]],
    [[x - len / 2, 0, z - w * 0.30], [x + len * 0.42, 0, z - w * 0.30],
     [x + len * 0.44, h * 0.30, z - w / 2], [x - len / 2, h * 0.30, z - w / 2]],
    [[x + len * 0.42, 0, z + w * 0.30], [x - len / 2, 0, z + w * 0.30],
     [x - len / 2, h * 0.30, z + w / 2], [x + len * 0.44, h * 0.30, z + w / 2]],
    [[x + len * 0.42, 0, z - w * 0.30], [x + len * 0.42, 0, z + w * 0.30],
     [x + len * 0.44, h * 0.30, z + w / 2], [x + len / 2, h * 0.52, z],
     [x + len * 0.44, h * 0.30, z - w / 2]],
  ]);
  const solid = merge(
    hull,
    box(x - len * 0.06, z, len * 0.26, w * 0.72, h * 0.30, h * 0.30),
    box(x - len * 0.06, z, len * 0.16, w * 0.50, h * 0.18, h * 0.60),
    prism(x - len * 0.16, z, w * 0.13, h * 0.42, 10, h * 0.60),
  );
  solid.lines.push(
    [[x + len * 0.24, h * 0.30, z], [x + len * 0.24, h * 1.05, z]],
    [[x - len * 0.34, h * 0.30, z], [x - len * 0.34, h * 0.98, z]],
    [[x + len * 0.24, h * 1.05, z], [x - len * 0.34, h * 0.98, z]],
  );
  return solid;
}

/** Şanlıurfa: a Corinthian column on the citadel rock. */
export function column(x: number, z: number, r: number, h: number, y0: number = 0): Solid {
  return merge(
    box(x, z, r * 3.2, r * 3.2, h * 0.06, y0),
    prism(x, z, r, h * 0.84, 12, y0 + h * 0.06, 0, r * 0.88),
    prism(x, z, r * 1.30, h * 0.07, 12, y0 + h * 0.90),
    box(x, z, r * 2.8, r * 2.8, h * 0.03, y0 + h * 0.97),
  );
}

/** A volcano cone with a wide skirt — Erciyes, Palandöken. */
export function volcano(x: number, z: number, r: number, h: number, y0: number = 0): Solid {
  return merge(
    cone(x, z, r, h * 0.34, 20, y0),
    cone(x, z, r * 0.66, h * 0.44, 18, y0 + h * 0.30),
    cone(x, z, r * 0.30, h * 0.30, 16, y0 + h * 0.70),
  );
}

/** Small domed church — Trabzon Ayasofya, Akdamar. */
export function church(x: number, z: number, w: number, d: number, h: number, y0: number = 0): Solid {
  return merge(
    box(x, z, w, d, h, y0),
    box(x, z, w * 0.34, d * 0.34, h * 0.30, y0 + h),
    cone(x, z, w * 0.26, h * 0.42, 10, y0 + h * 1.30),
    box(x - w * 0.40, z, w * 0.20, d * 0.30, h * 1.10, y0),
  );
}

/** Cliff-face monastery — Sümela. */
export function cliffMonastery(x: number, z: number, w: number, h: number, y0: number): Solid {
  const parts = [];
  for (let i = 0; i < 4; i++) {
    parts.push(box(x + (i - 1.5) * w * 0.26, z, w * 0.24, w * 0.34, h * (0.5 + (i % 2) * 0.3), y0 + h * 0.1 * i));
  }
  parts.push(box(x, z, w * 1.06, w * 0.40, h * 0.16, y0 - h * 0.16));
  return merge(...parts);
}


const st = (x: number, solid: Solid, tag?: string | null, flags?: Partial<Structure> | null): Structure =>
  ({ x, solid, tag, ...flags });

/** A loose cluster of pitched-roof houses on a slope. */
function houseCluster(x0: number, x1: number, z: number, n: number, seed: number, hLo: number = 26, hHi: number = 40, rise: number = 0): Solid {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t + (rnd() - 0.5) * 40;
    const zz = z + (rnd() - 0.5) * 150;
    const w = 34 + rnd() * 26, h = hLo + rnd() * (hHi - hLo);
    const y = rise ? rise * (1 - Math.abs(t - 0.5) * 1.4) : 0;
    parts.push(house(x, zz, w, w * 0.85, h, h * 0.55, Math.max(0, y)));
  }
  return merge(...parts);
}

/** Flat-roofed white cubes with chimneys — Muğla / Bodrum. */
function cubeCluster(x0: number, x1: number, z: number, n: number, seed: number): Solid {
  const rnd = mulberry32(seed);
  const parts = [];
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = x0 + (x1 - x0) * t + (rnd() - 0.5) * 40;
    const zz = z + (rnd() - 0.5) * 170;
    const w = 32 + rnd() * 24, h = 22 + rnd() * 22;
    parts.push(box(x, zz, w, w * 0.9, h));
    parts.push(box(x + w * 0.22, zz - w * 0.2, w * 0.16, w * 0.16, h * 0.42, h));
  }
  return merge(...parts);
}

/** Stone arch bridge over a river. */
function archBridge(x: number, z: number, span: number, h: number, arches: number = 3): Solid {
  const parts = [box(x, z, span, 34, 9, h)];
  for (let i = 0; i <= arches; i++) {
    const px = x - span / 2 + (span * i) / arches;
    parts.push(box(px, z, span * 0.06, 34, h, 0));
  }
  for (let i = 0; i < arches; i++) {
    const px = x - span / 2 + (span * (i + 0.5)) / arches;
    parts.push(prism(px, z, span / arches / 2.4, 34, 10, h * 0.55, 0));
  }
  return merge(...parts);
}

// =================================================================
const CITY: City[] = [];

// --- İSTANBUL ----------------------------------------------------
CITY.push({
  name: "İstanbul", scale: 1.0, region: "Marmara", water: true,
  structures: [
    st(-820, blocks(-900, -560, -70, 26, 66, 101, 8)),
    st(-470, merge(
      prism(-470, 30, 27, 74, 14), prism(-470, 30, 33, 12, 14, 74),
      prism(-470, 30, 28, 16, 14, 86), cone(-470, 30, 32, 44, 14, 102),
      prism(-470, 30, 3, 12, 4, 146),
    ), "Galata"),
    st(-250, mosque(-250, -30, 158, 126, 96, {
      domeR: 0.32, domeH: 0.56, drum: 0.10, minarets: 4, minaretH: 182, minaretSpread: 92, minaretZ: 56,
    }), "Ayasofya", { accent: 1 }),
    st(-20, mosque(-20, 20, 162, 130, 104, {
      domeR: 0.28, domeH: 0.70, drum: 0.18, minarets: 6, minaretH: 198, minaretSpread: 96, minaretZ: 58,
    }), "Sultanahmet"),
    st(200, blocks(140, 330, -60, 26, 58, 102, 6)),
    st(430, bridge(300, 730, 130, 34, 178)),
    st(520, merge(box(520, 210, 46, 46, 34), prism(520, 210, 15, 30, 8, 34), cone(520, 210, 17, 22, 8, 64)), "Kız Kulesi"),
    st(600, tower(600, -170, 46, 46, 246, "tapered"), "Levent"),
    st(672, tower(672, -196, 38, 38, 192, "pyramid")),
    st(744, tower(744, -164, 42, 42, 218, "flat")),
    st(812, tower(812, -186, 34, 34, 172, "slant")),
  ],
  markers: [{ x: -250, y: 200, t: "Fatih", v: "76.400 ₺/m²", tone: "primary" },
            { x: 700, y: 300, t: "Levent", v: "+%9,1", tone: "positive" }],
});

// --- ANKARA ------------------------------------------------------
CITY.push({
  name: "Ankara", scale: 1.0, region: "İç Anadolu", water: false,
  structures: [
    st(-880, ridge(-900, -420, -330, 78, 111, 14, 170), null, { far: 1 }),
    st(-560, colonnade(-560, 20, 300, 168, 150), "Anıtkabir"),
    st(-220, blocks(-300, -60, -60, 34, 88, 112, 7)),
    st(120, mosque(120, 20, 150, 128, 88, { minarets: 4, minaretH: 176, minaretSpread: 88, minaretZ: 56 }), "Kocatepe"),
    st(330, blocks(260, 420, -80, 30, 74, 113, 5)),
    st(470, needle(470, -10, 268), "Atakule", { accent: 1 }),
    st(640, ridge(480, 900, -330, 92, 114, 14, 170), null, { far: 1 }),
    st(740, castle(740, -120, 210, 116, 54, 4, 42), "Ankara Kalesi"),
    st(860, blocks(620, 890, 60, 28, 66, 115, 6)),
  ],
  markers: [{ x: 470, y: 316, t: "Çankaya", v: "62.800 ₺/m²", tone: "primary" },
            { x: -560, y: 170, t: "Anıttepe", v: "koruma", tone: "risk" }],
});

// --- İZMİR -------------------------------------------------------
CITY.push({
  name: "İzmir", scale: 1.08, region: "Ege", water: true,
  structures: [
    st(-880, ridge(-900, -480, -430, 96, 121, 14, 190), null, { far: 1 }),
    st(-760, blocks(-840, -520, -50, 24, 58, 122, 7)),
    st(-300, merge(
      box(-300, 30, 64, 64, 16), box(-300, 30, 44, 44, 44, 16), box(-300, 30, 52, 52, 8, 60),
      box(-300, 30, 34, 34, 32, 68), box(-300, 30, 40, 40, 7, 100),
      prism(-300, 30, 17, 22, 12, 107), dome(-300, 30, 17, 16, 12, 2, 129),
      prism(-300, 30, 2.5, 10, 4, 145),
    ), "Saat Kulesi", { accent: 1 }),
    st(-140, blocks(-200, 40, -60, 26, 64, 123, 7)),
    st(90, mosque(90, 20, 94, 84, 54, { minarets: 2, minaretH: 106, minaretSpread: 54, minaretZ: 36 })),
    st(280, merge(box(280, -70, 120, 90, 54), box(280, -70, 28, 28, 116, 54)), "Asansör"),
    st(500, tower(500, -170, 38, 38, 222, "pyramid"), "Bayraklı"),
    st(570, tower(570, -190, 38, 38, 236, "pyramid")),
    st(740, merge(box(740, 210, 230, 62, 12), box(700, 210, 96, 56, 44, 12)), "Konak Pier"),
    st(860, merge(palm(830, 150, 62, 124), palm(880, 176, 54, 125), palm(920, 140, 58, 126)), null, { foliage: 1 }),
  ],
  markers: [{ x: -300, y: 160, t: "Konak", v: "54.100 ₺/m²", tone: "primary" },
            { x: 535, y: 285, t: "Bayraklı", v: "+%14,8", tone: "positive" }],
});

// --- ESKİŞEHİR ---------------------------------------------------
CITY.push({
  name: "Eskişehir", scale: 1.34, region: "İç Anadolu", water: true,
  structures: [
    st(-880, ridge(-900, -400, -330, 64, 131, 12, 170), null, { far: 1 }),
    st(-700, houseCluster(-860, -560, -80, 9, 132, 30, 46, 34), "Odunpazarı"),
    st(-480, houseCluster(-560, -300, -20, 8, 133, 28, 44, 18)),
    st(-260, merge(
      box(-260, 40, 90, 80, 44), house(-260, 40, 96, 86, 6, 30, 44),
      prism(-260, 40, 8, 34, 8, 80), cone(-260, 40, 11, 20, 8, 114),
    ), "Kurşunlu Külliyesi"),
    st(-60, archBridge(-60, 190, 200, 26, 3), "Porsuk"),
    st(120, blocks(40, 300, -70, 32, 78, 134, 7)),
    st(400, merge(
      castle(400, -80, 176, 104, 52, 4, 0),
      cone(340, -122, 22, 54, 8, 70), cone(460, -122, 22, 54, 8, 70),
    ), "Sazova", { accent: 1 }),
    st(640, blocks(560, 820, -40, 34, 92, 135, 7)),
    st(840, tower(840, -110, 36, 36, 168, "flat")),
  ],
  markers: [{ x: -700, y: 120, t: "Odunpazarı", v: "31.700 ₺/m²", tone: "risk" },
            { x: 640, y: 130, t: "Tepebaşı", v: "+%11,2", tone: "positive" }],
});

// --- KONYA -------------------------------------------------------
CITY.push({
  name: "Konya", scale: 1.2, region: "İç Anadolu", water: false,
  structures: [
    st(-860, blocks(-900, -580, -70, 22, 54, 141, 8)),
    st(-420, merge(
      box(-420, 20, 150, 118, 62),
      dome(-478, 20, 26, 24, 10, 2, 62), dome(-420, 20, 26, 24, 10, 2, 62), dome(-362, 20, 26, 24, 10, 2, 62),
      box(-420, -30, 58, 58, 78), flutedTower(-420, -30, 30, 122, 78),
      minaret(-500, 66, 128), minaret(-340, 66, 128),
    ), "Mevlana", { accent: 1 }),
    st(-180, blocks(-260, -40, -60, 26, 66, 142, 6)),
    st(60, mosque(60, 10, 136, 116, 78, { minarets: 2, minaretH: 152, minaretSpread: 78, minaretZ: 50 }), "Selimiye"),
    st(300, ridge(200, 560, -250, 58, 143, 12, 150), "Alaeddin Tepesi", { far: 1 }),
    st(320, merge(
      box(320, -150, 76, 68, 34), dome(320, -150, 26, 22, 10, 2, 34), minaret(370, -120, 92),
    )),
    st(600, blocks(520, 800, -50, 30, 82, 144, 7)),
    st(860, tower(860, -90, 34, 34, 156, "flat")),
  ],
  markers: [{ x: -420, y: 210, t: "Karatay", v: "28.900 ₺/m²", tone: "primary" },
            { x: 600, y: 110, t: "Selçuklu", v: "+%8,4", tone: "positive" }],
});

// --- ANTALYA -----------------------------------------------------
CITY.push({
  name: "Antalya", scale: 1.22, region: "Akdeniz", water: true,
  structures: [
    st(-880, box(-300, 10, 1180, 190, 40), "falez"),
    st(-760, houseCluster(-840, -560, 60, 8, 151, 26, 38, 0), "Kaleiçi"),
    st(-560, merge(prism(-560, 90, 26, 46, 12, 44), prism(-560, 90, 22, 26, 12, 90),
      cone(-560, 90, 25, 16, 12, 116)), "Hıdırlık"),
    st(-360, merge(minaret(-360, 30, 196, 8), box(-360, 30, 76, 66, 40, 44)), "Yivli Minare", { accent: 1 }),
    st(-160, houseCluster(-260, 40, 40, 8, 152, 26, 40, 0)),
    st(180, tower(180, -40, 62, 52, 132, "flat", false)),
    st(290, tower(290, -60, 56, 50, 164, "slant", false)),
    st(400, tower(400, -30, 66, 54, 122, "flat", false)),
    st(560, ridge(300, 940, -350, 176, 153, 16, 190), null, { far: 1 }),
    st(700, merge(palm(640, 130, 72, 154), palm(720, 160, 64, 155), palm(800, 120, 68, 156)), null, { foliage: 1 }),
    st(880, merge(box(830, 240, 40, 16, 8), box(900, 262, 34, 14, 7))),
  ],
  markers: [{ x: -360, y: 250, t: "Kaleiçi", v: "71.900 ₺/m²", tone: "risk" },
            { x: 290, y: 215, t: "Lara", v: "+%17,3", tone: "positive" }],
});

// --- MUĞLA / BODRUM ----------------------------------------------
CITY.push({
  name: "Muğla", scale: 1.52, region: "Ege", water: true,
  structures: [
    st(-880, ridge(-900, -340, -330, 112, 161, 14, 170), null, { far: 1 }),
    st(-700, cubeCluster(-860, -520, -60, 10, 162), "Beyaz evler"),
    st(-420, merge(windmill(-420, -90, 22, 46), windmill(-330, -110, 20, 42), windmill(-240, -80, 21, 44)), "Yel değirmenleri"),
    st(-140, cubeCluster(-240, 80, 20, 10, 163)),
    st(200, merge(
      box(200, 150, 250, 150, 20),
      castle(200, 150, 214, 122, 62, 4, 20),
    ), "Bodrum Kalesi", { accent: 1 }),
    st(500, cubeCluster(420, 700, -40, 8, 164)),
    st(760, ridge(620, 940, -300, 78, 165, 12, 150), null, { far: 1 }),
    st(860, merge(
      box(800, 250, 46, 18, 9), box(870, 272, 38, 16, 8), box(930, 246, 42, 17, 8),
    ), "Marina"),
    st(880, merge(palm(760, 200, 58, 166), palm(840, 216, 52, 167)), null, { foliage: 1 }),
  ],
  markers: [{ x: 200, y: 130, t: "Bodrum", v: "94.600 ₺/m²", tone: "positive" },
            { x: -700, y: 90, t: "Menteşe", v: "38.200 ₺/m²", tone: "primary" }],
});

// --- HATAY -------------------------------------------------------
CITY.push({
  name: "Hatay", scale: 1.44, region: "Akdeniz", water: true,
  structures: [
    st(-880, ridge(-900, -420, -330, 100, 171, 14, 170), null, { far: 1 }),
    st(-660, houseCluster(-820, -520, -60, 8, 172, 26, 40, 0), "Antakya evleri"),
    st(-400, merge(
      box(-400, 20, 118, 100, 58), dome(-400, 20, 30, 26, 12, 2, 58), minaret(-470, 60, 132),
    ), "Habib-i Neccar", { accent: 1 }),
    st(-160, archBridge(-160, 200, 190, 24, 3), "Asi Nehri"),
    st(60, houseCluster(-40, 220, 30, 7, 173, 26, 42, 0)),
    st(300, merge(box(300, -30, 240, 110, 46), box(300, -30, 210, 90, 12, 46)), "Meclis Binası"),
    st(520, blocks(420, 700, -60, 30, 84, 174, 7)),
    st(760, ridge(560, 940, -350, 180, 175, 16, 190), "Habib-i Neccar Dağı", { far: 1 }),
    st(860, tower(860, -100, 34, 34, 148, "flat")),
  ],
  markers: [{ x: -400, y: 160, t: "Antakya", v: "24.300 ₺/m²", tone: "primary" },
            { x: 520, y: 120, t: "Defne", v: "yeniden imar", tone: "risk" }],
});

// --- MERSİN ------------------------------------------------------
CITY.push({
  name: "Mersin", scale: 1.0, region: "Akdeniz", water: true,
  structures: [
    st(-880, ridge(-900, -400, -340, 124, 181, 14, 180), null, { far: 1 }),
    st(-720, merge(crane(-760, 210, 130), crane(-640, 232, 118), crane(-520, 206, 126)), "Liman"),
    st(-400, blocks(-500, -240, -50, 30, 78, 182, 7)),
    st(-120, merge(tower(-120, -60, 48, 48, 262, "tapered"), tower(-40, -84, 34, 34, 176, "flat")), "Mertim", { accent: 1 }),
    st(60, blocks(-20, 240, -40, 32, 86, 183, 7)),
    st(340, merge(box(340, 40, 200, 100, 14), box(300, 40, 90, 60, 40, 14)), "Marina"),
    st(560, merge(
      box(600, 220, 180, 118, 14),
      castle(600, 220, 150, 96, 54, 4, 14),
    ), "Kızkalesi"),
    st(820, blocks(740, 900, -60, 28, 70, 184, 5)),
    st(880, merge(palm(420, 130, 70, 185), palm(500, 150, 62, 186), palm(780, 140, 66, 187)), null, { foliage: 1 }),
  ],
  markers: [{ x: -120, y: 320, t: "Yenişehir", v: "44.700 ₺/m²", tone: "primary" },
            { x: 600, y: 100, t: "Erdemli", v: "+%12,6", tone: "positive" }],
});



// --- BURSA (Marmara) ---------------------------------------------
CITY.push({
  name: "Bursa", scale: 1.02, region: "Marmara", water: false,
  structures: [
    st(-880, ridge(-900, -200, -360, 176, 201, 16, 190), null, { far: 1 }),
    st(-620, ridge(-300, 900, -400, 214, 202, 18, 200), "Uludağ", { far: 1 }),
    st(-500, blocks(-880, -560, -60, 30, 78, 203, 8)),
    st(-260, domeGrid(-260, 0, 220, 160, 74, 4, 3, { minaretH: 178 }), "Ulu Camii", { accent: 1 }),
    st(20, merge(box(20, 30, 96, 88, 52), kumbet(20, 30, 34, 76, 52)), "Yeşil Türbe"),
    st(200, merge(box(200, 20, 150, 110, 46), house(200, 20, 158, 118, 6, 26, 46)), "Koza Han"),
    st(420, blocks(340, 620, -50, 34, 96, 204, 7)),
    st(700, tower(700, -90, 40, 40, 196, "flat")),
    st(770, tower(770, -110, 36, 36, 168, "slant")),
    st(880, blocks(820, 900, 40, 30, 72, 205, 3)),
  ],
  markers: [{ x: -260, y: 190, t: "Osmangazi", v: "41.300 ₺/m²", tone: "primary" }],
});

// --- KOCAELİ (Marmara) -------------------------------------------
CITY.push({
  name: "Kocaeli", scale: 1.20, region: "Marmara", water: true,
  structures: [
    st(-880, ridge(-900, -300, -360, 150, 211, 16, 180), null, { far: 1 }),
    st(-700, merge(crane(-740, 235, 122), crane(-620, 258, 110), crane(-500, 232, 118)), "Liman"),
    st(-420, merge(box(-420, 90, 210, 90, 40), box(-420, 90, 190, 74, 10, 40)), "Tersane"),
    st(-180, merge(
      box(-180, 20, 52, 52, 20), box(-180, 20, 38, 38, 62, 20), box(-180, 20, 46, 46, 8, 82),
      prism(-180, 20, 15, 22, 12, 90), cone(-180, 20, 17, 20, 12, 112),
    ), "Saat Kulesi", { accent: 1 }),
    st(60, blocks(-40, 260, -50, 34, 92, 212, 7)),
    st(360, mosque(360, 10, 122, 104, 66, { minarets: 2, minaretSpread: 66, minaretH: 126, minaretZ: 42 })),
    st(560, blocks(480, 760, -60, 32, 104, 213, 7)),
    st(820, tower(820, -80, 38, 38, 172, "flat")),
    st(900, merge(box(880, 220, 52, 20, 10), box(940, 244, 44, 18, 9)), "Marina"),
  ],
  markers: [{ x: -180, y: 150, t: "İzmit", v: "36.800 ₺/m²", tone: "primary" }],
});

// --- ADANA (Akdeniz) ---------------------------------------------
CITY.push({
  name: "Adana", scale: 1.06, region: "Akdeniz", water: true,
  structures: [
    st(-880, ridge(-900, -420, -380, 128, 221, 14, 180), null, { far: 1 }),
    st(-660, blocks(-860, -500, -50, 30, 76, 222, 8)),
    st(-300, mosque(-300, 0, 210, 170, 118, {
      domeR: 0.30, domeH: 0.68, drum: 0.18, minarets: 6, minaretSpread: 122, minaretH: 258, minaretZ: 72,
    }), "Sabancı Merkez Camii", { accent: 1 }),
    st(60, archBridge(60, 210, 340, 30, 8), "Taşköprü"),
    st(340, blocks(240, 520, -60, 34, 98, 223, 7)),
    st(620, tower(620, -80, 42, 42, 204, "tapered")),
    st(700, tower(700, -104, 36, 36, 158, "flat")),
    st(830, merge(box(830, 20, 130, 96, 44), kumbet(830, 20, 30, 62, 44)), "Ulu Camii"),
    st(900, merge(palm(760, 150, 74, 224), palm(880, 178, 66, 225)), null, { foliage: 1 }),
  ],
  markers: [{ x: -300, y: 250, t: "Seyhan", v: "33.600 ₺/m²", tone: "primary" }],
});

// --- GAZİANTEP (Güneydoğu Anadolu) -------------------------------
CITY.push({
  name: "Gaziantep", scale: 1.14, region: "Güneydoğu Anadolu", water: false,
  structures: [
    st(-880, ridge(-900, -380, -380, 108, 231, 14, 170), null, { far: 1 }),
    st(-640, houseCluster(-860, -500, -40, 9, 232, 24, 40, 0), "Bey Mahallesi"),
    st(-300, merge(
      ridge(-460, -140, -30, 66, 233, 10, 150),
      roundCastle(-300, -10, 96, 62, 46),
    ), "Gaziantep Kalesi", { accent: 1 }),
    st(-40, merge(box(-40, 20, 116, 98, 54), dome(-40, 20, 28, 24, 14, 3, 54), minaret(-110, 58, 128)), "Şeyh Fethullah"),
    st(200, houseCluster(100, 380, 30, 8, 234, 24, 42, 0)),
    st(460, blocks(380, 660, -50, 32, 96, 235, 7)),
    st(740, tower(740, -80, 40, 40, 186, "flat")),
    st(880, blocks(800, 900, 30, 28, 70, 236, 4)),
  ],
  markers: [{ x: -300, y: 140, t: "Şahinbey", v: "29.400 ₺/m²", tone: "primary" }],
});

// --- ŞANLIURFA (Güneydoğu Anadolu) -------------------------------
CITY.push({
  name: "Şanlıurfa", scale: 1.16, region: "Güneydoğu Anadolu", water: false,
  structures: [
    st(-880, ridge(-900, -400, -380, 96, 241, 14, 170), null, { far: 1 }),
    st(-600, houseCluster(-840, -460, -40, 9, 242, 24, 38, 0)),
    st(-260, merge(
      ridge(-430, -90, -20, 88, 243, 10, 150),
      box(-260, 0, 190, 90, 34, 74),
      column(-320, 6, 9, 96, 108), column(-206, 6, 9, 96, 108),
    ), "Urfa Kalesi", { accent: 1 }),
    st(60, merge(
      box(60, 40, 156, 118, 50),
      dome(20, 40, 26, 22, 12, 3, 50), dome(90, 40, 26, 22, 12, 3, 50),
      minaret(-20, 86, 128),
    ), "Halil-ür Rahman"),
    st(300, houseCluster(200, 470, 20, 8, 244, 24, 40, 0), "Balıklıgöl"),
    st(560, blocks(470, 740, -50, 30, 88, 245, 7)),
    st(820, tower(820, -70, 38, 38, 164, "flat")),
  ],
  markers: [{ x: -260, y: 210, t: "Eyyübiye", v: "21.800 ₺/m²", tone: "primary" }],
});

// --- DİYARBAKIR (Güneydoğu Anadolu) ------------------------------
CITY.push({
  name: "Diyarbakır", scale: 1.24, region: "Güneydoğu Anadolu", water: true,
  structures: [
    st(-880, ridge(-900, -460, -380, 82, 251, 14, 170), null, { far: 1 }),
    st(-620, wallRun(-860, -300, -40, 62, 5, 30), "Surlar", { accent: 1 }),
    st(-280, merge(
      box(-280, 30, 150, 118, 48),
      box(-280, 30, 60, 60, 16, 48), dome(-280, 30, 30, 24, 14, 3, 64),
      minaret(-350, 74, 116),
    ), "Ulu Camii"),
    st(-40, houseCluster(-140, 130, 20, 8, 252, 22, 38, 0)),
    st(180, wallRun(60, 420, -40, 58, 4, 28)),
    st(500, archBridge(500, 220, 320, 26, 10), "On Gözlü Köprü"),
    st(700, blocks(600, 860, -50, 30, 86, 253, 7)),
    st(880, tower(880, -70, 36, 36, 152, "flat")),
  ],
  markers: [{ x: -620, y: 90, t: "Sur", v: "18.900 ₺/m²", tone: "risk" }],
});

// --- KAYSERİ (İç Anadolu) ----------------------------------------
CITY.push({
  name: "Kayseri", scale: 1.00, region: "İç Anadolu", water: false,
  structures: [
    st(-880, ridge(-900, -300, -420, 92, 261, 14, 180), null, { far: 1 }),
    st(-300, volcano(-100, -520, 520, 300), "Erciyes", { far: 1 }),
    st(-700, blocks(-880, -560, -50, 28, 74, 262, 8)),
    st(-380, merge(
      box(-380, 10, 176, 150, 58),
      box(-380, 10, 196, 170, 12, 0),
      prism(-448, 78, 20, 76, 10), prism(-312, 78, 20, 76, 10),
      prism(-448, 78, 22, 8, 10, 76), prism(-312, 78, 22, 8, 10, 76),
    ), "Kayseri Kalesi", { accent: 1 }),
    st(-90, merge(box(-90, 20, 130, 104, 52), dome(-90, 20, 30, 26, 14, 3, 52), minaret(-160, 62, 122)), "Hunat Hatun"),
    st(140, kumbet(140, 30, 34, 92), "Döner Kümbet"),
    st(380, blocks(280, 580, -50, 34, 94, 263, 7)),
    st(700, tower(700, -80, 40, 40, 192, "tapered")),
    st(870, blocks(790, 900, 30, 28, 68, 264, 4)),
  ],
  markers: [{ x: -380, y: 150, t: "Melikgazi", v: "34.200 ₺/m²", tone: "primary" }],
});

// --- SAMSUN (Karadeniz) ------------------------------------------
CITY.push({
  name: "Samsun", scale: 1.24, region: "Karadeniz", water: true,
  structures: [
    st(-880, ridge(-900, -260, -400, 158, 271, 16, 200), null, { far: 1 }),
    st(-560, ridge(-420, 500, -330, 122, 272, 16, 180), "Amisos", { far: 1 }),
    st(-680, blocks(-860, -520, -40, 28, 72, 273, 8)),
    st(-360, merge(box(-360, 30, 140, 100, 46), box(-360, 30, 116, 80, 14, 46)), "Fuar"),
    st(-120, mosque(-120, 10, 116, 98, 58, { minarets: 2, minaretSpread: 62, minaretH: 118, minaretZ: 40 })),
    st(120, blocks(20, 320, -40, 32, 92, 274, 7)),
    st(420, ship(420, 250, 220, 78), "Bandırma Vapuru", { accent: 1 }),
    st(640, merge(box(640, 40, 120, 70, 24), prism(640, 40, 10, 96, 8, 24), prism(640, 40, 22, 12, 8, 120)), "Onur Anıtı"),
    st(840, tower(840, -70, 36, 36, 158, "flat")),
  ],
  markers: [{ x: 420, y: 100, t: "İlkadım", v: "38.500 ₺/m²", tone: "positive" }],
});

// --- TRABZON (Karadeniz) -----------------------------------------
CITY.push({
  name: "Trabzon", scale: 1.30, region: "Karadeniz", water: true,
  structures: [
    st(-880, ridge(-900, -200, -400, 190, 281, 18, 210), null, { far: 1 }),
    st(-620, ridge(-500, 460, -300, 142, 282, 16, 170), "Boztepe", { far: 1 }),
    st(-700, merge(box(-700, -240, 130, 180, 168), cliffMonastery(-700, -150, 120, 96, 96)), "Sümela", { accent: 1 }),
    st(-380, church(-380, 30, 104, 82, 52), "Ayasofya"),
    st(-140, houseCluster(-260, 40, 10, 8, 283, 26, 44, 26)),
    st(140, blocks(40, 340, -40, 34, 96, 284, 7)),
    st(440, merge(box(440, 60, 160, 90, 40), box(440, 60, 130, 66, 12, 40)), "Meydan"),
    st(660, tower(660, -60, 38, 38, 166, "flat")),
    st(880, merge(box(830, 250, 46, 18, 9), box(900, 272, 40, 16, 8)), "Liman"),
  ],
  markers: [{ x: -380, y: 120, t: "Ortahisar", v: "43.100 ₺/m²", tone: "positive" }],
});

// --- VAN (Doğu Anadolu) ------------------------------------------
CITY.push({
  name: "Van", scale: 1.28, region: "Doğu Anadolu", water: true,
  structures: [
    st(-880, ridge(-900, -160, -420, 210, 291, 18, 210), null, { far: 1 }),
    st(-560, merge(
      ridge(-780, -300, -60, 96, 292, 12, 150),
      box(-540, -50, 300, 62, 32, 74),
      prism(-680, -50, 26, 46, 10, 74), prism(-400, -50, 26, 46, 10, 74),
    ), "Van Kalesi", { accent: 1 }),
    st(-200, houseCluster(-320, -20, 20, 8, 293, 24, 40, 0)),
    st(60, mosque(60, 10, 124, 104, 62, { minarets: 2, minaretSpread: 66, minaretH: 126, minaretZ: 42 })),
    st(300, blocks(200, 500, -40, 30, 84, 294, 7)),
    st(620, merge(box(620, 260, 150, 110, 16), church(620, 260, 84, 70, 46, 16)), "Akdamar"),
    st(860, blocks(760, 900, -30, 28, 74, 295, 5)),
  ],
  markers: [{ x: -560, y: 130, t: "İpekyolu", v: "22.600 ₺/m²", tone: "primary" }],
});

// --- ERZURUM (Doğu Anadolu) --------------------------------------
CITY.push({
  name: "Erzurum", scale: 1.14, region: "Doğu Anadolu", water: false,
  structures: [
    st(-880, ridge(-900, -300, -420, 138, 301, 16, 190), null, { far: 1 }),
    st(-420, volcano(-260, -480, 460, 268), "Palandöken", { far: 1 }),
    st(-720, blocks(-880, -580, -40, 26, 66, 302, 7)),
    st(-380, twinPortal(-380, 20, 130, 90, 138), "Çifte Minareli", { accent: 1 }),
    st(-130, merge(kumbet(-190, 30, 26, 76), kumbet(-130, 30, 28, 82), kumbet(-70, 30, 26, 76)), "Üç Kümbetler"),
    st(120, merge(box(120, 20, 128, 104, 52), dome(120, 20, 28, 24, 14, 3, 52), minaret(50, 60, 118)), "Yakutiye"),
    st(360, merge(box(360, 10, 168, 120, 44), prism(300, 56, 22, 62, 10), prism(420, 56, 22, 62, 10)), "Erzurum Kalesi"),
    st(620, blocks(520, 800, -40, 30, 82, 303, 7)),
    st(880, tower(880, -60, 34, 34, 146, "flat")),
  ],
  markers: [{ x: -380, y: 200, t: "Yakutiye", v: "19.700 ₺/m²", tone: "primary" }],
});

export const CITIES: City[] = CITY;
export const CITY_NAMES: string[] = CITY.map(c => c.name);
