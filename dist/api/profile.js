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
import { FeeNotSetReasonSchema } from "./common.js";
import { PricingSettingsSchema } from "./recommend.js";
export const SellerTypeSchema = z.enum(["private", "business"]);
/** `manual` = an explicit seller choice (onboarding, or a Settings edit). `auto` = detected from
 *  the connected eBay account at OAuth time. The distinction is what stops the auto-detect pass
 *  silently clobbering a deliberate override — see curio-shared/decisions/0006. */
export const SellerTypeSourceSchema = z.enum(["manual", "auto"]);
export const DispatchAddressSchema = z.object({
    line1: z.string().nullable(),
    city: z.string().nullable(),
    postcode: z.string().nullable(),
    /** ISO-3166 alpha-2. Always present — the column is NOT NULL with a 'GB' default. */
    country: z.string(),
});
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
    /**
     * v0.2.0 (BREAKING): NULL = the seller has not set a tax rate, and then NO tax is set aside —
     * buying or selling (owner, 2026-10-08: "tax applies only when the seller sets a rate"). It was
     * a number with the DB default 0.20, so a stored default was read as a choice and every resale
     * copy carried a 20% provision the seller never asked for. 0 is a real, chosen "no provision";
     * null is "never set". Contracts only MODEL null: the database default 0.20 becomes null in a
     * separate migration that needs Ben's go (and until it runs the server keeps sending 0.2).
     * PATCH `taxRate: null` clears a chosen rate back to "not set". A tax line appears in a
     * breakdown only when this is non-null.
     */
    taxRate: z.number().nullable(),
    minProfitPct: z.number(),
    minSaleValue: z.number(),
    postageCost: z.number(),
});
/**
 * `PricingSettingsSchema` with the two fee fields nullable (v0.2.0, BREAKING for `Profile`).
 *
 * `effectivePricingSettings` is "what the server will ACTUALLY use", with the seller-type
 * derivation applied to a null fee. When the seller type has never been confirmed there is nothing
 * to derive from, and answering with the private-seller fee (0) is the assumption this release
 * removes. So `ebayFeeRate`/`ebayFeeFixed` are null — together — exactly when `feeNotSetReason` is
 * set. A separate schema, not a loosened `PricingSettingsSchema`: that one is also a REQUEST body,
 * where the client asserts a fee and null would mean nothing. (The same holds for `taxRate`, which
 * is nullable here for the same reason: "no rate set" is an answer only the server can give.)
 */
export const EffectivePricingSettingsSchema = PricingSettingsSchema.extend({
    ebayFeeRate: z.number().nullable(),
    ebayFeeFixed: z.number().nullable(),
    /** v0.2.0: null = no tax rate set, so no tax is set aside (see `StoredPricingSettings.taxRate`). */
    taxRate: z.number().nullable(),
}).superRefine((e, ctx) => {
    if ((e.ebayFeeRate === null) !== (e.ebayFeeFixed === null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ebayFeeFixed"],
            message: "ebayFeeRate and ebayFeeFixed are one fee: both null or both numbers" });
    }
});
/**
 * A buying margin as a PERCENTAGE OF THE SALE PRICE (35 = 35%), bounded 0 <= m < 100 (the DB check,
 * PLAN-MOST-TO-PAY #224 §5: a share of the sale cannot reach 100%). 0 is a real choice ("accept any
 * profit"); (0, 1) is rejected as a rate sent by mistake, exactly as on DecideRequest.targetMarginPct
 * — the `*Pct`/`*Rate` hazard (recommend.ts) applies to a stored value as much as a request.
 */
const BuyingMarginPctSchema = z.number().min(0).lt(100).refine((v) => v === 0 || v >= 1, {
    message: "buyingTargetMarginPct is a percentage (35 = 35%), not a rate. A value between 0 and 1 " +
        "looks like a rate sent by mistake.",
});
/** A buying tax set-aside as a FRACTION (0.20 = 20%), bounded 0 <= t < 1 (DB check, #224 §5). 0 is
 *  a real, chosen "no provision"; null is "never set". */
