// The shared PRICED BREAKDOWN — every line of a most-to-pay or a "You receive" calculation, with its
// source, as the server computed it (v0.2.0: declared, then ATTACHED to real responses).
//
// WHERE THE SHAPE COMES FROM. Ben, 2026-10-05: "the server returns every line of the max-buy and fee
// breakdown with its source; no screen computes money." One shape serves buying (most to pay) and
// selling (you receive). It is specified identically in two plans that say "edit both together":
//   - PLAN-GAP-032-036-maxbuy-breakdown.md  (#218) "Decisions from design handoff" §1
//   - PLAN-GAP-012-025-net-before-publish.md (#220) "Decisions from design handoff" §1
// and consumed by PLAN-SELLER-TYPE-FIRST-ASK (#230 §2, "Server response for Not set") and
// PLAN-POSTAGE-FUNCTION (#229, the `postage` line). Nothing here is invented beyond them.
//
// ── WHICH RESPONSES CARRY IT (attached in v0.2.0) ───────────────────────────────────────────
//   Selling, one copy:  POST /api/pricing/breakdown        → `PricingBreakdownResponse.breakdown`
//   Selling, a batch:   the listing preview (listing-preview.ts) → one `breakdown` per copy, plus
//                       group totals, so no screen sums a column
//   Buying:             POST /api/decide                   → `DecideResponse.breakdown`
//                       POST /api/quick-scan, decide batch → `breakdown`, null exactly when
//                       `decision` is null — BESIDE the decision, as `price` and `gradeEV` are
//
// v0.2.0 first declared this shape without attaching it ("the plans disagree on the attach point:
// #218 puts it at `Decision.maxBuy.breakdown`, which Ben's round-2 ruling removed"). The same
// release now attaches it, BESIDE the flat nullable figures, because shipping the shape to a
// response is the only way a client can build against it, and the release is breaking anyway.
// The flat figures stay for the headline; the breakdown is the line-by-line answer, and the two
// are cross-checked by the responses that carry both (a server-side guard).
//
// ── RULES THE SHAPE CARRIES (from the plans) ────────────────────────────────────────────────────
//  1. A client sums nothing, subtracts nothing and recomputes nothing. It sends back only seller
//     intent (price, theirPriceGbp, targetMarginPct, postageMode, packingKey) — `editKey` names
//     exactly those — never a figure the world sets (fees, postage rates, tax). ADR 0028.
//  2. GBP, value positive and deductions negative, so a client formats and never derives.
//  3. `amountGbp: null` means UNKNOWN, never 0 — and an unknown ALWAYS carries `unknownReason`
//     (the six-value vocabulary that already names a null most-to-pay), while a known figure never
//     does. A client renders the reason ("Not set", "Set your buying margin"), never a dash alone.
//  4. The fee line is always present. Not set: `amountGbp null`, `notSet` names why, the mode's
//     total is null, and the List/Publish action stays enabled.
//  5. `key` and `note` are OPEN strings (ADR 0027: an unknown value is a decode outcome, not a
//     crash); `source`, `mode`, `editKey`, `feeBasis`, `channel` and `notSet` entries are small
//     CLOSED enums, which every client decodes forward-compatibly (`unrecognised`/`Unknown`).
import { z } from "zod";
import { MaxBuyUnavailableReasonSchema, PostageBasisSchema, PostageServiceSchema, PriceKindSchema } from "./common.js";
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

/** Who pays postage on this sale: a keyed CHOICE (ADR 0028), never a free £ figure. The postage
 *  function (#229) decides the amount from the seller's Dispatch settings; this only says which
 *  side bears it. Sent back as the `postageMode` edit. */
export const PostageModeSchema = z.enum(["seller_pays", "buyer_pays"]);
export type PostageMode = z.infer<typeof PostageModeSchema>;

