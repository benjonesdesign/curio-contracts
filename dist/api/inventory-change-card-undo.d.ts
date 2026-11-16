import { z } from "zod";
/**
 * Why a change was not undone. Closed; an unrecognised value is "not undone".
 *   no_change_to_undo  nothing to undo (no event, or all undone)
 *   changed_since      the named event is not the copy's current newest undoable change
 *   live_on_ebay | sold | archived | not_found   as for the change itself
 *   write_failed       the save did not happen (outcome `failed`); the copy is as it was
 */
export declare const ChangeCardUndoRefusalReasonSchema: z.ZodEnum<["no_change_to_undo", "changed_since", "live_on_ebay", "sold", "archived", "not_found", "write_failed"]>;
export type ChangeCardUndoRefusalReason = z.infer<typeof ChangeCardUndoRefusalReasonSchema>;
export declare const ChangeCardUndoOutcomeSchema: z.ZodEnum<["undone", "refused", "failed"]>;
export type ChangeCardUndoOutcome = z.infer<typeof ChangeCardUndoOutcomeSchema>;
/** The groups of fields an undo puts back (or could not). */
export declare const ChangeCardRestorableSchema: z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>;
export type ChangeCardRestorable = z.infer<typeof ChangeCardRestorableSchema>;
/**
 * A copy's identity as it was before a change. Every field is nullable: a copy that was never matched to
 * the catalogue has no catalogue link or native id, and an old event may not have every field.
 */
