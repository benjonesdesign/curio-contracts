// GET /api/inventory/change-card/history and POST /api/inventory/change-card/undo (ADDITIVE, DRAFT).
//
// Source: pokemon-tool BE-6 "change-card undo" (product owner, 2026-11-13), on top of POST
// /api/inventory/change-card (inventory-change-card.ts, GAP-006). The change route already writes an
// `audit_events` row (`identity_changed`) with the copy's previous values; this contract reads that
// history and puts the newest change back. No new table: the history IS the audit rows.
//
//   GET  /api/inventory/change-card/history?physical_card_id=<id>   -> ChangeCardHistoryResponse
//   POST /api/inventory/change-card/undo { physical_card_id, event_id } -> UndoChangeCardResponse
//
// ── WHAT UNDO PUTS BACK ─────────────────────────────────────────────────────────────────
// The identity (game, name, set, number, rarity, language, native id, catalogue link), the `status` the
// copy had, and `id_verified_by_seller` as they were: exactly, not "re-confirmed". The market-price
// fields the change CLEARED are put back only when the event recorded them (changes made after this
// ships do; older events did not). The response never implies otherwise: `restored` lists what went back,
// `notRestored` lists what did not (and will be priced again by the next Market data refresh).
//
// ── WHEN IT IS NOT AVAILABLE (a refusal, nothing written, no event) ────────────────────────
//   no_change_to_undo  the copy has no change event, or every change was already undone
//   changed_since      the copy is not the card the named event left it as (it changed again, or the
//                      event is not the newest undoable one): the screen the seller was looking at is stale
//   live_on_ebay | sold | archived   the same state refusals as the change itself
//   not_found          no such copy for this account
//
// ── THE AUDIT RECORD IS WHAT MAKES UNDO POSSIBLE ───────────────────────────────────────────────
// The change itself is never reversed because its audit row failed to save (the seller's card IS
// the new card). Instead POST /api/inventory/change-card reports `undoAvailable: false` when that row
// could not be written, so a client does not offer an Undo the server cannot honour. History is read
// from the same rows, so a change with no row never appears in it.
//
// ── WORDING ───────────────────────────────────────────────────────────────────────────
// The sentences belong to @curio/copy; `error` is an English fallback for a client with no wording of
// its own. (Undo's own reasons `no_change_to_undo` and `changed_since` are awaiting design's sentences.)
import { z } from "zod";
import { PhysicalCardStatusSchema } from "./physical-card.js";
import { ChangeCardIdentitySchema } from "./inventory-change-card.js";
/**
 * Why a change was not undone. Closed; an unrecognised value is "not undone".
 *   no_change_to_undo  nothing to undo (no event, or all undone)
 *   changed_since      the named event is not the copy's current newest undoable change
 *   live_on_ebay | sold | archived | not_found   as for the change itself
 *   write_failed       the save did not happen (outcome `failed`); the copy is as it was
 */
export const ChangeCardUndoRefusalReasonSchema = z.enum([
    "no_change_to_undo",
    "changed_since",
    "live_on_ebay",
    "sold",
    "archived",
    "not_found",
    "write_failed",
]);
export const ChangeCardUndoOutcomeSchema = z.enum(["undone", "refused", "failed"]);
/** The groups of fields an undo puts back (or could not). */
export const ChangeCardRestorableSchema = z.enum(["identity", "status", "identity_confirmation", "market_price"]);
/**
 * A copy's identity as it was before a change. Every field is nullable: a copy that was never matched to
 * the catalogue has no catalogue link or native id, and an old event may not have every field.
 */