/**
 * KNOWN LINE KEYS, in display order (Ben's sum, native spec "Money, prices and the seller's
 * figures" and JTBD-GAP-032/012). `key` stays an OPEN string; these are the ones a client may
 * special-case. An unknown key still renders from `label`/`amountGbp`.
 *
 *   Selling ("You receive"):  sale_price · ebay_fee · [fee_vat] · postage · packing ·
 *                             [packing_time] · you_receive          (selling takes no tax line)
 *   Buying ("Most to pay"):   sale_price · ebay_fee · [fee_vat] · packing · [packing_time] ·
 *                             postage · target_margin · [tax_set_aside] · max_buy
 *   BESIDE (`PricedBreakdown.beside`, NOT in `lines`):  [listing_time]
 *
 *   [ ] = present only when it applies: `packing_time` and `listing_time` only when the seller has
 *   set an hourly rate, `tax_set_aside` only when the seller has set a tax rate (null = not set =
 *   no line, buying or selling), `fee_vat` only for a business seller whose VAT is split out of
 *   the fee. An absent line is ABSENT, not a null line: "only with a rate" means the row does not
 *   exist without one.
 *
 *   `sale_price` is the price the sale is worked from (the listing price when selling; the market
 *   value when buying). `target_margin` is "Your margin": a share of the SALE price, negative.
 *   `max_buy` / `you_receive` are the mode's total and are ALWAYS present (rule 4), so a null
 *   total always has a line to carry its `unknownReason`.
 *
 *   ROUNDING (owner, 2026-10-09): EVERY line's amount is rounded to the PENNY, and the mode's total
 *   is the SUM OF THE ROUNDED LINES: `you_receive` is exactly the sum of the other `lines`;
 *   `max_buy` is that sum rounded DOWN to the pound. Guarded in the breakdown below, because
 *   "no screen sums" is only safe if the server's own lines add up to its own total. A total is
 *   null (with its reason) as soon as an included line is unknown.
 *   "YOU RECEIVE" CAN BE NEGATIVE (owner, 2026-10-09): the true negative is sent, never clamped to
 *   0, and the line then carries `note: "below_cost"` so a screen can say "Below cost" without
 *   computing anything. `max_buy` is never negative.
 *
 *   TIME (owner, 2026-10-08; mirrors pokemon-tool #244; `your_time` is retired and must not be used):
 *     - `packing_time` is in `lines`, TAKEN OFF the sum (`included: true`): a NEGATIVE amount with
 *       `minutes`. The minutes are the seller's own setting or, if unset, the RULED DEFAULT (a
 *       flat 4 minutes a parcel and 2 for each extra card in it, no letter/parcel split:
 *       `defaultPackingMinutes` below), and the line is flagged `estimate: true` exactly when the
 *       default was used.
 *     - `listing_time` is NOT in `lines`. It is in the separate `beside` array: a POSITIVE
 *       magnitude, `minutes`, `included: false`, never in the arithmetic. (Whether listing time
 *       should ever be taken off is Ben's open "For Ben" item; the contract fixes `included: false`.)
 *   Both exist only when the seller has set an hourly rate; without one the line is ABSENT.
 *   `included` is on EVERY line: true for everything in `lines`, false for everything in `beside`.
 *   A client never decides this from the key.
 *
 *   FEE BASIS (mirrors #244's `feeBreakdown`): the `ebay_fee` line carries `perOrderBand`
 *   (`low | high`, null when the fee is not banded: a private seller or a seller override) and
 *   `feeBasisVerified`. `feeBasisVerified` is FALSE until eBay's own page confirms that the £10
 *   per-order band is tested on item + buyer-paid postage; while it is false a client must not
 *   present the fee as exact (render "estimate-grade", not a guarantee).
 *
 * SIGN: value lines are positive (`sale_price`, `you_receive`, `max_buy`) and deductions are
 * negative or zero (`ebay_fee`, `fee_vat`, `postage`, `packing`, `packing_time`, `target_margin`,
 * `tax_set_aside`). `listing_time` (beside the sum) is a positive magnitude. Enforced below, because a client that formats and never derives will print
 * exactly the sign it is given.
 */
const VALUE_KEYS = new Set(["sale_price", "max_buy"]);   // never negative. (`you_receive` may be: see ROUNDING)
const DEDUCTION_KEYS = new Set([
  "ebay_fee", "fee_vat", "postage", "packing", "packing_time", "target_margin", "tax_set_aside",
]);
const MINUTES_KEYS = new Set(["packing_time", "listing_time"]);

/** Which eBay per-order fee band applied (the fixed fee differs either side of £10). `low` is at or
 *  under £10, `high` above. Null (on the line) when the fee is not banded. */
export const PerOrderBandSchema = z.enum(["low", "high"]);
export type PerOrderBand = z.infer<typeof PerOrderBandSchema>;

