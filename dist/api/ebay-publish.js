// Contract for POST /api/ebay-publish (pokemon-tool) — the route that puts a real listing on a
// real marketplace with a real price. It had NO contract until 2026-09-02, which is how it came
// to accept a `format` field it never persisted, and it is the first consumer of the generator's
// `z.discriminatedUnion` support.
//
// ── WHY A DISCRIMINATED UNION, AND NOT `{ code, error }` ────────────────────────────────────
//
// The failures this route returns are not one shape with a varying label. They carry DIFFERENT
// DATA and demand DIFFERENT UI:
//
//   titleTooLong        needs the actual length and the limit, to say "84 characters, 80 allowed"
//   unmappableCondition needs the condition string it could not map
//   gradedNotVerified   needs the grading company, which may be null
//   scopeError          needs no data but a deep link to Settings → Channels
//   ebayError           needs the upstream code, which is an OPEN set we do not control
//
// Modelled as `{ code: string, error: string, ...maybe }`, every client re-derives which optional
// fields are meaningful for which code — and gets it wrong, silently, in the direction of showing
// a generic message. This repo has recorded that conflation twice already (ADR 0024's table), both
// times because the idiomatic construct was refused by the generator rather than rejected on
// merit. It is available now; this is the first schema to use it.
//
// ⚠️ `unrecognised` / `Unknown` EXISTS BECAUSE `ebayError` IS OPEN. eBay's own error codes arrive
// from upstream and change without notice. A client that hard-failed on an unknown code would
// turn "eBay said something new" into "the app broke". Per ADR 0027 item 2a, native clients must
// NEVER ORIGINATE an unknown case — it is a decode outcome, not a value to construct.
import { z } from "zod";
import { ListingRefusalReasonSchema } from "./listing-refusal.js";
// ── Request ─────────────────────────────────────────────────────────────────────────────────
export const EbayListingFormatSchema = z.enum(["FIXED_PRICE", "AUCTION"]);
export const EbayPublishRequestSchema = z.object({
    // v0.2.0 (BREAKING): `sku` is REMOVED from the request. A SKU is `SKU-` + 8 hex, given when the
    // copy is added, and NEVER EDITABLE: no request type in this contract carries one (asserted by
    // sku-immutable.test.ts). The server reads it from the copy named by `physicalCardId`; a retry
    // that sent a different SKU is how a second live listing is created (PLAN-SKU-ONE-RECIPE #227).
    // A pinned build that still sends `sku` keeps working: zod strips unknown keys, so the route
    // ignores it (and may log the mismatch). Swift/Kotlin lose the `sku` init parameter: delete it.
    title: z.string().min(1).max(80),
    description: z.string(),
    condition: z.string(),
    priceGbp: z.number().positive(),
    photoUrls: z.array(z.string()),
    aspectValues: z.record(z.union([z.string(), z.array(z.string())])),
    physicalCardId: z.string().nullable().optional(),
    cardId: z.string().nullable().optional(),
    game: z.string().default("pokemon"),
    format: EbayListingFormatSchema.default("FIXED_PRICE"),
    auctionStartPrice: z.number().positive().nullable().optional(),
    auctionDays: z.union([z.literal(3), z.literal(5), z.literal(7), z.literal(10)]).default(7),
});
// ── Success ─────────────────────────────────────────────────────────────────────────────────
export const EbayPublishSuccessSchema = z.object({
    status: z.literal("published"),
    /**
     * v0.2.0 (BREAKING: new REQUIRED key). The SKU the listing was published under: the copy's own
     * (`SKU-` + 8 hex, given when it was added), or — when a BulkRecord was listed as one lot — the
     * SKU the server minted for that single listing (a pile has none of its own). Non-null, opaque:
     * display and copy it, never parse it, never send one back.
     */
    sku: z.string().min(1),
    offerId: z.string(),
    listingId: z.string().nullable(),
    listingUrl: z.string().nullable(),
    production: z.boolean(),
});
// ── Failure ─────────────────────────────────────────────────────────────────────────────────
//
// `message` is on every variant and is the string to SHOW. `code` is the string to BRANCH on —
// but clients should branch on the decoded case, not on `code`; the field is present because it
// round-trips and because a log line wants it.
export const EbayPublishErrorSchema = z.discriminatedUnion("code", [
    z.object({
        code: z.literal("unauthenticated"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("invalid_request"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("title_too_long"),
        message: z.string(),
        titleLength: z.number().int(),
        maxLength: z.number().int(),
    }),
    z.object({
        // DEPRECATED at the v0.2.0 server switch: this flat 400 is on main today and clients may handle
        // it, so the arm STAYS; the server converts it to `card_not_listable` with reason
        // `slab_unverified` (409) at the same switch as the nulls. Do not add new uses.
        code: z.literal("graded_not_verified"),
        message: z.string(),
        // Null when the card claims a grade with no company recorded — the reason the check fires at
        // all. Do not render "null" at the user; the message already says what to do.
        gradingCompany: z.string().nullable(),
    }),
    z.object({
        code: z.literal("scope_error"),
        message: z.string(),
        // Deep link target for "Reconnect your eBay account". Kept as a plain string rather than an
        // enum: the destination is a client route, and the three clients spell it differently.
        reconnectHint: z.string(),
    }),
    z.object({
        code: z.literal("no_policies"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("unmappable_condition"),
        message: z.string(),
        condition: z.string(),
    }),
    z.object({
        code: z.literal("ebay_error"),
        message: z.string(),
        // eBay's own code, passed through verbatim.
        //
        // ⚠️ RESERVED, AND THE ROUTE DOES NOT EMIT IT TODAY. Every eBay failure is currently mapped to
        // one of the named arms below before it leaves the route, so this arm describes a pass-through
        // that does not happen. Kept rather than removed because it shipped in v0.1.45 and dropping an
        // arm breaks an exhaustive switch on three platforms — but recorded here as a claim rather
        // than an artifact, so nobody reads its presence as evidence the route passes codes through.
        ebayCode: z.string(),
        httpStatus: z.number().int(),
    }),
    z.object({
        code: z.literal("internal_error"),
        message: z.string(),
    }),
    // ── Added v0.1.46 ───────────────────────────────────────────────────────────────────────
    //
    // v0.1.45 declared eight arms. The route can return EIGHTEEN codes. The ten below were all
    // decoding to the forward-compatible fallback: SAFE — nothing threw, nothing was dropped — and
    // wrong, because a client can only render "unknown error" for ten real, actionable failures.
    //
    // Shipping a union covering eight of eighteen is the same shape as shipping a contract that
    // reaches no client, which is why these land in the same release as the coverage fix rather
    // than in a third partial one.
    z.object({
        code: z.literal("no_photos"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("missing_required_aspects"),
        message: z.string(),
        // THE SHARPEST OF THE TEN. The route computes `fields.missingRequired` and then flattens it
        // into an English sentence, so a client could only learn which fields to ask for by
        // re-parsing prose. This is precisely the case a discriminated union exists for, and it was
        // sitting inside the first schema built on one.
        missingRequired: z.array(z.string()),
    }),
    z.object({
        code: z.literal("no_dispatch_address"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("location_create_failed"),
        message: z.string(),
        // eBay's verbatim rejection of the address. Distinct from no_dispatch_address: the seller HAS
        // an address and eBay would not accept it, which is a different thing to tell them.
        ebayResponse: z.string().nullable(),
    }),
    z.object({
        code: z.literal("rate_limited"),
        message: z.string(),
        // ⚠️ A BULK PUBLISH THAT HITS THIS HAS PARTIAL SUCCESS: cards listed before the limit ARE
        // live. A client that retries the whole batch double-lists them.
        partialSuccess: z.boolean(),
    }),
    z.object({
        code: z.literal("publish_failed"),
        message: z.string(),
    }),
    // ── eBay token states ───────────────────────────────────────────────────────────────────
    //
    // FOUR arms, not one `token_error` with a sub-code. All four return 503 and all four have a
    // DIFFERENT remedy — reconnect, wait, contact us, nothing the seller can do — and collapsing
    // them behind one label is the conflation this contract exists to prevent, at the exact point
    // where the seller is being told to go and fix something.
    z.object({
        code: z.literal("not_connected"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("expired"),
        message: z.string(),
    }),
    z.object({
        code: z.literal("refresh_failed"),
        message: z.string(),
    }),
    z.object({
        // NOT the seller's fault and NOT actionable by them: our own eBay app credentials are absent.
        // A client must not tell a seller to reconnect their account for this one.
        code: z.literal("not_configured"),
        message: z.string(),
    }),
    // ── Added v0.2.0: refusals made BEFORE eBay is contacted ─────────────────────────────────
    //
    // The listing guards (#243), the game gate (#246) and the SKU rule (#227) all refuse a copy
    // without touching eBay, and none of them was in this union: a client decoded them to the
    // forward-compatible fallback and could only say "unknown error" for six real, actionable
    // failures. This is the v0.1.46 lesson again (a union covering 18 of 24 codes is a contract that
    // reaches no client for the other six), so they land together. The same family travels
    // everywhere else a copy is refused, as `ListingRefusal` (listing-refusal.ts); the arms below
    // mirror it with this union's `message` field.
    //
    // ⚠️ For a client to decode these, the ROUTE must put them under `failure` like every other
    // arm. The bodies #243 and #246 return today are the flat `{ error, code }` only, with no
    // `failure`: the web lane builds the envelope (error === failure.message) when it adopts this.
    z.object({
        // 409. THE state-conflict refusal; `reason` says which (listing-refusal.ts). Replaces #243's
        // `card_mine` / `card_set_aside` / `condition_not_confirmed` as separate codes (Ben decision:
        // docs/V0.2.0-ADOPTION.md "Refusal codes").
        code: z.literal("card_not_listable"),
        message: z.string(),
        reason: ListingRefusalReasonSchema,
    }),
    z.object({
        // 422. The copy's game is not live (Pokémon only at beta). `game` is null for an id this build
        // does not know. Existing copies of the game stay visible and editable; they are not listed.
        code: z.literal("game_not_available"),
        message: z.string(),
        game: z.string().nullable(),
        displayName: z.string(),
    }),
    z.object({
        // 422. The request names no copy (or lot) to give a SKU to.
        code: z.literal("sku_required"),
        message: z.string(),
    }),
    z.object({
        // 503. Seller can retry; nothing was sent to eBay (the SKU is saved before the first eBay call).
        code: z.literal("sku_unavailable"),
        message: z.string(),
    }),
    z.object({
        // 503. Seek could not read the copy's record. FAIL CLOSED: never treated as "listable".
        // Retried with the rest of a batch.
        code: z.literal("card_read_failed"),
        message: z.string(),
    }),
    z.object({
        // 404. No such copy for this account.
        code: z.literal("card_not_found"),
        message: z.string(),
    }),
]);
// ⚠️ THE UNION IS ADDITIVE. `error` STAYS A STRING.
//
// Three web callers render `data.error` straight into a toast today —
// app/inventory/bulk-publish/page.tsx:159, app/inventory/[id]/page.tsx:524, and
// app/add/multiple/page.tsx:333. Promoting `error` to an object would have put "[object Object]"
// in front of a seller mid-publish. Caught by reading the callers before changing the route, not
// by a test — no test asserts what a toast renders.
//
// So the structured union arrives under a NEW key and the old string is untouched. Existing
// clients keep working unchanged; a client that wants to branch reads `failure`.
//
// `error` MUST equal `failure.message` — asserted in the route's tests. Two fields carrying the
// same sentence is a small price for not breaking three screens, but two fields carrying
// DIFFERENT sentences would be worse than either.
export const EbayPublishErrorResponseSchema = z.object({
    /** The human message. Unchanged, and the only field older clients read. */
    error: z.string(),
    /** Legacy flat code. Retained for the same reason: clients already read it. Equals
     *  `failure.code` for every known arm. */
    code: z.string().optional(),
    /** The structured failure. New; the only field that carries per-arm data. */
    failure: EbayPublishErrorSchema,
});
