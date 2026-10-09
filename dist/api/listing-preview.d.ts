import { z } from "zod";
export declare const ListingPreviewItemRequestSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** The price the seller is considering for this copy. Absent = the copy's saved price. */
    priceGbp: z.ZodOptional<z.ZodNumber>;
    /** AUCTION is priced at the start price (line note `at_start_price`). */
    format: z.ZodOptional<z.ZodEnum<["FIXED_PRICE", "AUCTION"]>>;
    /** Seller intent for this copy (ADR 0028): who bears postage, a keyed packing choice. */
    postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
    packingKey: z.ZodOptional<z.ZodString>;
    /** A caller-assigned group key — C10's groups ("List now", "Bundle", ...). Echoed on each item
     *  and used to compute `groups[].totals`, so the group captions come from the server. */
    group: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    priceGbp?: number | undefined;
    format?: "FIXED_PRICE" | "AUCTION" | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    group?: string | undefined;
}, {
    physicalCardId: string;
    priceGbp?: number | undefined;
    format?: "FIXED_PRICE" | "AUCTION" | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    group?: string | undefined;
}>;
export type ListingPreviewItemRequest = z.infer<typeof ListingPreviewItemRequestSchema>;
export declare const ListingPreviewRequestSchema: z.ZodObject<{
    /** At most 200, as the decide batch (an account-wide rate limit applies). */
    items: z.ZodArray<z.ZodObject<{
        physicalCardId: z.ZodString;
        /** The price the seller is considering for this copy. Absent = the copy's saved price. */
        priceGbp: z.ZodOptional<z.ZodNumber>;
        /** AUCTION is priced at the start price (line note `at_start_price`). */
        format: z.ZodOptional<z.ZodEnum<["FIXED_PRICE", "AUCTION"]>>;
        /** Seller intent for this copy (ADR 0028): who bears postage, a keyed packing choice. */
        postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
        packingKey: z.ZodOptional<z.ZodString>;
        /** A caller-assigned group key — C10's groups ("List now", "Bundle", ...). Echoed on each item
         *  and used to compute `groups[].totals`, so the group captions come from the server. */
        group: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        physicalCardId: string;
        priceGbp?: number | undefined;
        format?: "FIXED_PRICE" | "AUCTION" | undefined;
        postageMode?: "seller_pays" | "buyer_pays" | undefined;
        packingKey?: string | undefined;
        group?: string | undefined;
    }, {
        physicalCardId: string;
        priceGbp?: number | undefined;
        format?: "FIXED_PRICE" | "AUCTION" | undefined;
        postageMode?: "seller_pays" | "buyer_pays" | undefined;
        packingKey?: string | undefined;
        group?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    items: {
        physicalCardId: string;
        priceGbp?: number | undefined;
        format?: "FIXED_PRICE" | "AUCTION" | undefined;
        postageMode?: "seller_pays" | "buyer_pays" | undefined;
        packingKey?: string | undefined;
        group?: string | undefined;
    }[];
}, {
    items: {
        physicalCardId: string;
        priceGbp?: number | undefined;
        format?: "FIXED_PRICE" | "AUCTION" | undefined;
        postageMode?: "seller_pays" | "buyer_pays" | undefined;
        packingKey?: string | undefined;
        group?: string | undefined;
    }[];
}>;
export type ListingPreviewRequest = z.infer<typeof ListingPreviewRequestSchema>;
export declare const ListingPreviewItemSchema: z.ZodEffects<z.ZodObject<{
    /** The copy, with its SKU and status. */
    card: z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        sku: z.ZodString;
        status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
        game: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
        conditionConfirmed: z.ZodBoolean;
        heldAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    }, {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    }>, {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    }, {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    }>;
    /** True exactly when `refusalReason` is null. */
    listable: z.ZodBoolean;
    /** WHY this copy cannot publish; null when it can. The one closed list (listing-refusal.ts).
     *  A client treats an unrecognised reason as "not listable". */
    refusalReason: z.ZodNullable<z.ZodEnum<["mine", "set_aside", "unmatched", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live"]>>;
    /** What the seller would receive, line by line, at the requested price/format. NULL when the
     *  server did not price the copy because the refusal is not about the figure (Mine, set aside,
     *  not identified, game not live, already live). A copy refused for `condition_not_confirmed`
     *  or `no_price` still carries one: the row "stays in the table with what it would receive". */
    breakdown: z.ZodNullable<z.ZodEffects<z.ZodObject<{
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
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
    }>>;
    /** Whether what the seller would receive is under their floor (Rules, H8). Null when that is
     *  unknown (no breakdown, or a null `youReceiveGbp`) — never false-by-default. */
    belowFloor: z.ZodNullable<z.ZodBoolean>;
    /** The request's `group`, echoed. */
    group: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
    } | null;
    group: string | null;
    card: {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    };
    listable: boolean;
    refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
    belowFloor: boolean | null;
}, {
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
    } | null;
    group: string | null;
    card: {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    };
    listable: boolean;
    refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
    belowFloor: boolean | null;
}>, {
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
    } | null;
    group: string | null;
    card: {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    };
    listable: boolean;
    refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
    belowFloor: boolean | null;
}, {
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
    } | null;
    group: string | null;
    card: {
        id: string;
        game: string;
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        name: string | null;
        setName: string | null;
        cardNumber: string | null;
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        conditionConfirmed: boolean;
        heldAt: string | null;
    };
    listable: boolean;
    refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
    belowFloor: boolean | null;
}>;
export type ListingPreviewItem = z.infer<typeof ListingPreviewItemSchema>;
/**
 * Totals for the whole batch or one group. `youReceiveGbp` is the sum of the LISTABLE copies'
 * "you receive" — null with `unknownReason` as soon as one listable copy's figure is unknown
 * (typically `seller_type_not_set`: "no receive figure is shown and List stays enabled"), and never
 * £0 for "unknown". A group with no listable copies totals £0, which is a true sum of nothing.
 */
