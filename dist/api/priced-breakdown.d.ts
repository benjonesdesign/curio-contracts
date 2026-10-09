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
/** Who pays postage on this sale: a keyed CHOICE (ADR 0028), never a free £ figure. The postage
 *  function (#229) decides the amount from the seller's Dispatch settings; this only says which
 *  side bears it. Sent back as the `postageMode` edit. */
export declare const PostageModeSchema: z.ZodEnum<["seller_pays", "buyer_pays"]>;
export type PostageMode = z.infer<typeof PostageModeSchema>;
/** Which eBay per-order fee band applied (the fixed fee differs either side of £10). `low` is at or
 *  under £10, `high` above. Null (on the line) when the fee is not banded. */
export declare const PerOrderBandSchema: z.ZodEnum<["low", "high"]>;
export type PerOrderBand = z.infer<typeof PerOrderBandSchema>;
/**
 * The RULED default packing time (owner, 2026-10-09): a flat 4 minutes for the parcel, plus 2 for
 * each extra card in it. No letter/parcel split. Used only when the seller has set an hourly rate
 * and has not set their own minutes; the `packing_time` line is then `estimate: true`.
 */
export declare function defaultPackingMinutes(cardsInParcel: number): number;
export declare const PricedLineSchema: z.ZodEffects<z.ZodObject<{
    /** Open string. See KNOWN LINE KEYS above. An unknown key still renders from `label`. */
    key: z.ZodString;
    /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
     *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
     *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
     *  and clients render from `key`. */
    label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Null = unknown, never 0 — and then `unknownReason` says why. In pounds; value positive,
     *  deductions negative. `max_buy` is a WHOLE-POUND figure, rounded down by the server
     *  ("shown rounded down to the pound"): no screen rounds. */
    amountGbp: z.ZodNullable<z.ZodNumber>;
    /** WHY `amountGbp` is null; null exactly when it is a number. Required key, so an unexplained
     *  null cannot reach a client. The same vocabulary as `Decision.maxBuyUnavailableReason`: on the
     *  fee line it is `seller_type_not_set | vat_not_set`; on `max_buy` any of the six; on
     *  `you_receive` the fee reasons or `no_price`; on `target_margin` `margin_not_set`; on
     *  `sale_price` `no_price`. A client reads an unrecognised reason as "no figure". */
    unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
    source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
    /** The server filled it in; the seller never said. */
    assumed: z.ZodBoolean;
    /** The figure is an ESTIMATE the seller can replace or that the sale will record: the line reads
     *  "(estimate)". Not the same as `assumed`: "Packing (estimate)" is assumed until the seller sets
     *  it in Cost, but "Packing time (estimate)" is an estimate even when the seller supplied the
     *  hourly rate. */
    estimate: z.ZodBoolean;
    editable: z.ZodBoolean;
    editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
    /** True when this line is PART OF THE SUM (taken off, or the total itself); false when it is shown
     *  BESIDE the sum and never taken off (`listing_time`). Required, so a client never has to infer
     *  from the key whether to subtract a line — it subtracts nothing at all (rule 1), but it does
     *  render an excluded line apart, with "not included". */
    included: z.ZodBoolean;
    /** Whole minutes behind a time line: REQUIRED on `packing_time` and `listing_time`, absent/null
     *  elsewhere. */
    minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /** `postage` only: which Dispatch service the postage is priced on (closed, forward-compatible;
     *  NO label in the contract, the words come from @curio/copy). Null when the buyer pays (the
     *  seller's postage is £0 and no service applies) or the seller has no Dispatch rules; present
     *  when the seller pays. Free postage is a threshold, not a service. */
    service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
    /** `postage` only: which rule the figure came from (closed): `ebay_policy` for a PUBLISHED
     *  listing, `dispatch_rules` for an ESTIMATE (owner, 2026-10-09). With `ebay_policy` the line's
     *  `source` is `ebay_policy` and `service` is null (the policy has no Dispatch service). */
    postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
    /** `ebay_fee` only: which per-order band applied; null when the fee is not banded (private
     *  seller, seller override) or unknown. */
    perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
    /** `ebay_fee` only: false until eBay's page confirms the £10 band is tested on item + buyer
     *  postage (#244). Present (boolean) whenever the fee is a figure; null when it is unknown. */
    feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
     *  your_rate | buyer_pays | free_postage | estimate | asking_basis | at_start_price. */
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
}>;
export type PricedLine = z.infer<typeof PricedLineSchema>;
export declare const PricedBreakdownModeSchema: z.ZodEnum<["selling", "buying"]>;
export type PricedBreakdownMode = z.infer<typeof PricedBreakdownModeSchema>;
/** The mode's own total is set; the other is null. Either is null when a `notSet` input blocks it.
 *  `maxBuyGbp` is a whole-pound, rounded-down figure (the `max_buy` line's amount, repeated). */
