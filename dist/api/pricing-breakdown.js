// Contract for POST /api/pricing/breakdown (pokemon-tool) — Design Spec 06 §2 "live profit
// feedback as the seller edits a price field". `lib/pricing.ts`'s `computeBreakdownForPrice` has
// existed since W3, documented for exactly this use, but nothing exposed it as a route: web calls
// it in-process, iOS cannot reach it at all. Per ADR 0011, fee/tax maths must never be re-derived
// client-side (a UK income-tax provision and an eBay fee with a fixed-plus-percent shape can't be
// reverse-engineered from a displayed total without risking a wrong number at the exact moment a
// seller is deciding a price) — this route is the only correct way for iOS to get live net-profit
// feedback on Spec 06's price step.
import { z } from "zod";
import { PricingSettingsSchema } from "./recommend.js";
export const PricingBreakdownRequestSchema = z.object({
    /** The price the seller is currently considering — recomputed live as they edit it. */
    price: z.number(),
    purchaseCost: z.number(),
    /** eBay sold median (25th-75th trimmed) — the reference point the breakdown is measured
     * against (Spec 06 §7's low/avg/top band, when available). */
    marketMedian: z.number(),
    /** "personal" zeroes the tax rate (CGT chattel-exemption modelling); default "resale". */
    collectionType: z.enum(["personal", "resale"]).optional(),
    /** The market price's own source id (e.g. "ebay-uk-sold", "poketrace-ebay") — used only to
     * derive the response's `priceKind`, so a caller never has to know or string-match the source
     * vocabulary itself. Omit when unknown; `priceKind` then defaults to "asking", the honest
     * default when provenance isn't known. */
    priceSource: z.string().nullable().optional(),
    /** Explicit settings override for a caller that already has its own (e.g. web's local,
     * not-yet-saved Settings -> Pricing draft). Omitted — the common case, and the ONLY option for
     * a caller with no local settings UI (today: iOS, Spec 06 §5) — falls back to the account's
     * saved profile settings, then lib/pricing.ts's DEFAULT_SETTINGS. Mirrors RecommendRequestSchema's
     * identical `pricingSettings` field. */
    settings: PricingSettingsSchema.optional(),
});
export const PricingBreakdownResponseSchema = z.object({
    purchaseCost: z.number(),
    marketMedian: z.number(),
    suggestedPrice: z.number(),
    ebayFee: z.number(),
    packagingCost: z.number(),
    shippingCost: z.number(),
    grossProfit: z.number(),
    taxProvision: z.number(),
    netProfit: z.number(),
    netMarginPct: z.number(),
    /** Spec 06 §4 — the floor below which the app should show a "below your minimum — consider
     * bundling" warning. */
    minViablePrice: z.number(),
    isMarketBelowMin: z.boolean(),
    warningMsg: z.string().nullable(),
    /** Spec 06 §6's machine-readable price provenance. "realised" only for a confirmed UK-sold
     * source (today: ebay-uk-sold) — every other source (cross-region reference prices, asking
     * listings, catalogue baselines) is "asking". Derived server-side from the request's
     * `priceSource` using the same classification lib/price-confidence.ts already encodes as
     * human-readable caveat text, so a caller gets one machine-readable field instead of having to
     * string-match source ids to guess the distinction. */
    priceKind: z.enum(["realised", "asking"]),
});
