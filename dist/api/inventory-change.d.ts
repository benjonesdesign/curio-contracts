import { z } from "zod";
/**
 * Why a copy was not changed. Closed; an unrecognised value is "not changed" (decisions/0027).
 *   live_on_ebay   on a marketplace: "End the listing first. It's live on eBay."
 *   sold           a sale was made; sold copies archive only
 *   archived       out of the inventory (ARCHIVED or RETURNED)
 *   set_aside      Mark Mine is not offered on a set-aside copy
 *   not_found      no such copy for this account (another account's is indistinguishable)
 *   write_failed   the copy was fine but the save did not happen (outcome `failed`)
 */
export declare const InventoryChangeRefusalReasonSchema: z.ZodEnum<["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed"]>;
export type InventoryChangeRefusalReason = z.infer<typeof InventoryChangeRefusalReasonSchema>;
/** What happened to one copy. `unchanged` = already as asked (an Undo of an Undo): nothing written,
 *  no audit row. */
export declare const InventoryChangeOutcomeSchema: z.ZodEnum<["changed", "unchanged", "refused", "failed"]>;
export type InventoryChangeOutcome = z.infer<typeof InventoryChangeOutcomeSchema>;
export declare const MineRequestSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
    /** true = Mark Mine; false = Change to stock (the only way back). */
    mine: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    mine: boolean;
    ids: string[];
}, {
    mine: boolean;
    ids: string[];
}>;
export type MineRequest = z.infer<typeof MineRequestSchema>;
export declare const SetAsideRequestSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
    /** The seller's chip. Omitted or null = skipped (allowed, WE3j-AC1). Never free text. */
    reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["looks_off", "altered_or_damaged", "unsupported_game", "other"]>>>;
}, "strip", z.ZodTypeAny, {
    ids: string[];
    reason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}, {
    ids: string[];
    reason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}>;
export type SetAsideRequest = z.infer<typeof SetAsideRequestSchema>;
export declare const PutBackRequestSchema: z.ZodObject<{
    ids: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    ids: string[];
}, {
    ids: string[];
}>;
export type PutBackRequest = z.infer<typeof PutBackRequestSchema>;
export declare const InventoryChangeResultSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    outcome: z.ZodEnum<["changed", "unchanged", "refused", "failed"]>;
    /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
    reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed"]>>>;
    /** A sentence to show if the client has no wording of its own for `reason`. English: wording
     *  belongs to @curio/copy, so a client with its own string ignores this. */
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** The copy's status after a change that wrote one (set aside, put back). */
    status: z.ZodOptional<z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>>;
    /** Mark Mine replaced a bundle/show/venue earmark (one column); the channel it replaced. */
    replacedChannel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Set aside dropped an earmark (a bundle finds its members by that column); the channel dropped. */
    droppedChannel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Put back: the reason the copy had been set aside with, so Undo of a put-back can set it aside
     *  again with the same reason. */
    previousReason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["looks_off", "altered_or_damaged", "unsupported_game", "other"]>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
    replacedChannel?: string | null | undefined;
    droppedChannel?: string | null | undefined;
    previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}, {
    id: string;
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
    replacedChannel?: string | null | undefined;
    droppedChannel?: string | null | undefined;
    previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}>, {
    id: string;
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
    replacedChannel?: string | null | undefined;
    droppedChannel?: string | null | undefined;
    previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}, {
    id: string;
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
    replacedChannel?: string | null | undefined;
    droppedChannel?: string | null | undefined;
    previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
}>;
export type InventoryChangeResult = z.infer<typeof InventoryChangeResultSchema>;
export declare const InventoryChangeSummarySchema: z.ZodObject<{
    changed: z.ZodNumber;
    unchanged: z.ZodNumber;
    refused: z.ZodNumber;
    failed: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    failed: number;
    changed: number;
    unchanged: number;
    refused: number;
}, {
    failed: number;
    changed: number;
    unchanged: number;
    refused: number;
}>;
export type InventoryChangeSummary = z.infer<typeof InventoryChangeSummarySchema>;
/** The answer of all three routes: one result per copy, in the order asked (repeats dropped), and a
 *  summary that is exactly the tally of the results. */
