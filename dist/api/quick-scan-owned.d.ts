import { z } from "zod";
export declare const OwnedCopySchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** The copy's SKU. Never null: every copy has one ("no SKU yet" does not exist, Ben 2026-10-08). E1e lists copies by it. */
    sku: z.ZodString;
    /** The condition on the copy, when it has one. */
    condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    /** True when the SELLER confirmed `condition`; false when it is the default assumption. Copy reads "confirmed by you". */
    conditionConfirmedBySeller: z.ZodBoolean;
    status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
    /** True when this copy is live on a channel right now. */
    listed: z.ZodBoolean;
    /** The channel it is listed on (e.g. "ebay"), null when not listed. */
    channel: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
    physicalCardId: string;
    channel: string | null;
    listed: boolean;
    conditionConfirmedBySeller: boolean;
}, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
    physicalCardId: string;
    channel: string | null;
    listed: boolean;
    conditionConfirmedBySeller: boolean;
}>;
export type OwnedCopy = z.infer<typeof OwnedCopySchema>;
export declare const OwnedCopiesSummarySchema: z.ZodEffects<z.ZodObject<{
    /** How many copies of this card the seller owns (any status that is still stock). */
    count: z.ZodNumber;
    /** Distinct seller-confirmed conditions across the copies. */
    conditions: z.ZodDefault<z.ZodArray<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>, "many">>;
    /** Copies currently live on eBay ("{n} listed on eBay"). */
    listedOnEbayCount: z.ZodNumber;
    /** One per copy, oldest first. Empty exactly when `count` is 0. */
    copies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        physicalCardId: z.ZodString;
        /** The copy's SKU. Never null: every copy has one ("no SKU yet" does not exist, Ben 2026-10-08). E1e lists copies by it. */
        sku: z.ZodString;
        /** The condition on the copy, when it has one. */
        condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
        /** True when the SELLER confirmed `condition`; false when it is the default assumption. Copy reads "confirmed by you". */
        conditionConfirmedBySeller: z.ZodBoolean;
        status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
        /** True when this copy is live on a channel right now. */
        listed: z.ZodBoolean;
        /** The channel it is listed on (e.g. "ebay"), null when not listed. */
        channel: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }, {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    count: number;
    conditions: ("NM" | "LP" | "MP" | "HP" | "DMG" | "Graded")[];
    listedOnEbayCount: number;
    copies: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }[];
}, {
    count: number;
    listedOnEbayCount: number;
    conditions?: ("NM" | "LP" | "MP" | "HP" | "DMG" | "Graded")[] | undefined;
    copies?: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }[] | undefined;
}>, {
    count: number;
    conditions: ("NM" | "LP" | "MP" | "HP" | "DMG" | "Graded")[];
    listedOnEbayCount: number;
    copies: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }[];
}, {
    count: number;
    listedOnEbayCount: number;
    conditions?: ("NM" | "LP" | "MP" | "HP" | "DMG" | "Graded")[] | undefined;
    copies?: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }[] | undefined;
}>;
export type OwnedCopiesSummary = z.infer<typeof OwnedCopiesSummarySchema>;
export declare const QuickScanMarketSchema: z.ZodEffects<z.ZodObject<{
    /** Low and high ends of the price range, GBP. Null when unknown. */
    lowGbp: z.ZodNullable<z.ZodNumber>;
    highGbp: z.ZodNullable<z.ZodNumber>;
    /** Median asking price across the live listings the range came from, GBP. Null when unknown. */
    medianAskGbp: z.ZodNullable<z.ZodNumber>;
    /** How many live listings the figures rest on. Null when the source does not say. */
    listingCount: z.ZodNullable<z.ZodNumber>;
    /** The price's source id, as `price.source`, repeated so the market line stands alone. */
    source: z.ZodNullable<z.ZodString>;
    /** ISO 8601: the catalogue fetch date (one per card, no per-comp dates). */
    fetchedAt: z.ZodNullable<z.ZodString>;
    /** Why the figures are null, when they are. Null when the range is present. */
    unavailableReason: z.ZodDefault<z.ZodNullable<z.ZodEnum<["not_priced", "no_listings", "provider_outage"]>>>;
}, "strip", z.ZodTypeAny, {
    source: string | null;
    lowGbp: number | null;
    highGbp: number | null;
    medianAskGbp: number | null;
    listingCount: number | null;
    fetchedAt: string | null;
    unavailableReason: "not_priced" | "no_listings" | "provider_outage" | null;
}, {
    source: string | null;
    lowGbp: number | null;
    highGbp: number | null;
    medianAskGbp: number | null;
    listingCount: number | null;
    fetchedAt: string | null;
    unavailableReason?: "not_priced" | "no_listings" | "provider_outage" | null | undefined;
}>, {
    source: string | null;
    lowGbp: number | null;
    highGbp: number | null;
    medianAskGbp: number | null;
    listingCount: number | null;
    fetchedAt: string | null;
    unavailableReason: "not_priced" | "no_listings" | "provider_outage" | null;
}, {
    source: string | null;
    lowGbp: number | null;
    highGbp: number | null;
    medianAskGbp: number | null;
    listingCount: number | null;
    fetchedAt: string | null;
    unavailableReason?: "not_priced" | "no_listings" | "provider_outage" | null | undefined;
}>;
export type QuickScanMarket = z.infer<typeof QuickScanMarketSchema>;
export declare const KeepItRequestSchema: z.ZodObject<{
    /** The identity the scan resolved: `match.game` and `match.nativeId`. */
    game: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
    nativeId: z.ZodString;
    /** Optional condition the seller chose. Absent adds the copy with no confirmed condition. */
    condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    /** Idempotency key: the same id never adds a second copy. */
    clientRequestId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    nativeId: string;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    clientRequestId?: string | undefined;
}, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    nativeId: string;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    clientRequestId?: string | undefined;
}>;
export type KeepItRequest = z.infer<typeof KeepItRequestSchema>;
export declare const KeepItOutcomeSchema: z.ZodEnum<["added", "refused", "failed"]>;
export type KeepItOutcome = z.infer<typeof KeepItOutcomeSchema>;
export declare const KeepItRefusalReasonSchema: z.ZodEnum<["card_unknown", "game_unavailable", "copy_limit_reached"]>;
export type KeepItRefusalReason = z.infer<typeof KeepItRefusalReasonSchema>;
export declare const KeepItResponseSchema: z.ZodEffects<z.ZodObject<{
    outcome: z.ZodEnum<["added", "refused", "failed"]>;
    /** The copy that was added (or, when `replayed`, the one already added). Present exactly when `added`. */
    copy: z.ZodNullable<z.ZodObject<{
        physicalCardId: z.ZodString;
        /** The copy's SKU. Never null: every copy has one ("no SKU yet" does not exist, Ben 2026-10-08). E1e lists copies by it. */
        sku: z.ZodString;
        /** The condition on the copy, when it has one. */
        condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
        /** True when the SELLER confirmed `condition`; false when it is the default assumption. Copy reads "confirmed by you". */
        conditionConfirmedBySeller: z.ZodBoolean;
        status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
        /** True when this copy is live on a channel right now. */
        listed: z.ZodBoolean;
        /** The channel it is listed on (e.g. "ebay"), null when not listed. */
        channel: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }, {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    }>>;
    /** 1-based position of this copy among the seller's copies of the card ("Added as your 2nd copy"). */
    ordinal: z.ZodNullable<z.ZodNumber>;
    /** How many copies of the card the seller owns now. */
    ownedCount: z.ZodNullable<z.ZodNumber>;
    /** True when this request id had already added the copy. */
    replayed: z.ZodDefault<z.ZodBoolean>;
    /** Present exactly when `failed`: true when trying again can work (a write hiccup), false when it cannot. */
    retryable: z.ZodDefault<z.ZodNullable<z.ZodBoolean>>;
    /** Why nothing was added. Present exactly when `refused`. */
    reason: z.ZodDefault<z.ZodNullable<z.ZodEnum<["card_unknown", "game_unavailable", "copy_limit_reached"]>>>;
}, "strip", z.ZodTypeAny, {
    reason: "card_unknown" | "game_unavailable" | "copy_limit_reached" | null;
    outcome: "failed" | "added" | "refused";
    copy: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    } | null;
    ordinal: number | null;
    ownedCount: number | null;
    replayed: boolean;
    retryable: boolean | null;
}, {
    outcome: "failed" | "added" | "refused";
    copy: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    } | null;
    ordinal: number | null;
    ownedCount: number | null;
    reason?: "card_unknown" | "game_unavailable" | "copy_limit_reached" | null | undefined;
    replayed?: boolean | undefined;
    retryable?: boolean | null | undefined;
}>, {
    reason: "card_unknown" | "game_unavailable" | "copy_limit_reached" | null;
    outcome: "failed" | "added" | "refused";
    copy: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    } | null;
    ordinal: number | null;
    ownedCount: number | null;
    replayed: boolean;
    retryable: boolean | null;
}, {
    outcome: "failed" | "added" | "refused";
    copy: {
        status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
        sku: string;
        condition: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | null;
        physicalCardId: string;
        channel: string | null;
        listed: boolean;
        conditionConfirmedBySeller: boolean;
    } | null;
    ordinal: number | null;
    ownedCount: number | null;
    reason?: "card_unknown" | "game_unavailable" | "copy_limit_reached" | null | undefined;
    replayed?: boolean | undefined;
    retryable?: boolean | null | undefined;
}>;
export type KeepItResponse = z.infer<typeof KeepItResponseSchema>;
export declare const UndoKeepItRequestSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
}, {
    physicalCardId: string;
}>;
export type UndoKeepItRequest = z.infer<typeof UndoKeepItRequestSchema>;
export declare const UndoKeepItOutcomeSchema: z.ZodEnum<["undone", "refused", "failed"]>;
export declare const UndoKeepItRefusalReasonSchema: z.ZodEnum<["not_found", "changed_since", "not_kept_from_scan"]>;
export declare const UndoKeepItResponseSchema: z.ZodEffects<z.ZodObject<{
    outcome: z.ZodEnum<["undone", "refused", "failed"]>;
    /** How many copies of the card the seller owns after the undo. Null unless `undone`. */
    ownedCount: z.ZodNullable<z.ZodNumber>;
    reason: z.ZodDefault<z.ZodNullable<z.ZodEnum<["not_found", "changed_since", "not_kept_from_scan"]>>>;
}, "strip", z.ZodTypeAny, {
    reason: "not_found" | "changed_since" | "not_kept_from_scan" | null;
    outcome: "failed" | "refused" | "undone";
    ownedCount: number | null;
}, {
    outcome: "failed" | "refused" | "undone";
    ownedCount: number | null;
    reason?: "not_found" | "changed_since" | "not_kept_from_scan" | null | undefined;
}>, {
    reason: "not_found" | "changed_since" | "not_kept_from_scan" | null;
    outcome: "failed" | "refused" | "undone";
    ownedCount: number | null;
}, {
    outcome: "failed" | "refused" | "undone";
    ownedCount: number | null;
    reason?: "not_found" | "changed_since" | "not_kept_from_scan" | null | undefined;
}>;
export type UndoKeepItResponse = z.infer<typeof UndoKeepItResponseSchema>;
