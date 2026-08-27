// Contract for GET/PATCH /api/profile (pokemon-tool) — W18 P1
// (curio-shared/canon/discovery/W18-onboarding-and-profile-discovery.md §5/§6).
//
// One server-authoritative profile, consumed identically by web and iOS. Before this existed,
// iOS wrote the `profiles` table directly as a documented stopgap (ROADMAP-COORDINATION.md
// "W18 §5 profile parity: built, but against the table, not the contract") — safe, because
// `profiles` carries owner-scoped RLS, but it meant two clients hand-mirroring one shape.
//
// PATCH is partial by design (§5 point 2): a just-in-time prompt ("set your seller type so fee
// estimates are right") writes ONE field without round-tripping the whole object, so two prompts
// answered on different devices can't clobber each other's other fields.
//
// `isAdmin` is deliberately absent from the PATCH shape: it's a privilege flag only the service
// role may flip. The DB enforces this independently — `20260711000003_profiles_is_admin.sql`
// replaced the original catch-all owner policy with granular ones whose UPDATE `with check` pins
// `is_admin` to its existing value — so omitting it here is defence in depth, not the only guard.
import { z } from "zod";
import { PricingSettingsSchema } from "./recommend.js";

export const SellerTypeSchema = z.enum(["private", "business"]);
export type SellerType = z.infer<typeof SellerTypeSchema>;

/** `manual` = an explicit seller choice (onboarding, or a Settings edit). `auto` = detected from
 *  the connected eBay account at OAuth time. The distinction is what stops the auto-detect pass
 *  silently clobbering a deliberate override — see curio-shared/decisions/0006. */
export const SellerTypeSourceSchema = z.enum(["manual", "auto"]);
export type SellerTypeSource = z.infer<typeof SellerTypeSourceSchema>;

export const DispatchAddressSchema = z.object({
  line1: z.string().nullable(),
  city: z.string().nullable(),
  postcode: z.string().nullable(),
  /** ISO-3166 alpha-2. Always present — the column is NOT NULL with a 'GB' default. */
  country: z.string(),
});
export type DispatchAddress = z.infer<typeof DispatchAddressSchema>;

/**
 * The seller's STORED pricing settings, as persisted.
 *
 * Differs from `PricingSettingsSchema` (the fully-resolved shape the engines consume) in exactly
 * one way: the two eBay fee fields are nullable, where null means **"not configured — derive it
 * from my seller type"** rather than "zero". That distinction is what ADR 0006 needs: eBay's fee
 * rate is a fact about the seller's own eBay registration (private pays £0 since Oct 2024;
 * business pays 12.8% + a fixed per-order fee + ~0.35% regulatory), not a preference the user
 * should have to look up and type in. A non-null value is an explicit override — a seller on a
 * shop subscription with negotiated rates, say.
 *
 * The other six are genuine preferences with universal defaults, unrelated to seller type, so
 * they're always populated.
 */
export const StoredPricingSettingsSchema = z.object({
  ebayFeeRate: z.number().nullable(),
  ebayFeeFixed: z.number().nullable(),
  packagingCost: z.number(),
  shippingCost: z.number(),
  taxRate: z.number(),
  minProfitPct: z.number(),
  minSaleValue: z.number(),
  postageCost: z.number(),
});
export type StoredPricingSettings = z.infer<typeof StoredPricingSettingsSchema>;

export const ProfileSchema = z.object({
  sellerType: SellerTypeSchema,
  sellerTypeSource: SellerTypeSourceSchema,
  dispatchAddress: DispatchAddressSchema,
  /** Days before unsold stock is flagged as aged on the dashboard. */
  agedInventoryDays: z.number().int(),
  /** As persisted — see StoredPricingSettingsSchema on why the fee fields are nullable. Render
   *  a null fee field as empty-with-a-placeholder, not as "0". */
  pricingSettings: StoredPricingSettingsSchema,
  /** What the server will ACTUALLY use: `pricingSettings` with ADR 0006's seller-type derivation
   *  already applied to any null fee field. Read-only (PATCH `pricingSettings` to change it) and
   *  the honest thing to show beside a blank input, so a business seller never sees a £0 fee
   *  estimate and has to work out for themselves that it's wrong. */
  effectivePricingSettings: PricingSettingsSchema,
  /** Read-only. Only the service role can flip it — never accepted on PATCH. */
  isAdmin: z.boolean(),
});
export type Profile = z.infer<typeof ProfileSchema>;

// `.partial()` returns a NEW schema object, so these are named exports rather than inlined: it
// lets the Swift/Kotlin generators registerName() them into readable `DispatchAddressPatch` /
// `StoredPricingSettingsPatch` types instead of the anonymous `DispatchAddress2` they'd otherwise
// get from the duplicate-name counter.
export const DispatchAddressPatchSchema = DispatchAddressSchema.partial();
export type DispatchAddressPatch = z.infer<typeof DispatchAddressPatchSchema>;

export const StoredPricingSettingsPatchSchema = StoredPricingSettingsSchema.partial();
export type StoredPricingSettingsPatch = z.infer<typeof StoredPricingSettingsPatchSchema>;

// Every field optional: a partial write. An omitted field is left alone; an explicitly-null
// `ebayFeeRate`/`ebayFeeFixed` clears the override back to the seller-type-derived default.
export const ProfilePatchSchema = z.object({
  sellerType: SellerTypeSchema.optional(),
  dispatchAddress: DispatchAddressPatchSchema.optional(),
  agedInventoryDays: z.number().int().optional(),
  pricingSettings: StoredPricingSettingsPatchSchema.optional(),
});
export type ProfilePatch = z.infer<typeof ProfilePatchSchema>;

/** Both GET and PATCH return the full, post-write profile, so a caller never has to re-fetch to
 *  see what its own partial write resolved to (notably `effectivePricingSettings`, which can
 *  change as a side effect of a `sellerType` write). */
export const ProfileResponseSchema = ProfileSchema;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