export declare const ListingPreviewTotalsSchema: z.ZodObject<{
    count: z.ZodNumber;
    listableCount: z.ZodNumber;
    /** Listable copies whose receipt is under the floor ("{3} cards · under your £1.50 floor"). */
    belowFloorCount: z.ZodNumber;
    youReceiveGbp: z.ZodNullable<z.ZodNumber>;
    /** WHY `youReceiveGbp` is null; null exactly when it is a number. */
    unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
}, "strip", z.ZodTypeAny, {
    count: number;
    unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    youReceiveGbp: number | null;
    listableCount: number;
    belowFloorCount: number;
}, {
    count: number;
    unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    youReceiveGbp: number | null;
    listableCount: number;
    belowFloorCount: number;
}>;
export type ListingPreviewTotals = z.infer<typeof ListingPreviewTotalsSchema>;
export declare const ListingPreviewGroupSchema: z.ZodObject<{
    key: z.ZodString;
    totals: z.ZodObject<{
        count: z.ZodNumber;
        listableCount: z.ZodNumber;
        /** Listable copies whose receipt is under the floor ("{3} cards · under your £1.50 floor"). */
        belowFloorCount: z.ZodNumber;
        youReceiveGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `youReceiveGbp` is null; null exactly when it is a number. */
        unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    }, {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    }>;
}, "strip", z.ZodTypeAny, {
    key: string;
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
}, {
    key: string;
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
}>;
export type ListingPreviewGroup = z.infer<typeof ListingPreviewGroupSchema>;
export declare const ListingPreviewResponseSchema: z.ZodEffects<z.ZodObject<{
    items: z.ZodArray<z.ZodEffects<z.ZodObject<{
        /** The copy, with its SKU and status. */
        card: z.ZodEffects<z.ZodObject<{
            id: z.ZodString;
            sku: z.ZodString;
            status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
            game: z.ZodString;
            name: z.ZodNullable<z.ZodString>;
            setName: z.ZodNullable<z.ZodString>;
            cardNumber: z.ZodNullable<z.ZodString>;
            condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
            conditionConfirmed: z.ZodBoolean;
            heldAt: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        }, {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        }>, {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        }, {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        }>;
        /** True exactly when `refusalReason` is null. */
        listable: z.ZodBoolean;
        /** WHY this copy cannot publish; null when it can. The one closed list (listing-refusal.ts).
         *  A client treats an unrecognised reason as "not listable". */
        refusalReason: z.ZodNullable<z.ZodEnum<["mine", "set_aside", "unmatched", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live"]>>;
        /** What the seller would receive, line by line, at the requested price/format. NULL when the
         *  server did not price the copy because the refusal is not about the figure (Mine, set aside,
         *  not identified, game not live, already live). A copy refused for `condition_not_confirmed`
         *  or `no_price` still carries one: the row "stays in the table with what it would receive". */
        breakdown: z.ZodNullable<z.ZodEffects<z.ZodObject<{
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
                perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
                feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                note: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
                feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                note: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        }>>;
        /** Whether what the seller would receive is under their floor (Rules, H8). Null when that is
         *  unknown (no breakdown, or a null `youReceiveGbp`) — never false-by-default. */
        belowFloor: z.ZodNullable<z.ZodBoolean>;
        /** The request's `group`, echoed. */
        group: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }, {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }>, {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }, {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }>, "many">;
    /** One entry per distinct request `group`, in first-seen order. Empty when no item named one. */
    groups: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        totals: z.ZodObject<{
            count: z.ZodNumber;
            listableCount: z.ZodNumber;
            /** Listable copies whose receipt is under the floor ("{3} cards · under your £1.50 floor"). */
            belowFloorCount: z.ZodNumber;
            youReceiveGbp: z.ZodNullable<z.ZodNumber>;
            /** WHY `youReceiveGbp` is null; null exactly when it is a number. */
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        }, "strip", z.ZodTypeAny, {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        }, {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }, {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }>, "many">;
    /** The whole batch. */
    totals: z.ZodObject<{
        count: z.ZodNumber;
        listableCount: z.ZodNumber;
        /** Listable copies whose receipt is under the floor ("{3} cards · under your £1.50 floor"). */
        belowFloorCount: z.ZodNumber;
        youReceiveGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `youReceiveGbp` is null; null exactly when it is a number. */
        unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
    }, "strip", z.ZodTypeAny, {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    }, {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    }>;
    /** The seller's floor from Rules (H8) that `belowFloor` was tested against; null when none is
     *  set. ⚠️ Whether the floor tests asking price, money received, or profit is UNRULED (#220 §6:
     *  `decideRoute`'s floor is on profit today); this schema reports the figure and the outcome and
     *  does not decide the basis. */
    floorGbp: z.ZodNullable<z.ZodNumber>;
    /** ISO timestamp. */
    computedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    items: {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }[];
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
    computedAt: string;
    groups: {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }[];
    floorGbp: number | null;
}, {
    items: {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }[];
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
    computedAt: string;
    groups: {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }[];
    floorGbp: number | null;
}>, {
    items: {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }[];
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
    computedAt: string;
    groups: {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }[];
    floorGbp: number | null;
}, {
    items: {
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                source: "seller_profile" | "ebay_policy" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
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
        } | null;
        group: string | null;
        card: {
            id: string;
            game: string;
            status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
            name: string | null;
            setName: string | null;
            cardNumber: string | null;
            sku: string;
            condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
            conditionConfirmed: boolean;
            heldAt: string | null;
        };
        listable: boolean;
        refusalReason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null;
        belowFloor: boolean | null;
    }[];
    totals: {
        count: number;
        unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        youReceiveGbp: number | null;
        listableCount: number;
        belowFloorCount: number;
    };
    computedAt: string;
    groups: {
        key: string;
        totals: {
            count: number;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            youReceiveGbp: number | null;
            listableCount: number;
            belowFloorCount: number;
        };
    }[];
    floorGbp: number | null;
}>;
export type ListingPreviewResponse = z.infer<typeof ListingPreviewResponseSchema>;