export declare const InventoryChangeResponseSchema: z.ZodEffects<z.ZodObject<{
    results: z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        outcome: z.ZodEnum<["changed", "unchanged", "refused", "failed"]>;
        /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
        reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed"]>>>;
        /** A sentence to show if the client has no wording of its own for `reason`. English: wording
         *  belongs to @curio/copy, so a client with its own string ignores this. */
        error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** The copy's status after a change that wrote one (set aside, put back). */
        status: z.ZodOptional<z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>>;
        /** Mark Mine replaced a bundle/show/venue earmark (one column); the channel it replaced. */
        replacedChannel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Set aside dropped an earmark (a bundle finds its members by that column); the channel dropped. */
        droppedChannel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Put back: the reason the copy had been set aside with, so Undo of a put-back can set it aside
         *  again with the same reason. */
        previousReason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["looks_off", "altered_or_damaged", "unsupported_game", "other"]>>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }, {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }>, {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }, {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }>, "many">;
    summary: z.ZodObject<{
        changed: z.ZodNumber;
        unchanged: z.ZodNumber;
        refused: z.ZodNumber;
        failed: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    }, {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    }>;
}, "strip", z.ZodTypeAny, {
    results: {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }[];
    summary: {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    };
}, {
    results: {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }[];
    summary: {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    };
}>, {
    results: {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }[];
    summary: {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    };
}, {
    results: {
        id: string;
        outcome: "failed" | "changed" | "unchanged" | "refused";
        error?: string | null | undefined;
        status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
        reason?: "set_aside" | "live_on_ebay" | "sold" | "archived" | "not_found" | "write_failed" | null | undefined;
        replacedChannel?: string | null | undefined;
        droppedChannel?: string | null | undefined;
        previousReason?: "looks_off" | "altered_or_damaged" | "unsupported_game" | "other" | null | undefined;
    }[];
    summary: {
        failed: number;
        changed: number;
        unchanged: number;
        refused: number;
    };
}>;
export type InventoryChangeResponse = z.infer<typeof InventoryChangeResponseSchema>;
/** Copies still in inventory (not sold, not archived), a PARTITION: set aside wins over Mine. A
 *  different base from `totalCards`. HELD and UNMATCHED copies are in `stock` as copies, but in no
 *  value. */
export declare const InventoryCountsSchema: z.ZodObject<{
    stock: z.ZodNumber;
    mine: z.ZodNumber;
    setAside: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    mine: number;
    stock: number;
    setAside: number;
}, {
    mine: number;
    stock: number;
    setAside: number;
}>;
export type InventoryCounts = z.infer<typeof InventoryCountsSchema>;
/**
 * The Mine copies' market range, valued APART from stock. `lowGbp`/`highGbp` are null when no Mine
 * copy is priced (never 0: unknown is not £0). A half range (one end only) is not priced.
 * `count` = `pricedCount` + `notPricedCount`. `sources` = the distinct price sources of the priced
 * ones (open strings; empty until a source is recorded).
 */
export declare const CollectionValueSchema: z.ZodEffects<z.ZodObject<{
    count: z.ZodNumber;
    pricedCount: z.ZodNumber;
    notPricedCount: z.ZodNumber;
    lowGbp: z.ZodNullable<z.ZodNumber>;
    highGbp: z.ZodNullable<z.ZodNumber>;
    sources: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    lowGbp: number | null;
    count: number;
    pricedCount: number;
    notPricedCount: number;
    highGbp: number | null;
    sources: string[];
}, {
    lowGbp: number | null;
    count: number;
    pricedCount: number;
    notPricedCount: number;
    highGbp: number | null;
    sources: string[];
}>, {
    lowGbp: number | null;
    count: number;
    pricedCount: number;
    notPricedCount: number;
    highGbp: number | null;
    sources: string[];
}, {
    lowGbp: number | null;
    count: number;
    pricedCount: number;
    notPricedCount: number;
    highGbp: number | null;
    sources: string[];
}>;
export type CollectionValue = z.infer<typeof CollectionValueSchema>;
export declare const StatsResponseSchema: z.ZodObject<{
    /** Copies per status. Keys are statuses (a client treats an unknown key as "other"). */
    statusCounts: z.ZodRecord<z.ZodString, z.ZodNumber>;
    /** Money spent on copies still held (not archived, not sold). Not a value; unchanged by Mine. */
    costBasis: z.ZodNumber;
    /** STOCK value: the seller's price on READY_TO_LIST and LISTED stock. Mine (valued apart in
     *  `collectionValue`), set-aside, HELD, UNMATCHED, sold and archived copies are not in it. */
    estValue: z.ZodNumber;
    realisedGain: z.ZodNumber;
    agedListings: z.ZodNumber;
    /** All copies except ARCHIVED. */
    totalCards: z.ZodNumber;
    counts: z.ZodObject<{
        stock: z.ZodNumber;
        mine: z.ZodNumber;
        setAside: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        mine: number;
        stock: number;
        setAside: number;
    }, {
        mine: number;
        stock: number;
        setAside: number;
    }>;
    collectionValue: z.ZodEffects<z.ZodObject<{
        count: z.ZodNumber;
        pricedCount: z.ZodNumber;
        notPricedCount: z.ZodNumber;
        lowGbp: z.ZodNullable<z.ZodNumber>;
        highGbp: z.ZodNullable<z.ZodNumber>;
        sources: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    }, {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    }>, {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    }, {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    costBasis: number;
    statusCounts: Record<string, number>;
    estValue: number;
    realisedGain: number;
    agedListings: number;
    totalCards: number;
    counts: {
        mine: number;
        stock: number;
        setAside: number;
    };
    collectionValue: {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    };
}, {
    costBasis: number;
    statusCounts: Record<string, number>;
    estValue: number;
    realisedGain: number;
    agedListings: number;
    totalCards: number;
    counts: {
        mine: number;
        stock: number;
        setAside: number;
    };
    collectionValue: {
        lowGbp: number | null;
        count: number;
        pricedCount: number;
        notPricedCount: number;
        highGbp: number | null;
        sources: string[];
    };
}>;
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
