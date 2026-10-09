// The LISTING PREVIEW — a batch of copies priced and vetted before anything is published (v0.2.0).
//
// What it answers, in one round trip, for the Review & list screen (C10), the "List {n} cards live?"
// sheet (C11), the single-copy sheet (E9g, a batch of one) and the web Review & list table:
//
//   1. WHICH copies can publish, and for each that cannot, WHY (the one closed reason list,
//      listing-refusal.ts) — "the server decides which cards can publish; the client only
//      displays", and "List {n} now counts only cards the server says can publish".
//   2. WHAT the seller would receive for each, line by line (`PricedBreakdown`, selling mode) —
//      fee by seller type and VAT, Dispatch postage, packing, you receive.
//   3. The totals the group captions print ("{14} cards · you receive £1,837"), so NO SCREEN SUMS
//      A COLUMN, and whether each copy falls under the seller's floor.
//   4. Each copy's SKU (non-null; every copy has had one since it was created).
//
// ⚠️ THE ROUTE PATH IS NOT DECIDED. Two plans name two endpoints for the same job: #220 puts the
// per-copy breakdowns on `POST /api/pricing/breakdown/batch`; #222 puts the listable/excluded split
// on `POST /api/listing-batches/preview {ids}`. This schema is deliberately path-neutral — one
// response answers both questions, since the screens need both at once — and the adoption doc
// asks Ben/the web lane to pick ONE path rather than build two that must be merged.
//
// The preview never publishes, never writes, and never contacts a marketplace. C11 re-requests it
// at the price about to be published rather than reusing E9c's figure (the price can change in
// between), so the confirmation can never differ from what the seller was shown.
import { z } from "zod";
import { MaxBuyUnavailableReasonSchema } from "./common.js";
import { EbayListingFormatSchema } from "./ebay-publish.js";
import { ListingRefusalReasonSchema } from "./listing-refusal.js";
import { PhysicalCardSchema } from "./physical-card.js";
import { PostageModeSchema, PricedBreakdownSchema } from "./priced-breakdown.js";

export const ListingPreviewItemRequestSchema = z.object({
  physicalCardId: z.string(),
  /** The price the seller is considering for this copy. Absent = the copy's saved price. */
  priceGbp: z.number().positive().optional(),
  /** AUCTION is priced at the start price (line note `at_start_price`). */
  format: EbayListingFormatSchema.optional(),
  /** Seller intent for this copy (ADR 0028): who bears postage, a keyed packing choice. */
  postageMode: PostageModeSchema.optional(),
  packingKey: z.string().optional(),
  /** A caller-assigned group key — C10's groups ("List now", "Bundle", ...). Echoed on each item
   *  and used to compute `groups[].totals`, so the group captions come from the server. */
  group: z.string().optional(),
});
export type ListingPreviewItemRequest = z.infer<typeof ListingPreviewItemRequestSchema>;

export const ListingPreviewRequestSchema = z.object({
  /** At most 200, as the decide batch (an account-wide rate limit applies). */
  items: z.array(ListingPreviewItemRequestSchema).min(1).max(200),
});
export type ListingPreviewRequest = z.infer<typeof ListingPreviewRequestSchema>;

export const ListingPreviewItemSchema = z.object({
  /** The copy, with its SKU and status. */
  card: PhysicalCardSchema,
  /** True exactly when `refusalReason` is null. */
  listable: z.boolean(),
  /** WHY this copy cannot publish; null when it can. The one closed list (listing-refusal.ts).
   *  A client treats an unrecognised reason as "not listable". */
  refusalReason: ListingRefusalReasonSchema.nullable(),
  /** What the seller would receive, line by line, at the requested price/format. NULL when the
   *  server did not price the copy because the refusal is not about the figure (Mine, set aside,
   *  not identified, game not live, already live). A copy refused for `condition_not_confirmed`
   *  or `no_price` still carries one: the row "stays in the table with what it would receive". */
  breakdown: PricedBreakdownSchema.nullable(),
  /** Whether what the seller would receive is under their floor (Rules, H8). Null when that is
   *  unknown (no breakdown, or a null `youReceiveGbp`) — never false-by-default. */
  belowFloor: z.boolean().nullable(),
  /** The request's `group`, echoed. */
  group: z.string().nullable(),
}).superRefine((i, ctx) => {
  const issue = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  if (i.listable !== (i.refusalReason === null)) {
    issue("refusalReason", i.listable
      ? "listable is true but refusalReason is set: a copy that can publish has no reason it cannot"
      : "listable is false, so refusalReason is required: a refusal must say why");
  }
  if (i.breakdown === null && i.listable) {
    issue("breakdown", "a listable copy always carries its breakdown: the seller sees what they receive before they publish");
  }
  if (i.breakdown !== null && i.breakdown.mode !== "selling") {
    issue("breakdown", 'a listing preview prices a SALE: breakdown.mode must be "selling"');
  }
  const receive = i.breakdown?.totals.youReceiveGbp ?? null;
  if ((i.belowFloor === null) !== (receive === null)) {
    issue("belowFloor", receive === null
      ? "belowFloor must be null while what the seller receives is unknown"
      : "belowFloor is null but what the seller receives is known: it is comparable to the floor");
  }
});
export type ListingPreviewItem = z.infer<typeof ListingPreviewItemSchema>;