export declare const ChangeCardSnapshotSchema: z.ZodObject<{
    game: z.ZodNullable<z.ZodString>;
    nativeId: z.ZodNullable<z.ZodString>;
    catalogueCardId: z.ZodNullable<z.ZodString>;
    name: z.ZodNullable<z.ZodString>;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    language: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game: string | null;
    name: string | null;
    language: string | null;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string | null;
    catalogueCardId: string | null;
}, {
    game: string | null;
    name: string | null;
    language: string | null;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string | null;
    catalogueCardId: string | null;
}>;
export type ChangeCardSnapshot = z.infer<typeof ChangeCardSnapshotSchema>;
/** One change of which card a copy is. */
export declare const ChangeCardHistoryEventSchema: z.ZodObject<{
    /** The audit row id: pass it back as `event_id` to undo this change. */
    eventId: z.ZodString;
    /** ISO 8601, when the change was made. */
    changedAt: z.ZodString;
    /** What the copy was before. */
    previous: z.ZodObject<{
        game: z.ZodNullable<z.ZodString>;
        nativeId: z.ZodNullable<z.ZodString>;
        catalogueCardId: z.ZodNullable<z.ZodString>;
        name: z.ZodNullable<z.ZodString>;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    }, {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    }>;
    /** The status the copy had before (undo puts it back). */
    previousStatus: z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>;
    /** Whether the seller had confirmed the old identity (undo puts it back as it was). */
    previousIdVerifiedBySeller: z.ZodNullable<z.ZodBoolean>;
    /** What the change made it. */
    next: z.ZodObject<{
        game: z.ZodString;
        nativeId: z.ZodString;
        catalogueCardId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
        imageRef: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    }, {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    }>;
    /** True once this change has been undone. */
    undone: z.ZodBoolean;
    /** What undoing this change would put back, and what it could not (old events did not keep prices). */
    restores: z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">;
    notRestored: z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">;
}, "strip", z.ZodTypeAny, {
    undone: boolean;
    eventId: string;
    changedAt: string;
    previous: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    };
    previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
    previousIdVerifiedBySeller: boolean | null;
    next: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    };
    restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
}, {
    undone: boolean;
    eventId: string;
    changedAt: string;
    previous: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    };
    previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
    previousIdVerifiedBySeller: boolean | null;
    next: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    };
    restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
}>;
export type ChangeCardHistoryEvent = z.infer<typeof ChangeCardHistoryEventSchema>;
export declare const ChangeCardHistoryResponseSchema: z.ZodEffects<z.ZodObject<{
    physicalCardId: z.ZodString;
    /** Newest first, at most 20. Empty when the copy has never been changed. */
    events: z.ZodArray<z.ZodObject<{
        /** The audit row id: pass it back as `event_id` to undo this change. */
        eventId: z.ZodString;
        /** ISO 8601, when the change was made. */
        changedAt: z.ZodString;
        /** What the copy was before. */
        previous: z.ZodObject<{
            game: z.ZodNullable<z.ZodString>;
            nativeId: z.ZodNullable<z.ZodString>;
            catalogueCardId: z.ZodNullable<z.ZodString>;
            name: z.ZodNullable<z.ZodString>;
            setName: z.ZodNullable<z.ZodString>;
            cardNumber: z.ZodNullable<z.ZodString>;
            rarity: z.ZodNullable<z.ZodString>;
            language: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        }, {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        }>;
        /** The status the copy had before (undo puts it back). */
        previousStatus: z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>;
        /** Whether the seller had confirmed the old identity (undo puts it back as it was). */
        previousIdVerifiedBySeller: z.ZodNullable<z.ZodBoolean>;
        /** What the change made it. */
        next: z.ZodObject<{
            game: z.ZodString;
            nativeId: z.ZodString;
            catalogueCardId: z.ZodString;
            name: z.ZodString;
            setName: z.ZodNullable<z.ZodString>;
            cardNumber: z.ZodNullable<z.ZodString>;
            rarity: z.ZodNullable<z.ZodString>;
            language: z.ZodString;
            imageRef: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        }, {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        }>;
        /** True once this change has been undone. */
        undone: z.ZodBoolean;
        /** What undoing this change would put back, and what it could not (old events did not keep prices). */
        restores: z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">;
        notRestored: z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }, {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }>, "many">;
    /** Whether Undo can be offered NOW, and which change it would undo. Decided by the server: a client
     *  never derives it from `events`. */
    undo: z.ZodObject<{
        available: z.ZodBoolean;
        /** The change an undo would reverse; present exactly when `available`. */
        eventId: z.ZodNullable<z.ZodString>;
        /** Why not, when not available (never the write failure: that is an undo result, not a read). */
        reason: z.ZodNullable<z.ZodEnum<["no_change_to_undo", "changed_since", "live_on_ebay", "sold", "archived", "not_found", "write_failed"]>>;
    }, "strip", z.ZodTypeAny, {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    }, {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    }>;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    events: {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }[];
    undo: {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    };
}, {
    physicalCardId: string;
    events: {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }[];
    undo: {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    };
}>, {
    physicalCardId: string;
    events: {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }[];
    undo: {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    };
}, {
    physicalCardId: string;
    events: {
        undone: boolean;
        eventId: string;
        changedAt: string;
        previous: {
            game: string | null;
            name: string | null;
            language: string | null;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string | null;
            catalogueCardId: string | null;
        };
        previousStatus: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null;
        previousIdVerifiedBySeller: boolean | null;
        next: {
            game: string;
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            catalogueCardId: string;
            imageRef: string | null;
        };
        restores: ("status" | "identity" | "market_price" | "identity_confirmation")[];
        notRestored: ("status" | "identity" | "market_price" | "identity_confirmation")[];
    }[];
    undo: {
        available: boolean;
        reason: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null;
        eventId: string | null;
    };
}>;
export type ChangeCardHistoryResponse = z.infer<typeof ChangeCardHistoryResponseSchema>;
export declare const UndoChangeCardRequestSchema: z.ZodObject<{
    physical_card_id: z.ZodString;
    /** The change to undo, from the history the client is showing. Required so a stale screen cannot undo a
     *  different change than the one the seller saw. */
    event_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    physical_card_id: string;
    event_id: string;
}, {
    physical_card_id: string;
    event_id: string;
}>;
export type UndoChangeCardRequest = z.infer<typeof UndoChangeCardRequestSchema>;
export declare const UndoChangeCardResponseSchema: z.ZodEffects<z.ZodObject<{
    outcome: z.ZodEnum<["undone", "refused", "failed"]>;
    /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
    reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["no_change_to_undo", "changed_since", "live_on_ebay", "sold", "archived", "not_found", "write_failed"]>>>;
    /** A sentence if the client has no wording of its own for `reason`. English. */
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** The identity the copy has now (what it was before the change). */
    identity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        game: z.ZodNullable<z.ZodString>;
        nativeId: z.ZodNullable<z.ZodString>;
        catalogueCardId: z.ZodNullable<z.ZodString>;
        name: z.ZodNullable<z.ZodString>;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    }, {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    }>>>;
    /** The copy's status after the undo (what it was before the change). */
    status: z.ZodOptional<z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>>;
    idVerifiedBySeller: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    /** What went back, and what did not (to be priced again by the next Market data refresh). */
    restored: z.ZodOptional<z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">>;
    notRestored: z.ZodOptional<z.ZodArray<z.ZodEnum<["identity", "status", "identity_confirmation", "market_price"]>, "many">>;
    /** False when only the physical record was written and the legacy `cards` row could not be. */
    legacyUpdated: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    /** False when the undo happened but its own audit row could not be written (so the history will still
     *  show the change as not undone; a second undo is refused `changed_since`). */
    recorded: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    outcome: "failed" | "refused" | "undone";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null | undefined;
    identity?: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    } | null | undefined;
    recorded?: boolean | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    legacyUpdated?: boolean | null | undefined;
    notRestored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
    restored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
}, {
    outcome: "failed" | "refused" | "undone";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null | undefined;
    identity?: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    } | null | undefined;
    recorded?: boolean | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    legacyUpdated?: boolean | null | undefined;
    notRestored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
    restored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
}>, {
    outcome: "failed" | "refused" | "undone";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null | undefined;
    identity?: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    } | null | undefined;
    recorded?: boolean | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    legacyUpdated?: boolean | null | undefined;
    notRestored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
    restored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
}, {
    outcome: "failed" | "refused" | "undone";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "no_change_to_undo" | "changed_since" | null | undefined;
    identity?: {
        game: string | null;
        name: string | null;
        language: string | null;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string | null;
        catalogueCardId: string | null;
    } | null | undefined;
    recorded?: boolean | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    legacyUpdated?: boolean | null | undefined;
    notRestored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
    restored?: ("status" | "identity" | "market_price" | "identity_confirmation")[] | undefined;
}>;
export type UndoChangeCardResponse = z.infer<typeof UndoChangeCardResponseSchema>;
