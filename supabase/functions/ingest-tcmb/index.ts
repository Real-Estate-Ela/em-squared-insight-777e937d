import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EVDS_BASE = "https://evds2.tcmb.gov.tr/service/evds";

const KFE_SERIES = [
  "TP_KFE_TR",
  "TP_KFE_TR10",
  "TP_KFE_TR21",
  "TP_KFE_TR22",
  "TP_KFE_TR31",
  "TP_KFE_TR32",
  "TP_KFE_TR33",
  "TP_KFE_TR41",
  "TP_KFE_TR42",
  "TP_KFE_TR51",
  "TP_KFE_TR52",
  "TP_KFE_TR61",
  "TP_KFE_TR62",
  "TP_KFE_TR63",
  "TP_KFE_TR7",
  "TP_KFE_TR8",
  "TP_KFE_TR9",
  "TP_KFE_TRA",
  "TP_KFE_TRB",
  "TP_KFE_TRC",
];

const BIRIMFIYAT_SERIES = ["TP_BIRIMFIYAT_TR", "TP_BIRIMFIYAT_IST"];

const BIRIMFIYAT_REGION_MAP: Record<string, string> = {
  TP_BIRIMFIYAT_TR: "TR",
  TP_BIRIMFIYAT_IST: "TR10",
};

function evdsCodeToRegionCode(seriesKey: string): string | null {
  if (BIRIMFIYAT_REGION_MAP[seriesKey]) return BIRIMFIYAT_REGION_MAP[seriesKey];
  const m = seriesKey.match(/^TP_KFE_(TR\w*)$/);
  return m ? m[1] : null;
}

function evdsCodeToDotNotation(seriesKey: string): string {
  return seriesKey.replace(/_/g, ".");
}

function parseEvdsDate(raw: string): string | null {
  const monthly = raw.match(/^(\d{4})-(\d{2})$/);
  if (monthly) return `${monthly[1]}-${monthly[2]}-01`;

  const quarterly = raw.match(/^(\d{4})-(\d)Ç$/);
  if (quarterly) {
    const q = parseInt(quarterly[2], 10);
    const month = (q - 1) * 3 + 1;
    return `${quarterly[1]}-${String(month).padStart(2, "0")}-01`;
  }

  return null;
}

function parseEvdsNumber(raw: unknown): number | null {
  if (raw == null || raw === "") return null;
  const cleaned = String(raw).replace(/,/g, "");
  const n = Number(cleaned);
  if (!isFinite(n)) return null;
  return n;
}

function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

