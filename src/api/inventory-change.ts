// Mark Mine / Change to stock, Set aside, Put back — and the stats they feed (v0.2.0, ADDITIVE).
//
// Source: pokemon-tool #259 (columns + triggers, migration pending Ben's go) and #260 (the routes
// and the value split), against GAP-037 (Mine, not for sale) and GAP-009 (set aside). #260 defined
// every shape below route-local ("contracts: additive, curio-contracts; the new routes use local
// types until then"); this file is that carrier.
//
//   POST /api/inventory/mine       { ids, mine }      mine true = Mark Mine, false = Change to stock
//   POST /api/inventory/set-aside  { ids, reason? }   status EXCEPTION; reason is a chip or omitted
//   POST /api/inventory/put-back   { ids }            back to where it was
//   POST /api/inventory/stop-holding { ids }          HELD back to READY_TO_LIST, no listing
//   GET  /api/stats                                   StatsResponse
//
// ── PER-COPY RESULTS, NEVER ALL-OR-NOTHING ──────────────────────────────────────────────────
// A mixed selection changes what it can and says, per copy, why it did not change the rest. HTTP is
// 200 once the request is understood; a failed read is 503 with nothing written. Nothing is reported
// `changed` unless the row came back from the write. Undo is the same call the other way round.
//
// ── SEPARATE FROM ListingRefusalReason: ITS OWN ENUM, MEANING AND LABEL GROUP ────────────────
// `ListingRefusalReason` answers "why can this copy not be LISTED". `InventoryChangeRefusalReason`
// answers "why was this copy not CHANGED (marked Mine / set aside / put back)". Different
// questions with different remedies and wording, so two enums, and the wire strings may COINCIDE
// (`sold`, `archived`, `set_aside` appear in both) without the enums, meanings or labels being the
// same. The labels come from @curio/copy's `changeRefusalReasonLabels` (this enum) and
// `listingRefusalReasonLabels` / `listingRefusalShortLabels` (the listing one); a client never maps
// one enum's value through the other's labels. A live copy is named differently in each
// (`already_live` there, `live_on_ebay` here: "End the listing first. It's live on eBay."). Both
// are closed and forward-compatible.
//
// ── VALUE TOTALS (Ben, 2026-10-09; supersedes the earlier "held out of totals" note) ─────────
// A HELD copy COUNTS in the stock value, and the held part is returned APART (`heldValue`) so a
// screen can say "£4,812 · £320 held" without subtracting. A Not-identified (UNMATCHED) copy has no
// price and adds nothing. Stock value is the seller's price on READY_TO_LIST, LISTED and HELD
// stock; Mine is valued APART (the market range, `collectionValue`); set-aside, sold and archived
// copies are in no value. Every copy still counts as a copy (`counts`).
import { z } from "zod";
import { PhysicalCardStatusSchema, SetAsideReasonSchema } from "./physical-card.js";

/**
 * Why a copy was not changed. Closed; an unrecognised value is "not changed" (decisions/0027).
 *   live_on_ebay   on a marketplace: "End the listing first. It's live on eBay."
 *   sold           a sale was made; sold copies archive only
 *   archived       out of the inventory (ARCHIVED or RETURNED)
 *   set_aside      Mark Mine is not offered on a set-aside copy
 *   not_found      no such copy for this account (another account's is indistinguishable)
 *   write_failed   the copy was fine but the save did not happen (outcome `failed`)
 */
export const InventoryChangeRefusalReasonSchema = z.enum([
  "live_on_ebay",
  "sold",
  "archived",
  "set_aside",
  "not_found",
  "write_failed",
]);
export type InventoryChangeRefusalReason = z.infer<typeof InventoryChangeRefusalReasonSchema>;

/** What happened to one copy. `unchanged` = already as asked (an Undo of an Undo): nothing written,
 *  no audit row. */
export const InventoryChangeOutcomeSchema = z.enum(["changed", "unchanged", "refused", "failed"]);
export type InventoryChangeOutcome = z.infer<typeof InventoryChangeOutcomeSchema>;

