// ============================================================
// emlakmetric — billing domain
//
// The database is the source of truth for quota. This layer never
// decides whether a user may act; it asks the database and reports
// the answer. Any "if (used < quota)" written in TypeScript is a
// bug waiting to happen, because two browser tabs will both pass it.
// ============================================================
import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanCode = "free" | "pro" | "enterprise";
export type PropertyKind = "konut" | "arsa" | "ticari";
export type ReportFormat = "pdf" | "xlsx";

// ---------- entities ----------------------------------------

export class Plan {
  constructor(
    readonly code: PlanCode,
    readonly name: string,
    readonly priceMonthly: number,     // minor units (kuruş)
    readonly currency: string,
    readonly analysisQuota: number,
    readonly reportQuota: number,
    readonly isFeatured: boolean,
    readonly sortOrder: number,
  ) {}

  get isFree(): boolean {
    return this.priceMonthly === 0;
  }

  /** "₺249" — display only; never do arithmetic on this. */
  formatPrice(locale = "tr-TR"): string {
    if (this.isFree) return locale.startsWith("en") ? "Free" : "Ücretsiz";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency,
      maximumFractionDigits: 0,
    }).format(this.priceMonthly / 100);
  }

  static fromRow(r: PlanRow): Plan {
    return new Plan(
      r.code as PlanCode, r.name, r.price_monthly, r.currency,
      r.analysis_quota, r.report_quota, r.is_featured, r.sort_order,
    );
  }
}

/** What the signed-in user is allowed to do right now. */
export class Entitlements {
  constructor(
    readonly planCode: PlanCode,
    readonly planName: string,
    readonly periodEnd: Date,
    readonly analysisQuota: number,
    readonly analysesUsed: number,
    readonly analysesLeft: number,
    readonly reportQuota: number,
    readonly reportsUsed: number,
    readonly reportsLeft: number,
  ) {}

  get canAnalyse(): boolean { return this.analysesLeft > 0; }
  get canDownload(): boolean { return this.reportsLeft > 0; }

  /** 0–1, for a progress bar. */
  get analysisRatio(): number {
    return this.analysisQuota ? this.analysesUsed / this.analysisQuota : 0;
  }
  get reportRatio(): number {
    return this.reportQuota ? this.reportsUsed / this.reportQuota : 0;
  }

  static fromRow(r: EntitlementRow): Entitlements {
    return new Entitlements(
      r.plan_code as PlanCode, r.plan_name, new Date(r.period_end),
      r.analysis_quota, r.analyses_used, r.analyses_left,
      r.report_quota, r.reports_used, r.reports_left,
    );
  }
}

export class Analysis {
  constructor(
    readonly id: string,
    readonly listingUrl: string,
    readonly kind: PropertyKind,
    readonly result: unknown,
    readonly createdAt: Date,
  ) {}

  static fromRow(r: AnalysisRow): Analysis {
    return new Analysis(r.id, r.listing_url, r.kind as PropertyKind, r.result, new Date(r.created_at));
  }
}

// ---------- errors ------------------------------------------

export class QuotaExhaustedError extends Error {
  constructor(readonly resource: "analysis" | "report") {
    super(`${resource} quota exhausted`);
    this.name = "QuotaExhaustedError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("not authenticated");
    this.name = "NotAuthenticatedError";
  }
}

// ---------- row shapes --------------------------------------

interface PlanRow {
  code: string; name: string; price_monthly: number; currency: string;
  analysis_quota: number; report_quota: number; is_featured: boolean; sort_order: number;
}
interface EntitlementRow {
  plan_code: string; plan_name: string; period_end: string;
  analysis_quota: number; analyses_used: number; analyses_left: number;
  report_quota: number; reports_used: number; reports_left: number;
}
interface AnalysisRow {
  id: string; listing_url: string; kind: string; result: unknown; created_at: string;
}

// ---------- repository --------------------------------------

export class BillingRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listPlans(): Promise<Plan[]> {
    const { data, error } = await this.db
      .from("plans")
      .select("code,name,price_monthly,currency,analysis_quota,report_quota,is_featured,sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data as PlanRow[]).map(Plan.fromRow);
  }

  async myEntitlements(): Promise<Entitlements> {
    const { data, error } = await this.db.rpc("my_entitlements");
    if (error) throw this.translate(error);
    const row = (data as EntitlementRow[])[0];
    if (!row) throw new NotAuthenticatedError();
    return Entitlements.fromRow(row);
  }

  async consumeAnalysis(listingUrl: string, kind: PropertyKind): Promise<Analysis> {
    const { data, error } = await this.db.rpc("consume_analysis", {
      p_listing_url: listingUrl,
      p_kind: kind,
    });
    if (error) throw this.translate(error, "analysis");
    return Analysis.fromRow(data as AnalysisRow);
  }

  async consumeReport(analysisId: string, format: ReportFormat = "pdf"): Promise<string> {
    const { data, error } = await this.db.rpc("consume_report", {
      p_analysis_id: analysisId,
      p_format: format,
    });
    if (error) throw this.translate(error, "report");
    return (data as { id: string }).id;
  }

  /** Postgres error codes → domain errors the UI can branch on. */
  private translate(error: { message?: string; code?: string }, resource?: "analysis" | "report"): Error {
    const msg = error.message ?? "";
    if (/quota exhausted/i.test(msg) && resource) return new QuotaExhaustedError(resource);
    if (/not authenticated/i.test(msg) || error.code === "28000") return new NotAuthenticatedError();
    return error as Error;
  }
}

// ---------- service -----------------------------------------

/**
 * The only thing the UI talks to. It deliberately does NOT pre-check
 * quota before calling the database: the check and the spend must be
 * the same operation, otherwise two tabs both spend the last slot.
 */
export class BillingService {
  constructor(private readonly repo: BillingRepository) {}

  listPlans(): Promise<Plan[]> {
    return this.repo.listPlans();
  }

  entitlements(): Promise<Entitlements> {
    return this.repo.myEntitlements();
  }

  /** Throws QuotaExhaustedError — catch it and show the upgrade prompt. */
  async analyse(listingUrl: string, kind: PropertyKind = "konut"): Promise<Analysis> {
    return this.repo.consumeAnalysis(listingUrl, kind);
  }

  async downloadReport(analysisId: string, format: ReportFormat = "pdf"): Promise<string> {
    return this.repo.consumeReport(analysisId, format);
  }
}
