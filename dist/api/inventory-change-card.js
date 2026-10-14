// POST /api/inventory/change-card — change which card a copy is (v0.2.0, ADDITIVE).
//
// Source: pokemon-tool, GAP-006 ("Fixing the wrong card leads nowhere"), the smallest slice the
// product owner approved 2026-10-14. The seller picks a catalogue card (from POST /api/card-search)
// and the copy BECOMES that card: identity, catalogue link and game change; the physical facts of the
// copy do not.
//
//   POST /api/inventory/change-card { physical_card_id, to: { game, nativeId } }
//
// ── WHAT CHANGES AND WHAT DOES NOT (the response says it, so a client never implies a state the
//    server did not set) ────────────────────────────────────────────────────────────────────
// Changed: name, set, number, rarity, language, game, the catalogue link, the legacy `cards` row.
// `id_verified_by_seller` goes back to false and the status returns to NEEDS_ID_REVIEW: the seller
// re-confirms the new identity once.
// CLEARED: the market-price fields (eBay low/avg/top, price source, CardMarket and TCGplayer
// reference prices, the FX rates), so the next Market data refresh prices the NEW card.
// KEPT, deliberately: condition and its confirmation (a property of the physical card), the SKU
// (immutable), the asking price the seller set, the cost, notes, photos, allocation, acquisition.
// NOT refreshed (out of this slice): listing title and description, any recommendation.
//
// ── ONE COPY, ONE RESULT ─────────────────────────────────────────────────────────────────
// A refusal is a 409 (or 404/422) with this same body shape: `outcome` is `refused`, `reason` says
// why. A failed save is a 500 with `outcome: "failed"`, `reason: "write_failed"`. A body is never
// returned with outcome `changed` unless the row came back from the write.
//
// ── WORDING ───────────────────────────────────────────────────────────────────────────
// The sentences belong to @curio/copy: `changeRefusalReasonLabels` carries `live_on_ebay`, `sold`,
// `archived`, `not_found`, `write_failed`; `target_not_found` reads as `not_found` there until design
// gives it its own; `game_not_available` uses the game gate's sentence. `error` is an English
// fallback for a client with no wording of its own.
import { z } from "zod";
import { PhysicalCardStatusSchema } from "./physical-card.js";
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
export const ChangeCardRefusalReasonSchema = z.enum([
    "live_on_ebay",
    "sold",
    "archived",
    "not_found",
    "target_not_found",
    "game_not_available",
    "write_failed",
]);
export const ChangeCardOutcomeSchema = z.enum(["changed", "unchanged", "refused", "failed"]);
export const ChangeCardRequestSchema = z.object({
    /** The copy (physical record) to change. Legacy-only cards have none and cannot be changed here. */
    physical_card_id: z.string().min(1),
    /** The chosen card: a catalogue row by game and its native id (what POST /api/card-search returns). */
    to: z.object({
        game: z.string().min(1),
        nativeId: z.string().min(1),
    }),
});
/** The identity the copy now has. */
export const ChangeCardIdentitySchema = z.object({
    game: z.string(),
    nativeId: z.string(),
    catalogueCardId: z.string(),
    name: z.string(),
    setName: z.string().nullable(),
    cardNumber: z.string().nullable(),
    rarity: z.string().nullable(),
    language: z.string(),
    /** A reference URL to the card's image at its source, display only (decisions/0022); never re-hosted. */
    imageRef: z.string().nullable(),
});
export const ChangeCardResponseSchema = z.object({
    outcome: ChangeCardOutcomeSchema,
    /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
    reason: ChangeCardRefusalReasonSchema.nullable().optional(),
    /** A sentence if the client has no wording of its own for `reason`. English. */
    error: z.string().nullable().optional(),
    /** The identity the copy has now (changed, or unchanged when it already was this card). */
    identity: ChangeCardIdentitySchema.nullable().optional(),
    /** The copy's status after the change. */
    status: PhysicalCardStatusSchema.nullable().optional(),
    idVerifiedBySeller: z.boolean().nullable().optional(),
    /** Which groups of fields the change reset, so a page never implies a state it did not set. */
    cleared: z.array(z.enum(["market_price", "identity_confirmation"])).optional(),
    /** Which things the change deliberately left as they were. */
    kept: z.array(z.enum(["condition", "sku", "asking_price", "cost", "notes", "photos", "allocation"])).optional(),
    /** False when only the physical record was written and the legacy `cards` row could not be (the
     *  copy is still correct; a refresh of the legacy row happens on the next write). */
    legacyUpdated: z.boolean().nullable().optional(),
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
    if ((r.outcome === "changed" || r.outcome === "unchanged") && r.identity == null) {
        issue("identity", `outcome ${r.outcome} must carry the identity the copy now has`);
    }
});
