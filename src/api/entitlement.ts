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
