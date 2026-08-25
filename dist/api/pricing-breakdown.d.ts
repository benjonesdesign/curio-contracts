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
export declare const PricingBreakdownResponseSchema: z.ZodObject<{
    purchaseCost: z.ZodNumber;
    marketMedian: z.ZodNumber;
    suggestedPrice: z.ZodNumber;
    ebayFee: z.ZodNumber;
    packagingCost: z.ZodNumber;
    shippingCost: z.ZodNumber;
    grossProfit: z.ZodNumber;
    taxProvision: z.ZodNumber;
    netProfit: z.ZodNumber;
    netMarginPct: z.ZodNumber;
    /** Spec 06 §4 — the floor below which the app should show a "below your minimum — consider
     * bundling" warning. */
    minViablePrice: z.ZodNumber;
    isMarketBelowMin: z.ZodBoolean;
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
    marketMedian: number;
    ebayFee: number;
    grossProfit: number;
    taxProvision: number;
    netProfit: number;
    netMarginPct: number;
    minViablePrice: number;
    isMarketBelowMin: boolean;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    marketMedian: number;
    ebayFee: number;
    grossProfit: number;
    taxProvision: number;
    netProfit: number;
    netMarginPct: number;
    minViablePrice: number;
    isMarketBelowMin: boolean;
    warningMsg: string | null;
    priceKind: "realised" | "asking";
}>;
export type PricingBreakdownResponse = z.infer<typeof PricingBreakdownResponseSchema>;
