import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BillingRepository, BillingService, QuotaExhaustedError, NotAuthenticatedError } from "@/lib/billing/billing";
import type { PropertyKind } from "@/lib/billing/billing";

export const Route = createFileRoute("/api/analyse")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: { url?: string; kind?: string };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: "invalid_body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const listingUrl = body.url;
        const kind = body.kind as PropertyKind | undefined;

        if (!listingUrl || !kind) {
          return new Response(JSON.stringify({ error: "missing_fields" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const db = getSupabaseServerClient(request);

        const { data: { user } } = await db.auth.getUser();
        if (!user) {
          return new Response(JSON.stringify({ error: "not_authenticated" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const service = new BillingService(new BillingRepository(db));
          const analysis = await service.analyse(listingUrl, kind);
          return new Response(JSON.stringify({ ok: true, id: analysis.id }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err) {
          if (err instanceof QuotaExhaustedError) {
            return new Response(JSON.stringify({ error: "quota_exhausted", resource: err.resource }), {
              status: 429,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (err instanceof NotAuthenticatedError) {
            return new Response(JSON.stringify({ error: "not_authenticated" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
          throw err;
        }
      },
    },
  },
});