/**
 * Totals for the whole batch or one group. `youReceiveGbp` is the sum of the LISTABLE copies'
 * "you receive" — null with `unknownReason` as soon as one listable copy's figure is unknown
 * (typically `seller_type_not_set`: "no receive figure is shown and List stays enabled"), and never
 * £0 for "unknown". A group with no listable copies totals £0, which is a true sum of nothing.
 */
export const ListingPreviewTotalsSchema = z.object({
  count: z.number().int(),
  listableCount: z.number().int(),
  /** Listable copies whose receipt is under the floor ("{3} cards · under your £1.50 floor"). */
  belowFloorCount: z.number().int(),
  youReceiveGbp: z.number().nullable(),
  /** WHY `youReceiveGbp` is null; null exactly when it is a number. */
  unknownReason: MaxBuyUnavailableReasonSchema.nullable(),
});
export type ListingPreviewTotals = z.infer<typeof ListingPreviewTotalsSchema>;

export const ListingPreviewGroupSchema = z.object({
  key: z.string(),
  totals: ListingPreviewTotalsSchema,
});
export type ListingPreviewGroup = z.infer<typeof ListingPreviewGroupSchema>;

const pence = (gbp: number) => Math.round(gbp * 100);

function checkTotals(
  t: z.infer<typeof ListingPreviewTotalsSchema>,
  items: z.infer<typeof ListingPreviewItemSchema>[],
  ctx: z.RefinementCtx,
  path: (string | number)[],
) {
  const issue = (sub: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [...path, sub], message });
  const listable = items.filter((i) => i.listable);
  if (t.count !== items.length) issue("count", `count is ${t.count} but there are ${items.length} items`);
  if (t.listableCount !== listable.length) issue("listableCount", `listableCount is ${t.listableCount} but ${listable.length} items are listable`);
  const below = listable.filter((i) => i.belowFloor === true).length;
  if (t.belowFloorCount !== below) issue("belowFloorCount", `belowFloorCount is ${t.belowFloorCount} but ${below} listable items are below the floor`);

  if ((t.youReceiveGbp === null) !== (t.unknownReason !== null)) {
    issue("unknownReason", t.youReceiveGbp === null
      ? "youReceiveGbp is null, so unknownReason is required: an unknown total must say why"
      : "unknownReason is set but youReceiveGbp is a number: a total that exists has no reason to be missing");
  }
  const amounts = listable.map((i) => i.breakdown?.totals.youReceiveGbp ?? null);
  const anyUnknown = amounts.some((a) => a === null);
  if (anyUnknown !== (t.youReceiveGbp === null)) {
    issue("youReceiveGbp", anyUnknown
      ? "a listable item's receipt is unknown, so the total must be null: an unknown is not £0"
      : "every listable item's receipt is known, so the total must be a number");
  } else if (!anyUnknown && t.youReceiveGbp !== null) {
    // Whole pence, summed as integers: the server totals so the screen never has to, and the
    // total must be exactly what the rows add up to.
    const sum = amounts.reduce<number>((acc, a) => acc + pence(a as number), 0);
    if (pence(t.youReceiveGbp) !== sum) {
      issue("youReceiveGbp", `youReceiveGbp (${t.youReceiveGbp}) is not the sum of the listable items' receipts (${sum / 100})`);
    }
  }
}

export const ListingPreviewResponseSchema = z.object({
  items: z.array(ListingPreviewItemSchema),
  /** One entry per distinct request `group`, in first-seen order. Empty when no item named one. */
  groups: z.array(ListingPreviewGroupSchema),
  /** The whole batch. */
  totals: ListingPreviewTotalsSchema,
  /** The seller's floor from Rules (H8) that `belowFloor` was tested against; null when none is
   *  set. ⚠️ Whether the floor tests asking price, money received, or profit is UNRULED (#220 §6:
   *  `decideRoute`'s floor is on profit today); this schema reports the figure and the outcome and
   *  does not decide the basis. */
  floorGbp: z.number().nullable(),
  /** ISO timestamp. */
  computedAt: z.string(),
}).superRefine((r, ctx) => {
  const ids = new Set<string>();
  r.items.forEach((it, i) => {
    if (ids.has(it.card.id)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["items", i, "card", "id"],
        message: `copy ${it.card.id} appears twice: one row per copy` });
    }
    ids.add(it.card.id);
  });
  if (r.floorGbp === null && r.items.some((i) => i.belowFloor !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["floorGbp"],
      message: "an item reports belowFloor but floorGbp is null: there is no floor to be below" });
  }
  checkTotals(r.totals, r.items, ctx, ["totals"]);
  const keys = new Set<string>();
  r.groups.forEach((g, gi) => {
    if (keys.has(g.key)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["groups", gi, "key"], message: `duplicate group "${g.key}"` });
    }
    keys.add(g.key);
    checkTotals(g.totals, r.items.filter((i) => i.group === g.key), ctx, ["groups", gi, "totals"]);
  });
  const named = new Set(r.items.map((i) => i.group).filter((g): g is string => g !== null));
  for (const g of named) {
    if (!keys.has(g)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["groups"], message: `items name group "${g}" but groups has no totals for it` });
    }
  }
});
export type ListingPreviewResponse = z.infer<typeof ListingPreviewResponseSchema>;
