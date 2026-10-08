// The shared PRICED BREAKDOWN — every line of a most-to-pay or a "You receive" calculation, with its
// source, as the server computed it (v0.2.0, ADDITIVE: new schemas only).
//
// WHERE THE SHAPE COMES FROM. Ben, 2026-10-05: "the server returns every line of the max-buy and fee
// breakdown with its source; no screen computes money." One shape serves buying (most to pay) and
// selling (you receive). It is specified identically in two plans that say "edit both together":
//   - PLAN-GAP-032-036-maxbuy-breakdown.md  (#218) "Decisions from design handoff" §1
//   - PLAN-GAP-012-025-net-before-publish.md (#220) "Decisions from design handoff" §1
// and consumed by PLAN-SELLER-TYPE-FIRST-ASK (#230 §2, "Server response for Not set") and
// PLAN-POSTAGE-FUNCTION (#229, the `postage` line). Nothing here is invented beyond them.
//
// ── WHICH ENDPOINTS WILL CARRY IT (none yet — this release only DECLARES the shape) ─────────────
//   Selling: POST /api/pricing/breakdown   → response gains `breakdown: PricedBreakdown`
//            POST /api/pricing/breakdown/batch (new) → per-item breakdowns + group totals
//   Buying:  POST /api/decide, POST /api/quick-scan → a `breakdown` BESIDE `decision` (as `price`
//            and `gradeEV` already are)
// Attaching it is an additive OPTIONAL field on each response, so it needs no major bump and is
// deliberately NOT done here: the plans disagree on the attach point (#218 puts it at
// `Decision.maxBuy.breakdown`, a nested object Ben's round-2 ruling replaced with the flat nullable
// `maxBuyGbp`), and declaring a field no server populates is decisions/0027's trap. The generators
// emit these types now so a client can start compiling against them.
//
// ── RULES THE SHAPE CARRIES (from the plans) ────────────────────────────────────────────────────
//  1. A client sums nothing, subtracts nothing and recomputes nothing. It sends back only seller
//     intent (price, theirPriceGbp, targetMarginPct, postageMode, packingKey) — `editKey` names
//     exactly those — never a figure the world sets (fees, postage rates, tax). ADR 0028.
//  2. GBP, value positive and deductions negative, so a client formats and never derives.
//  3. `amountGbp: null` means UNKNOWN, never 0.
//  4. The fee line is always present. Not set: `amountGbp null`, `notSet` names why, the mode's
//     total is null, and the List/Publish action stays enabled.
//  5. `key` and `note` are OPEN strings (ADR 0027: an unknown value is a decode outcome, not a
//     crash); `source`, `mode`, `editKey`, `feeBasis`, `channel` and `notSet` entries are small
//     CLOSED enums, which every client decodes forward-compatibly (`unrecognised`/`Unknown`).
import { z } from "zod";
import { PriceKindSchema } from "./pricing-breakdown.js";
import { SellerTypeSchema } from "./profile.js";

/** Where a line's figure came from. `dispatch_rules` and `profile_estimate`, which the postage
 *  function uses internally, are NOT here: #229 §"PricedBreakdown" maps them onto these seven
 *  ("No enum change"), and the service name travels in `label`. */
export const PricedLineSourceSchema = z.enum([
  "seller_profile",
  "ebay_policy",
  "fee_model",
  "price_provider",
  "card_override",
  "request",
  "default",
]);
export type PricedLineSource = z.infer<typeof PricedLineSourceSchema>;

/** The only things a client may send back to change a line (ADR 0028: a client may send what the
 *  seller WANTS, never what the world COSTS). */
export const PricedLineEditKeySchema = z.enum(["targetMarginPct", "postageMode", "packingKey"]);
export type PricedLineEditKey = z.infer<typeof PricedLineEditKeySchema>;

export const PricedLineSchema = z.object({
  /** Open string. Known values — selling: sale_price, ebay_fee, fee_vat, postage, packing,
   *  you_receive; buying: market_value, ebay_fee, fee_vat, postage, packing, tax_set_aside,
   *  target_margin, max_buy, your_time. An unknown key still renders from `label`. */
  key: z.string(),
  /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
   *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
   *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
   *  and clients render from `key`. */
  label: z.string().nullable().optional(),
  /** Null = unknown, never 0. */
  amountGbp: z.number().nullable(),
  source: PricedLineSourceSchema,
  /** The server filled it in; the seller never said. */
  assumed: z.boolean(),
  editable: z.boolean(),
  editKey: PricedLineEditKeySchema.nullable(),
  /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
   *  your_rate | buyer_pays | free_postage | estimate | asking_basis | not_included |
   *  at_start_price. */
  note: z.string().nullable(),
});
export type PricedLine = z.infer<typeof PricedLineSchema>;

