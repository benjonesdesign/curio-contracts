import { z } from "zod";
/** Where a line's figure came from. `dispatch_rules` and `profile_estimate`, which the postage
 *  function uses internally, are NOT here: #229 §"PricedBreakdown" maps them onto these seven
 *  ("No enum change"), and the service name travels in `label`. */
export declare const PricedLineSourceSchema: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
export type PricedLineSource = z.infer<typeof PricedLineSourceSchema>;
/** The only things a client may send back to change a line (ADR 0028: a client may send what the
 *  seller WANTS, never what the world COSTS). */
export declare const PricedLineEditKeySchema: z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>;
export type PricedLineEditKey = z.infer<typeof PricedLineEditKeySchema>;
export declare const PricedLineSchema: z.ZodObject<{
    /** Open string. Known values — selling: sale_price, ebay_fee, fee_vat, postage, packing,
     *  you_receive; buying: market_value, ebay_fee, fee_vat, postage, packing, tax_set_aside,
     *  target_margin, max_buy, your_time. An unknown key still renders from `label`. */
    key: z.ZodString;
    /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
     *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
     *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
     *  and clients render from `key`. */
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Null = unknown, never 0. */
    amountGbp: z.ZodNullable<z.ZodNumber>;
    source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
    /** The server filled it in; the seller never said. */
    assumed: z.ZodBoolean;
    editable: z.ZodBoolean;
    editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
    /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
     *  your_rate | buyer_pays | free_postage | estimate | asking_basis | not_included |
     *  at_start_price. */
    note: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
    key: string;
    amountGbp: number | null;
    assumed: boolean;
    editable: boolean;
    editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
    note: string | null;
    label?: string | null | undefined;
}, {
    source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
    key: string;
    amountGbp: number | null;
    assumed: boolean;
    editable: boolean;
    editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
    note: string | null;
    label?: string | null | undefined;
}>;
export type PricedLine = z.infer<typeof PricedLineSchema>;
export declare const PricedBreakdownModeSchema: z.ZodEnum<["selling", "buying"]>;
export type PricedBreakdownMode = z.infer<typeof PricedBreakdownModeSchema>;
/** The mode's own total is set; the other is null. Either is null when a `notSet` input blocks it. */
export declare const PricedTotalsSchema: z.ZodObject<{
    youReceiveGbp: z.ZodNullable<z.ZodNumber>;
    maxBuyGbp: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    maxBuyGbp: number | null;
    youReceiveGbp: number | null;
}, {
    maxBuyGbp: number | null;
    youReceiveGbp: number | null;
}>;
export type PricedTotals = z.infer<typeof PricedTotalsSchema>;
/** Buying only, and only when the client sent `theirPriceGbp`. Computed once on the server so a
 *  screen never subtracts two figures (and an offline screen shows the stored answer instead). */
export declare const PricedCompareSchema: z.ZodObject<{
    theirPriceGbp: z.ZodNumber;
    overUnderGbp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    theirPriceGbp: number;
    overUnderGbp: number;
}, {
    theirPriceGbp: number;
    overUnderGbp: number;
}>;
export type PricedCompare = z.infer<typeof PricedCompareSchema>;
export declare const PricedChannelSchema: z.ZodEnum<["ebay", "direct"]>;
export type PricedChannel = z.infer<typeof PricedChannelSchema>;
/** How the fee was arrived at. `not_set` means the fee line is null (see `notSet`). */
export declare const FeeBasisSchema: z.ZodEnum<["derived", "seller_override", "not_set"]>;
export type FeeBasis = z.infer<typeof FeeBasisSchema>;
/** What was USED. A null `sellerType`/`vatRegistered` is "not set", never "private"/"false". */
export declare const PricedFeePositionSchema: z.ZodObject<{
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
export type PricedFeePosition = z.infer<typeof PricedFeePositionSchema>;
/** An input the seller has not stated. Never rendered as a default. `targetMargin` is the buying
 *  margin (PLAN-MOST-TO-PAY #224 §5). */
export declare const PricedNotSetSchema: z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>;
export type PricedNotSet = z.infer<typeof PricedNotSetSchema>;
/** The market price behind the breakdown. `source` is the price provider's own id (open string). */
export declare const PricedPriceSchema: z.ZodObject<{
    gbp: z.ZodNullable<z.ZodNumber>;
    source: z.ZodNullable<z.ZodString>;
    kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
    /** ISO timestamp the price was fetched (`price_lookups.fetched_at`). */
    asOf: z.ZodNullable<z.ZodString>;
    /** True when this is a stored answer rather than a fresh lookup (offline "Last checked"). */
    cached: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    source: string | null;
    cached: boolean;
    kind: "realised" | "asking" | null;
    gbp: number | null;
    asOf: string | null;
}, {
    source: string | null;
    cached: boolean;
    kind: "realised" | "asking" | null;
    gbp: number | null;
    asOf: string | null;
}>;
export type PricedPrice = z.infer<typeof PricedPriceSchema>;
export declare const PricedBreakdownSchema: z.ZodEffects<z.ZodObject<{
    mode: z.ZodEnum<["selling", "buying"]>;
    /** In display order. */
    lines: z.ZodArray<z.ZodObject<{
        /** Open string. Known values — selling: sale_price, ebay_fee, fee_vat, postage, packing,
         *  you_receive; buying: market_value, ebay_fee, fee_vat, postage, packing, tax_set_aside,
         *  target_margin, max_buy, your_time. An unknown key still renders from `label`. */
        key: z.ZodString;
        /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
         *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
         *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
         *  and clients render from `key`. */
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Null = unknown, never 0. */
        amountGbp: z.ZodNullable<z.ZodNumber>;
        source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
        /** The server filled it in; the seller never said. */
        assumed: z.ZodBoolean;
        editable: z.ZodBoolean;
        editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
        /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
         *  your_rate | buyer_pays | free_postage | estimate | asking_basis | not_included |
         *  at_start_price. */
        note: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }, {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }>, "many">;
    totals: z.ZodObject<{
        youReceiveGbp: z.ZodNullable<z.ZodNumber>;
        maxBuyGbp: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
    }, {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
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
        /** ISO timestamp the price was fetched (`price_lookups.fetched_at`). */
        asOf: z.ZodNullable<z.ZodString>;
        /** True when this is a stored answer rather than a fresh lookup (offline "Last checked"). */
        cached: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    }, {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    }>;
    /** ISO timestamp. What an offline client stores and shows as "Last checked". */
    computedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    price: {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    };
    mode: "selling" | "buying";
    lines: {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }[];
    totals: {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
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
    computedAt: string;
}, {
    price: {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    };
    mode: "selling" | "buying";
    lines: {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }[];
    totals: {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
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
    computedAt: string;
}>, {
    price: {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    };
    mode: "selling" | "buying";
    lines: {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }[];
    totals: {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
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
    computedAt: string;
}, {
    price: {
        source: string | null;
        cached: boolean;
        kind: "realised" | "asking" | null;
        gbp: number | null;
        asOf: string | null;
    };
    mode: "selling" | "buying";
    lines: {
        source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
        key: string;
        amountGbp: number | null;
        assumed: boolean;
        editable: boolean;
        editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
        note: string | null;
        label?: string | null | undefined;
    }[];
    totals: {
        maxBuyGbp: number | null;
        youReceiveGbp: number | null;
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
    computedAt: string;
}>;
export type PricedBreakdown = z.infer<typeof PricedBreakdownSchema>;
