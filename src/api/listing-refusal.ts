// ONE closed vocabulary for "this copy cannot be listed", with a reason (v0.2.0).
//
// ── THE PROBLEM THIS CLOSES ─────────────────────────────────────────────────────────────────
// Three sources named the same refusal three ways, and none of them was shipped in a contract:
//
//   PLAN-GAP-037-039 (#222) and the native spec (C2 "card_not_listable (409)", E3d-AC4):
//       409 { error, code: "card_not_listable", reason: "mine" | "set_aside" }
//   The web server guard that is actually open (#243, pokemon-tool):
//       409 card_mine · 409 card_set_aside · 422 condition_not_confirmed · 503 card_read_failed ·
//       404 card_not_found          (body: { error: string, code: string }, NO `reason`)
//   The beta game gate (#246): 422 game_not_available (listing) / game_coming (acquire, price).
//   The SKU plan (#227): 422 sku_required, 503 sku_unavailable.
//
// A client that has to branch on twelve flat codes, spread over four routes, re-derives which are
// "the card is not for sale" and which are "try again" and gets it wrong in the direction of a
// generic toast (the conflation decisions/0024 records). So this release models the family ONCE:
//
//   code   = WHICH KIND of refusal (a small closed set; each has one HTTP status)
//   reason = for `card_not_listable` only, WHY (a closed set; the one list every list/publish/draft/
//            CardTrader/bulk/preview surface shares)
//
// ⚠️ THIS IS A BEN DECISION, NOT A SETTLED ONE. The web lane's #243 uses `card_mine`,
// `card_set_aside` and a 422 `condition_not_confirmed`; the plan and the spec say `card_not_listable`
// (409). The contract follows the plan/spec because it is the only form that is ONE enum with a
// reason. The mapping from #243's codes is in docs/V0.2.0-ADOPTION.md ("Refusal codes"), so the
// web lane can align (a rename of three string literals in `lib/listing/notListable.ts` and its
// DB trigger messages) rather than the contract guessing which side is right.
//
// ── REASONS ─────────────────────────────────────────────────────────────────────────────────
// Open to additions (ADR 0027): a client decodes an unknown reason to `.unrecognised` / `Unknown`
// and must treat it as "not listable", never as listable.
import { z } from "zod";

/**
 * WHY a copy cannot be listed. Closed. Precedence when several apply is the server's call; the
 * recommended order (matching #243's predicate, then the rest) is:
 * set_aside, mine, unmatched, slab_unverified, game_not_available, already_live,
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
 *
 * NOT here, deliberately: `held`. A HELD copy may be listed on purpose (it moves to
 * READY_TO_LIST), so holding is a suggestion rule ("left out of List now"), not a refusal.
 */
export const ListingRefusalReasonSchema = z.enum([
  "mine",
  "set_aside",
  "unmatched",
  "slab_unverified",
  "condition_not_confirmed",
  "no_price",
  "no_sku",
  "game_not_available",
  "already_live",
]);
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
export const ListingRefusalCodeSchema = z.enum([
  "card_not_listable",
  "game_not_available",
  "sku_required",
  "sku_unavailable",
  "card_read_failed",
  "card_not_found",
]);
export type ListingRefusalCode = z.infer<typeof ListingRefusalCodeSchema>;

/** The HTTP status each code is returned with. A constant, not a schema: it is for the SERVER
 *  (`NextResponse.json(body, { status: LISTING_REFUSAL_HTTP_STATUS[code] })`) so the status cannot
 *  drift from the code, and for a test that pins the table. Clients branch on `code`, not status.
 *  ⚠️ #243 returns `condition_not_confirmed` as 422; as a `card_not_listable` reason it is 409 here
 *  (one status per code). Open question for Ben in docs/V0.2.0-ADOPTION.md. */
export const LISTING_REFUSAL_HTTP_STATUS: Record<ListingRefusalCode, number> = {
  card_not_listable: 409,
  game_not_available: 422,
  sku_required: 422,
  sku_unavailable: 503,
  card_read_failed: 503,
  card_not_found: 404,
};

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
export const ListingRefusalSchema = z.object({
  error: z.string(),
  code: ListingRefusalCodeSchema,
  reason: ListingRefusalReasonSchema.nullable(),
}).superRefine((r, ctx) => {
  const isNotListable = r.code === "card_not_listable";
  if (isNotListable !== (r.reason !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"],
      message: isNotListable
        ? "code is card_not_listable, so reason is required: a refusal must say why"
        : `reason is set but code is ${r.code}: only card_not_listable carries a reason` });
  }
});
export type ListingRefusal = z.infer<typeof ListingRefusalSchema>;