/** 1 to 500 ids per call; a client with more sends several. */
const IdsSchema = z.array(z.string().min(1)).min(1).max(500);

export const MineRequestSchema = z.object({
  ids: IdsSchema,
  /** true = Mark Mine; false = Change to stock (the only way back). */
  mine: z.boolean(),
});
export type MineRequest = z.infer<typeof MineRequestSchema>;

export const SetAsideRequestSchema = z.object({
  ids: IdsSchema,
  /** The seller's chip. Omitted or null = skipped (allowed, WE3j-AC1). Never free text. */
  reason: SetAsideReasonSchema.nullable().optional(),
});
export type SetAsideRequest = z.infer<typeof SetAsideRequestSchema>;

export const PutBackRequestSchema = z.object({
  ids: IdsSchema,
});
export type PutBackRequest = z.infer<typeof PutBackRequestSchema>;

/**
 * "Stop holding" (the Held record's `E3g` More sheet; Ben, 2026-10-09): a HELD copy goes back to
 * READY_TO_LIST, and is NOT listed. A server action, answered with the same per-copy
 * `InventoryChangeResponse` as Mine / Put back: `changed` with `status: READY_TO_LIST` (and
 * `heldAt` cleared on the copy); `unchanged` for a copy that is not held (Undo of an Undo is
 * harmless); `refused` / `failed` with the usual reasons. Listing a held copy ON PURPOSE is a
 * different action (it lists and moves to READY_TO_LIST on the way).
 */
export const StopHoldingRequestSchema = z.object({
  ids: IdsSchema,
});
export type StopHoldingRequest = z.infer<typeof StopHoldingRequestSchema>;

export const InventoryChangeResultSchema = z.object({
  id: z.string(),
  outcome: InventoryChangeOutcomeSchema,
  /** Present exactly when outcome is `refused` or `failed` (and `failed` is always `write_failed`). */
  reason: InventoryChangeRefusalReasonSchema.nullable().optional(),
  /** A sentence to show if the client has no wording of its own for `reason`. English: wording
   *  belongs to @curio/copy, so a client with its own string ignores this. */
  error: z.string().nullable().optional(),
  /** The copy's status after a change that wrote one (set aside, put back). */
  status: PhysicalCardStatusSchema.nullable().optional(),
  /** Mark Mine replaced a bundle/show/venue earmark (one column); the channel it replaced. */
  replacedChannel: z.string().nullable().optional(),
  /** Set aside dropped an earmark (a bundle finds its members by that column); the channel dropped. */
  droppedChannel: z.string().nullable().optional(),
  /** Put back: the reason the copy had been set aside with, so Undo of a put-back can set it aside
   *  again with the same reason. */
  previousReason: SetAsideReasonSchema.nullable().optional(),
}).superRefine((r, ctx) => {
  const issue = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
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
});
export type InventoryChangeResult = z.infer<typeof InventoryChangeResultSchema>;

export const InventoryChangeSummarySchema = z.object({
  changed: z.number().int().nonnegative(),
  unchanged: z.number().int().nonnegative(),
  refused: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});
export type InventoryChangeSummary = z.infer<typeof InventoryChangeSummarySchema>;

/** The answer of all three routes: one result per copy, in the order asked (repeats dropped), and a
 *  summary that is exactly the tally of the results. */
export const InventoryChangeResponseSchema = z.object({
  results: z.array(InventoryChangeResultSchema),
  summary: InventoryChangeSummarySchema,
}).superRefine((r, ctx) => {
  const tally = { changed: 0, unchanged: 0, refused: 0, failed: 0 };
  const seen = new Set<string>();
  r.results.forEach((x, i) => {
    tally[x.outcome] += 1;
    if (seen.has(x.id)) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["results", i, "id"], message: `copy ${x.id} appears twice: one result per copy` });
    seen.add(x.id);
  });
  for (const k of ["changed", "unchanged", "refused", "failed"] as const) {
    if (r.summary[k] !== tally[k]) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["summary", k], message: `summary.${k} is ${r.summary[k]} but ${tally[k]} results are ${k}` });
    }
  }
});
export type InventoryChangeResponse = z.infer<typeof InventoryChangeResponseSchema>;

