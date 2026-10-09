// The PHYSICAL COPY as it appears in an API response (v0.2.0), and its lifecycle status.
//
// Before v0.2.0 the contract had no `PhysicalCard` and no status enum at all: `physical_cards.status`
// is a bare `string` in the generated DB row, and the web repo's `PhysicalCardStatus` type
// (lib/types.ts) lived only there. A client could not tell which statuses exist, and could not
// decode a new one safely. Two statuses are new in this release, so the enum is declared here once
// and every platform decodes it forward-compatibly (ADR 0027: an unrecognised status is
// `.unrecognised(raw)` / `Unknown(raw)`, and a client must read it as "not listable, not sold").
//
// ── THE STATUS MACHINE (domain-model.md, "Lifecycle state machine") ─────────────────────────
//
//   RECEIVED → AWAITING_SCAN → PROCESSING → NEEDS_ID_REVIEW → NEEDS_CONDITION → NEEDS_DECISION
//   → READY_TO_LIST → (EBAY_DRAFT) → LISTED → SOLD → PICKED → DISPATCHED → COMPLETED
//   Side paths from most states: EXCEPTION, RETURNED, ARCHIVED.
//   Seller-set side paths (Ben, 2026-10-08): UNMATCHED, HELD.   ← NEW in this release
//
//   UNMATCHED  the seller kept a card with no catalogue match ("Keep it without a match", A8b).
//              Holds the seller's typed name/set/number as UNCONFIRMED identity; has its SKU; is
//              unpriced and cannot be listed; spends no identification. Leaves by being identified
//              (→ NEEDS_CONDITION), set aside (→ EXCEPTION) or archived.
//   HELD       the seller chose to wait before listing (the Hold route, C19). A status in the
//              domain model (committed 16ab771) with a `held_at` timestamp on the copy, carried
//              here as `heldAt`. Stays in stock and keeps its price, condition and SKU. Left out
//              of "List now" groups and suggestions, but the seller CAN list it on purpose ("List
//              it anyway", or selecting it in a bulk List), which moves it to READY_TO_LIST. So
//              HELD is NOT a refusal reason (settled, not a flag for Ben): see
//              ListingRefusalReason. It is not Mine (a keeper, `allocation_channel = keep`, which is
//              not a status) and not set aside (EXCEPTION).
//
// ── WHAT THE SELLER SEES (docs only; the contract carries codes, never English) ─────────────
//   UNMATCHED → "Not identified"      HELD → "Held by you"      EXCEPTION → "Set aside"
//   Mine is NOT a status. A Mine copy is READY_TO_LIST (or similar) with `allocation_channel =
//   'keep'`; it reaches a client as the refusal reason `mine`, never as a status value.
//   The label table, and the screens each one appears on, is in docs/V0.2.0-ADOPTION.md.
//
// ⚠️ `EBAY_DRAFT` is in the list because the code writes it (sandbox draft created, not live); the
// domain-model ADR's diagram predates it. `LISTED` is live.
import { z } from "zod";
import { ConditionSchema } from "./common.js";
export const PhysicalCardStatusSchema = z.enum([
    "RECEIVED",
    "AWAITING_SCAN",
    "PROCESSING",
    "NEEDS_ID_REVIEW",
    "NEEDS_CONDITION",
    "NEEDS_DECISION",
    "READY_TO_LIST",
    "EBAY_DRAFT",
    "LISTED",
    "SOLD",
    "PICKED",
    "DISPATCHED",
    "COMPLETED",
    "EXCEPTION",
    "RETURNED",
    "ARCHIVED",
    // ── New in v0.2.0 (Ben, 2026-10-08) ───────────────────────────────────────────────────────
    "UNMATCHED",
    "HELD",
]);
/**
 * WHY a seller set a copy aside: a CHIP choice only, never free text (DECISIONS QC.7). Closed and
 * forward-compatible (decisions/0027). Labels come from @curio/copy, not the contract:
 *   looks_off ("Doesn't look genuine") · altered_or_damaged · unsupported_game ("Not a game Seek
 *   lists") · other ("Something else"). Skipping the reason is allowed: it is null on the copy.
 * From pokemon-tool #259/#260 (`physical_cards.set_aside_reason`, a CHECK on exactly these four).
 */
export const SetAsideReasonSchema = z.enum(["looks_off", "altered_or_damaged", "unsupported_game", "other"]);
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
export const PhysicalCardSchema = z.object({
    id: z.string(),
    /** Non-null, non-empty, opaque. See the block above. */
    sku: z.string().min(1),
    status: PhysicalCardStatusSchema,
    game: z.string(),
    /** Null for a copy captured but not yet identified ("Not identified yet · Photos saved"). For an
     *  UNMATCHED copy this is the seller's TYPED name, which is unconfirmed identity. */
    name: z.string().nullable(),
    setName: z.string().nullable(),
    cardNumber: z.string().nullable(),
    /** The condition on the copy, whether or not the seller has confirmed it. */
    condition: ConditionSchema.nullable(),
    /** True only when the SELLER chose or confirmed `condition` ("Confirmed by you"). A condition
     *  from a failed check, or one the engine assumed, is NOT confirmed, and such a copy cannot be
     *  listed (`condition_not_confirmed`). */
    conditionConfirmed: z.boolean(),
    /** When the seller chose to hold it (`held_at`). Non-null whenever `status` is HELD; null for a
     *  copy that was never held (or was listed on purpose, which clears the hold). Required key. */
    heldAt: z.string().datetime().nullable(),
    /**
     * Mine (a keeper, never listed): `allocation_channel = keep`. NOT a status (a copy is Mine OR
     * stock; Mine and set aside can both be true). The only way back is "Change to stock".
     */
    isMine: z.boolean(),
    /** When it became Mine ("Set by you on {date}"). Stamped by the database, so a client cannot
     *  back-date it; null when not Mine, and for a legacy Mine row from before the stamp existed. */
    mineSetAt: z.string().datetime().nullable(),
    /** The seller's chip, when the copy is set aside (status EXCEPTION). Null = skipped, or not set aside. */
    setAsideReason: SetAsideReasonSchema.nullable(),
    /** When it was set aside ("By you on {date}"). Non-null exactly while status is EXCEPTION. */
    setAsideAt: z.string().datetime().nullable(),
}).superRefine((c, ctx) => {
    if ((c.status === "EXCEPTION") !== (c.setAsideAt !== null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["setAsideAt"],
            message: c.status === "EXCEPTION"
                ? "status is EXCEPTION (set aside), so setAsideAt is required: it says since when"
                : "setAsideAt is set but the copy is not set aside (status is not EXCEPTION)" });
    }
    if (c.setAsideReason !== null && c.setAsideAt === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["setAsideReason"],
            message: "setAsideReason is set but the copy is not set aside" });
    }
    if (c.mineSetAt !== null && !c.isMine) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["mineSetAt"],
            message: "mineSetAt is set but the copy is not Mine" });
    }
    if (c.status === "HELD" && c.heldAt === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["heldAt"],
            message: "status is HELD, so heldAt is required: a held copy says since when" });
    }
});
