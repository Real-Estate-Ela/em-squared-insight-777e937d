import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  BillingRepository,
  BillingService,
  type Plan,
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
      { rel: "alternate", hrefLang: "tr", href: "https://emlakmetric.com/paketler" },
      { rel: "alternate", hrefLang: "en", href: "https://emlakmetric.com/paketler?lang=en" },
    ],
  }),
  component: Paketler,
});

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
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const PLAN_ORDER: PlanCode[] = ["free", "pro", "enterprise"];

const COMPARISON_KEYS = [
  "monthlyAnalysis",
  "locationQuery",
  "portfolioTracking",
  "pdfReport",
  "apiAccess",
  "userCount",
] as const;

type CompKey = (typeof COMPARISON_KEYS)[number];

const COMPARISON_DATA: Record<CompKey, Record<PlanCode, string | { text: string; color: string }>> = {
  monthlyAnalysis: { free: "5", pro: "250", enterprise: "∞" },
  locationQuery: { free: "10", pro: "∞", enterprise: "∞" },
  portfolioTracking: {
    free: { text: "—", color: "rgba(14,17,22,.25)" },
    pro: "50",
    enterprise: "∞",
  },
  pdfReport: {
    free: { text: "—", color: "rgba(14,17,22,.25)" },
    pro: { text: "✓", color: "#00875A" },
    enterprise: { text: "✓", color: "#00875A" },
  },
  apiAccess: {
    free: { text: "—", color: "rgba(14,17,22,.25)" },
    pro: { text: "—", color: "rgba(14,17,22,.25)" },
    enterprise: { text: "10.000 / ay", color: "#00875A" },
  },
  userCount: { free: "1", pro: "3", enterprise: "10+" },
};