// ── GET /api/stats ──────────────────────────────────────────────────────────────────────────

/** Copies still in inventory (not sold, not archived), a PARTITION in this order of precedence:
 *  set aside > Mine > held > stock. So `stock` EXCLUDES held (a held copy is counted once, as held).
 *  A different base from `totalCards`. HELD copies are in `estValue` (the held part is `heldValue`);
 *  UNMATCHED copies are in `stock` as copies and add nothing to any value. */
export const InventoryCountsSchema = z.object({
  stock: z.number().int().nonnegative(),
  held: z.number().int().nonnegative(),
  mine: z.number().int().nonnegative(),
  setAside: z.number().int().nonnegative(),
});
export type InventoryCounts = z.infer<typeof InventoryCountsSchema>;

/**
 * The Mine copies' market range, valued APART from stock. `lowGbp`/`highGbp` are null when no Mine
 * copy is priced (never 0: unknown is not £0). A half range (one end only) is not priced.
 * `count` = `pricedCount` + `notPricedCount`. `sources` = the distinct price sources of the priced
 * ones (open strings; empty until a source is recorded).
 */
export const CollectionValueSchema = z.object({
  count: z.number().int().nonnegative(),
  pricedCount: z.number().int().nonnegative(),
  notPricedCount: z.number().int().nonnegative(),
  lowGbp: z.number().nullable(),
  highGbp: z.number().nullable(),
  sources: z.array(z.string()),
}).superRefine((c, ctx) => {
  const issue = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  if (c.pricedCount + c.notPricedCount !== c.count) {
    issue("count", `count (${c.count}) is not pricedCount + notPricedCount (${c.pricedCount + c.notPricedCount})`);
  }
  const unpriced = c.pricedCount === 0;
  if (unpriced !== (c.lowGbp === null) || unpriced !== (c.highGbp === null)) {
    issue("lowGbp", unpriced
      ? "no Mine copy is priced, so lowGbp and highGbp must be null: unknown is never £0"
      : "Mine copies are priced, so lowGbp and highGbp are required");
  }
  if (c.lowGbp !== null && c.highGbp !== null && c.lowGbp > c.highGbp) {
    issue("highGbp", "highGbp is below lowGbp");
  }
});
export type CollectionValue = z.infer<typeof CollectionValueSchema>;

export const StatsResponseSchema = z.object({
  /** Copies per status. Keys are statuses (a client treats an unknown key as "other"). */
  statusCounts: z.record(z.string(), z.number().int().nonnegative()),
  /** Money spent on copies still held (not archived, not sold). Not a value; unchanged by Mine. */
  costBasis: z.number(),
  /** STOCK value: the seller's price on READY_TO_LIST, LISTED and HELD stock. HELD copies COUNT
   *  here (Ben, 2026-10-09); Mine (valued apart in `collectionValue`), set-aside, UNMATCHED (no
   *  price), sold and archived copies are not in it. */
  estValue: z.number(),
  /** The part of `estValue` that is HELD copies, apart: "£4,812 · £320 held". Included in
   *  `estValue`, never added to it; never above it. NULL (not 0) when no held copy is priced: an
   *  unknown is not £0. */
  heldValue: z.number().nonnegative().nullable(),
  realisedGain: z.number(),
  agedListings: z.number().int().nonnegative(),
  /** All copies except ARCHIVED. */
  totalCards: z.number().int().nonnegative(),
  counts: InventoryCountsSchema,
  collectionValue: CollectionValueSchema,
}).superRefine((s, ctx) => {
  if (s.heldValue !== null && s.heldValue > s.estValue + 1e-9) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["heldValue"],
      message: `heldValue (${s.heldValue}) is part of estValue (${s.estValue}) and cannot exceed it` });
  }
  if (s.heldValue !== null && s.counts.held === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["heldValue"],
      message: "heldValue is a figure but counts.held is 0: there is no held copy to have a value" });
  }
});
export type StatsResponse = z.infer<typeof StatsResponseSchema>;