/**
 * The RULED default packing time (owner, 2026-10-09): a flat 4 minutes for the parcel, plus 2 for
 * each extra card in it. No letter/parcel split. Used only when the seller has set an hourly rate
 * and has not set their own minutes; the `packing_time` line is then `estimate: true`.
 */
export function defaultPackingMinutes(cardsInParcel: number): number {
  if (!Number.isInteger(cardsInParcel) || cardsInParcel < 1) {
    throw new RangeError(`a parcel holds at least one card, got ${cardsInParcel}`);
  }
  return 4 + 2 * (cardsInParcel - 1);
}

/** Amounts are in whole pence: a line is rounded to the penny before it is sent. */
const isWholePence = (gbp: number) => Math.abs(gbp * 100 - Math.round(gbp * 100)) < 1e-6;
const pence = (gbp: number) => Math.round(gbp * 100);

export const PricedLineSchema = z.object({
  /** Open string. See KNOWN LINE KEYS above. An unknown key still renders from `label`. */
  key: z.string(),
  /** Display text, resolved by the route from @curio/copy so a line renders on a build that has
   *  never seen its key. OPTIONAL because #218 §6 question 3 / #220 question 3 ("who owns label
   *  text: the route, or codes only?") is UNRULED: if Ben rules "codes only" the server omits it
   *  and clients render from `key`. */
  label: z.string().nullable().optional(),
  /** Null = unknown, never 0 — and then `unknownReason` says why. In pounds; value positive,
   *  deductions negative. `max_buy` is a WHOLE-POUND figure, rounded down by the server
   *  ("shown rounded down to the pound"): no screen rounds. */
  amountGbp: z.number().nullable(),
  /** WHY `amountGbp` is null; null exactly when it is a number. Required key, so an unexplained
   *  null cannot reach a client. The same vocabulary as `Decision.maxBuyUnavailableReason`: on the
   *  fee line it is `seller_type_not_set | vat_not_set`; on `max_buy` any of the six; on
   *  `you_receive` the fee reasons or `no_price`; on `target_margin` `margin_not_set`; on
   *  `sale_price` `no_price`. A client reads an unrecognised reason as "no figure". */
  unknownReason: MaxBuyUnavailableReasonSchema.nullable(),
  source: PricedLineSourceSchema,
  /** The server filled it in; the seller never said. */
  assumed: z.boolean(),
  /** The figure is an ESTIMATE the seller can replace or that the sale will record: the line reads
   *  "(estimate)". Not the same as `assumed`: "Packing (estimate)" is assumed until the seller sets
   *  it in Cost, but "Packing time (estimate)" is an estimate even when the seller supplied the
   *  hourly rate. */
  estimate: z.boolean(),
  editable: z.boolean(),
  editKey: PricedLineEditKeySchema.nullable(),
  /** True when this line is PART OF THE SUM (taken off, or the total itself); false when it is shown
   *  BESIDE the sum and never taken off (`listing_time`). Required, so a client never has to infer
   *  from the key whether to subtract a line — it subtracts nothing at all (rule 1), but it does
   *  render an excluded line apart, with "not included". */
  included: z.boolean(),
  /** Whole minutes behind a time line: REQUIRED on `packing_time` and `listing_time`, absent/null
   *  elsewhere. */
  minutes: z.number().nullable().optional(),
  /** `postage` only: which Dispatch service the postage is priced on (closed, forward-compatible;
   *  NO label in the contract, the words come from @curio/copy). Null when the buyer pays (the
   *  seller's postage is £0 and no service applies) or the seller has no Dispatch rules; present
   *  when the seller pays. Free postage is a threshold, not a service. */
  service: PostageServiceSchema.nullable().optional(),
  /** `postage` only: which rule the figure came from (closed): `ebay_policy` for a PUBLISHED
   *  listing, `dispatch_rules` for an ESTIMATE (owner, 2026-10-09). With `ebay_policy` the line's
   *  `source` is `ebay_policy` and `service` is null (the policy has no Dispatch service). */
  postageBasis: PostageBasisSchema.nullable().optional(),
  /** `ebay_fee` only: which per-order band applied; null when the fee is not banded (private
   *  seller, seller override) or unknown. */
  perOrderBand: PerOrderBandSchema.nullable().optional(),
  /** `ebay_fee` only: false until eBay's page confirms the £10 band is tested on item + buyer
   *  postage (#244). Present (boolean) whenever the fee is a figure; null when it is unknown. */
  feeBasisVerified: z.boolean().nullable().optional(),
  /** Open string, a code (copy lives in @curio/copy): vat_reclaimed | vat_unrecoverable |
   *  your_rate | buyer_pays | free_postage | estimate | asking_basis | at_start_price. */
  note: z.string().nullable(),
}).superRefine((l, ctx) => {
  const issue = (path: string, message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  const unknown = l.amountGbp === null;
  if (unknown && l.unknownReason === null) {
    issue("unknownReason", `line "${l.key}" has amountGbp null, so unknownReason is required: an unknown figure must say why`);
  }
  if (!unknown && l.unknownReason !== null) {
    issue("unknownReason", `line "${l.key}" has a figure but unknownReason is ${l.unknownReason}: a figure that exists has no reason to be missing`);
  }
  if (l.key === "listing_time" && l.included) {
    issue("included", "listing_time is shown BESIDE the sum and never taken off: included must be false");
  }
  if (l.key === "listing_time" && l.amountGbp !== null && l.amountGbp < 0) {
    issue("amountGbp", "listing_time is a positive magnitude (it is not a deduction: it is never taken off)");
  }
  if (MINUTES_KEYS.has(l.key) !== (l.minutes != null)) {
    issue("minutes", MINUTES_KEYS.has(l.key)
      ? `line "${l.key}" is a time line and must carry its minutes`
      : `line "${l.key}" is not a time line and must not carry minutes`);
  }
  if (l.minutes != null && (l.minutes < 0 || !Number.isInteger(l.minutes))) {
    issue("minutes", "minutes is a whole, non-negative number");
  }
  if (l.postageBasis != null) {
    if (l.key !== "postage") issue("postageBasis", `line "${l.key}" is not the postage line: postageBasis belongs to postage only`);
    else if (l.postageBasis === "ebay_policy" && l.source !== "ebay_policy") issue("postageBasis", 'postageBasis ebay_policy means the line\'s source is "ebay_policy"');
    else if (l.postageBasis === "dispatch_rules" && l.source === "ebay_policy") issue("postageBasis", 'postageBasis dispatch_rules cannot have source "ebay_policy"');
    else if (l.postageBasis === "ebay_policy" && l.service != null) issue("service", "a published listing\'s postage comes from the eBay policy, which has no Dispatch service: service must be null");
  }
  if (l.amountGbp !== null && !isWholePence(l.amountGbp)) {
    issue("amountGbp", `line "${l.key}" must be rounded to the penny (got ${l.amountGbp}); totals are the sum of the rounded lines`);
  }
  if (l.key === "you_receive" && l.amountGbp !== null && l.amountGbp < 0 && l.note !== "below_cost") {
    issue("note", 'a negative you_receive is sent as the true negative with note "below_cost" (never clamped to 0)');
  }
  if (l.service != null) {
    if (l.key !== "postage") issue("service", `line "${l.key}" is not the postage line: service belongs to postage only`);
    else if (l.note === "buyer_pays") issue("service", "the buyer pays, so no service applies to the seller's postage: service must be null");
    else if (l.amountGbp === null) issue("service", "an unknown postage figure has no service");
  }
  if (l.key === "ebay_fee") {
    if ((l.amountGbp !== null) !== (l.feeBasisVerified != null)) {
      issue("feeBasisVerified", l.amountGbp !== null
        ? "the ebay_fee line has a figure, so feeBasisVerified is required (false until eBay's page confirms the band basis)"
        : "the ebay_fee line is unknown, so there is no basis to verify: feeBasisVerified must be null");
    }
    if (l.perOrderBand != null && l.amountGbp === null) {
      issue("perOrderBand", "an unknown fee has no per-order band");
    }
  } else if (l.perOrderBand != null || l.feeBasisVerified != null) {
    issue("feeBasisVerified", `line "${l.key}" is not the fee line: perOrderBand and feeBasisVerified belong to ebay_fee only`);
  }
  if (l.key !== "listing_time" && !l.included && (VALUE_KEYS.has(l.key) || DEDUCTION_KEYS.has(l.key))) {
    issue("included", `line "${l.key}" is part of the sum: included must be true (only listing_time sits beside it)`);
  }
  if (l.amountGbp !== null) {
    if (VALUE_KEYS.has(l.key) && l.amountGbp < 0) {
      issue("amountGbp", `line "${l.key}" is a value line and must not be negative (value positive, deductions negative)`);
    }
    if (DEDUCTION_KEYS.has(l.key) && l.amountGbp > 0) {
      issue("amountGbp", `line "${l.key}" is a deduction and must be negative or zero (value positive, deductions negative)`);
    }
    if (l.key === "max_buy" && !Number.isInteger(l.amountGbp)) {
      issue("amountGbp", "the max_buy line is rounded DOWN to a whole pound by the server; no screen rounds");
    }
  }
});
export type PricedLine = z.infer<typeof PricedLineSchema>;

export const PricedBreakdownModeSchema = z.enum(["selling", "buying"]);
export type PricedBreakdownMode = z.infer<typeof PricedBreakdownModeSchema>;

/** The mode's own total is set; the other is null. Either is null when a `notSet` input blocks it.
 *  `maxBuyGbp` is a whole-pound, rounded-down figure (the `max_buy` line's amount, repeated). */
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
 *  margin (PLAN-MOST-TO-PAY #224 §5) and exists only in a buying breakdown. */
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
  /** Lines SHOWN BESIDE the sum and never in its arithmetic: today only `listing_time`, present
   *  only when the seller has an hourly rate (empty otherwise). Every one is `included: false`.
   *  Required key, so a client always knows whether there is a "beside" section. */
  beside: z.array(PricedLineSchema),
  totals: PricedTotalsSchema,
  compare: PricedCompareSchema.nullable(),
  feePosition: PricedFeePositionSchema,
  notSet: z.array(PricedNotSetSchema),
  price: PricedPriceSchema,
  /** ISO timestamp. What an offline client stores and shows as "Last checked". */
  computedAt: z.string(),
}).superRefine((b, ctx) => {
  const issue = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });

  // The fee position cannot contradict itself: "not set" and "we know the seller type / a fee was
  // derived" are the same fact seen from two fields, and a breakdown asserting both would let a
  // client choose which to believe.
  const feeUnset = b.notSet.includes("sellerType") || b.notSet.includes("vatPosition");
  if (feeUnset !== (b.feePosition.feeBasis === "not_set")) {
    issue(["feePosition", "feeBasis"], feeUnset
      ? 'notSet names the seller type or VAT position, so feePosition.feeBasis must be "not_set"'
      : 'feePosition.feeBasis is "not_set" but notSet does not name the seller type or VAT position');
  }
  if (b.notSet.includes("sellerType") && b.feePosition.sellerType !== null) {
    issue(["feePosition", "sellerType"], "notSet names sellerType, so feePosition.sellerType must be null (not a guess)");
  }
  if (b.notSet.includes("vatPosition") && b.feePosition.vatRegistered !== null) {
    issue(["feePosition", "vatRegistered"], "notSet names vatPosition, so feePosition.vatRegistered must be null (not a guess)");
  }

  // Lines: unique keys, so "the" fee line / total line is unambiguous. `lines` is the arithmetic
  // (all included) and `beside` is not (none included); listing_time is only ever beside.
  const seen = new Set<string>();
  b.lines.forEach((l, i) => {
    if (seen.has(l.key)) issue(["lines", i, "key"], `duplicate line key "${l.key}": a client finds a line by key`);
    seen.add(l.key);
    if (!l.included) issue(["lines", i, "included"], `line "${l.key}" is in the arithmetic: lines are all included (put a line shown beside the sum in \`beside\`)`);
    // (listing_time in `lines` is refused by the two rules around it: it cannot be included, and
    // `lines` are all included.)
  });
  const besideSeen = new Set<string>();
  b.beside.forEach((l, i) => {
    if (l.included) issue(["beside", i, "included"], `line "${l.key}" is beside the sum: beside lines are never included`);
    if (besideSeen.has(l.key) || seen.has(l.key)) issue(["beside", i, "key"], `duplicate line key "${l.key}"`);
    besideSeen.add(l.key);
  });
  const line = (key: string) => b.lines.find((l) => l.key === key);

  // Rule 4: an unset fee position nulls the fee line, with the reason that names the gap. Presence
  // is NOT enforced for the fee line (the `direct` channel's fee line is undefined in the plans),
  // but if "ebay_fee" is there it may not carry a figure the server could not have computed, and
  // its reason must be the fee position's own (seller type first, as FeeNotSetReason orders them).
  const fee = line("ebay_fee");
  if (fee) {
    if (feeUnset && fee.amountGbp !== null) {
      issue(["lines"], 'the "ebay_fee" line must have amountGbp null while the fee position is not set');
    }
    if (feeUnset && fee.amountGbp === null) {
      const want = b.notSet.includes("sellerType") ? "seller_type_not_set" : "vat_not_set";
      if (fee.unknownReason !== want) {
        issue(["lines"], `the "ebay_fee" line's unknownReason must be ${want} (notSet is ${b.notSet.join(", ")}), got ${fee.unknownReason ?? "null"}`);
      }
    }
  }

  // Mode: the other mode's total is null, and the mode-specific inputs belong to their mode.
  const own = b.mode === "selling" ? "you_receive" : "max_buy";
  const ownTotal = b.mode === "selling" ? b.totals.youReceiveGbp : b.totals.maxBuyGbp;
  const otherTotal = b.mode === "selling" ? b.totals.maxBuyGbp : b.totals.youReceiveGbp;
  if (otherTotal !== null) {
    issue(["totals"], `a ${b.mode} breakdown has no ${b.mode === "selling" ? "maxBuyGbp" : "youReceiveGbp"}: the other mode's total is null`);
  }
  if (b.mode === "selling" && b.notSet.includes("targetMargin")) {
    issue(["notSet"], "targetMargin is the BUYING margin; a selling breakdown cannot have it unset");
  }
  if (b.mode === "selling" && b.compare !== null) {
    issue(["compare"], "compare (their price over/under) exists only in a buying breakdown");
  }
  // (totals.maxBuyGbp is a whole pound too: it must equal the max_buy line, which is checked to be
  // a whole pound above, so no separate integer rule is needed.)

  // The mode's total line is always present (so a null total always has a reason) and agrees with
  // the total. A client reads the total from the line or the totals block and gets one answer.
  const totalLine = line(own);
  if (!totalLine) {
    issue(["lines"], `a ${b.mode} breakdown always carries a "${own}" line: a null total needs a line to carry its unknownReason`);
  } else if (totalLine.amountGbp !== ownTotal) {
    issue(["totals"], `totals and the "${own}" line disagree (${ownTotal ?? "null"} vs ${totalLine.amountGbp ?? "null"}): one figure, reported once`);
  }

  // ── The total is the SUM OF THE ROUNDED LINES (owner, 2026-10-09) ──────────────────────────
  // Every included line other than the total itself adds up, in whole pence, to the total
  // (selling), or to the total before it is rounded down to the pound (buying). One unknown
  // included line makes the total null: an unknown is never summed as 0.
  const addends = b.lines.filter((l) => l.key !== own && l.included);
  const unknownAddend = addends.find((l) => l.amountGbp === null);
  if (ownTotal !== null && unknownAddend) {
    issue(["totals"], `the "${unknownAddend.key}" line is unknown, so the total must be null: an unknown is not summed as £0`);
  } else if (ownTotal !== null) {
    const sumPence = addends.reduce((acc, l) => acc + pence(l.amountGbp as number), 0);
    if (b.mode === "selling" && pence(ownTotal) !== sumPence) {
      issue(["totals", "youReceiveGbp"], `youReceiveGbp (${ownTotal}) is not the sum of the rounded lines (${sumPence / 100})`);
    }
    if (b.mode === "buying" && ownTotal !== Math.max(0, Math.floor(sumPence / 100))) {
      issue(["totals", "maxBuyGbp"], `maxBuyGbp (${ownTotal}) is not the sum of the rounded lines (${sumPence / 100}) rounded down to the pound`);
    }
  }

  // An unset fee position, or (buying) an unset margin, withholds the mode's total.
  if (feeUnset && ownTotal !== null) {
    issue(["totals"], "the fee position is not set, so the mode's total must be null: nothing assumes a private seller");
  }
  if (b.notSet.includes("targetMargin") && b.mode === "buying" && b.totals.maxBuyGbp !== null) {
    issue(["totals", "maxBuyGbp"], "the buying margin is not set, so maxBuyGbp must be null: there is no fallback to the selling floor");
  }
  if (b.notSet.includes("targetMargin")) {
    const m = line("target_margin");
    if (m && m.amountGbp !== null) {
      issue(["lines"], 'the "target_margin" line must have amountGbp null while the buying margin is not set');
    }
  }
});
export type PricedBreakdown = z.infer<typeof PricedBreakdownSchema>;
