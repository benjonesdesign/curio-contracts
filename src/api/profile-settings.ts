// GET/PATCH /api/profile as the SERVER ACTUALLY SERVES IT today (pokemon-tool app/api/profile/route.ts, lib/profile/settings.ts;
// written 2026-10-18, extended by item 94). v0.2.2, ADDITIVE.
//
// ── WHY THESE ARE NOT `Profile*` ────────────────────────────────────────────────────────────────
// `profile.ts` (W18 P1) already defines `ProfileSchema` / `ProfilePatchSchema` / `ProfileResponseSchema`, a DIFFERENT and larger
// shape (dispatch address, aged-inventory days, stored/effective pricing settings, `isAdmin`; GET answers the profile itself).
// The route that shipped answers `{ profile }` with the seller's pricing SETTINGS and the reasons a figure is missing, and its
// PATCH takes a different, STRICT key set. Both cannot be the contract for one URL, and renaming the old schemas would break any
// client that compiled against them, so this entry takes new names and the old ones stay untouched. Which of the two a client
// should adopt: THIS one, because it is what the route returns. Retiring the W18 schemas is a decision for the next breaking
// version, not this one.
//
// The route keeps its own zod (lib/profile/settings.ts) until clients adopt this entry; this file mirrors it field for field.
//
// ── SEMANTICS (each from a ruling; see lib/profile/settings.ts for the full reasoning) ────────────────
//   * PATCH is any non-empty subset; an unknown key is refused (400). `null` clears a setting ("not set").
//   * Percentages are plain percent numbers (35 = 35%). `incomeTaxRatePct` is 1..60 (0 is accepted and stored as not set).
//   * `handlingDays` is whole working days 1..3; `neverBidAboveGbp` a ceiling in pounds up to 1,000,000 (0 = not set).
//   * `vatRegistered` is only meaningful for a business seller (a private seller's PATCH of it is a 400 field error).
//   * The VIEW reports a figure that is missing as null with its reason in `notSet` / `feeNotSetReason`, never as a default.
// Error body for a refused PATCH: `{ error, code: "invalid_request", requestId, fields: { field: sentence } }` (400); 401
// unauthenticated; 429 rate_limited (60 changes / 5 minutes).
import { z } from "zod";
import { FeeNotSetReasonSchema } from "./common.js";
import { SellerTypeSchema } from "./profile.js";

const money = z.number().finite().min(0);

/** The Dispatch panel as it is stored. The service KEYS are the server's catalogue (open string here: the catalogue, and the
 *  rule that exactly one enabled service is the default, are checked by the server, which answers 400 `postageRules`). */
export const StoredPostageServiceSchema = z.object({
  key: z.string().min(1),
  enabled: z.boolean(),
  /** Used for items priced strictly above this. null = no threshold. */
  usedAboveGbp: money.nullable(),
  isDefault: z.boolean(),
  costOverrideGbp: money.nullable(),
});
export type StoredPostageService = z.infer<typeof StoredPostageServiceSchema>;

export const StoredPostageRulesSchema = z.object({
  v: z.literal(1),
  /** Item price strictly above which postage is free to the buyer. null = never free. */
  freePostageAboveGbp: money.nullable(),
  services: z.array(StoredPostageServiceSchema).min(1),
});
export type StoredPostageRules = z.infer<typeof StoredPostageRulesSchema>;

export const ProfileSettingsPatchSchema = z.object({
  sellerType: SellerTypeSchema.optional(),
  /** Business sellers only. */
  vatRegistered: z.boolean().optional(),
  /** A plain percent (20 = 20%); 0 is stored as not set. */
  incomeTaxRatePct: z.number().finite().min(0).max(60).refine((n) => n === 0 || n >= 1).nullable().optional(),
  /** Percent of the SALE price, 0..95; null = not set (then there is no most-to-pay). */
  buyingTargetMarginPct: z.number().finite().min(0).max(95).nullable().optional(),
  hourlyRateGbp: z.number().finite().min(0).max(1000).nullable().optional(),
  packingMaterialsGbp: z.number().finite().min(0).max(100).nullable().optional(),
  packingMinutesPerParcel: z.number().int().min(1).max(60).nullable().optional(),
  postageRules: StoredPostageRulesSchema.nullable().optional(),
  /** Whole working days promised on every listing, 1..3. */
  handlingDays: z.number().int().min(1).max(3).nullable().optional(),
  /** A hard bidding ceiling in pounds across every search; 0 or null = none. */
  neverBidAboveGbp: z.number().finite().min(0).max(1_000_000).nullable().optional(),
}).strict();
export type ProfileSettingsPatch = z.infer<typeof ProfileSettingsPatchSchema>;

/** WHY a figure is missing, so a screen shows the reason beside the input. true = not set. */
export const ProfileSettingsNotSetSchema = z.object({
  sellerType: z.boolean(),
  vatPosition: z.boolean(),
  buyingTargetMargin: z.boolean(),
  incomeTaxRate: z.boolean(),
  hourlyRate: z.boolean(),
  packingMaterials: z.boolean(),
  packingMinutes: z.boolean(),
  handlingDays: z.boolean(),
  neverBidAbove: z.boolean(),
});
export type ProfileSettingsNotSet = z.infer<typeof ProfileSettingsNotSetSchema>;

export const ProfileSettingsViewSchema = z.object({
  /** null until the seller has answered. */
  sellerType: SellerTypeSchema.nullable(),
  sellerTypeConfirmedAt: z.string().nullable(),
  /** null until a business seller has answered (and always null for a private seller). */
  vatRegistered: z.boolean().nullable(),
  vatConfirmedAt: z.string().nullable(),
  /** A plain percent (35 = 35%) of the SALE price; null = not set. */
  buyingTargetMarginPct: z.number().nullable(),
  buyingTargetMarginSetAt: z.string().nullable(),
  /** A plain percent (20 = 20%); null = not set (no tax line). */
  incomeTaxRatePct: z.number().nullable(),
  hourlyRateGbp: z.number().nullable(),
  handlingDays: z.number().int().nullable(),
  neverBidAboveGbp: z.number().nullable(),
  packingMaterialsGbp: z.number().nullable(),
  packingMinutesPerParcel: z.number().int().nullable(),
  postageRules: StoredPostageRulesSchema.nullable(),
  notSet: ProfileSettingsNotSetSchema,
  /** The eBay fee position: known (null), or the one reason it is not. */
  feeNotSetReason: FeeNotSetReasonSchema.nullable(),
  /** True when the ruled most-to-pay can produce a figure: the fee is known AND a buying margin is set. */
  mostToPayReady: z.boolean(),
});
export type ProfileSettingsView = z.infer<typeof ProfileSettingsViewSchema>;

/** GET and a successful PATCH both answer with the post-write view. */
export const ProfileSettingsResponseSchema = z.object({ profile: ProfileSettingsViewSchema });
export type ProfileSettingsResponse = z.infer<typeof ProfileSettingsResponseSchema>;

/** 400 for a refused PATCH: one sentence per field, written to be shown beside the input. */
export const ProfileSettingsInvalidSchema = z.object({
  error: z.string(),
  code: z.literal("invalid_request"),
  requestId: z.string().optional(),
  fields: z.record(z.string(), z.string()),
});
export type ProfileSettingsInvalid = z.infer<typeof ProfileSettingsInvalidSchema>;
