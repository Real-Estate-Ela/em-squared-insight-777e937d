import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  BillingRepository,
  BillingService,
  Plan,
  type PlanCode,
  type Entitlements,
} from "@/lib/billing/billing";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Paketler | emlakmetric ilan analizi paketleri" },
      {
        name: "description",
        content:
          "emlakmetric analiz paketlerini karşılaştırın. Başlangıç, Pro ve Kurumsal. Aylık analiz kotasına göre üç plan, istediğin zaman iptal.",
      },
      { property: "og:title", content: "Paketler | emlakmetric" },
      {
        property: "og:description",
        content:
          "Analiz başına ödeme yok. Aylık analiz hakkına göre üç paket.",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [
      { rel: "canonical", href: "https://emlakmetric.com/paketler" },
      {
        rel: "alternate",
        hrefLang: "tr",
        href: "https://emlakmetric.com/paketler",
      },
      {
        rel: "alternate",
        hrefLang: "en",
        href: "https://emlakmetric.com/paketler?lang=en",
      },
    ],
  }),
  component: Paketler,
});

/* ── hooks ─────────────────────────────────────────────── */

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setVisible(true);
      return;
    }
    let done = false;
    const mark = () => { if (!done) { done = true; setVisible(true); } };
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { mark(); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    const timer = setTimeout(mark, 600);
    return () => { obs.disconnect(); clearTimeout(timer); };
  }, [threshold]);
  return { ref, visible };
}

function useCanTilt() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setOk(!coarse && !reduced);
  }, []);
  return ok;
}

/* ── constants ─────────────────────────────────────────── */

const PLAN_ORDER: PlanCode[] = ["free", "pro", "enterprise"];

const FALLBACK_PLANS: Plan[] = [
  new Plan("free", "Başlangıç", 0, "TRY", 3, 3, false, 0),
  new Plan("pro", "Analist", 150_000, "TRY", 100, 100, true, 1),
  new Plan("enterprise", "Kurumsal", 300_000, "TRY", 1000, 1000, false, 2),
];

const COMPARISON_KEYS = [
  "monthlyAnalysis",
  "locationQuery",
  "portfolioTracking",
  "pdfReport",
  "apiAccess",
  "userCount",
] as const;

type CompKey = (typeof COMPARISON_KEYS)[number];

const COMPARISON_DATA: Record<
  CompKey,
  Record<PlanCode, string | { text: string; color: string }>
> = {
  monthlyAnalysis: { free: "3", pro: "250", enterprise: "∞" },
  locationQuery: { free: "10", pro: "∞", enterprise: "∞" },
  portfolioTracking: {
    free: { text: "✕", color: "#E23D28" },
    pro: "50 ilan",
    enterprise: "∞",
  },
  pdfReport: {
    free: { text: "✕", color: "#E23D28" },
    pro: { text: "✓", color: "#00875A" },
    enterprise: { text: "✓", color: "#00875A" },
  },
  apiAccess: {
    free: { text: "✕", color: "#E23D28" },
    pro: { text: "✕", color: "#E23D28" },
    enterprise: { text: "10.000 / ay", color: "#00875A" },
  },
  userCount: { free: "1", pro: "3", enterprise: "10+" },
};

/* ── calculator logic ──────────────────────────────────── */

function calcFromSlider(v: number, plans: Plan[]) {
  const raw = 3 * Math.pow(1000 / 3, v / 100);
  const count =
    raw < 20
      ? Math.round(raw)
      : raw < 200
        ? Math.round(raw / 5) * 5
        : Math.round(raw / 25) * 25;

  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
  const free = sorted.find((p) => p.code === "free");
  const pro = sorted.find((p) => p.code === "pro");

  const freeQuota = free?.analysisQuota ?? 3;
  const proQuota = pro?.analysisQuota ?? 100;

  const tier: 0 | 1 | 2 =
    count <= freeQuota ? 0 : count <= proQuota ? 1 : 2;
  const plan = sorted[tier] ?? sorted[0];

  const price = plan.priceMonthly / 100;
  const perAnalysis = price > 0 ? price / count : 0;

  const limit = tier === 0 ? freeQuota : tier === 1 ? proQuota : count;
  const fill = Math.round(Math.min(100, (count / limit) * 100));

  return { count, tier, plan, price, perAnalysis, fill };
}

