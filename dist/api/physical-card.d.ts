import { z } from "zod";
export declare const PhysicalCardStatusSchema: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
export type PhysicalCardStatus = z.infer<typeof PhysicalCardStatusSchema>;
/**
 * One owned copy, as the API returns it (v0.2.0).
 *
 * ── `sku` IS A NON-NULL STRING ON EVERY COPY ────────────────────────────────────────────────
 * A PhysicalCard gets its SKU WHEN THE COPY IS CREATED (Ben, 2026-10-08, domain-model.md): there
 * is no "no SKU yet" state, so there is no `null` here and no "Assigned when you list" placeholder
 * to render. (PLAN-SKU-ONE-RECIPE #227 proposed minting at first list; the ruling supersedes it.)
 * An UNMATCHED copy has one too. The DB column `physical_cards.sku` is still `string | null`
 * until the web lane's backfill + NOT NULL lands; this schema is what the SERVER may send.
 *
 * RECIPE (owner, 2026-10-08): `SKU-` + 8 hex, given when the copy is ADDED, and NEVER EDITABLE:
 * no request type in this contract carries a `sku` (asserted by sku-immutable.test.ts), so there
 * is nothing to PATCH. The format is nonetheless OPAQUE to clients: display it, copy it, and NEVER
 * parse, slice, normalise, validate its shape or derive anything from it (the design frames
 * illustrate `A17-B03-0042`; they are illustrative). That is why the schema constrains it to a
 * non-empty string and no further — the recipe is the server's and a client that learned it
 * would break the day it changed.
 *
 * A BulkRecord (a counted pile) is NOT a PhysicalCard and has NO sku. (There is no BulkRecord or
 * lot wire type in this contract yet: no route defines one. When it does: a lot's cost share and
 * value use the LOW END of the asking range, the same basis as lot appraisal (owner, 2026-10-08),
 * never a midpoint or the high end, and no figure is ever multiplied by a count.) The only SKU a pile ever
 * has is the one the server mints for the single LISTING of the pile as one lot, which arrives on
 * that listing's own response (`EbayPublishSuccess.sku`), not on a record of the pile.
 */
export declare const PhysicalCardSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    /** Non-null, non-empty, opaque. See the block above. */
    sku: z.ZodString;
    status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
    game: z.ZodString;
    /** Null for a copy captured but not yet identified ("Not identified yet · Photos saved"). For an
     *  UNMATCHED copy this is the seller's TYPED name, which is unconfirmed identity. */
    name: z.ZodNullable<z.ZodString>;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    /** The condition on the copy, whether or not the seller has confirmed it. */
    condition: z.ZodNullable<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    /** True only when the SELLER chose or confirmed `condition` ("Confirmed by you"). A condition
     *  from a failed check, or one the engine assumed, is NOT confirmed, and such a copy cannot be
     *  listed (`condition_not_confirmed`). */
    conditionConfirmed: z.ZodBoolean;
    /** When the seller chose to hold it (`held_at`). Non-null whenever `status` is HELD; null for a
     *  copy that was never held (or was listed on purpose, which clears the hold). Required key. */
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
export type PhysicalCard = z.infer<typeof PhysicalCardSchema>;
