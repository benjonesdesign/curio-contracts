import { z } from "zod";
/**
 * Why a copy was not changed to the chosen card. Closed; an unrecognised value is "not changed".
 *   live_on_ebay        the copy is live on a marketplace: "End the listing first. It's live on eBay."
 *   sold                a sale was made; a sold copy can't be changed
 *   archived            out of the inventory (ARCHIVED or RETURNED)
 *   not_found           no such copy for this account (another account's is indistinguishable)
 *   target_not_found    the chosen card is not in the catalogue, or is not a sourced row
 *   game_not_available  the chosen card's game is not live ("coming")
 *   write_failed        the save did not happen (outcome `failed`)
 */
export declare const ChangeCardRefusalReasonSchema: z.ZodEnum<["live_on_ebay", "sold", "archived", "not_found", "target_not_found", "game_not_available", "write_failed"]>;
export type ChangeCardRefusalReason = z.infer<typeof ChangeCardRefusalReasonSchema>;
export declare const ChangeCardOutcomeSchema: z.ZodEnum<["changed", "unchanged", "refused", "failed"]>;
export type ChangeCardOutcome = z.infer<typeof ChangeCardOutcomeSchema>;
export declare const ChangeCardRequestSchema: z.ZodObject<{
    /** The copy (physical record) to change. Legacy-only cards have none and cannot be changed here. */
    physical_card_id: z.ZodString;
    /** The chosen card: a catalogue row by game and its native id (what POST /api/card-search returns). */
    to: z.ZodObject<{
        game: z.ZodString;
        nativeId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        game: string;
        nativeId: string;
    }, {
        game: string;
        nativeId: string;
    }>;
}, "strip", z.ZodTypeAny, {
    physical_card_id: string;
    to: {
        game: string;
        nativeId: string;
    };
}, {
    physical_card_id: string;
    to: {
        game: string;
        nativeId: string;
    };
}>;
export type ChangeCardRequest = z.infer<typeof ChangeCardRequestSchema>;
/** The identity the copy now has. */
export declare const ChangeCardIdentitySchema: z.ZodObject<{
    game: z.ZodString;
    nativeId: z.ZodString;
    catalogueCardId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    language: z.ZodString;
    /** A reference URL to the card's image at its source, display only (decisions/0022); never re-hosted. */
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
export type ChangeCardIdentity = z.infer<typeof ChangeCardIdentitySchema>;
export declare const ChangeCardResponseSchema: z.ZodEffects<z.ZodObject<{
    outcome: z.ZodEnum<["changed", "unchanged", "refused", "failed"]>;
    /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
    reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["live_on_ebay", "sold", "archived", "not_found", "target_not_found", "game_not_available", "write_failed"]>>>;
    /** A sentence if the client has no wording of its own for `reason`. English. */
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** The identity the copy has now (changed, or unchanged when it already was this card). */
    identity: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        game: z.ZodString;
        nativeId: z.ZodString;
        catalogueCardId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
        /** A reference URL to the card's image at its source, display only (decisions/0022); never re-hosted. */
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
    }>>>;
    /** The copy's status after the change. */
    status: z.ZodOptional<z.ZodNullable<z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>>>;
    idVerifiedBySeller: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    /** Which groups of fields the change reset, so a page never implies a state it did not set. */
    cleared: z.ZodOptional<z.ZodArray<z.ZodEnum<["market_price", "identity_confirmation"]>, "many">>;
    /** Which things the change deliberately left as they were. */
    kept: z.ZodOptional<z.ZodArray<z.ZodEnum<["condition", "sku", "asking_price", "cost", "notes", "photos", "allocation"]>, "many">>;
    /** False when only the physical record was written and the legacy `cards` row could not be (the
     *  copy is still correct; a refresh of the legacy row happens on the next write). */
    legacyUpdated: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "game_not_available" | "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "target_not_found" | null | undefined;
    identity?: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    } | null | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    cleared?: ("market_price" | "identity_confirmation")[] | undefined;
    kept?: ("sku" | "condition" | "asking_price" | "cost" | "notes" | "photos" | "allocation")[] | undefined;
    legacyUpdated?: boolean | null | undefined;
}, {
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "game_not_available" | "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "target_not_found" | null | undefined;
    identity?: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    } | null | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    cleared?: ("market_price" | "identity_confirmation")[] | undefined;
    kept?: ("sku" | "condition" | "asking_price" | "cost" | "notes" | "photos" | "allocation")[] | undefined;
    legacyUpdated?: boolean | null | undefined;
}>, {
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "game_not_available" | "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "target_not_found" | null | undefined;
    identity?: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    } | null | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    cleared?: ("market_price" | "identity_confirmation")[] | undefined;
    kept?: ("sku" | "condition" | "asking_price" | "cost" | "notes" | "photos" | "allocation")[] | undefined;
    legacyUpdated?: boolean | null | undefined;
}, {
    outcome: "failed" | "changed" | "unchanged" | "refused";
    error?: string | null | undefined;
    status?: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD" | null | undefined;
    reason?: "game_not_available" | "sold" | "archived" | "live_on_ebay" | "not_found" | "write_failed" | "target_not_found" | null | undefined;
    identity?: {
        game: string;
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        catalogueCardId: string;
        imageRef: string | null;
    } | null | undefined;
    idVerifiedBySeller?: boolean | null | undefined;
    cleared?: ("market_price" | "identity_confirmation")[] | undefined;
    kept?: ("sku" | "condition" | "asking_price" | "cost" | "notes" | "photos" | "allocation")[] | undefined;
    legacyUpdated?: boolean | null | undefined;
}>;
export type ChangeCardResponse = z.infer<typeof ChangeCardResponseSchema>;
