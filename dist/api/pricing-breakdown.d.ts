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
    /** The copy being priced. With it the server reads the stored game, condition, per-card
     *  overrides and (for an auction) the start price; without it the breakdown is for a loose
     *  price, as before. */
    physicalCardId: z.ZodOptional<z.ZodString>;
    /** AUCTION prices the receipt at the start price, with the line note `at_start_price`. */
    format: z.ZodOptional<z.ZodEnum<["FIXED_PRICE", "AUCTION"]>>;
    /** Who bears postage for this card, for this request. Absent = the seller's Dispatch rule. */
    postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
    /** A keyed packing choice from the server-owned catalogue (open string: the catalogue is the
     *  server's, and a key a client has never seen must not fail the request). */
    packingKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    purchaseCost: number;
    price: number;
    marketMedian: number;
    collectionType?: "personal" | "resale" | undefined;
    physicalCardId?: string | undefined;
    priceSource?: string | null | undefined;
    format?: "FIXED_PRICE" | "AUCTION" | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
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
    physicalCardId?: string | undefined;
    priceSource?: string | null | undefined;
    format?: "FIXED_PRICE" | "AUCTION" | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
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
 * The richer, line-by-line answer is `PricedBreakdown` (./priced-breakdown.ts), now carried in
 * `breakdown` (v0.2.0); the flat fields remain for clients that only want the headline, and the
 * two are cross-checked below (a server-side guard: Swift/Kotlin cannot express it).
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
    /** v0.2.0. Every line of "You receive", with its source: sale price, eBay fee, postage, packing,
     *  you receive. `mode` is "selling". A client renders these lines in order and sums nothing. */
    breakdown: z.ZodEffects<z.ZodObject<{
        mode: z.ZodEnum<["selling", "buying"]>;
        lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        totals: z.ZodObject<{
            youReceiveGbp: z.ZodNullable<z.ZodNumber>;
            maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }>;
        compare: z.ZodNullable<z.ZodObject<{
            theirPriceGbp: z.ZodNumber;
            overUnderGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }>>;
        feePosition: z.ZodObject<{
            sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
            vatRegistered: z.ZodNullable<z.ZodBoolean>;
            channel: z.ZodEnum<["ebay", "direct"]>;
            feeBasis: z.ZodEnum<["derived", "seller_override", "not_set"]>;
        }, "strip", z.ZodTypeAny, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }>;
        notSet: z.ZodArray<z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>, "many">;
        price: z.ZodObject<{
            gbp: z.ZodNullable<z.ZodNumber>;
            source: z.ZodNullable<z.ZodString>;
            kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
            asOf: z.ZodNullable<z.ZodString>;
            cached: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }>;
        computedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>, {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    purchaseCost: number;
    suggestedPrice: number;
    packagingCost: number;
    shippingCost: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
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
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
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
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
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
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            estimate: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
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
