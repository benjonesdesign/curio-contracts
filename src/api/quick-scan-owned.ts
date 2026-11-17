// Quick scan: "In your inventory" (A4e), the market line (A4a) and "Keep it" (ADDITIVE, DRAFT).
//
// Source: curio-shared canon/design/build-spec/native/A-quick-scan.md, A4a (market line; "Keep it" adds one
// copy with a SKU: A4a-AC12, A2t-AC1) and A4e (owned copies: "Add it as a {ordinal} copy", "It's one of my {n}"
// opening E1e, single copy "It's my copy"). Product owner, 2026-11-16.
//
//   POST /api/quick-scan            gains two OPTIONAL fields: `ownedCopies`, `market`  (QuickScanResponse)
//   POST /api/quick-scan/keep       { game, nativeId, ... } -> KeepItResponse   (adds ONE copy with a SKU)
//
// Nothing here is a new table: `ownedCopies` is read from `physical_cards`, and Keep it inserts one row there.
//
// ── ownedCopies ─────────────────────────────────────────────────────────────────────────────
// Present only for a signed-in seller and an identified card; null otherwise (an anonymous scan has no
// inventory to count: null is "we did not look", never "you own none"). When present and `count` is 0 the
// seller owns none of this card.
//   conditions   the DISTINCT conditions the seller has CONFIRMED on those copies (a copy whose condition is
//                only the default assumption is not listed: the seller has not said it).
//   listedOnEbayCount  copies currently LISTED.
//   copies       one entry per copy, oldest first, so a client can number them ("1st", "2nd") and E1e can list
//                each by SKU. The server decides the order; a client must not re-sort and renumber.
//
// ── market ──────────────────────────────────────────────────────────────────────────────────
// The numbers behind the price range line. Every figure is nullable: unknown is null with the reason in
// `source`/absence, never 0 (a £0 would read as "worth nothing"). `fetchedAt` is when the server got the
// figures, not when the scan happened, so a stale price says so.
//
// ── Which card do they describe? ────────────────────────────────────────────────────────────
// `ownedCopies` and `market` describe `QuickScanResponse.match` ONLY. When the identity is a tie
// (`identified` false, `candidates` non-empty) both are null: there is no single card to count or price.
// They are not per-candidate. After the seller picks a candidate the client has neither for it and must not
// compute them: it re-scans with that candidate's `nativeId` (+ `game`) on QuickScanRequest, and the server
// resolves exactly that card, ignoring fuzzy name matching, and returns them for the resolved match.
// Without `nativeId` the request behaves as before.
//
// Signed out is a plain HTTP 401 (the route is authenticated), not a refusal reason.
// ── Keep it ─────────────────────────────────────────────────────────────────────────────────
// Adds ONE copy of the scanned card to the seller's inventory with a SKU. It spends no identification (the
// identity was already resolved by the scan) and sets no price. `clientRequestId` makes a double tap or a
// retry add one copy, not two: the same id returns the same copy with `replayed: true`.
import { z } from "zod";
import { ConditionSchema, GameIdSchema } from "./common.js";
import { PhysicalCardStatusSchema } from "./physical-card.js";

export const OwnedCopySchema = z.object({
  physicalCardId: z.string(),
  /** The copy's SKU. Never null: every copy has one ("no SKU yet" does not exist, Ben 2026-10-08). E1e lists copies by it. */
  sku: z.string().min(1),
  /** The condition on the copy, when it has one. */
  condition: ConditionSchema.nullable(),
  /** True when the SELLER confirmed `condition`; false when it is the default assumption. Copy reads "confirmed by you". */
  conditionConfirmedBySeller: z.boolean(),
  status: PhysicalCardStatusSchema,
  /** True when this copy is live on a channel right now. */
  listed: z.boolean(),
  /** The channel it is listed on (e.g. "ebay"), null when not listed. */
  channel: z.string().nullable(),
});
export type OwnedCopy = z.infer<typeof OwnedCopySchema>;

export const OwnedCopiesSummarySchema = z.object({
  /** How many copies of this card the seller owns (any status that is still stock). */
  count: z.number().int().min(0),
  /** Distinct seller-confirmed conditions across the copies. */
  conditions: z.array(ConditionSchema).default([]),
  /** Copies currently live on eBay ("{n} listed on eBay"). */
  listedOnEbayCount: z.number().int().min(0),
  /** One per copy, oldest first. Empty exactly when `count` is 0. */
  copies: z.array(OwnedCopySchema).default([]),
}).superRefine((s, ctx) => {
  if (s.copies.length !== s.count) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["copies"],
      message: "copies must have exactly `count` entries: E1e lists each copy, so a short list hides one" });
  }
  if (s.listedOnEbayCount > s.count) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["listedOnEbayCount"],
      message: "listedOnEbayCount cannot exceed count" });
  }
});
export type OwnedCopiesSummary = z.infer<typeof OwnedCopiesSummarySchema>;

