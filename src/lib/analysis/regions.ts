import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface RegionCard {
  regionId: number;
  code: string;
  name: string;
  level: string;
  parentId: number | null;
  kfeIndex: number | null;
  kfeYoyPct: number | null;
  medianM2: number | null;
  period: string | null;
  hasUnitPrice: boolean;
}

export interface Province {
  id: number;
  code: string;
  name: string;
  parentId: number;
}

export interface RegionInfo {
  id: number;
  code: string;
  name: string;
  level: string;
  parentId: number | null;
}

const KFE_CODES = [
  "TR", "TR10", "TR21", "TR22", "TR31", "TR32", "TR33",
  "TR41", "TR42", "TR51", "TR52", "TR61", "TR62", "TR63",
  "TR7", "TR8", "TR9", "TRA", "TRB", "TRC",
];

function cutoffDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 15);
  return d.toISOString().slice(0, 10);
}

export async function fetchRegionData(): Promise<{
  cards: RegionCard[];
  provinces: Province[];
  lookup: Map<number, RegionInfo>;
}> {
  const db = getSupabaseBrowserClient();

  const [regionsRes, provRes, kfeRes, estRes] = await Promise.all([
    db
      .from("regions")
      .select("id, code, name, level, parent_id")
      .in("level", ["country", "nuts1", "nuts2"]),
    db
      .from("regions")
      .select("id, code, name, parent_id")
      .eq("level", "province")
      .order("name"),
    db
      .from("region_metrics")
      .select("region_id, value, period")
      .eq("metric", "kfe_index")
      .gte("period", cutoffDate())
      .order("period", { ascending: false }),
    db
      .from("region_estimates")
      .select("region_id, median_m2, period")
      .order("period", { ascending: false }),
  ]);

  const allRegions = regionsRes.data ?? [];
  const lookup = new Map<number, RegionInfo>();
  for (const r of allRegions) {
    lookup.set(r.id, {
      id: r.id,
      code: r.code,
      name: r.name,
      level: r.level,
      parentId: r.parent_id,
    });
  }

  const kfeCodes = new Set(KFE_CODES);
  const kfeRegions = allRegions.filter((r) => kfeCodes.has(r.code));

  const kfeMap = new Map<
    number,
    { value: number; period: string; prevValue: number | null }
  >();
  for (const row of kfeRes.data ?? []) {
    const existing = kfeMap.get(row.region_id);
    if (!existing) {
      kfeMap.set(row.region_id, {
        value: Number(row.value),
        period: row.period,
        prevValue: null,
      });
      continue;
    }
    if (existing.prevValue !== null) continue;
    const latest = new Date(existing.period);
    const prev = new Date(row.period);
    const diff =
      (latest.getFullYear() - prev.getFullYear()) * 12 +
      (latest.getMonth() - prev.getMonth());
    if (diff === 12) {
      existing.prevValue = Number(row.value);
    }
  }

  const estMap = new Map<number, { medianM2: number; period: string }>();
  for (const row of estRes.data ?? []) {
    if (!estMap.has(row.region_id)) {
      estMap.set(row.region_id, {
        medianM2: Number(row.median_m2),
        period: row.period,
      });
    }
  }

  const cards: RegionCard[] = kfeRegions
    .map((r) => {
      const kfe = kfeMap.get(r.id);
      const est = estMap.get(r.id);
      const yoy =
        kfe?.prevValue && kfe.prevValue !== 0
          ? Math.round(((kfe.value / kfe.prevValue - 1) * 100) * 10) / 10
          : null;
      return {
        regionId: r.id,
        code: r.code,
        name: r.name,
        level: r.level,
        parentId: r.parent_id,
        kfeIndex: kfe?.value ?? null,
        kfeYoyPct: yoy,
        medianM2: est?.medianM2 ?? null,
        period: kfe?.period ?? est?.period ?? null,
        hasUnitPrice: est != null,
      };
    })
    .sort((a, b) => {
      if (a.code === "TR") return -1;
      if (b.code === "TR") return 1;
      return a.code.localeCompare(b.code);
    });

  const provinces: Province[] = (provRes.data ?? []).map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    parentId: r.parent_id!,
  }));

  return { cards, provinces, lookup };
}

export function resolveProvinceToKfeRegion(
  province: Province,
  lookup: Map<number, RegionInfo>,
  kfeRegionIds: Set<number>,
): { regionId: number; regionName: string } | null {
  let currentId: number | null = province.parentId;
  while (currentId !== null) {
    const region = lookup.get(currentId);
    if (!region) break;
    if (kfeRegionIds.has(region.id)) {
      return { regionId: region.id, regionName: region.name };
    }
    currentId = region.parentId;
  }
  return null;
}

export function formatPrice(n: number): string {
  return (
    new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(n) +
    " ₺/m²"
  );
}

export function formatIndex(n: number): string {
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(n);
}

export function formatChange(pct: number): string {
  const sign = pct >= 0 ? "+" : "−";
  return `${sign}${Math.abs(pct).toFixed(1).replace(".", ",")}%`;
}

export function formatPeriod(periodStr: string, locale: "tr" | "en"): string {
  const d = new Date(periodStr + "T00:00:00Z");
  const month = d.getUTCMonth();
  const year = d.getUTCFullYear();
  const TR = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
  ];
  const EN = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const months = locale === "tr" ? TR : EN;
  return `${months[month]} ${year}`;
}