function ScaleAxis({ plans }: { plans: Plan[] }) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [springX, setSpringX] = useState<number | null>(null);
  const springRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  const maxQ = 1000;
  const logScale = (v: number) => Math.log(v + 1) / Math.log(maxQ + 1);

  const markers = sorted.map((p) => ({
    plan: p,
    pos: p.analysisQuota === 0 ? 1 : logScale(Math.min(p.analysisQuota, maxQ)),
  }));

  useEffect(() => {
    const animate = () => {
      const target = hoverX;
      const cur = springRef.current;
      if (target !== null && cur !== null) {
        const next = cur + (target - cur) * 0.15;
        springRef.current = next;
        setSpringX(next);
      } else if (target !== null) {
        springRef.current = target;
        setSpringX(target);
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [hoverX]);

  const handleMove = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setHoverX(pct);
  }, []);

  const handleLeave = useCallback(() => {
    setHoverX(null);
    springRef.current = null;
    setSpringX(null);
  }, []);

  const closestPlan = springX !== null
    ? markers.reduce((best, m) =>
        Math.abs(m.pos - springX) < Math.abs(best.pos - springX) ? m : best,
      ).plan
    : null;

  const logValue = springX !== null
    ? Math.round(Math.pow(maxQ + 1, springX) - 1)
    : null;

  return (
    <div style={{ padding: "0 0 16px" }}>
      <div
        style={{
          font: "400 10px 'Space Mono', monospace",
          letterSpacing: ".22em",
          color: "rgba(14,17,22,.45)",
          marginBottom: 18,
        }}
      >
        {t.pricing.scaleLabel}
      </div>
      <div
        ref={trackRef}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onMouseLeave={handleLeave}
        onTouchEnd={handleLeave}
        style={{
          position: "relative",
          height: 64,
          cursor: "crosshair",
          touchAction: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 0,
            right: 0,
            height: 1,
            background: "rgba(14,17,22,.2)",
          }}
        />

        {markers.map((m) => (
          <div
            key={m.plan.code}
            style={{
              position: "absolute",
              left: `${m.pos * 100}%`,
              top: 18,
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transition: closestPlan?.code === m.plan.code
                ? "transform 200ms ease-out"
                : "none",
            }}
          >
            <span
              style={{
                font: "700 10px 'Space Mono', monospace",
                letterSpacing: ".14em",
                color: closestPlan?.code === m.plan.code ? "#1B4DFF" : "rgba(14,17,22,.5)",
                transition: "color 200ms ease-out",
                whiteSpace: "nowrap",
              }}
            >
              {m.plan.name.toUpperCase()}
            </span>
            <div
              style={{
                width: 8,
                height: 8,
                border: "1.5px solid",
                borderColor: closestPlan?.code === m.plan.code ? "#1B4DFF" : "rgba(14,17,22,.35)",
                background: closestPlan?.code === m.plan.code ? "#1B4DFF" : "#fff",
                transition: "border-color 200ms ease-out, background 200ms ease-out",
              }}
            />
            <span
              style={{
                font: "400 10px 'Space Mono', monospace",
                color: "rgba(14,17,22,.4)",
                whiteSpace: "nowrap",
              }}
            >
              {m.plan.analysisQuota === 0
                ? `${m.plan.analysisQuota}`
                : m.plan.analysisQuota >= 9999
                  ? "∞"
                  : m.plan.analysisQuota.toLocaleString()}
            </span>
          </div>
        ))}

        {springX !== null && (
          <div
            style={{
              position: "absolute",
              left: `${springX * 100}%`,
              top: 0,
              height: "100%",
              width: 1,
              background: "#1B4DFF",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
        )}

        {springX !== null && logValue !== null && (
          <div
            style={{
              position: "absolute",
              left: `${springX * 100}%`,
              bottom: -6,
              transform: "translateX(-50%)",
              background: "#0E1116",
              color: "#fff",
              padding: "3px 8px",
              font: "700 10px 'Space Mono', monospace",
              letterSpacing: ".08em",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {logValue >= 999 ? "∞" : logValue} {t.pricing.scaleAnalyses}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          font: "400 9px 'Space Mono', monospace",
          color: "rgba(14,17,22,.3)",
          letterSpacing: ".12em",
          marginTop: 4,
        }}
      >
        <span>3</span>
        <span>1000+</span>
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  index,
  currentPlanCode,
  t,
  visible,
}: {
  plan: Plan;
  index: number;
  currentPlanCode: PlanCode | null;
  t: ReturnType<typeof useI18n>["t"];
  visible: boolean;
}) {
  const isCurrent = currentPlanCode === plan.code;
  const isFeatured = plan.isFeatured;
  const code = plan.code as PlanCode;

  const cta = code === "free"
    ? { label: t.pricing.tryFree, to: "/kayit" as const }
    : code === "pro"
      ? { label: t.pricing.tryDays, to: "/kayit" as const }
      : { label: t.pricing.requestQuote, to: "/iletisim" as const };

  const features = t.pricing.planFeatures[code];

  return (
    <div
      style={{
        background: isFeatured ? "#0E1116" : "#FFFFFF",
        border: isFeatured ? "none" : "1px solid rgba(14,17,22,.14)",
        padding: "clamp(28px, 3vw, 40px)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 300ms ease-out ${index * 120}ms, transform 300ms ease-out ${index * 120}ms`,
      }}
    >
      {isFeatured && (
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 24,
            transform: "translateY(-50%)",
            background: "#1B4DFF",
            color: "#fff",
            padding: "5px 12px",
            font: "700 9px 'Space Mono', monospace",
            letterSpacing: ".18em",
            whiteSpace: "nowrap",
          }}
        >
          {t.pricing.badge.toUpperCase()}
        </div>
      )}

      <div
        style={{
          font: "400 10px 'Space Mono', monospace",
          letterSpacing: ".22em",
          color: isFeatured ? "rgba(255,255,255,.5)" : "rgba(14,17,22,.4)",
          marginBottom: 24,
        }}
      >
        {String(index + 1).padStart(2, "0")} · {plan.name.toUpperCase()}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            font: "700 clamp(40px, 4.5vw, 64px) 'Space Grotesk', sans-serif",
            letterSpacing: "-0.06em",
            color: isFeatured ? "#FFFFFF" : "#0E1116",
          }}
        >
          {plan.formatPrice()}
        </span>
        {!plan.isFree && (
          <span
            style={{
              font: "400 12px 'Space Mono', monospace",
              color: isFeatured ? "rgba(255,255,255,.45)" : "rgba(14,17,22,.4)",
            }}
          >
            {t.pricing.perMonth}
          </span>
        )}
      </div>

      <div
        style={{
          font: "400 11px 'Space Mono', monospace",
          letterSpacing: ".1em",
          color: isFeatured ? "rgba(255,255,255,.4)" : "rgba(14,17,22,.4)",
          marginBottom: 28,
        }}
      >
        {plan.isFree
          ? t.pricing.forever.toUpperCase()
          : code === "enterprise"
            ? `10 ${t.pricing.users.toUpperCase()} · ${t.pricing.vatIncluded.toUpperCase()}`
            : t.pricing.vatIncluded.toUpperCase()}
      </div>

      <div
        style={{
          borderTop: `1px solid ${isFeatured ? "rgba(255,255,255,.12)" : "rgba(14,17,22,.1)"}`,
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              font: "400 11px 'Space Mono', monospace",
              color: isFeatured ? "rgba(255,255,255,.5)" : "rgba(14,17,22,.5)",
            }}
          >
            {t.pricing.analysisQuota}
          </span>
          <span
            style={{
              font: "700 12px 'Space Mono', monospace",
              color: isFeatured ? "#FFFFFF" : "#0E1116",
            }}
          >
            {plan.analysisQuota >= 9999 ? t.pricing.unlimited : plan.analysisQuota}
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span
            style={{
              font: "400 11px 'Space Mono', monospace",
              color: isFeatured ? "rgba(255,255,255,.5)" : "rgba(14,17,22,.5)",
            }}
          >
            {t.pricing.reportQuota}
          </span>
          <span
            style={{
              font: "700 12px 'Space Mono', monospace",
              color: isFeatured ? "#FFFFFF" : "#0E1116",
            }}
          >
            {plan.reportQuota >= 9999 ? t.pricing.unlimited : plan.reportQuota}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: `1px solid ${isFeatured ? "rgba(255,255,255,.12)" : "rgba(14,17,22,.1)"}`,
          paddingTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
        }}
      >
        {features.map((f) => (
          <div
            key={f}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              font: "400 12px 'Space Mono', monospace",
              lineHeight: 1.5,
              color: isFeatured ? "rgba(255,255,255,.72)" : "rgba(14,17,22,.65)",
            }}
          >
            <span
              style={{
                color: isFeatured ? "#1B4DFF" : "#1B4DFF",
                flexShrink: 0,
                marginTop: 1,
                font: "700 12px 'Space Mono', monospace",
              }}
            >
              +
            </span>
            <span>{f}</span>
          </div>
        ))}
      </div>

      {isCurrent ? (
        <div
          style={{
            marginTop: 32,
            width: "100%",
            padding: 16,
            font: "700 11px 'Space Mono', monospace",
            letterSpacing: ".18em",
            textAlign: "center",
            border: `1px solid ${isFeatured ? "rgba(255,255,255,.2)" : "rgba(14,17,22,.2)"}`,
            color: isFeatured ? "rgba(255,255,255,.4)" : "rgba(14,17,22,.4)",
          }}
        >
          {t.pricing.currentPlan.toUpperCase()}
        </div>
      ) : (
        <Link
          to={cta.to}
          className="em-plan-btn"
          data-featured={isFeatured ? "" : undefined}
          style={{
            marginTop: 32,
            width: "100%",
            padding: 16,
            font: "700 11px 'Space Mono', monospace",
            letterSpacing: ".18em",
            textAlign: "center",
            textDecoration: "none",
            border: isFeatured ? "1px solid #1B4DFF" : "1px solid #0E1116",
            background: isFeatured ? "#1B4DFF" : "transparent",
            color: isFeatured ? "#fff" : "#0E1116",
            cursor: "pointer",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cta.label.toUpperCase()}
        </Link>
      )}
    </div>
  );
}

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

  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ minWidth: 600, border: "1px solid rgba(14,17,22,.14)" }}>
        <div
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
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
              borderBottom:
                i < COMPARISON_KEYS.length - 1
                  ? "1px solid rgba(14,17,22,.08)"
                  : "none",
              font: "400 12px 'Space Mono', monospace",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(8px)",
              transition: `opacity 200ms ease-out ${i * 60}ms, transform 200ms ease-out ${i * 60}ms`,
            }}
          >
            <span
              style={{
                padding: "15px 16px",
                color: "rgba(14,17,22,.6)",
              }}
            >
              {t.pricing.comparisonRows[key]}
            </span>
            {sorted.map((p) => {
              const cell = COMPARISON_DATA[key][p.code as PlanCode];
              const isObj = typeof cell === "object";
              return (
                <span
                  key={p.code}
                  style={{
                    padding: "15px 16px",
                    color: isObj ? cell.color : undefined,
                    font: isObj ? undefined : "700 12px 'Space Mono', monospace",
                  }}
                >
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

function PricingFaq({ t }: { t: ReturnType<typeof useI18n>["t"] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: t.pricing.faq.cancelQ, a: t.pricing.faq.cancelA },
    { q: t.pricing.faq.quotaQ, a: t.pricing.faq.quotaA },
    { q: t.pricing.faq.changeQ, a: t.pricing.faq.changeA },
    { q: t.pricing.faq.refundQ, a: t.pricing.faq.refundA },
  ];

  return (
    <div>
      <div style={{ borderTop: "1px solid rgba(14,17,22,.14)" }}>
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{ borderBottom: "1px solid rgba(14,17,22,.14)" }}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: 0,
                  padding: "20px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  cursor: "pointer",
                  textAlign: "left",
                  minHeight: 44,
                }}
              >
                <span
                  style={{
                    font: "500 clamp(14px, 1.6vw, 18px) 'Space Grotesk', sans-serif",
                    letterSpacing: "-0.03em",
                    color: "#0E1116",
                  }}
                >
                  {faq.q}
                </span>
                <span
                  style={{
                    font: "400 18px 'Space Mono', monospace",
                    color: "rgba(14,17,22,.4)",
                    flexShrink: 0,
                    transition: "transform 200ms ease-out",
                    transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                  }}
                >
                  +
                </span>
              </button>
              <div
                style={{
                  overflow: "hidden",
                  maxHeight: isOpen ? 300 : 0,
                  transition: "max-height 250ms ease-out",
                }}
              >
                <div
                  style={{
                    padding: "0 0 20px",
                    font: "400 13px 'Space Mono', monospace",
                    lineHeight: 1.85,
                    color: "rgba(14,17,22,.58)",
                    maxWidth: 620,
                  }}
                >
                  {faq.a}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20 }}>
        <Link
          to="/sss"
          style={{
            font: "400 11px 'Space Mono', monospace",
            letterSpacing: ".14em",
            color: "#1B4DFF",
            textDecoration: "none",
          }}
        >
          {t.pricing.faq.generalLink.toUpperCase()} →
        </Link>
      </div>
    </div>
  );
}