export const ChangeCardSnapshotSchema = z.object({
    game: z.string().nullable(),
    nativeId: z.string().nullable(),
    catalogueCardId: z.string().nullable(),
    name: z.string().nullable(),
    setName: z.string().nullable(),
    cardNumber: z.string().nullable(),
    rarity: z.string().nullable(),
    language: z.string().nullable(),
});
/** One change of which card a copy is. */
export const ChangeCardHistoryEventSchema = z.object({
    /** The audit row id: pass it back as `event_id` to undo this change. */
    eventId: z.string().min(1),
    /** ISO 8601, when the change was made. */
    changedAt: z.string(),
    /** What the copy was before. */
    previous: ChangeCardSnapshotSchema,
    /** The status the copy had before (undo puts it back). */
    previousStatus: PhysicalCardStatusSchema.nullable(),
    /** Whether the seller had confirmed the old identity (undo puts it back as it was). */
    previousIdVerifiedBySeller: z.boolean().nullable(),
    /** What the change made it. */
    next: ChangeCardIdentitySchema,
    /** True once this change has been undone. */
    undone: z.boolean(),
    /** What undoing this change would put back, and what it could not (old events did not keep prices). */
    restores: z.array(ChangeCardRestorableSchema),
    notRestored: z.array(ChangeCardRestorableSchema),
});
export const ChangeCardHistoryResponseSchema = z.object({
    physicalCardId: z.string(),
    /** Newest first, at most 20. Empty when the copy has never been changed. */
    events: z.array(ChangeCardHistoryEventSchema),
    /** Whether Undo can be offered NOW, and which change it would undo. Decided by the server: a client
     *  never derives it from `events`. */
    undo: z.object({
        available: z.boolean(),
        /** The change an undo would reverse; present exactly when `available`. */
        eventId: z.string().nullable(),
        /** Why not, when not available (never the write failure: that is an undo result, not a read). */
        reason: ChangeCardUndoRefusalReasonSchema.nullable(),
    }),
}).superRefine((r, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["undo", path], message });
    if (r.undo.available && r.undo.eventId == null)
        issue("eventId", "an available undo names the change it would reverse");
    if (r.undo.available && r.undo.reason != null)
        issue("reason", "an available undo has no reason");
    if (!r.undo.available && r.undo.reason == null)
        issue("reason", "an unavailable undo must say why");
    if (!r.undo.available && r.undo.eventId != null)
        issue("eventId", "an unavailable undo names no change");
    if (r.undo.reason === "write_failed")
        issue("reason", "write_failed is an undo result, not a history reason");
});
export const UndoChangeCardRequestSchema = z.object({
    physical_card_id: z.string().min(1),
    /** The change to undo, from the history the client is showing. Required so a stale screen cannot undo a
     *  different change than the one the seller saw. */
    event_id: z.string().min(1),
});
export const UndoChangeCardResponseSchema = z.object({
    outcome: ChangeCardUndoOutcomeSchema,
    /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
    reason: ChangeCardUndoRefusalReasonSchema.nullable().optional(),
    /** A sentence if the client has no wording of its own for `reason`. English. */
    error: z.string().nullable().optional(),
    /** The identity the copy has now (what it was before the change). */
    identity: ChangeCardSnapshotSchema.nullable().optional(),
    /** The copy's status after the undo (what it was before the change). */
    status: PhysicalCardStatusSchema.nullable().optional(),
    idVerifiedBySeller: z.boolean().nullable().optional(),
    /** What went back, and what did not (to be priced again by the next Market data refresh). */
    restored: z.array(ChangeCardRestorableSchema).optional(),
    notRestored: z.array(ChangeCardRestorableSchema).optional(),
    /** False when only the physical record was written and the legacy `cards` row could not be. */
    legacyUpdated: z.boolean().nullable().optional(),
    /** False when the undo happened but its own audit row could not be written (so the history will still
     *  show the change as not undone; a second undo is refused `changed_since`). */
    recorded: z.boolean().optional(),
}).superRefine((r, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
    const hasReason = r.reason != null;
    const needsReason = r.outcome === "refused" || r.outcome === "failed";
    if (needsReason !== hasReason) {
        issue("reason", needsReason
            ? `outcome ${r.outcome} must say why: reason is required`
            : `outcome ${r.outcome} has a reason: only refused or failed results carry one`);
    }
    if (r.outcome === "failed" && r.reason != null && r.reason !== "write_failed") {
        issue("reason", "a failed result's reason is write_failed");
    }
    if (r.outcome === "refused" && r.reason === "write_failed") {
        issue("reason", "write_failed is a failure, not a refusal: outcome must be failed");
    }
    if (r.outcome === "undone" && r.identity == null) {
        issue("identity", "an undone result must carry the identity the copy now has");
    }
});
