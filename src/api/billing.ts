// Wire shapes for pokemon-tool's three Stripe billing routes — POST /api/billing/checkout,
// POST /api/billing/portal (STRIPE-INTEGRATION-SPEC.md §4) and POST /api/billing/withdraw
// (13-LEGAL-UX-IMPLEMENTATION-SPEC.md §6). The two redirect routes only ever hand the client a
// Stripe-hosted URL; neither touches entitlements itself (that happens only via
// app/api/webhooks/stripe once Stripe confirms the change). Kept as separate schemas, not one
// shared type, so each route can diverge later without a client depending on another's shape —
// same reasoning as EntitlementResponseSchema getting its own schema next to EntitlementSchema.
//
// Casing checked against each route's actual `NextResponse.json(...)` call before writing this
// (B-32's lesson): checkout and portal return `{ url: session.url }`; withdraw returns
// `{ refunded, deducted, refundReference }`. All camelCase — no snake_case in any of the three.
// That is the opposite of GET /api/entitlement, which is snake_case; the casing is per-route here
// and must not be assumed from a sibling.
import { z } from "zod";

export const BillingCheckoutResponseSchema = z.object({
  url: z.string().min(1),
});
export type BillingCheckoutResponse = z.infer<typeof BillingCheckoutResponseSchema>;

export const BillingPortalResponseSchema = z.object({
  url: z.string().min(1),
});
export type BillingPortalResponse = z.infer<typeof BillingPortalResponseSchema>;
// POST /api/billing/withdraw — statutory 14-day cooling-off withdrawal. Success ends the
// subscription and issues any lawful refund in one call, so the response is the receipt for
// both: what came back, what was kept, and the Stripe refund id to quote.
//
// Bounds, derived from lib/billing/coolingOff.ts rather than assumed:
//  - `refunded` is `round2(Math.max(0, price - deduction))` — never negative.
//  - `deducted` is `round2(Math.min(price, proportional + usage))` of three non-negative terms,
//    or a literal 0 on the no-early-performance path — also never negative.
// Both are GBP major units (pounds, 2dp), NOT Stripe minor units: the route divides
// `unit_amount` by 100 before the calculation and never multiplies back for the response.
//
// `refundReference` is nullable by design and null does not mean failure. The route sets it only
// when a refund was actually created at Stripe; a lawful zero-refund withdrawal, and one where
// the latest invoice carried no payment_intent, both cancel the subscription successfully and
// return null. A client that treats null as an error will report a successful withdrawal as a
// failed one.
export const BillingWithdrawResponseSchema = z.object({
  refunded: z.number().nonnegative(),
  deducted: z.number().nonnegative(),
  refundReference: z.string().min(1).nullable(),
});
export type BillingWithdrawResponse = z.infer<typeof BillingWithdrawResponseSchema>;