function Paketler() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const svc = new BillingService(
      new BillingRepository(getSupabaseBrowserClient()),
    );
    svc.listPlans().then((p) => {
      setPlans(p.sort((a, b) => a.sortOrder - b.sortOrder));
      setLoaded(true);
    }).catch(() => setLoaded(true));

    if (!authLoading && user) {
      svc.entitlements().then(setEntitlements).catch(() => {});
    }
  }, [user, authLoading]);

  const currentPlanCode = entitlements?.planCode ?? null;

  const cardsReveal = useReveal(0.1);
  const tableReveal = useReveal(0.1);
  const faqReveal = useReveal(0.1);

  const sortedPlans = PLAN_ORDER
    .map((code) => plans.find((p) => p.code === code))
    .filter(Boolean) as Plan[];

  const heroLines = t.pricing.heroTitle.split("\n");

  const jsonLd = sortedPlans.length > 0
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: sortedPlans.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: `emlakmetric ${p.name}`,
            description: t.pricing.planDescriptions[p.code as PlanCode],
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

  return (
    <div>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}

      <style>{`
        .em-plan-btn {
          transition: background 160ms ease-out, color 160ms ease-out, border-color 160ms ease-out;
        }
        .em-plan-btn:hover {
          background: #1B4DFF !important;
          color: #fff !important;
          border-color: #1B4DFF !important;
        }
        .em-plan-btn[data-featured]:hover {
          background: #fff !important;
          color: #0E1116 !important;
          border-color: #fff !important;
        }
      `}</style>

      {/* HERO */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(120px, 14vw, 190px) clamp(16px, 4vw, 44px) clamp(40px, 5vw, 70px)",
        }}
      >
        <div style={{ maxWidth: 1560, margin: "0 auto" }}>
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 20,
            }}
          >
            01 · {t.pricing.title.toUpperCase()}
          </div>
          <h1
            style={{
              margin: "0 0 clamp(20px, 3vw, 36px)",
              font: "700 clamp(38px, 7.5vw, 128px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.06em",
              lineHeight: 0.88,
              animation: "em-rise-in 1s both",
            }}
          >
            {heroLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
            <span style={{ color: "#E23D28" }}>.</span>
          </h1>
          <p
            style={{
              margin: "0 0 clamp(36px, 5vw, 64px)",
              maxWidth: 620,
              font: "400 13px 'Space Mono', monospace",
              lineHeight: 1.85,
              color: "rgba(14,17,22,.58)",
            }}
          >
            {t.pricing.heroSubtitle}
          </p>

          {loaded && sortedPlans.length > 0 && (
            <div className="em-hide">
              <ScaleAxis plans={sortedPlans} />
            </div>
          )}
        </div>
      </section>

      {/* CARDS */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(30px, 4vw, 56px) clamp(16px, 4vw, 44px) clamp(40px, 5vw, 70px)",
        }}
      >
        <div
          ref={cardsReveal.ref}
          className="em-col-1"
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "clamp(12px, 2vw, 24px)",
          }}
        >
          {sortedPlans.map((plan, i) => (
            <PlanCard
              key={plan.code}
              plan={plan}
              index={i}
              currentPlanCode={currentPlanCode}
              t={t}
              visible={cardsReveal.visible}
            />
          ))}
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
            color: "rgba(14,17,22,.4)",
          }}
        >
          <span>{t.pricing.cancelNote.toUpperCase()}</span>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "clamp(40px, 5vw, 70px) clamp(16px, 4vw, 44px) clamp(64px, 8vw, 120px)",
        }}
      >
        <div
          ref={tableReveal.ref}
          style={{
            maxWidth: 1560,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.14)",
            paddingTop: "clamp(30px, 4vw, 52px)",
          }}
        >
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 20,
            }}
          >
            02 · {t.pricing.comparisonTitle.toUpperCase()}
          </div>
          <h2
            style={{
              margin: "0 0 clamp(24px, 3vw, 40px)",
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

      {/* FAQ */}
      <section
        data-bg="light"
        style={{
          background: "#FFFFFF",
          padding:
            "0 clamp(16px, 4vw, 44px) clamp(80px, 10vw, 140px)",
        }}
      >
        <div
          ref={faqReveal.ref}
          style={{
            maxWidth: 800,
            margin: "0 auto",
            borderTop: "1px solid rgba(14,17,22,.14)",
            paddingTop: "clamp(30px, 4vw, 52px)",
            opacity: faqReveal.visible ? 1 : 0,
            transform: faqReveal.visible ? "none" : "translateY(16px)",
            transition: "opacity 250ms ease-out, transform 250ms ease-out",
          }}
        >
          <div
            style={{
              font: "400 11px 'Space Mono', monospace",
              letterSpacing: ".28em",
              color: "#1B4DFF",
              marginBottom: 20,
            }}
          >
            03 · {t.pricing.faq.title.toUpperCase()}
          </div>
          <h2
            style={{
              margin: "0 0 clamp(20px, 3vw, 36px)",
              font: "700 clamp(24px, 3.2vw, 48px) 'Space Grotesk', sans-serif",
              letterSpacing: "-0.055em",
            }}
          >
            {t.pricing.faq.title}
            <span style={{ color: "#E23D28" }}>.</span>
          </h2>
          <PricingFaq t={t} />
        </div>
      </section>
    </div>
  );
}