export const QuickScanMarketSchema = z.object({
  /** Low and high ends of the price range, GBP. Null when unknown. */
  lowGbp: z.number().nonnegative().nullable(),
  highGbp: z.number().nonnegative().nullable(),
  /** Median asking price across the live listings the range came from, GBP. Null when unknown. */
  medianAskGbp: z.number().nonnegative().nullable(),
  /** How many live listings the figures rest on. Null when the source does not say. */
  listingCount: z.number().int().min(0).nullable(),
  /** The price's source id, as `price.source`, repeated so the market line stands alone. */
  source: z.string().nullable(),
  /** ISO 8601: the catalogue fetch date (one per card, no per-comp dates). */
  fetchedAt: z.string().datetime({ offset: true }).nullable(),
  /** Why the figures are null, when they are. Present exactly when there is no range (low and high both null). */
  unavailableReason: z.enum(["not_priced", "no_listings", "provider_outage"]).nullable().default(null),
}).superRefine((m, ctx) => {
  if (m.lowGbp !== null && m.highGbp !== null && m.lowGbp > m.highGbp) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lowGbp"], message: "lowGbp cannot exceed highGbp" });
  }
  const noRange = m.lowGbp === null && m.highGbp === null;
  if (noRange !== (m.unavailableReason !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unavailableReason"],
      message: "unavailableReason is present exactly when there is no range: unknown is a dash with its reason, never a bare dash" });
  }
});
export type QuickScanMarket = z.infer<typeof QuickScanMarketSchema>;

// ── POST /api/quick-scan/keep — authenticated ────────────────────────────────────────────────
export const KeepItRequestSchema = z.object({
  /** The identity the scan resolved: `match.game` and `match.nativeId`. */
  game: GameIdSchema,
  nativeId: z.string().min(1),
  /** Optional condition the seller chose. Absent adds the copy with no confirmed condition. */
  condition: ConditionSchema.optional(),
  /** Idempotency key: the same id never adds a second copy. */
  clientRequestId: z.string().min(1).max(100).optional(),
});
export type KeepItRequest = z.infer<typeof KeepItRequestSchema>;

export const KeepItOutcomeSchema = z.enum(["added", "refused", "failed"]);
export type KeepItOutcome = z.infer<typeof KeepItOutcomeSchema>;

export const KeepItRefusalReasonSchema = z.enum([
  "card_unknown",      // the identity is not in the catalogue
  "game_unavailable",  // the game is not open to this account yet
  "copy_limit_reached", // the account's inventory limit is reached
]);
export type KeepItRefusalReason = z.infer<typeof KeepItRefusalReasonSchema>;

export const KeepItResponseSchema = z.object({
  outcome: KeepItOutcomeSchema,
  /** The copy that was added (or, when `replayed`, the one already added). Present exactly when `added`. */
  copy: OwnedCopySchema.nullable(),
  /** 1-based position of this copy among the seller's copies of the card ("Added as your 2nd copy"). */
  ordinal: z.number().int().min(1).nullable(),
  /** How many copies of the card the seller owns now. */
  ownedCount: z.number().int().min(0).nullable(),
  /** True when this request id had already added the copy. */
  replayed: z.boolean().default(false),
  /** Present exactly when `failed`: true when trying again can work (a write hiccup), false when it cannot. */
  retryable: z.boolean().nullable().default(null),
  /** Why nothing was added. Present exactly when `refused`. */
  reason: KeepItRefusalReasonSchema.nullable().default(null),
}).superRefine((r, ctx) => {
  const added = r.outcome === "added";
  if (added !== (r.copy !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["copy"],
      message: "copy is present exactly when outcome is added" });
  }
  if (added !== (r.ordinal !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ordinal"],
      message: "ordinal is present exactly when outcome is added" });
  }
  if ((r.outcome === "refused") !== (r.reason !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"],
      message: "reason is present exactly when outcome is refused" });
  }
  if ((r.outcome === "failed") !== (r.retryable !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["retryable"],
      message: "retryable is present exactly when outcome is failed: the toast cannot word a failure without it" });
  }
  if (r.replayed && !added) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["replayed"],
      message: "replayed only applies to an added copy" });
  }
});
export type KeepItResponse = z.infer<typeof KeepItResponseSchema>;

// ── POST /api/quick-scan/keep/undo — authenticated (A2t toast, M6) ───────────────────────────
// Takes back the copy a Keep it just added. Archives it (never a hard delete). Only a copy that is still
// exactly as Keep it left it can be taken back: once it has been priced, listed or edited, it is the seller's
// copy to manage from inventory, so undo refuses.
export const UndoKeepItRequestSchema = z.object({ physicalCardId: z.string().min(1) });
export type UndoKeepItRequest = z.infer<typeof UndoKeepItRequestSchema>;

export const UndoKeepItOutcomeSchema = z.enum(["undone", "refused", "failed"]);
export const UndoKeepItRefusalReasonSchema = z.enum([
  "not_found",         // no such copy for this account
  "changed_since",     // the copy has been edited, priced or listed since it was kept
  "not_kept_from_scan", // the copy was not added by Keep it
]);
export const UndoKeepItResponseSchema = z.object({
  outcome: UndoKeepItOutcomeSchema,
  /** How many copies of the card the seller owns after the undo. Null unless `undone`. */
  ownedCount: z.number().int().min(0).nullable(),
  reason: UndoKeepItRefusalReasonSchema.nullable().default(null),
  /** Present exactly when `failed`: true when trying again can work, false when it cannot. */
  retryable: z.boolean().nullable().default(null),
}).superRefine((r, ctx) => {
  if ((r.outcome === "failed") !== (r.retryable !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["retryable"], message: "retryable is present exactly when outcome is failed" });
  }
  if ((r.outcome === "undone") !== (r.ownedCount !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["ownedCount"], message: "ownedCount is present exactly when undone" });
  }
  if ((r.outcome === "refused") !== (r.reason !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"], message: "reason is present exactly when refused" });
  }
});
export type UndoKeepItResponse = z.infer<typeof UndoKeepItResponseSchema>;
