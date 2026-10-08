import { z } from "zod";
export declare const PricingBreakdownRequestSchema: z.ZodObject<{
    /** The price the seller is currently considering — recomputed live as they edit it. */
    price: z.ZodNumber;
    purchaseCost: z.ZodNumber;
    /** eBay sold median (25th-75th trimmed) — the reference point the breakdown is measured
     * against (Spec 06 §7's low/avg/top band, when available). */
    marketMedian: z.ZodNumber;
    /** "personal" zeroes the tax rate (CGT chattel-exemption modelling); default "resale". */
    collectionType: z.ZodOptional<z.ZodEnum<["personal", "resale"]>>;
    /** The market price's own source id (e.g. "ebay-uk-sold", "poketrace-ebay") — used only to
     * derive the response's `priceKind`, so a caller never has to know or string-match the source
     * vocabulary itself. Omit when unknown; `priceKind` then defaults to "asking", the honest
     * default when provenance isn't known. */
    priceSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Explicit settings override for a caller that already has its own (e.g. web's local,
     * not-yet-saved Settings -> Pricing draft). Omitted — the common case, and the ONLY option for
     * a caller with no local settings UI (today: iOS, Spec 06 §5) — falls back to the account's
     * saved profile settings, then lib/pricing.ts's DEFAULT_SETTINGS. Mirrors RecommendRequestSchema's
     * identical `pricingSettings` field. */
    settings: z.ZodOptional<z.ZodObject<{
        ebayFeeRate: z.ZodNumber;
        ebayFeeFixed: z.ZodNumber;
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }>>;
}, "strip", z.ZodTypeAny, {
    purchaseCost: number;
    price: number;
    marketMedian: number;
    collectionType?: "personal" | "resale" | undefined;
    priceSource?: string | null | undefined;
    settings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}, {
    purchaseCost: number;
    price: number;
    marketMedian: number;
    collectionType?: "personal" | "resale" | undefined;
    priceSource?: string | null | undefined;
    settings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}>;
export type PricingBreakdownRequest = z.infer<typeof PricingBreakdownRequestSchema>;
/** Where the market price came from, in the only two classes that matter to a seller. Hoisted
 *  from the response's inline enum in v0.2.0 so `PricedBreakdown.price.kind` can reuse it: an
 *  inline copy would have emitted `PriceKind2`. The wire values and the generated name (`PriceKind`)
 *  are unchanged. */
export declare const PriceKindSchema: z.ZodEnum<["realised", "asking"]>;
export type PriceKind = z.infer<typeof PriceKindSchema>;
/**
 * v0.2.0 (BREAKING): every figure that CONTAINS the seller's eBay fee is nullable, together, with
 * `feeNotSetReason` saying why. They are one fact:
 *
 *   `ebayFee`, `grossProfit`, `taxProvision`, `netProfit`, `netMarginPct`, `minViablePrice` and
 *   `isMarketBelowMin` are all null with a reason, or all present with no reason.
 *
 * `minViablePrice` is the price at which net-of-fees clears the seller's margin, and
 * `isMarketBelowMin` compares the market to it, so both depend on the fee as surely as `netProfit`
 * does — leaving them numbers would keep the private-seller assumption alive in the two figures a
 * seller acts on. `packagingCost` and `shippingCost` do not depend on seller type and stay numbers.
 *
 * The richer, line-by-line answer is `PricedBreakdown` (./priced-breakdown.ts), which this
 * endpoint will also carry; these flat fields remain for clients that only want the headline.
 */
export declare const PricingBreakdownResponseSchema: z.ZodEffects<z.ZodObject<{
    purchaseCost: z.ZodNumber;
    marketMedian: z.ZodNumber;
    suggestedPrice: z.ZodNumber;
    /** Null when the fee position is not set (v0.2.0) — NOT £0, which is a private seller's real fee. */
    ebayFee: z.ZodNullable<z.ZodNumber>;
    /** WHY the fee-dependent fields below are null. Null exactly when `ebayFee` is a number. */
    feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
    packagingCost: z.ZodNumber;
    shippingCost: z.ZodNumber;
    grossProfit: z.ZodNullable<z.ZodNumber>;
    taxProvision: z.ZodNullable<z.ZodNumber>;
    netProfit: z.ZodNullable<z.ZodNumber>;
    netMarginPct: z.ZodNullable<z.ZodNumber>;
    /** Spec 06 §4 — the floor below which the app should show a "below your minimum — consider
     * bundling" warning. Null with the fee (v0.2.0). */
    minViablePrice: z.ZodNullable<z.ZodNumber>;
    /** Null with the fee (v0.2.0): the comparison needs `minViablePrice`. */
    isMarketBelowMin: z.ZodNullable<z.ZodBoolean>;
    warningMsg: z.ZodNullable<z.ZodString>;
    /** Spec 06 §6's machine-readable price provenance. "realised" only for a confirmed UK-sold
     * source (today: ebay-uk-sold) — every other source (cross-region reference prices, asking
     * listings, catalogue baselines) is "asking". Derived server-side from the request's
     * `priceSource` using the same classification lib/price-confidence.ts already encodes as
     * human-readable caveat text, so a caller gets one machine-readable field instead of having to
     * string-match source ids to guess the distinction. */
    priceKind: z.ZodEnum<["realised", "asking"]>;
}, "strip", z.ZodTypeAny, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    marketMedian: number;
    ebayFee: number | null;
    grossProfit: number | null;
    taxProvision: number | null;
    netProfit: number | null;
    netMarginPct: number | null;
    minViablePrice: number | null;
    isMarketBelowMin: boolean | null;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    marketMedian: number;
    ebayFee: number | null;
    grossProfit: number | null;
    taxProvision: number | null;
    netProfit: number | null;
    netMarginPct: number | null;
    minViablePrice: number | null;
    isMarketBelowMin: boolean | null;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}>, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    marketMedian: number;
    ebayFee: number | null;
    grossProfit: number | null;
    taxProvision: number | null;
    netProfit: number | null;
    netMarginPct: number | null;
    minViablePrice: number | null;
    isMarketBelowMin: boolean | null;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    marketMedian: number;
    ebayFee: number | null;
    grossProfit: number | null;
    taxProvision: number | null;
    netProfit: number | null;
    netMarginPct: number | null;
    minViablePrice: number | null;
    isMarketBelowMin: boolean | null;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}>;
export type PricingBreakdownResponse = z.infer<typeof PricingBreakdownResponseSchema>;
