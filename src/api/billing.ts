// Wire shapes for the two Stripe redirect routes in pokemon-tool — POST /api/billing/checkout
// and POST /api/billing/portal (STRIPE-INTEGRATION-SPEC.md §4). Both routes only ever hand the
// client a Stripe-hosted URL to redirect to; neither touches entitlements itself (that happens
// only via app/api/webhooks/stripe once Stripe confirms the change). Kept as two schemas, not one
// shared type, so each route can diverge later without a client depending on the other's shape —
// same reasoning as EntitlementResponseSchema getting its own schema next to EntitlementSchema.
//
// Casing checked against each route's actual `NextResponse.json(...)` call before writing this
// (B-32's lesson): both return `{ url: session.url }` on success — camelCase, single field, no
// snake_case in either response.
import { z } from "zod";

export const BillingCheckoutResponseSchema = z.object({
  url: z.string().min(1),
});
export type BillingCheckoutResponse = z.infer<typeof BillingCheckoutResponseSchema>;

export const BillingPortalResponseSchema = z.object({
  url: z.string().min(1),
});
export type BillingPortalResponse = z.infer<typeof BillingPortalResponseSchema>;