const BuyingTaxRateSchema = z.number().min(0).lt(1);
export const ProfileSchema = z.object({
    /**
     * v0.2.0 (BREAKING): NULL until the seller has answered "private or business?" (asked once, on
     * first opening Sell or connecting eBay). Was non-null with `not null default 'private'`, so a
     * seller who had never been asked read as private and every fee downstream assumed £0.
     * Null exactly when `sellerTypeConfirmedAt` is null. An eBay-detected type is NOT an answer — it
     * is `suggestedSellerType`.
     */
    sellerType: SellerTypeSchema.nullable(),
    /** ISO time the seller answered. Null = never asked/answered. "Set" means this is non-null and
     *  nothing else (PLAN-SELLER-TYPE-FIRST-ASK §2). Read-only: written by PATCH `sellerType`. */
    sellerTypeConfirmedAt: z.string().datetime().nullable(),
    sellerTypeSource: SellerTypeSourceSchema,
    /** eBay's detected type (`sellerTypeSource` "auto"), offered as a SUGGESTION the seller
     *  confirms — never applied on its own, and only ever "business" (absence of
     *  `BusinessSellerDetails` is not evidence of a private seller). Null when there is none. */
    suggestedSellerType: SellerTypeSchema.nullable(),
    /** Only meaningful for a business seller. Null = the VAT question is unanswered (or the seller
     *  type is not set / private). Null exactly when `vatConfirmedAt` is null. */
    vatRegistered: z.boolean().nullable(),
    vatConfirmedAt: z.string().datetime().nullable(),
    /** Read-only. Why the seller's fee is unknown, or null when it is known — either from the
     *  answers above or because the seller set their own fee override (a stated cost). The same
     *  fact the server reports as `feeNotSetReason` on every priced response. */
    feeNotSetReason: FeeNotSetReasonSchema.nullable(),
    /**
     * The seller's BUYING margin, as a % of the SALE price (PLAN-MOST-TO-PAY #224 §2). Its own
     * setting with NO fallback to the selling floor (`pricingSettings.minProfitPct`): null =
     * "Not set" and there is no most-to-pay (`maxBuyUnavailableReason: "margin_not_set"`). A stored
     * default is not a choice. Null exactly when `buyingTargetMarginSetAt` is null.
     */
    buyingTargetMarginPct: BuyingMarginPctSchema.nullable(),
    buyingTargetMarginSetAt: z.string().datetime().nullable(),
    /** The tax set-aside applied to BUYING, as a FRACTION. Null = no provision (not set); 0 = the
     *  seller chose "none". Kept separate from `pricingSettings.taxRate` (which is now ALSO null =
     *  not set, v0.2.0) because #224 §5 stores them apart; whether the two should merge into one
     *  rate is a question for Ben (docs/V0.2.0-ADOPTION.md). */
    buyingTaxRate: BuyingTaxRateSchema.nullable(),
    buyingTaxRateSetAt: z.string().datetime().nullable(),
    dispatchAddress: DispatchAddressSchema,
    /** Days before unsold stock is flagged as aged on the dashboard. */
    agedInventoryDays: z.number().int(),
    /** As persisted — see StoredPricingSettingsSchema on why the fee fields are nullable. Render
     *  a null fee field as empty-with-a-placeholder, not as "0". */
    pricingSettings: StoredPricingSettingsSchema,
    /** What the server will ACTUALLY use: `pricingSettings` with ADR 0006's seller-type derivation
     *  already applied to any null fee field. v0.2.0: the fee fields are NULL while the fee position
     *  is not set (`feeNotSetReason`) — the type is now `EffectivePricingSettings`, not
     *  `PricingSettings`. Read-only (PATCH `pricingSettings` to change it). */
    effectivePricingSettings: EffectivePricingSettingsSchema,
    /** Read-only. Only the service role can flip it — never accepted on PATCH. */
    isAdmin: z.boolean(),
}).superRefine((p, ctx) => {
    // A confirmation timestamp and the value it confirms are one fact; neither may exist alone.
    const pair = (value, at, valueKey, atKey) => {
        if ((value === null) !== (at === null)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [valueKey],
                message: `${valueKey} and ${atKey} are one fact: both null (never answered) or both set` });
        }
    };
    pair(p.sellerType, p.sellerTypeConfirmedAt, "sellerType", "sellerTypeConfirmedAt");
    pair(p.vatRegistered, p.vatConfirmedAt, "vatRegistered", "vatConfirmedAt");
    pair(p.buyingTargetMarginPct, p.buyingTargetMarginSetAt, "buyingTargetMarginPct", "buyingTargetMarginSetAt");
    pair(p.buyingTaxRate, p.buyingTaxRateSetAt, "buyingTaxRate", "buyingTaxRateSetAt");
    // The effective fee is null exactly when the reason says it is.
    const effNull = p.effectivePricingSettings.ebayFeeRate === null;
    if (effNull !== (p.feeNotSetReason !== null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feeNotSetReason"],
            message: effNull
                ? "effectivePricingSettings.ebayFeeRate is null, so feeNotSetReason is required: a null fee must say why"
                : "feeNotSetReason is set but effectivePricingSettings carries a fee: a fee that is known has no reason to be missing" });
    }
    // The reason must agree with the answers it is derived from.
    if (p.feeNotSetReason === "seller_type_not_set" && p.sellerType !== null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feeNotSetReason"],
            message: "seller_type_not_set but sellerType is set" });
    }
    if (p.feeNotSetReason === "vat_not_set" && !(p.sellerType === "business" && p.vatRegistered === null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feeNotSetReason"],
            message: "vat_not_set applies only to a business seller whose VAT question is unanswered" });
    }
});
// `.partial()` returns a NEW schema object, so these are named exports rather than inlined: it
// lets the Swift/Kotlin generators registerName() them into readable `DispatchAddressPatch` /
// `StoredPricingSettingsPatch` types instead of the anonymous `DispatchAddress2` they'd otherwise
// get from the duplicate-name counter.
export const DispatchAddressPatchSchema = DispatchAddressSchema.partial();
export const StoredPricingSettingsPatchSchema = StoredPricingSettingsSchema.partial();
// Every field optional: a partial write. An omitted field is left alone; an explicitly-null
// `ebayFeeRate`/`ebayFeeFixed` clears the override back to the seller-type-derived default.
export const ProfilePatchSchema = z.object({
    /** Writing this CONFIRMS the seller type (sets `sellerTypeSource` "manual" and
     *  `sellerTypeConfirmedAt`). There is no way to PATCH it back to unset. */
    sellerType: SellerTypeSchema.optional(),
    /** v0.2.0. Writing this answers the VAT question (sets `vatConfirmedAt`). */
    vatRegistered: z.boolean().optional(),
    /** v0.2.0. Writing a margin sets `buyingTargetMarginSetAt`. Number only: PLAN-MOST-TO-PAY #224
     *  defines no way to clear a chosen margin back to "Not set". */
    buyingTargetMarginPct: BuyingMarginPctSchema.optional(),
    /** v0.2.0. 0 is a legal, deliberate "no provision". */
    buyingTaxRate: BuyingTaxRateSchema.optional(),
    dispatchAddress: DispatchAddressPatchSchema.optional(),
    agedInventoryDays: z.number().int().optional(),
    pricingSettings: StoredPricingSettingsPatchSchema.optional(),
});
/** Both GET and PATCH return the full, post-write profile, so a caller never has to re-fetch to
 *  see what its own partial write resolved to (notably `effectivePricingSettings`, which can
 *  change as a side effect of a `sellerType` write). */
export const ProfileResponseSchema = ProfileSchema;
