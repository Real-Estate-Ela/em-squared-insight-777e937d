import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/auth/AuthProvider";
import { BillingRepository, BillingService, type Plan, type Entitlements } from "@/lib/billing/billing";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Reveal } from "@/components/Reveal";
import { MouseCard } from "@/components/MouseCard";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Paketler — emlakmetric" },
      {
        name: "description",
        content:
          "emlakmetric paketlerini karşılaştırın. Ücretsiz, Pro ve Enterprise planları ile gayrimenkul analiz ihtiyaçlarınızı karşılayın.",
      },
      { property: "og:title", content: "Paketler — emlakmetric" },
      {
        property: "og:description",
        content:
          "Gayrimenkul analiz paketlerini karşılaştırın. İhtiyacınıza uygun planı seçin.",
      },
    ],
    links: [
      { rel: "canonical", href: "/paketler" },
      { rel: "alternate", hrefLang: "tr", href: "/paketler" },
      { rel: "alternate", hrefLang: "en", href: "/paketler" },
    ],
  }),
  component: PaketlerPage,
});

function useBilling() {
  const db = getSupabaseBrowserClient();
  const repo = new BillingRepository(db);
  return new BillingService(repo);
}

function PaketlerPage() {
  const { t, locale } = useI18n();
  const p = t.pricing;
  const { user } = useAuth();
  const service = useBilling();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planList, entitlements] = await Promise.all([
          service.listPlans(),
          user ? service.entitlements().catch(() => null) : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setPlans(planList);
          setEnt(entitlements);
        }
      } catch {
        // plans table may not exist yet
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const jsonLd = plans.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: plans.map((plan, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: `emlakmetric ${plan.name}`,
            description: `${plan.analysisQuota} ${p.analysisQuota}, ${plan.reportQuota} ${p.reportQuota}`,
            offers: {
              "@type": "Offer",
              price: (plan.priceMonthly / 100).toString(),
              priceCurrency: plan.currency,
              availability: "https://schema.org/InStock",
            },
          },
        })),
      }
    : null;

  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, var(--surface-cool) 0%, var(--background) 40%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal variant="blur">
          <div className="text-center">
            <p className="label-mono">{p.title}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              {p.subtitle}
            </h1>
          </div>
        </Reveal>

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            Planlar yüklenemedi.
          </p>
        ) : (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-start">
            {plans.map((plan, i) => {
              const isCurrent = ent?.planCode === plan.code;
              const featured = plan.isFeatured;
              const isEnterprise = plan.code === "enterprise";

              return (
                <Reveal key={plan.code} delay={i * 100} variant="scale">
                  <MouseCard
                    className={`glass relative flex flex-col rounded-2xl p-6 md:p-8 ${
                      featured
                        ? "border-2 border-primary md:scale-105 md:-translate-y-2 shadow-xl shadow-primary/10"
                        : ""
                    }`}
                    glowColor={featured ? "var(--primary)" : "var(--border)"}
                    tiltMax={featured ? 6 : 4}
                    glowOpacity={featured ? 0.08 : 0.04}
                  >
                    {featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-md shadow-primary/20">
                        <Sparkles className="h-3.5 w-3.5" />
                        {p.badge}
                      </span>
                    )}

                    <h2 className="text-xl font-bold text-foreground">
                      {plan.name}
                    </h2>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight text-foreground">
                        {plan.formatPrice(locale === "en" ? "en-US" : "tr-TR")}
                      </span>
                      {!plan.isFree && (
                        <span className="text-sm text-muted-foreground">
                          {p.perMonth}
                        </span>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3 text-sm">
                      <li className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-positive" />
                        <span>
                          <strong>{plan.analysisQuota}</strong>{" "}
                          {p.analysisQuota}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check className="h-4 w-4 shrink-0 text-positive" />
                        <span>
                          <strong>{plan.reportQuota}</strong>{" "}
                          {p.reportQuota}
                        </span>
                      </li>
                    </ul>

                    <div className="mt-8">
                      {isCurrent ? (
                        <button
                          type="button"
                          disabled
                          className="w-full rounded-xl bg-muted px-6 py-3.5 text-sm font-semibold text-muted-foreground"
                        >
                          {p.currentPlan}
                        </button>
                      ) : isEnterprise ? (
                        <Link
                          to="/iletisim"
                          className="flex w-full items-center justify-center rounded-xl border-2 border-primary bg-transparent px-6 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-primary-foreground hover:-translate-y-0.5"
                        >
                          {p.contactSales}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={`w-full rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                            featured
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                              : "bg-foreground text-background hover:bg-foreground/90"
                          }`}
                        >
                          {plan.isFree ? p.getStarted : p.upgrade}
                        </button>
                      )}
                    </div>
                  </MouseCard>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </div>
  );
}
