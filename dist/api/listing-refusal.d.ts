import { z } from "zod";
/**
 * WHY a copy cannot be listed. Closed. Precedence when several apply is the server's call; the
 * recommended order (matching #243's predicate, then the rest) is:
 * set_aside, mine, unmatched, slab_unverified, game_not_available, already_live, sold, archived,
 * condition_not_confirmed, no_price, no_sku.
 *
 *  - `mine`                    the seller keeps it (`allocation_channel = keep`). A copy is Mine OR
 *                              stock; the only way back is "Change to stock".
 *  - `set_aside`               status EXCEPTION. Kept, never priced or listed.
 *  - `unmatched`               status UNMATCHED ("Not identified"): no catalogue match, so nothing
 *                              to list against. Identify it first.
 *  - `slab_unverified`         a graded slab whose cert the server has not verified (see
 *                              `GradedCreateResponse.certVerified`). Ben's ruling: an unverified
 *                              slab is NEVER listed as graded. Replaces the flat
 *                              `graded_not_verified` (400) that is on main today. Fix: verify the
 *                              cert (PSA), or list it as ungraded with the condition confirmed.
 *  - `condition_not_confirmed` the seller has not chosen/confirmed a condition (or the only one
 *                              came from a failed check). The description is written from it.
 *  - `no_price`                no price on the copy (nothing to list at). "Price these first".
 *  - `no_sku`                  the copy has no SKU. With SKU-at-creation this is a data defect (a
 *                              legacy row before the backfill), not a state a seller reaches.
 *  - `game_not_available`      its game is "coming" (Pokémon only at beta). Existing Magic /
 *                              Yu-Gi-Oh! copies stay visible and editable but are not listed.
 *  - `already_live`            the copy is already on a marketplace; a second listing would
 *                              duplicate it.
 *  - `sold`                    the copy has been sold (SOLD, PICKED, DISPATCHED, COMPLETED, or a
 *                              recorded sale): there is nothing left to list. Shown for a listing
 *                              ATTEMPT on one (C16b, WE2b, E9k). Provisional until design confirms.
 *  - `archived`                the copy is out of the inventory (ARCHIVED or RETURNED). Same screens.
 *
 *    SEPARATE FROM `InventoryChangeRefusalReason` (inventory-change.ts). That enum answers a
 *    different question ("why was this copy not CHANGED: marked Mine, set aside, put back"). Its
 *    wire strings may COINCIDE with some of these (`sold`, `archived`, `set_aside`), but the two
 *    enums, their meanings and their LABEL GROUPS do not: these reasons are labelled from
 *    @curio/copy's `listingRefusalReasonLabels` (and `listingRefusalShortLabels` for a table cell),
 *    the change refusals from its own `changeRefusalReasonLabels`. A client never maps one enum's
 *    value through the other's labels.
 *
 * NOT here, deliberately: `held`. A HELD copy may be listed on purpose (it moves to
 * READY_TO_LIST), so holding is a suggestion rule ("left out of List now"), not a refusal.
 */
export declare const ListingRefusalReasonSchema: z.ZodEnum<["mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live", "sold", "archived"]>;
export type ListingRefusalReason = z.infer<typeof ListingRefusalReasonSchema>;
/**
 * Which KIND of refusal a listing route returned, before it contacted any marketplace.
 *
 *  card_not_listable   409  the copy's state forbids it; `reason` says which state
 *  game_not_available  422  the copy's game is not live (also `reason: game_not_available` in a
 *                           per-card list). Body also carries `game`/`displayName`: see
 *                           game-availability.ts
 *  sku_required        422  the request names no copy (or no lot) to give a SKU to
 *  sku_unavailable     503  Seek could not save the copy's SKU; nothing was sent; retry
 *  card_read_failed    503  Seek could not read the copy's record; a failed read is NEVER read as
 *                           "listable" (fail closed). Retry
 *  card_not_found      404  no such copy for this account
 */
export declare const ListingRefusalCodeSchema: z.ZodEnum<["card_not_listable", "game_not_available", "sku_required", "sku_unavailable", "card_read_failed", "card_not_found"]>;
export type ListingRefusalCode = z.infer<typeof ListingRefusalCodeSchema>;
/** The HTTP status each code is returned with. A constant, not a schema: it is for the SERVER
 *  (`NextResponse.json(body, { status: LISTING_REFUSAL_HTTP_STATUS[code] })`) so the status cannot
 *  drift from the code, and for a test that pins the table. Clients branch on `code`, not status.
 *  ⚠️ #243 returns `condition_not_confirmed` as 422; as a `card_not_listable` reason it is 409 here
 *  (one status per code). Open question for Ben in docs/V0.2.0-ADOPTION.md. */
export declare const LISTING_REFUSAL_HTTP_STATUS: Record<ListingRefusalCode, number>;
/**
 * The flat refusal body: `{ error, code, reason }`.
 *
 * `error` is the sentence to SHOW (the same field every other route's failure path uses, so
 * `ApiError` still decodes it); `code` is what to branch on; `reason` is non-null exactly when
 * `code` is `card_not_listable`. Used by ebay-draft, channel-listing (beside its existing envelope)
 * and anywhere a route refuses one copy. ebay-publish carries the same facts inside its existing
 * `failure` union (see ebay-publish.ts), because that envelope already exists and shipped.
 *
 * A SERVER-SIDE GUARD, like every cross-field rule in this contract: Swift/Kotlin cannot express
 * "reason iff card_not_listable".
 */
export declare const ListingRefusalSchema: z.ZodEffects<z.ZodObject<{
    error: z.ZodString;
    code: z.ZodEnum<["card_not_listable", "game_not_available", "sku_required", "sku_unavailable", "card_read_failed", "card_not_found"]>;
    reason: z.ZodNullable<z.ZodEnum<["mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live", "sold", "archived"]>>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found";
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived" | null;
}, {
    error: string;
    code: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found";
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived" | null;
}>, {
    error: string;
    code: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found";
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived" | null;
}, {
    error: string;
    code: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found";
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived" | null;
}>;
export type ListingRefusal = z.infer<typeof ListingRefusalSchema>;
