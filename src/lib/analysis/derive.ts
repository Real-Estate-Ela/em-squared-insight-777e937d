export interface DeriveResult {
  price: number;
  total: number;
  yieldPct: number;
  payback: number;
  delta: number;
  parts: {
    base: number;
    fiyat: number;
    getiri: number;
    piyasa: number;
  };
  score: number;
}

export function derive(
  price: number,
  median: number,
  area: number,
  rent: number,
  noise: number,
): DeriveResult {
  const total = price * area;
  const yieldPct = (rent * 12) / total * 100;
  const payback = 100 / yieldPct;
  const delta = ((price - median) / median) * 100;
  const parts = {
    base: 50,
    fiyat: -delta * 0.85,
    getiri: (yieldPct - 5) * 6.5,
    piyasa: noise,
  };
  const raw = parts.base + parts.fiyat + parts.getiri + parts.piyasa;
  return {
    price,
    total,
    yieldPct,
    payback,
    delta,
    parts,
    score: Math.max(12, Math.min(96, Math.round(raw))),
  };
}