async function fetchEvds(
  apiKey: string,
  series: string[],
  frequency: number,
): Promise<{ items: Record<string, unknown>[]; error: string | null }> {
  const seriesParam = series.join("-");
  const url =
    `${EVDS_BASE}?series=${seriesParam}` +
    `&startDate=01-01-2020&endDate=${todayDDMMYYYY()}` +
    `&type=json&frequency=${frequency}`;

  const res = await fetch(url, {
    headers: { key: apiKey },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return { items: [], error: `EVDS HTTP ${res.status}: ${body.slice(0, 500)}` };
  }

  const json = await res.json();
  const items = json?.items;
  if (!Array.isArray(items)) {
    return { items: [], error: `EVDS response missing items array: ${JSON.stringify(json).slice(0, 500)}` };
  }

  return { items, error: null };
}

interface MetricRow {
  region_id: number;
  metric: string;
  period: string;
  value: number;
  source: string;
  series_code: string;
}

function extractMetrics(
  items: Record<string, unknown>[],
  seriesList: string[],
  metric: string,
  regionMap: Map<string, number>,
): MetricRow[] {
  const rows: MetricRow[] = [];

  for (const item of items) {
    const dateRaw = (item.Tarih ?? item.TARIH ?? item.tarih) as string | undefined;
    if (!dateRaw) continue;

    const period = parseEvdsDate(dateRaw);
    if (!period) continue;

    for (const series of seriesList) {
      const val = item[series];
      const num = parseEvdsNumber(val);
      if (num === null) continue;

      const regionCode = evdsCodeToRegionCode(series);
      if (!regionCode) continue;

      const regionId = regionMap.get(regionCode);
      if (!regionId) continue;

      rows.push({
        region_id: regionId,
        metric,
        period,
        value: num,
        source: "TCMB_EVDS",
        series_code: evdsCodeToDotNotation(series),
      });
    }
  }

  return rows;
}

Deno.serve(async (_req: Request) => {
  const evdsKey = Deno.env.get("EVDS_API_KEY");
  if (!evdsKey) {
    return new Response(JSON.stringify({ error: "EVDS_API_KEY not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const db = createClient(supabaseUrl, serviceKey);

  const { data: runData, error: runErr } = await db
    .from("ingest_runs")
    .insert({ source: "TCMB_EVDS", status: "running" })
    .select("id")
    .single();

  if (runErr || !runData) {
    return new Response(
      JSON.stringify({ error: "Failed to create ingest run", detail: runErr }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const runId = runData.id;
  let totalUpserted = 0;
  const errors: string[] = [];

  try {
    const { data: regionsData } = await db
      .from("regions")
      .select("id, code")
      .in("level", ["country", "nuts1", "nuts2"]);

    const regionMap = new Map<string, number>();
    for (const r of regionsData ?? []) {
      regionMap.set(r.code, r.id);
    }

    // --- Call 1: KFE index (monthly, frequency=5) ---
    const kfeResult = await fetchEvds(evdsKey, KFE_SERIES, 5);
    if (kfeResult.error) {
      errors.push(`KFE: ${kfeResult.error}`);
    } else {
      const kfeRows = extractMetrics(kfeResult.items, KFE_SERIES, "kfe_index", regionMap);
      if (kfeRows.length > 0) {
        const BATCH = 500;
        for (let i = 0; i < kfeRows.length; i += BATCH) {
          const batch = kfeRows.slice(i, i + BATCH);
          const { error: upsertErr } = await db
            .from("region_metrics")
            .upsert(batch, { onConflict: "region_id,metric,period" });
          if (upsertErr) {
            errors.push(`KFE upsert batch ${i}: ${upsertErr.message}`);
          } else {
            totalUpserted += batch.length;
          }
        }
      }
    }

    // --- Call 2: Unit price (quarterly, frequency=6) ---
    const bfResult = await fetchEvds(evdsKey, BIRIMFIYAT_SERIES, 6);
    if (bfResult.error) {
      errors.push(`BirimFiyat: ${bfResult.error}`);
    } else {
      const bfRows = extractMetrics(bfResult.items, BIRIMFIYAT_SERIES, "unit_price", regionMap);
      if (bfRows.length > 0) {
        const BATCH = 500;
        for (let i = 0; i < bfRows.length; i += BATCH) {
          const batch = bfRows.slice(i, i + BATCH);
          const { error: upsertErr } = await db
            .from("region_metrics")
            .upsert(batch, { onConflict: "region_id,metric,period" });
          if (upsertErr) {
            errors.push(`BirimFiyat upsert batch ${i}: ${upsertErr.message}`);
          } else {
            totalUpserted += batch.length;
          }
        }
      }

      // Write region_estimates for TR and TR10 only (real unit price data)
      const latestByRegion = new Map<string, { period: string; value: number }>();
      for (const row of bfRows) {
        const code = [...regionMap.entries()].find(([, id]) => id === row.region_id)?.[0];
        if (!code || (code !== "TR" && code !== "TR10")) continue;
        const existing = latestByRegion.get(code);
        if (!existing || row.period > existing.period) {
          latestByRegion.set(code, { period: row.period, value: row.value });
        }
      }

      const estimateRows = [];
      for (const [code, { period, value }] of latestByRegion) {
        const regionId = regionMap.get(code);
        if (!regionId) continue;
        estimateRows.push({
          region_id: regionId,
          period,
          median_m2: value,
          method: "official",
          confidence: "high",
          sample_size: 0,
        });
      }

      if (estimateRows.length > 0) {
        const { error: estErr } = await db
          .from("region_estimates")
          .upsert(estimateRows, { onConflict: "region_id,period" });
        if (estErr) {
          errors.push(`region_estimates upsert: ${estErr.message}`);
        }
      }
    }

    // Finalize run
    const finalStatus = errors.length > 0
      ? (totalUpserted > 0 ? "ok" : "failed")
      : "ok";

    await db
      .from("ingest_runs")
      .update({
        status: finalStatus,
        rows_upsert: totalUpserted,
        error: errors.length > 0 ? errors.join(" | ") : null,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return new Response(
      JSON.stringify({
        status: finalStatus,
        rows_upserted: totalUpserted,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: finalStatus === "failed" ? 500 : 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db
      .from("ingest_runs")
      .update({
        status: "failed",
        rows_upsert: totalUpserted,
        error: msg,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    return new Response(
      JSON.stringify({ status: "failed", error: msg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
