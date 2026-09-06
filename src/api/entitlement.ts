// Contract for the shared `entitlements` record — decisions/0015 (curio-shared). One
// provider-agnostic subscription state per user, written by a Stripe webhook handler (web) and an
// Apple App Store Server Notifications handler (iOS), read identically by both apps. Feature
// gating reads only `tier` + `status` — never provider-specific fields, never a client-side
// purchase claim. Ships flag-gated on both platforms; landing the contract does not make billing
// live (decisions/0015's tax/entity specifics are still pending — see that ADR before wiring a
// real Stripe/Apple account to this shape).
import { z } from "zod";

export const EntitlementTierSchema = z.enum(["free", "starter", "growth", "pro"]);
export type EntitlementTier = z.infer<typeof EntitlementTierSchema>;

export const EntitlementStatusSchema = z.enum([
  "active",
  "trialing",
  "past_due",
  "grace",
  "canceled",
  "expired",
]);
export type EntitlementStatus = z.infer<typeof EntitlementStatusSchema>;

export const EntitlementSourceSchema = z.enum(["stripe", "apple"]);
export type EntitlementSource = z.infer<typeof EntitlementSourceSchema>;

export const EntitlementSchema = z.object({
  userId: z.string().min(1),
  tier: EntitlementTierSchema,
  status: EntitlementStatusSchema,
  /** Who's billing this user — never mix gating logic with this field; gate on tier+status only. */
  source: EntitlementSourceSchema,
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean(),
  /** Free trial (decisions/0015 "Resolved product decisions" #2). Null outside a trial. */
  trialEnd: z.string().datetime().nullable(),
  updatedAt: z.string().datetime(),
});
export type Entitlement = z.infer<typeof EntitlementSchema>;

// Wire shape for GET /api/entitlement — snake_case, deliberately distinct from `EntitlementSchema`
// above. `app/api/entitlement/route.ts` (pokemon-tool) returns the raw Supabase row as-is because
// iOS decodes it with `convertFromSnakeCase`; `EntitlementSchema` is the camelCase domain shape
// used elsewhere and does not match what this route actually sends over the wire (B-32 — a client
// parsing a real response through `EntitlementSchema` throws on every call, since none of its
// required camelCase keys are present). This schema exists so a route response can be validated
// without changing the domain shape or the wire format iOS depends on. Any other route that
// returns a raw snake_case Supabase row should get its own `*ResponseSchema` next to this one
// rather than being forced through `EntitlementSchema`.
export const EntitlementResponseSchema = z.object({
  user_id: z.string().min(1),
  tier: EntitlementTierSchema,
  status: EntitlementStatusSchema,
  source: EntitlementSourceSchema,
  current_period_end: z.string().datetime(),
  cancel_at_period_end: z.boolean(),
  trial_end: z.string().datetime().nullable(),
  updated_at: z.string().datetime(),
});
export type EntitlementResponse = z.infer<typeof EntitlementResponseSchema>;