/* ── mouse interaction helpers ─────────────────────────── */

function cardMove(e: React.MouseEvent<HTMLElement>, tilt: boolean) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width;
  const ny = (e.clientY - r.top) / r.height;
  el.style.setProperty("--mx", (nx * 100).toFixed(1) + "%");
  el.style.setProperty("--my", (ny * 100).toFixed(1) + "%");
  if (tilt) {
    el.style.setProperty(
      "--rx",
      ((0.5 - ny) * 3.4).toFixed(2) + "deg",
    );
    el.style.setProperty(
      "--ry",
      ((nx - 0.5) * 4.2).toFixed(2) + "deg",
    );
  }
  el.style.setProperty("--spot", "1");
}

function cardLeave(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
  el.style.setProperty("--spot", "0");
}

function sectionMove(e: React.MouseEvent<HTMLElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty(
    "--px",
    (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
  );
  el.style.setProperty(
    "--py",
    (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
  );
}

/* ── ComparisonTable ───────────────────────────────────── */

function ComparisonTable({
  plans,
  t,
  visible,
}: {
  plans: Plan[];
  t: ReturnType<typeof useI18n>["t"];
  visible: boolean;
}) {
  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  const data: Record<
    CompKey,
    Record<PlanCode, string | { text: string; color: string }>
  > = {
    ...COMPARISON_DATA,
    monthlyAnalysis: Object.fromEntries(
      sorted.map((p) => [
        p.code,
        p.analysisQuota >= 9999
          ? t.pricing.unlimited
          : String(p.analysisQuota),
      ]),
    ) as Record<PlanCode, string>,
  };

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ border: "1px solid rgba(14,17,22,.16)" }}>
        <div
          className="pk-cmp-head"
          style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
            background: "#0E1116",
            color: "#fff",
            font: "400 10px 'Space Mono', monospace",
            letterSpacing: ".18em",
          }}
        >
          <span style={{ padding: "14px 16px" }}>
            {t.pricing.feature.toUpperCase()}
          </span>
          {sorted.map((p) => (
            <span
              key={p.code}
              style={{
                padding: "14px 16px",
                color: p.isFeatured ? "#1B4DFF" : "#fff",
              }}
            >
              {p.name.toUpperCase()}
            </span>
          ))}
        </div>

        {COMPARISON_KEYS.map((key, i) => (
          <div
            key={key}
            className="comp-row pk-cmp"
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
              borderTop: "1px solid rgba(14,17,22,.1)",
              font: "400 12px 'Space Mono', monospace",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(8px)",
              transition: `opacity 200ms ease-out ${i * 60}ms, transform 200ms ease-out ${i * 60}ms, background 180ms linear`,
            }}
          >
            <span
              style={{ padding: "15px 16px", color: "rgba(14,17,22,.65)" }}
            >
              {t.pricing.comparisonRows[key]}
            </span>
            {sorted.map((p) => {
              const cell = data[key][p.code as PlanCode];
              const isObj = typeof cell === "object";
              return (
                <span
                  key={p.code}
                  style={{
                    padding: "15px 16px",
                    color: isObj ? cell.color : undefined,
                    fontWeight: isObj ? undefined : 700,
                  }}
                >
                  <span
                    className="pk-cmp-plan"
                    style={{
                      display: "none",
                      font: "400 9px 'Space Mono', monospace",
                      letterSpacing: ".2em",
                      color: "rgba(14,17,22,.38)",
                      marginBottom: 5,
                    }}
                  >
                    {p.name.toUpperCase()}
                  </span>
                  {isObj ? cell.text : cell}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── PricingFaq ────────────────────────────────────────── */

function PricingFaq({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  const faqs = [
    { q: t.pricing.faq.changeQ, a: t.pricing.faq.changeA },
    { q: t.pricing.faq.quotaQ, a: t.pricing.faq.quotaA },
    { q: t.pricing.faq.cardQ, a: t.pricing.faq.cardA },
    { q: t.pricing.faq.invoiceQ, a: t.pricing.faq.invoiceA },
    { q: t.pricing.faq.cancelQ, a: t.pricing.faq.cancelA },
    { q: t.pricing.faq.refundQ, a: t.pricing.faq.refundA },
  ];

  return (
    <div>
      {faqs.map((faq, i) => (
        <details
          key={i}
          style={{
            borderTop: "1px solid rgba(14,17,22,.14)",
            padding: "18px 0",
          }}
          {...(i === 0 ? { open: true } : {})}
        >
          <summary
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
              listStyle: "none",
              font: "500 clamp(15px, 1.5vw, 19px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.02em",
              color: "#0E1116",
            }}
          >
            <span
              style={{
                flex: "none",
                font: "400 10px 'Space Mono', monospace",
                letterSpacing: ".18em",
                color: "#1B4DFF",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{faq.q}</span>
            <span
              aria-hidden="true"
              style={{
                marginLeft: "auto",
                flex: "none",
                font: "400 16px 'Space Mono', monospace",
                color: "rgba(14,17,22,.35)",
              }}
            >
              +
            </span>
          </summary>
          <p
            style={{
              margin: "12px 0 0 34px",
              maxWidth: "62ch",
              font: "400 12px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.62)",
            }}
          >
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  );
}

/* ── Paketler (main) ───────────────────────────────────── */

function Paketler() {
  const { locale, t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loaded, setLoaded] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState(46);
  const canTilt = useCanTilt();

  useEffect(() => {
    let cancelled = false;
    const svc = new BillingService(
      new BillingRepository(getSupabaseBrowserClient()),
    );
    svc
      .listPlans()
      .then((p) => {
        if (cancelled) return;
        const sorted = p.sort((a, b) => a.sortOrder - b.sortOrder);
        if (sorted.length > 0) setPlans(sorted);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[paketler] listPlans failed, using fallback:", err);
        setLoadError(String(err?.message ?? err));
      })
      .finally(() => { if (!cancelled) setLoaded(true); });

    if (!authLoading && user) {
      svc.entitlements().then(setEntitlements).catch(() => {});
    }
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const currentPlanCode = entitlements?.planCode ?? null;

  const sortedPlans = PLAN_ORDER.map((code) =>
    plans.find((p) => p.code === code),
  ).filter(Boolean) as Plan[];

  const calc = useMemo(
    () =>
      loaded && sortedPlans.length > 0
        ? calcFromSlider(sliderValue, sortedPlans)
        : null,
    [sliderValue, sortedPlans, loaded],
  );

  const heroLines = t.pricing.heroTitle.split("\n");

  const cardsReveal = useReveal(0.1);
  const tableReveal = useReveal(0.1);
  const faqReveal = useReveal(0.1);

  const fmtLocale = locale === "tr" ? "tr-TR" : "en-US";

  const formatCount = (n: number) =>
    n >= 1000 ? "1000+" : n.toLocaleString(fmtLocale);

  const formatTL = (n: number) =>
    n === 0
      ? locale === "tr"
        ? "ÜCRETSİZ"
        : "FREE"
      : "₺" + n.toLocaleString(fmtLocale);

  const formatPerAnalysis = (n: number) =>
    "₺" +
    n.toLocaleString(fmtLocale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* schema.org */
  const productJsonLd =
    sortedPlans.length > 0
      ? JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: sortedPlans.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: `emlakmetric ${p.name}`,
              description:
                t.pricing.planDescriptions[p.code as PlanCode],
              offers: {
                "@type": "Offer",
                price: (p.priceMonthly / 100).toFixed(2),
                priceCurrency: p.currency,
                availability: "https://schema.org/InStock",
              },
            },
          })),
        })
      : null;

  const faqJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { q: t.pricing.faq.changeQ, a: t.pricing.faq.changeA },
      { q: t.pricing.faq.quotaQ, a: t.pricing.faq.quotaA },
      { q: t.pricing.faq.cardQ, a: t.pricing.faq.cardA },
      { q: t.pricing.faq.invoiceQ, a: t.pricing.faq.invoiceA },
    ].map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });

  return (
    <div>
      {productJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: productJsonLd }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: faqJsonLd }}
      />

      <style>{`
        .comp-row:hover { background: #F5F7FF; }
        summary::-webkit-details-marker { display: none; }
        .pk-card-btn {
          transition: background 160ms linear, color 160ms linear, border-color 160ms linear;
        }
        .pk-card-btn:hover {
          background: #0E1116 !important;
          color: #fff !important;
        }
        .pk-card-btn[data-featured]:hover,
        .pk-card-btn[data-hot]:hover {
          background: #E23D28 !important;
          border-color: #E23D28 !important;
          color: #fff !important;
        }
        .pk-cta-primary:hover {
          background: #E23D28 !important;
          border-color: #E23D28 !important;
        }
        .pk-cta-ghost:hover {
          border-color: #fff !important;
        }
        .pk-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 44px;
          background: transparent;
          cursor: grab;
          touch-action: none;
        }
        .pk-slider:active { cursor: grabbing; }
        .pk-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: rgba(255,255,255,.2);
          border-radius: 2px;
        }
        .pk-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #1B4DFF;
          border: 3px solid #0E1116;
          box-shadow: 0 0 0 2px rgba(27,77,255,.35);
          margin-top: -9px;
          cursor: grab;
        }
        .pk-slider::-moz-range-track {
          height: 4px;
          background: rgba(255,255,255,.2);
          border: none;
          border-radius: 2px;
        }
        .pk-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #1B4DFF;
          border: 3px solid #0E1116;
          box-shadow: 0 0 0 2px rgba(27,77,255,.35);
          cursor: grab;
        }
        @media (pointer: coarse) {
          .pk-slider::-webkit-slider-thumb {
            width: 32px;
            height: 32px;
            margin-top: -14px;
          }
          .pk-slider::-moz-range-thumb {
            width: 32px;
            height: 32px;
          }
          .pk-slider { height: 52px; }
        }
        @media (max-width: 900px) {
          .pk-cards[data-tier="0"] > [data-plan="free"]       { order: -1; }
          .pk-cards[data-tier="1"] > [data-plan="pro"]        { order: -1; }
          .pk-cards[data-tier="2"] > [data-plan="enterprise"] { order: -1; }
          .pk-cmp { grid-template-columns: repeat(3, 1fr) !important; }
          .pk-cmp > span:first-child { grid-column: 1 / -1; border-bottom: 1px solid rgba(14,17,22,.08); font-weight: 700; }
          .pk-cmp-plan { display: block !important; }
          .pk-cmp-head { display: none !important; }
        }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section
        data-bg="light"
        onMouseMove={sectionMove}
        style={{
          position: "relative",
          background: "#FFFFFF",
          overflow: "hidden",
          padding:
            "clamp(116px, 13vw, 176px) clamp(16px, 4vw, 44px) clamp(30px, 4vw, 56px)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-20%",
            pointerEvents: "none",
            background:
              "radial-gradient(620px circle at var(--px, 70%) var(--py, 20%), rgba(27,77,255,.09), transparent 62%)",
            transition: "background 220ms linear",
          }}
        />
        <div style={{ position: "relative", maxWidth: 1560, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 18,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 7,
                height: 7,
                background: "#1B4DFF",
                animation: "em-pulse-dot 1.9s infinite",
              }}
            />
            {t.pricing.pricingLabel.toUpperCase()}
          </div>

          <h1
            style={{
              margin: "0 0 clamp(18px, 2.6vw, 32px)",
              font: "700 clamp(38px, 7.6vw, 128px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {heroLines.map((line, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  animation: `em-line-in .9s ${i * 0.1}s cubic-bezier(.2,.75,.2,1) both`,
                }}
              >
                {line}
                {i === heroLines.length - 1 && (
                  <span style={{ color: "#E23D28" }}>.</span>
                )}
              </span>
            ))}
          </h1>

          <p
            style={{
              margin: 0,
              maxWidth: 560,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.62)",
              animation: "em-rise-in .9s .18s both",
            }}
          >
            {t.pricing.heroSubtitle}
          </p>
        </div>
      </section>

      {loadError && (
        <div style={{
          maxWidth: 1560,
          margin: "0 auto",
          padding: "12px clamp(16px, 4vw, 44px)",
          font: "400 12px 'Space Mono', monospace",
          color: "rgba(14,17,22,.55)",
          textAlign: "center",
        }}>
          {locale === "tr"
            ? "Güncel fiyatlar yüklenemedi, varsayılan değerler gösteriliyor."
            : "Could not load live prices, showing default values."}
        </div>
      )}

      {/* ═══ CALCULATOR ═══ */}
      {loaded && calc && (
        <section
          data-bg="light"
          style={{
            background: "#FFFFFF",
            padding: "0 clamp(16px, 4vw, 44px) clamp(30px, 4vw, 52px)",
          }}
        >
          <div
            onMouseMove={(e) => {
              const el = e.currentTarget;
              const r = el.getBoundingClientRect();
              const nx = (e.clientX - r.left) / r.width;
              const ny = (e.clientY - r.top) / r.height;
              el.style.setProperty(
                "--mx",
                (nx * 100).toFixed(1) + "%",
              );
              el.style.setProperty(
                "--my",
                (ny * 100).toFixed(1) + "%",
              );
              el.style.setProperty("--spot", "1");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--spot", "0");
            }}
            style={{
              position: "relative",
              maxWidth: 1560,
              margin: "0 auto",
              overflow: "hidden",
              background: "#0E1116",
              color: "#fff",
              padding: "clamp(26px, 3.4vw, 46px)",
              animation:
                "em-flip-in 1s .3s cubic-bezier(.2,.75,.2,1) both",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(27,77,255,.34), transparent 72%)",
                opacity: "var(--spot, 0)",
                transition: "opacity 300ms linear",
              }}
            />

            <div
              className="em-col-1"
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1.35fr .95fr",
                gap: "clamp(26px, 4vw, 62px)",
                alignItems: "end",
              }}
            >
              {/* slider side */}
              <div>
                <div
                  style={{
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".24em",
                    color: "rgba(255,255,255,.5)",
                    marginBottom: 20,
                  }}
                >
                  {t.pricing.calcLabel.toUpperCase()}
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 14,
                    marginBottom: 22,
                  }}
                >
                  <strong
                    style={{
                      font: "700 clamp(46px, 7vw, 96px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.06em",
                      lineHeight: 0.9,
                    }}
                  >
                    {formatCount(calc.count)}
                  </strong>
                  <span
                    style={{
                      font: "400 12px 'Space Mono', monospace",
                      letterSpacing: ".2em",
                      color: "rgba(255,255,255,.5)",
                    }}
                  >
                    {t.pricing.scaleAnalyses.toUpperCase()}
                  </span>
                </div>

                <input
                  type="range"
                  className="pk-slider"
                  min={0}
                  max={100}
                  step={1}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(+e.target.value)}
                  aria-label={t.pricing.calcLabel}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    font: "400 10px 'Space Mono', monospace",
                    letterSpacing: ".18em",
                    color: "rgba(255,255,255,.35)",
                    marginTop: -4,
                  }}
                >
                  <span>3</span>
                  <span>50</span>
                  <span>250</span>
                  <span>1000+</span>
                </div>
              </div>

              {/* summary side */}
              <div style={{ display: "grid", gap: 14 }}>
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,.2)",
                    paddingTop: 14,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      font: "400 10px 'Space Mono', monospace",
                      letterSpacing: ".22em",
                      color: "rgba(255,255,255,.45)",
                      marginBottom: 8,
                    }}
                  >
                    {t.pricing.recommendedPlan.toUpperCase()}
                  </span>
                  <strong
                    style={{
                      display: "block",
                      font: "700 clamp(24px, 3vw, 38px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.04em",
                      color: "#1B4DFF",
                    }}
                  >
                    {calc.plan.name.toUpperCase()}
                  </strong>
                </div>

                <div
                  className="em-col-2"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 14,
                    borderTop: "1px solid rgba(255,255,255,.2)",
                    paddingTop: 14,
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: "block",
                        font: "400 10px 'Space Mono', monospace",
                        letterSpacing: ".22em",
                        color: "rgba(255,255,255,.45)",
                        marginBottom: 8,
                      }}
                    >
                      {t.pricing.monthlyLabel.toUpperCase()}
                    </span>
                    <strong
                      style={{
                        font: "700 20px 'Space Mono', monospace",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {formatTL(calc.price)}
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "block",
                        font: "400 10px 'Space Mono', monospace",
                        letterSpacing: ".22em",
                        color: "rgba(255,255,255,.45)",
                        marginBottom: 8,
                      }}
                    >
                      {t.pricing.perAnalysis.toUpperCase()}
                    </span>
                    <strong
                      style={{
                        font: "700 20px 'Space Mono', monospace",
                        letterSpacing: "-0.02em",
                        color: "#00875A",
                      }}
                    >
                      {formatPerAnalysis(calc.perAnalysis)}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,.14)",
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      height: "100%",
                      width: `${calc.fill}%`,
                      background: "#1B4DFF",
                      transition:
                        "width 320ms cubic-bezier(.2,.75,.2,1)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ PLAN CARDS ═══ */}
      {loaded && sortedPlans.length > 0 && (
        <section
          data-bg="light"
          style={{
            background: "#FFFFFF",
            padding:
              "clamp(20px, 3vw, 40px) clamp(16px, 4vw, 44px) clamp(30px, 4vw, 50px)",
          }}
        >
          <div
            ref={cardsReveal.ref}
            className="em-col-1 pk-cards"
            data-tier={calc?.tier}
            style={{
              maxWidth: 1560,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 1,
              background: "rgba(14,17,22,.16)",
              border: "1px solid rgba(14,17,22,.16)",
            }}
          >
            {sortedPlans.map((plan, i) => {
              const code = plan.code as PlanCode;
              const isFeatured = plan.isFeatured;
              const isCurrent = currentPlanCode === code;
              const isRecommended = calc?.tier === i;
              const quotaLabel =
                plan.analysisQuota >= 9999
                  ? (locale === "tr" ? "Sınırsız analiz" : "Unlimited analysis")
                  : `${plan.analysisQuota.toLocaleString(fmtLocale)} ${locale === "tr" ? "analiz / ay" : "analyses / mo"}`;
              const features = [quotaLabel, ...t.pricing.planFeatures[code].slice(1)];

              const cta =
                code === "free"
                  ? { label: t.pricing.tryFree, to: "/kayit" as const }
                  : code === "pro"
                    ? {
                        label: t.pricing.tryDays,
                        to: "/kayit" as const,
                      }
                    : {
                        label: t.pricing.buyPlan,
                        to: "/iletisim" as const,
                      };

              const spotlightColor = isFeatured
                ? "rgba(27,77,255,.4)"
                : code === "enterprise"
                  ? "rgba(226,61,40,.12)"
                  : "rgba(27,77,255,.13)";

              return (
                <article
                  key={code}
                  data-plan={code}
                  onMouseMove={(e) => cardMove(e, canTilt)}
                  onMouseLeave={cardLeave}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: isFeatured ? "#0E1116" : "#fff",
                    color: isFeatured ? "#fff" : "#0E1116",
                    padding: "clamp(24px, 3vw, 40px)",
                    display: "flex",
                    flexDirection: "column",
                    transform: canTilt
                      ? "perspective(1200px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateZ(0)"
                      : undefined,
                    transition: canTilt
                      ? "transform 320ms cubic-bezier(.2,.75,.2,1)"
                      : undefined,
                    opacity: cardsReveal.visible ? 1 : 0,
                  }}
                >
                  {/* spotlight */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${spotlightColor}, transparent 72%)`,
                      opacity: "var(--spot, 0)",
                      transition: "opacity 300ms linear",
                    }}
                  />

                  {/* header */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      minHeight: 22,
                    }}
                  >
                    <span
                      style={{
                        font: "400 10px 'Space Mono', monospace",
                        letterSpacing: ".22em",
                        color: isFeatured
                          ? "rgba(255,255,255,.5)"
                          : "rgba(14,17,22,.45)",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")} ·{" "}
                      {plan.name.toUpperCase()}
                    </span>

                    {!isFeatured && isRecommended && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: "#00875A",
                          color: "#fff",
                          font: "700 9px 'Space Mono', monospace",
                          letterSpacing: ".18em",
                          padding: "5px 8px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {t.pricing.suitableForYou.toUpperCase()}
                      </span>
                    )}

                    {isFeatured && (
                      <span
                        style={{
                          marginLeft: "auto",
                          background: isRecommended
                            ? "#00875A"
                            : "#1B4DFF",
                          color: "#fff",
                          font: "700 9px 'Space Mono', monospace",
                          letterSpacing: ".18em",
                          padding: "5px 8px",
                          whiteSpace: "nowrap",
                          transition: "background 240ms linear",
                        }}
                      >
                        {isRecommended
                          ? t.pricing.suitableForYou.toUpperCase()
                          : t.pricing.badge.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* price */}
                  <div
                    style={{
                      position: "relative",
                      margin: "24px 0 6px",
                      font: "700 clamp(38px, 4vw, 62px) 'Space Grotesk', sans-serif",
                      letterSpacing: "-0.06em",
                    }}
                  >
                    {plan.formatPrice(fmtLocale)}
                  </div>

                  {/* term note */}
                  <div
                    style={{
                      position: "relative",
                      font: "400 11px 'Space Mono', monospace",
                      letterSpacing: ".16em",
                      color: isFeatured
                        ? "rgba(255,255,255,.5)"
                        : "rgba(14,17,22,.45)",
                      marginBottom: 26,
                    }}
                  >
                    {plan.isFree
                      ? t.pricing.freeMonthly.toUpperCase()
                      : code === "enterprise"
                        ? `10 ${t.pricing.users.toUpperCase()} · ${t.pricing.vatIncluded.toUpperCase()}`
                        : `${t.pricing.perMonth.toUpperCase()} · ${t.pricing.vatIncluded.toUpperCase()}`}
                  </div>

                  {/* features */}
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                      font: "400 12px 'Space Mono', monospace",
                      lineHeight: 1.6,
                      color: isFeatured
                        ? "rgba(255,255,255,.78)"
                        : "rgba(14,17,22,.7)",
                      borderTop: `1px solid ${isFeatured ? "rgba(255,255,255,.16)" : "rgba(14,17,22,.14)"}`,
                      paddingTop: 22,
                      flex: 1,
                    }}
                  >
                    {features.map((f) => {
                      const isNeg = f.startsWith("−");
                      const text = isNeg ? f.slice(1) : f;
                      return (
                        <span
                          key={f}
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 9,
                            ...(isNeg
                              ? { color: "rgba(226,61,40,.9)" }
                              : {}),
                          }}
                        >
                          <span
                            style={{
                              flex: "none",
                              font: "700 11px 'Space Mono', monospace",
                            }}
                          >
                            {isNeg ? "−" : "+"}
                          </span>
                          <span>{text}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  {isCurrent ? (
                    <div
                      style={{
                        position: "relative",
                        marginTop: 34,
                        width: "100%",
                        padding: 17,
                        font: "700 11px 'Space Mono', monospace",
                        letterSpacing: ".2em",
                        textAlign: "center",
                        border: `1px solid ${isFeatured ? "rgba(255,255,255,.2)" : "rgba(14,17,22,.2)"}`,
                        color: isFeatured
                          ? "rgba(255,255,255,.4)"
                          : "rgba(14,17,22,.4)",
                      }}
                    >
                      {t.pricing.currentPlan.toUpperCase()}
                    </div>
                  ) : (
                    <Link
                      to={cta.to}
                      className="pk-card-btn"
                      data-featured={isFeatured ? "" : undefined}
                      data-hot={code === "enterprise" ? "" : undefined}
                      style={{
                        position: "relative",
                        marginTop: 34,
                        width: "100%",
                        padding: 17,
                        font: "700 11px 'Space Mono', monospace",
                        letterSpacing: ".2em",
                        textAlign: "center",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 44,
                        border: isFeatured
                          ? "1px solid #1B4DFF"
                          : "1px solid #0E1116",
                        background: isFeatured
                          ? "#1B4DFF"
                          : "transparent",
                        color: isFeatured ? "#fff" : "#0E1116",
                        cursor: "pointer",
                      }}
                    >
                      {cta.label.toUpperCase()}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>

          <div
            className="em-stack"
            style={{
              maxWidth: 1560,
              margin: "16px auto 0",
              display: "flex",
              gap: 16,
              font: "400 10px 'Space Mono', monospace",
              letterSpacing: ".16em",
              color: "rgba(14,17,22,.45)",
            }}
          >
            <span>{t.pricing.cancelNote.toUpperCase()}</span>
          </div>
        </section>
      )}

      {/* ═══ COMPARISON TABLE ═══ */}
      {loaded && sortedPlans.length > 0 && (
        <section
          data-bg="light"
          style={{
            background: "#FFFFFF",
            padding:
              "clamp(46px, 6vw, 88px) clamp(16px, 4vw, 44px) clamp(30px, 4vw, 50px)",
          }}
        >
          <div
            ref={tableReveal.ref}
            style={{ maxWidth: 1560, margin: "0 auto" }}
          >
            <h2
              style={{
                margin: "0 0 clamp(22px, 3vw, 38px)",
                font: "700 clamp(24px, 3.2vw, 48px) 'Space Grotesk', sans-serif",
                letterSpacing: "-0.055em",
              }}
            >
              {t.pricing.comparisonTitle}
              <span style={{ color: "#E23D28" }}>.</span>
            </h2>
            <ComparisonTable
              plans={sortedPlans}
              t={t}
              visible={tableReveal.visible}
            />
          </div>
        </section>
      )}

      {/* ═══ FAQ ═══ */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(30px, 4vw, 54px) clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div
          ref={faqReveal.ref}
          className="em-col-1"
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: ".9fr 1.4fr",
            gap: "clamp(24px, 4vw, 64px)",
            borderTop: "1px solid rgba(14,17,22,.16)",
            paddingTop: "clamp(28px, 4vw, 50px)",
            opacity: faqReveal.visible ? 1 : 0,
            transition: "opacity 400ms ease-out",
          }}
        >
          <div>
            <h2
              style={{
                margin: "0 0 12px",
                font: "700 clamp(22px, 2.8vw, 40px) 'Space Grotesk', sans-serif",
                letterSpacing: "-0.05em",
              }}
            >
              {t.pricing.faq.sideTitle.split("\n").map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
              <span style={{ color: "#E23D28" }}>.</span>
            </h2>
            <p
              style={{
                margin: 0,
                maxWidth: "34ch",
                font: "400 12px 'Space Mono', monospace",
                lineHeight: 1.8,
                color: "rgba(14,17,22,.55)",
              }}
            >
              {t.pricing.faq.sideSubtitle}
            </p>
          </div>

          <PricingFaq t={t} />
        </div>
      </section>

      {/* ═══ CLOSING CTA ═══ */}
      <section
        data-bg="dark"
        onMouseMove={sectionMove}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#0E1116",
          color: "#fff",
          padding: "clamp(60px, 8vw, 120px) clamp(16px, 4vw, 44px)",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-20%",
            pointerEvents: "none",
            background:
              "radial-gradient(560px circle at var(--px, 50%) var(--py, 50%), rgba(27,77,255,.3), transparent 62%)",
            transition: "background 220ms linear",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1560,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              margin: "0 0 clamp(18px, 2.4vw, 30px)",
              maxWidth: "18ch",
              font: "700 clamp(30px, 5.4vw, 86px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
            }}
          >
            {t.pricing.closingTitle.split("\n").map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
            <span style={{ color: "#E23D28" }}>.</span>
          </h2>

          <p
            style={{
              margin: "0 0 clamp(24px, 3vw, 40px)",
              maxWidth: "54ch",
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(255,255,255,.6)",
            }}
          >
            {t.pricing.closingSubtitle}
          </p>

          <div
            className="em-stack"
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <Link
              to="/kayit"
              className="pk-cta-primary"
              style={{
                background: "#1B4DFF",
                color: "#fff",
                border: "1px solid #1B4DFF",
                minHeight: 52,
                padding: "0 30px",
                font: "700 12px 'Space Mono', monospace",
                letterSpacing: ".2em",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition:
                  "background 160ms linear, border-color 160ms linear",
              }}
            >
              {t.pricing.tryFree.toUpperCase()}
            </Link>
            <Link
              to="/iletisim"
              className="pk-cta-ghost"
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,.4)",
                minHeight: 52,
                padding: "0 30px",
                font: "700 12px 'Space Mono', monospace",
                letterSpacing: ".2em",
                cursor: "pointer",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 160ms linear",
              }}
            >
              {t.pricing.buyPlan.toUpperCase()}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