export declare const PricedTotalsSchema: z.ZodObject<{
    youReceiveGbp: z.ZodNullable<z.ZodNumber>;
    maxBuyGbp: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    youReceiveGbp: number | null;
    maxBuyGbp: number | null;
}, {
    youReceiveGbp: number | null;
    maxBuyGbp: number | null;
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
 *  margin (PLAN-MOST-TO-PAY #224 §5) and exists only in a buying breakdown. */
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
export type PricedPrice = z.infer<typeof PricedPriceSchema>;
export declare const PricedBreakdownSchema: z.ZodEffects<z.ZodObject<{
    mode: z.ZodEnum<["selling", "buying"]>;
    /** In display order. */
    lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
        /** Open string. See KNOWN LINE KEYS above. An unknown key still renders from `label`. */
        key: z.ZodString;
        /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
         *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
         *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
         *  and clients render from `key`. */
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Null = unknown, never 0 — and then `unknownReason` says why. In pounds; value positive,
         *  deductions negative. `max_buy` is a WHOLE-POUND figure, rounded down by the server
         *  ("shown rounded down to the pound"): no screen rounds. */
        amountGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `amountGbp` is null; null exactly when it is a number. Required key, so an unexplained
         *  null cannot reach a client. The same vocabulary as `Decision.maxBuyUnavailableReason`: on the
         *  fee line it is `seller_type_not_set | vat_not_set`; on `max_buy` any of the six; on
         *  `you_receive` the fee reasons or `no_price`; on `target_margin` `margin_not_set`; on
         *  `sale_price` `no_price`. A client reads an unrecognised reason as "no figure". */
        unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
        /** The server filled it in; the seller never said. */
        assumed: z.ZodBoolean;
        /** The figure is an ESTIMATE the seller can replace or that the sale will record: the line reads
         *  "(estimate)". Not the same as `assumed`: "Packing (estimate)" is assumed until the seller sets
         *  it in Cost, but "Packing time (estimate)" is an estimate even when the seller supplied the
         *  hourly rate. */
        estimate: z.ZodBoolean;
        editable: z.ZodBoolean;
        editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
        /** True when this line is PART OF THE SUM (taken off, or the total itself); false when it is shown
         *  BESIDE the sum and never taken off (`listing_time`). Required, so a client never has to infer
         *  from the key whether to subtract a line — it subtracts nothing at all (rule 1), but it does
         *  render an excluded line apart, with "not included". */
        included: z.ZodBoolean;
        /** Whole minutes behind a time line: REQUIRED on `packing_time` and `listing_time`, absent/null
         *  elsewhere. */
        minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        /** `postage` only: which Dispatch service the postage is priced on (closed, forward-compatible;
         *  NO label in the contract, the words come from @curio/copy). Null when the buyer pays (the
         *  seller's postage is £0 and no service applies) or the seller has no Dispatch rules; present
         *  when the seller pays. Free postage is a threshold, not a service. */
        service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
        /** `postage` only: which rule the figure came from (closed): `ebay_policy` for a PUBLISHED
         *  listing, `dispatch_rules` for an ESTIMATE (owner, 2026-10-09). With `ebay_policy` the line's
         *  `source` is `ebay_policy` and `service` is null (the policy has no Dispatch service). */
        postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
        /** `ebay_fee` only: which per-order band applied; null when the fee is not banded (private
         *  seller, seller override) or unknown. */
        perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
        /** `ebay_fee` only: false until eBay's page confirms the £10 band is tested on item + buyer
         *  postage (#244). Present (boolean) whenever the fee is a figure; null when it is unknown. */
        feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
         *  your_rate | buyer_pays | free_postage | estimate | asking_basis | at_start_price. */
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
    /** Lines SHOWN BESIDE the sum and never in its arithmetic: today only `listing_time`, present
     *  only when the seller has an hourly rate (empty otherwise). Every one is `included: false`.
     *  Required key, so a client always knows whether there is a "beside" section. */
    beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
        /** Open string. See KNOWN LINE KEYS above. An unknown key still renders from `label`. */
        key: z.ZodString;
        /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
         *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
         *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
         *  and clients render from `key`. */
        label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Null = unknown, never 0 — and then `unknownReason` says why. In pounds; value positive,
         *  deductions negative. `max_buy` is a WHOLE-POUND figure, rounded down by the server
         *  ("shown rounded down to the pound"): no screen rounds. */
        amountGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `amountGbp` is null; null exactly when it is a number. Required key, so an unexplained
         *  null cannot reach a client. The same vocabulary as `Decision.maxBuyUnavailableReason`: on the
         *  fee line it is `seller_type_not_set | vat_not_set`; on `max_buy` any of the six; on
         *  `you_receive` the fee reasons or `no_price`; on `target_margin` `margin_not_set`; on
         *  `sale_price` `no_price`. A client reads an unrecognised reason as "no figure". */
        unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
        /** The server filled it in; the seller never said. */
        assumed: z.ZodBoolean;
        /** The figure is an ESTIMATE the seller can replace or that the sale will record: the line reads
         *  "(estimate)". Not the same as `assumed`: "Packing (estimate)" is assumed until the seller sets
         *  it in Cost, but "Packing time (estimate)" is an estimate even when the seller supplied the
         *  hourly rate. */
        estimate: z.ZodBoolean;
        editable: z.ZodBoolean;
        editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
        /** True when this line is PART OF THE SUM (taken off, or the total itself); false when it is shown
         *  BESIDE the sum and never taken off (`listing_time`). Required, so a client never has to infer
         *  from the key whether to subtract a line — it subtracts nothing at all (rule 1), but it does
         *  render an excluded line apart, with "not included". */
        included: z.ZodBoolean;
        /** Whole minutes behind a time line: REQUIRED on `packing_time` and `listing_time`, absent/null
         *  elsewhere. */
        minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        /** `postage` only: which Dispatch service the postage is priced on (closed, forward-compatible;
         *  NO label in the contract, the words come from @curio/copy). Null when the buyer pays (the
         *  seller's postage is £0 and no service applies) or the seller has no Dispatch rules; present
         *  when the seller pays. Free postage is a threshold, not a service. */
        service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
        /** `postage` only: which rule the figure came from (closed): `ebay_policy` for a PUBLISHED
         *  listing, `dispatch_rules` for an ESTIMATE (owner, 2026-10-09). With `ebay_policy` the line's
         *  `source` is `ebay_policy` and `service` is null (the policy has no Dispatch service). */
        postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
        /** `ebay_fee` only: which per-order band applied; null when the fee is not banded (private
         *  seller, seller override) or unknown. */
        perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
        /** `ebay_fee` only: false until eBay's page confirms the £10 band is tested on item + buyer
         *  postage (#244). Present (boolean) whenever the fee is a figure; null when it is unknown. */
        feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
         *  your_rate | buyer_pays | free_postage | estimate | asking_basis | at_start_price. */
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
        /** ISO timestamp the price was fetched (`price_lookups.fetched_at`). */
        asOf: z.ZodNullable<z.ZodString>;
        /** True when this is a stored answer rather than a fresh lookup (offline "Last checked"). */
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
    /** ISO timestamp. What an offline client stores and shows as "Last checked". */
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
export type PricedBreakdown = z.infer<typeof PricedBreakdownSchema>;