export const PricedBreakdownModeSchema = z.enum(["selling", "buying"]);
export type PricedBreakdownMode = z.infer<typeof PricedBreakdownModeSchema>;

/** The mode's own total is set; the other is null. Either is null when a `notSet` input blocks it. */
export const PricedTotalsSchema = z.object({
  youReceiveGbp: z.number().nullable(),
  maxBuyGbp: z.number().nullable(),
});
export type PricedTotals = z.infer<typeof PricedTotalsSchema>;

/** Buying only, and only when the client sent `theirPriceGbp`. Computed once on the server so a
 *  screen never subtracts two figures (and an offline screen shows the stored answer instead). */
export const PricedCompareSchema = z.object({
  theirPriceGbp: z.number(),
  overUnderGbp: z.number(),
});
export type PricedCompare = z.infer<typeof PricedCompareSchema>;

export const PricedChannelSchema = z.enum(["ebay", "direct"]);
export type PricedChannel = z.infer<typeof PricedChannelSchema>;

/** How the fee was arrived at. `not_set` means the fee line is null (see `notSet`). */
export const FeeBasisSchema = z.enum(["derived", "seller_override", "not_set"]);
export type FeeBasis = z.infer<typeof FeeBasisSchema>;

/** What was USED. A null `sellerType`/`vatRegistered` is "not set", never "private"/"false". */
export const PricedFeePositionSchema = z.object({
  sellerType: SellerTypeSchema.nullable(),
  vatRegistered: z.boolean().nullable(),
  channel: PricedChannelSchema,
  feeBasis: FeeBasisSchema,
});
export type PricedFeePosition = z.infer<typeof PricedFeePositionSchema>;

/** An input the seller has not stated. Never rendered as a default. `targetMargin` is the buying
 *  margin (PLAN-MOST-TO-PAY #224 §5). */
export const PricedNotSetSchema = z.enum(["sellerType", "vatPosition", "targetMargin"]);
export type PricedNotSet = z.infer<typeof PricedNotSetSchema>;

/** The market price behind the breakdown. `source` is the price provider's own id (open string). */
export const PricedPriceSchema = z.object({
  gbp: z.number().nullable(),
  source: z.string().nullable(),
  kind: PriceKindSchema.nullable(),
  /** ISO timestamp the price was fetched (`price_lookups.fetched_at`). */
  asOf: z.string().nullable(),
  /** True when this is a stored answer rather than a fresh lookup (offline "Last checked"). */
  cached: z.boolean(),
});
export type PricedPrice = z.infer<typeof PricedPriceSchema>;

export const PricedBreakdownSchema = z.object({
  mode: PricedBreakdownModeSchema,
  /** In display order. */
  lines: z.array(PricedLineSchema),
  totals: PricedTotalsSchema,
  compare: PricedCompareSchema.nullable(),
  feePosition: PricedFeePositionSchema,
  notSet: z.array(PricedNotSetSchema),
  price: PricedPriceSchema,
  /** ISO timestamp. What an offline client stores and shows as "Last checked". */
  computedAt: z.string(),
}).superRefine((b, ctx) => {
  // The fee position cannot contradict itself: "not set" and "we know the seller type / a fee was
  // derived" are the same fact seen from two fields, and a breakdown asserting both would let a
  // client choose which to believe.
  const feeUnset = b.notSet.includes("sellerType") || b.notSet.includes("vatPosition");
  if (feeUnset !== (b.feePosition.feeBasis === "not_set")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feePosition", "feeBasis"],
      message: feeUnset
        ? 'notSet names the seller type or VAT position, so feePosition.feeBasis must be "not_set"'
        : 'feePosition.feeBasis is "not_set" but notSet does not name the seller type or VAT position' });
  }
  if (b.notSet.includes("sellerType") && b.feePosition.sellerType !== null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feePosition", "sellerType"],
      message: "notSet names sellerType, so feePosition.sellerType must be null (not a guess)" });
  }
  if (b.notSet.includes("vatPosition") && b.feePosition.vatRegistered !== null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feePosition", "vatRegistered"],
      message: "notSet names vatPosition, so feePosition.vatRegistered must be null (not a guess)" });
  }
  // Rule 4: an unset fee position nulls the fee line. Presence is NOT enforced here — the key is an
  // open string and the plans leave the `direct` channel's fee line undefined — but if the
  // "ebay_fee" line is there it may not carry a figure the server could not have computed.
  const fee = b.lines.find((l) => l.key === "ebay_fee");
  if (feeUnset && fee && fee.amountGbp !== null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lines"],
      message: 'the "ebay_fee" line must have amountGbp null while the fee position is not set' });
  }
});
export type PricedBreakdown = z.infer<typeof PricedBreakdownSchema>;
