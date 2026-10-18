// MUTATION-CHECKED 2026-10-08 (v0.2.0 PricedBreakdown, as declared): red against dropping the
// feeBasis<->notSet rule, the sellerType-must-be-null and vatRegistered-must-be-null rules, and the
// null-fee-line rule (one test each); against `source` becoming an open string; and against
// `amountGbp` coercing null to 0 (four tests). Green against current.
//
// MUTATION-CHECKED 2026-10-08 (v0.2.0 attached breakdown): see CHANGELOG "Mutation check, round 2"
// for the list; each rule below names the test that goes red.

import { describe, it, expect } from "vitest";
import { PricedBreakdownSchema, PricedLineSchema, defaultPackingMinutes } from "./priced-breakdown.js";
import { PostageServiceSchema } from "./common.js";
import {
  line, rebalance, SELLING_KNOWN, SELLING_FEE_UNSET, BUYING_PRIVATE, BUYING_BUSINESS, BUYING_MARGIN_UNSET, BUYING_FEE_UNSET,
} from "../test-support/breakdown-fixtures.js";

const issues = (r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  r.success ? [] : r.error!.issues;
const ok = (b: unknown) => {
  const r = PricedBreakdownSchema.safeParse(b);
  expect(r.success, JSON.stringify(issues(r))).toBe(true);
};
/** Replace one line (by key) of a breakdown. */
const withLine = (b: { lines: ReturnType<typeof line>[] }, key: string, over: Record<string, unknown>) => ({
  ...b, lines: b.lines.map((l) => (l.key === key ? { ...l, ...over } : l)),
});

describe("PricedBreakdown (v0.2.0): accepts the states a real response is in", () => {
  it("accepts a fully-known selling breakdown", () => ok(SELLING_KNOWN));

  it("accepts a breakdown whose fee position is NOT SET: null fee line WITH a reason, null total, notSet names why", () => {
    ok(SELLING_FEE_UNSET);
  });

  it("accepts a business seller with the VAT question open (reason vat_not_set)", () => {
    ok({
      ...withLine(withLine(SELLING_FEE_UNSET, "ebay_fee", { unknownReason: "vat_not_set" }), "you_receive", { unknownReason: "vat_not_set" }),
      notSet: ["vatPosition"],
      feePosition: { sellerType: "business", vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
    });
  });

  it("names the SELLER TYPE reason when both seller type and VAT are open (the fee reason order)", () => {
    ok({ ...SELLING_FEE_UNSET, notSet: ["sellerType", "vatPosition"] });
  });

  it("accepts a seller-set override with the type unset: a stated cost, so the fee shows", () => {
    ok({
      ...SELLING_KNOWN,
      feePosition: { sellerType: null, vatRegistered: null, channel: "ebay", feeBasis: "seller_override" },
    });
  });

  it("accepts a buying breakdown: private £84.77 is SHOWN £84, business £66.49 is SHOWN £66", () => {
    ok(BUYING_PRIVATE);
    ok(BUYING_BUSINESS);
  });

  it("accepts a buying breakdown with an unset margin and a null most-to-pay that says margin_not_set", () => {
    ok(BUYING_MARGIN_UNSET);
  });

  it("accepts a buying breakdown with the seller type unset", () => ok(BUYING_FEE_UNSET));

  it("does not make a margin gap look like a fee gap: notSet [targetMargin] alone is a known fee position", () => {
    expect(BUYING_MARGIN_UNSET.feePosition.feeBasis).toBe("derived");
    ok(BUYING_MARGIN_UNSET);
  });

  it("carries packing time ONLY as a line: present with an hourly rate, ABSENT without one", () => {
    const withTime = rebalance({
      ...BUYING_PRIVATE,
      lines: [
        ...BUYING_PRIVATE.lines.slice(0, 3),
        line({ key: "packing_time", label: "Packing time (estimate)", amountGbp: -1, minutes: 4, source: "seller_profile", estimate: true, note: "estimate" }),
        ...BUYING_PRIVATE.lines.slice(3),
      ],
    });
    ok(withTime);
    ok(BUYING_PRIVATE);
    expect(BUYING_PRIVATE.lines.some((l) => l.key === "packing_time")).toBe(false);
    expect(BUYING_PRIVATE.lines.some((l) => l.key === "tax_set_aside")).toBe(false);
  });

  it("has NO listing time anywhere (Ben, 2026-10-09): not a line, not a key, not a field", () => {
    for (const key of ["listing_time", "your_time"]) {
      const withIt = { ...BUYING_PRIVATE, lines: [...BUYING_PRIVATE.lines, line({ key, amountGbp: -1, minutes: 5 })] };
      const r = PricedBreakdownSchema.safeParse(withIt);
      expect(r.success, key).toBe(false);
      expect(issues(r).some((i) => /retired/.test(i.message)), key).toBe(true);
    }
    const parsed = PricedBreakdownSchema.parse({ ...BUYING_PRIVATE, beside: [line({ key: "listing_time", amountGbp: 1, minutes: 5 })] }) as Record<string, unknown>;
    expect("beside" in parsed).toBe(false);   // an old server's key is stripped, never carried
    expect("included" in (PricedBreakdownSchema.parse(BUYING_PRIVATE).lines[0] as Record<string, unknown>)).toBe(false);
  });

  it("packing time is NEGATIVE, taken off, and carries its minutes; with no hourly rate it is simply absent", () => {
    const pt = (over: Record<string, unknown> = {}) => line({ key: "packing_time", amountGbp: -1, minutes: 4, estimate: true, ...over });
    expect(PricedLineSchema.safeParse(pt()).success).toBe(true);
    expect(PricedLineSchema.safeParse(pt({ amountGbp: 1 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(pt({ minutes: null })).success).toBe(false);
  });

  it("does not let a non-time line carry minutes", () => {
    expect(PricedLineSchema.safeParse(line({ key: "packing", amountGbp: -0.34, minutes: 2 })).success).toBe(false);
  });

  it("the fee line carries feeBasisVerified (false until eBay's page confirms the £10 band basis) and perOrderBand", () => {
    expect(PricedLineSchema.parse(line()).feeBasisVerified).toBe(false);
    expect(PricedLineSchema.parse(line()).perOrderBand).toBe("high");
    expect(PricedLineSchema.safeParse(line({ perOrderBand: "low" })).success).toBe(true);
    expect(PricedLineSchema.safeParse(line({ perOrderBand: "middle" })).success).toBe(false);
    // a private seller's £0 fee is not banded
    expect(PricedLineSchema.safeParse(line({ amountGbp: 0, perOrderBand: null })).success).toBe(true);
    // verified is a real value once eBay confirms it
    expect(PricedLineSchema.safeParse(line({ feeBasisVerified: true })).success).toBe(true);
  });

  it("REJECTS a fee figure with no feeBasisVerified, and a basis or band on an UNKNOWN fee", () => {
    expect(PricedLineSchema.safeParse(line({ feeBasisVerified: null })).success).toBe(false);
    const unknown = { amountGbp: null, unknownReason: "seller_type_not_set" };
    expect(PricedLineSchema.safeParse(line({ ...unknown })).success).toBe(true);
    expect(PricedLineSchema.safeParse(line({ ...unknown, feeBasisVerified: false })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ ...unknown, perOrderBand: "low" })).success).toBe(false);
  });

  // ── the postage line's `service` (closed code, no label; H6 "SERVICES YOU OFFER") ──────────────
  const postage = (over: Record<string, unknown> = {}) =>
    line({ key: "postage", amountGbp: -3.29, source: "seller_profile", service: "tracked48_sp", note: null, ...over });

  it("is exactly the four services H6 draws, as the keys #229 stores, and nothing invented", () => {
    expect([...PostageServiceSchema.options]).toEqual(["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]);
  });

  it("accepts each service on a seller-paid postage line, and null service", () => {
    for (const service of PostageServiceSchema.options) {
      expect(PricedLineSchema.safeParse(postage({ service })).success, service).toBe(true);
    }
    expect(PricedLineSchema.safeParse(postage({ service: null })).success).toBe(true);
    const { service: _s, ...absent } = postage();
    expect(PricedLineSchema.safeParse(absent).success).toBe(true);
  });

  it("models free postage and buyer-pays as NO service: they are a threshold and a mode, not services", () => {
    expect(PostageServiceSchema.safeParse("free").success).toBe(false);
    expect(PostageServiceSchema.safeParse("buyer_pays").success).toBe(false);
    expect(PricedLineSchema.safeParse(postage({ amountGbp: 0, service: null, note: "buyer_pays" })).success).toBe(true);
    // the buyer pays, so the seller uses no service
    expect(PricedLineSchema.safeParse(postage({ amountGbp: 0, note: "buyer_pays" })).success).toBe(false);
    // free to the buyer above the threshold: the SELLER pays the service Dispatch would use
    expect(PricedLineSchema.safeParse(postage({ note: "free_postage" })).success).toBe(true);
  });

  it("REJECTS a service on any line but postage, and on an unknown postage figure", () => {
    expect(PricedLineSchema.safeParse(line({ key: "packing", amountGbp: -0.34, service: "rm48_ll" })).success).toBe(false);
    expect(PricedLineSchema.safeParse(postage({ amountGbp: null, unknownReason: "no_price" })).success).toBe(false);
  });

  it("REJECTS a service outside the closed list, and carries no label", () => {
    expect(PricedLineSchema.safeParse(postage({ service: "royal_mail_48" })).success).toBe(false);
    expect(PricedLineSchema.safeParse(postage({ service: "Royal Mail 48 · large letter" })).success).toBe(false);
  });

  it("REJECTS fee-basis fields on any other line", () => {
    expect(PricedLineSchema.safeParse(line({ key: "postage", amountGbp: -3.29, feeBasisVerified: false })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "postage", amountGbp: -3.29, perOrderBand: "low" })).success).toBe(false);
  });

  it("carries tax set aside ONLY as a line, a deduction, when the seller has set a rate", () => {
    ok(rebalance({
      ...BUYING_PRIVATE,
      lines: [
        ...BUYING_PRIVATE.lines.slice(0, 5),
        line({ key: "tax_set_aside", label: "Tax set aside", amountGbp: -11.9, source: "seller_profile", note: null }),
        ...BUYING_PRIVATE.lines.slice(5),
      ],
    }));
  });

  it("round-trips through JSON", () => {
    for (const b of [SELLING_KNOWN, SELLING_FEE_UNSET, BUYING_PRIVATE, BUYING_MARGIN_UNSET]) {
      const parsed = PricedBreakdownSchema.parse(b);
      expect(PricedBreakdownSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    }
  });
});

describe("PricedLine: an unknown figure is null WITH a reason, never 0; a known figure never has one", () => {
  it("REJECTS a null amount with no reason: an unexplained null cannot reach a client", () => {
    const r = PricedLineSchema.safeParse(line({ amountGbp: null }));
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "unknownReason")).toBe(true);
  });

  it("REJECTS a figure that also carries a reason: which would a client believe?", () => {
    expect(PricedLineSchema.safeParse(line({ amountGbp: -18.28, unknownReason: "seller_type_not_set" })).success).toBe(false);
  });

  it("REJECTS the key being absent (it is a REQUIRED key, so a null cannot hide by omission)", () => {
    const { unknownReason: _u, ...noReason } = line({ amountGbp: null, unknownReason: "no_price" });
    expect(PricedLineSchema.safeParse(noReason).success).toBe(false);
  });

  it("keeps an unknown amount null, never coerced to 0, and keeps the reason with it", () => {
    const parsed = PricedLineSchema.parse(line({ amountGbp: null, unknownReason: "seller_type_not_set" }));
    expect(parsed.amountGbp).toBeNull();
    expect(parsed.unknownReason).toBe("seller_type_not_set");
  });

  it("accepts every reason in the shared five-value vocabulary, and REJECTS an unlisted one", () => {
    for (const reason of ["margin_not_set", "seller_type_not_set", "vat_not_set", "no_price", "not_viable"]) {
      expect(PricedLineSchema.safeParse(line({ amountGbp: null, unknownReason: reason })).success, reason).toBe(true);
    }
    expect(PricedLineSchema.safeParse(line({ amountGbp: null, unknownReason: "private_assumed" })).success).toBe(false);
  });

  it("has an `estimate` flag that is not the same fact as `assumed`", () => {
    // Packing time is an estimate even when the seller supplied the hourly rate (assumed false).
    expect(PricedLineSchema.safeParse(line({ key: "packing_time", amountGbp: -1, minutes: 4, estimate: true, assumed: false })).success).toBe(true);
    // ...and `estimate` is REQUIRED: a missing flag would let "(estimate)" silently vanish.
    const { estimate: _e, ...noEstimate } = line();
    expect(PricedLineSchema.safeParse(noEstimate).success).toBe(false);
  });

  it("keeps `key` and `note` OPEN strings (ADR 0027) but `source` a closed enum", () => {
    expect(PricedLineSchema.safeParse(line({ key: "a_line_added_next_year", note: "a_note_nobody_knows_yet" })).success).toBe(true);
    expect(PricedLineSchema.safeParse(line({ source: "invented_by_the_client" })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ editKey: "feeRate" })).success).toBe(false);
  });

  it("allows the label to be absent (UNRULED: route-resolved text vs codes only)", () => {
    const { label: _l, ...noLabel } = line();
    expect(PricedLineSchema.safeParse(noLabel).success).toBe(true);
  });

  it("applies the sign rule to KNOWN keys: value lines positive, deductions negative or zero", () => {
    expect(PricedLineSchema.safeParse(line({ key: "ebay_fee", amountGbp: 18.28 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "postage", amountGbp: 3.29 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "ebay_fee", amountGbp: 0 })).success).toBe(true);      // a private seller's real fee
    expect(PricedLineSchema.safeParse(line({ key: "you_receive", amountGbp: -1 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "sale_price", amountGbp: -167 })).success).toBe(false);
    // an unknown key has no sign rule
    expect(PricedLineSchema.safeParse(line({ key: "a_new_line", amountGbp: 5 })).success).toBe(true);
  });

  it("requires the max_buy line to be a WHOLE pound: the server rounds down, no screen rounds", () => {
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: 84, note: null })).success).toBe(true);
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: 84.77, note: null })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: 0, note: null })).success).toBe(true); // £0 is a real "pay nothing"
  });
});

describe("PricedBreakdown: rules that keep the fee position and the totals honest", () => {
  it("REJECTS 'not set' that contradicts the fee basis, in both directions", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_FEE_UNSET, feePosition: { ...SELLING_FEE_UNSET.feePosition, feeBasis: "derived" } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, feePosition: { ...SELLING_KNOWN.feePosition, feeBasis: "not_set" } }).success).toBe(false);
  });

  it("REJECTS a seller type or VAT answer reported alongside the notSet that says it is unknown", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_FEE_UNSET, feePosition: { ...SELLING_FEE_UNSET.feePosition, sellerType: "private" } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({
      ...SELLING_FEE_UNSET, notSet: ["vatPosition"],
      feePosition: { sellerType: "business", vatRegistered: false, channel: "ebay", feeBasis: "not_set" },
    }).success).toBe(false);
  });

  it("REJECTS a fee line carrying a figure while the fee position is not set", () => {
    expect(PricedBreakdownSchema.safeParse(withLine(SELLING_FEE_UNSET, "ebay_fee", { amountGbp: -18.28, unknownReason: null })).success).toBe(false);
  });

  it("REJECTS a fee line whose reason is not the fee position's own", () => {
    // seller type is the open question, but the line blames the VAT position
    const r = PricedBreakdownSchema.safeParse(withLine(SELLING_FEE_UNSET, "ebay_fee", { unknownReason: "vat_not_set" }));
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /unknownReason must be seller_type_not_set/.test(i.message))).toBe(true);
    // ...and not a margin reason on the fee line
    expect(PricedBreakdownSchema.safeParse(withLine(SELLING_FEE_UNSET, "ebay_fee", { unknownReason: "margin_not_set" })).success).toBe(false);
  });

  it("REJECTS a total with the fee position unset: nothing assumes a private seller", () => {
    const r = PricedBreakdownSchema.safeParse({
      ...SELLING_FEE_UNSET, totals: { youReceiveGbp: 166.66, maxBuyGbp: null, askingPriceOnly: false },
      lines: SELLING_FEE_UNSET.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: 166.66, unknownReason: null } : l)),
    });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /fee position is not set/.test(i.message))).toBe(true);
  });

  it("REJECTS a most-to-pay while the buying margin is unset: no fallback to the selling floor", () => {
    const r = PricedBreakdownSchema.safeParse({
      ...BUYING_MARGIN_UNSET, totals: { youReceiveGbp: null, maxBuyGbp: 70, askingPriceOnly: false },
      lines: BUYING_MARGIN_UNSET.lines.map((l) => (l.key === "max_buy" ? { ...l, amountGbp: 70, unknownReason: null } : l)),
    });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /margin is not set/.test(i.message))).toBe(true);
  });

  it("REJECTS a margin figure on the margin line while the margin is not set", () => {
    expect(PricedBreakdownSchema.safeParse(withLine(BUYING_MARGIN_UNSET, "target_margin", { amountGbp: -47.6, unknownReason: null })).success).toBe(false);
  });

  it("REQUIRES the mode's total line (rule 4): a null total needs a line to carry its reason", () => {
    const r = PricedBreakdownSchema.safeParse({ ...SELLING_FEE_UNSET, lines: SELLING_FEE_UNSET.lines.filter((l) => l.key !== "you_receive") });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /always carries a "you_receive" line/.test(i.message))).toBe(true);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: BUYING_PRIVATE.lines.filter((l) => l.key !== "max_buy") }).success).toBe(false);
  });

  it("REJECTS totals that disagree with the total line: one figure, reported once", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, totals: { youReceiveGbp: 150, maxBuyGbp: null, askingPriceOnly: false } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: 85, askingPriceOnly: false } }).success).toBe(false);
  });

  it("REJECTS the OTHER mode's total: a sale has no most-to-pay and a purchase has no receipt", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, totals: { youReceiveGbp: 148.38, maxBuyGbp: 84, askingPriceOnly: false } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: 12, maxBuyGbp: 84, askingPriceOnly: false } }).success).toBe(false);
  });

  it("REJECTS a fractional most-to-pay total", () => {
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: 84.77, askingPriceOnly: false } }).success).toBe(false);
  });

  it("REJECTS buying-only inputs in a selling breakdown (the buying margin, their price)", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_FEE_UNSET, notSet: ["sellerType", "targetMargin"] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, compare: { theirPriceGbp: 90, overUnderGbp: 5 } }).success).toBe(false);
  });

  it("REJECTS two lines with one key: a client finds a line by key", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, lines: [...SELLING_KNOWN.lines, SELLING_KNOWN.lines[1]] }).success).toBe(false);
  });

  it("does not require a fee line at all (the `direct` channel's fee line is undefined in the plans)", () => {
    ok({
      ...rebalance({ ...SELLING_KNOWN, lines: SELLING_KNOWN.lines.filter((l) => l.key !== "ebay_fee") }),
      feePosition: { sellerType: null, vatRegistered: null, channel: "direct", feeBasis: "seller_override" },
    });
  });
});

// ── Owner rulings, 2026-10-09 ──────────────────────────────────────────────────────────────────

describe("rounding: every line to the penny, and the total is the SUM OF THE ROUNDED LINES", () => {
  it("accepts a selling total that is exactly the sum of its lines, and REJECTS one that is a penny out", () => {
    ok(SELLING_KNOWN);
    const out = (youReceiveGbp: number) => ({ ...SELLING_KNOWN, totals: { youReceiveGbp, maxBuyGbp: null, askingPriceOnly: false },
      lines: SELLING_KNOWN.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: youReceiveGbp } : l)) });
    const r = PricedBreakdownSchema.safeParse(out(148.39));
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /not the sum of the rounded lines/.test(i.message))).toBe(true);
    expect(PricedBreakdownSchema.safeParse(out(148.37)).success).toBe(false);
  });

  it("REJECTS a line that is not rounded to the penny, even when the total would foot to it", () => {
    const r = PricedLineSchema.safeParse(line({ key: "postage", amountGbp: -3.285 }));
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /rounded to the penny/.test(i.message))).toBe(true);
    expect(PricedLineSchema.safeParse(line({ key: "postage", amountGbp: -3.29 })).success).toBe(true);
    // a float that IS a whole number of pence (0.1 + 0.2) is fine: tolerance is for float noise only
    expect(PricedLineSchema.safeParse(line({ key: "sale_price", amountGbp: 0.1 + 0.2, source: "request", note: null })).success).toBe(true);
  });

  it("sums each line ROUNDED, not the unrounded figures behind them: three £0.335 fees are three £0.34 lines", () => {
    // 0.335 x 3 = 1.005 -> 1.01 if rounded once at the end; 3 x 0.34 = 1.02 if each is rounded first.
    const mk = (sale: number) => rebalance({
      ...SELLING_KNOWN,
      lines: [
        line({ key: "sale_price", amountGbp: sale, source: "request", note: null }),
        line({ key: "ebay_fee", amountGbp: -0.34, perOrderBand: "low" }),
        line({ key: "fee_vat", amountGbp: -0.34, source: "fee_model", note: "vat_unrecoverable" }),
        line({ key: "packing", amountGbp: -0.34, source: "default", assumed: true, estimate: true, note: "estimate" }),
        line({ key: "you_receive", amountGbp: 0, source: "fee_model", note: null }),
      ],
    });
    const b = mk(10);
    expect(b.totals.youReceiveGbp).toBe(8.98);   // 10 - 1.02, the sum of the ROUNDED lines
    ok(b);
    expect(PricedBreakdownSchema.safeParse({ ...b, totals: { youReceiveGbp: 8.99, maxBuyGbp: null, askingPriceOnly: false },
      lines: b.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: 8.99 } : l)) }).success).toBe(false);
  });

  it("buying: the total is the sum rounded DOWN to the pound (£84.77 -> £84), never to the nearest", () => {
    ok(BUYING_PRIVATE);
    const to = (maxBuy: number) => ({ ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: maxBuy, askingPriceOnly: false },
      lines: BUYING_PRIVATE.lines.map((l) => (l.key === "max_buy" ? { ...l, amountGbp: maxBuy } : l)) });
    expect(PricedBreakdownSchema.safeParse(to(85)).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse(to(83)).success).toBe(false);
  });

  it("buying: a sum under £1 is a £0 most-to-pay (a real 'pay nothing'), and a negative sum is £0, not negative", () => {
    const cheap = rebalance({ ...BUYING_PRIVATE, lines: BUYING_PRIVATE.lines.map((l) => (l.key === "sale_price" ? { ...l, amountGbp: 52.21 } : l)) });
    // 52.21 - 0.34 - 3.29 - 47.60 = 0.98
    expect(cheap.totals.maxBuyGbp).toBe(0);
    ok(cheap);
    const underwater = rebalance({ ...BUYING_PRIVATE, lines: BUYING_PRIVATE.lines.map((l) => (l.key === "sale_price" ? { ...l, amountGbp: 10 } : l)) });
    expect(underwater.totals.maxBuyGbp).toBe(0);
    ok(underwater);
    const negative = { ...underwater, totals: { youReceiveGbp: null, maxBuyGbp: -41, askingPriceOnly: false },
      lines: underwater.lines.map((l) => (l.key === "max_buy" ? { ...l, amountGbp: -41 } : l)) };
    expect(PricedBreakdownSchema.safeParse(negative).success).toBe(false);
  });

  it("an unknown line makes the total null: an unknown is never summed as £0", () => {
    const unknownPostage = { ...SELLING_KNOWN, lines: SELLING_KNOWN.lines.map((l) => (l.key === "postage" ? { ...l, amountGbp: null, unknownReason: "no_price", note: null } : l)) };
    const r = PricedBreakdownSchema.safeParse(unknownPostage);
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /not summed as £0/.test(i.message))).toBe(true);
    // ...and the same breakdown with a null total (and the reason on it) is the honest one
    ok({ ...unknownPostage, totals: NO_TOTAL(), lines: unknownPostage.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: null, unknownReason: "no_price" } : l)) });
  });

  it("sums pence by ROUNDING each line, not truncating: £0.29 is 29p although 0.29 x 100 is 28.999...", () => {
    const tiny = rebalance({ ...SELLING_KNOWN, lines: [
      line({ key: "sale_price", amountGbp: 0.29, source: "request", note: null }),
      line({ key: "you_receive", amountGbp: 0, source: "fee_model", note: null }),
    ] });
    expect(tiny.totals.youReceiveGbp).toBe(0.29);
    ok(tiny);
  });

});

function NO_TOTAL() { return { youReceiveGbp: null, maxBuyGbp: null, askingPriceOnly: false }; }

describe("you receive can be NEGATIVE: the true negative is sent, flagged pays_to_sell", () => {
  const loss = rebalance({
    ...SELLING_KNOWN,
    lines: SELLING_KNOWN.lines.map((l) => (l.key === "sale_price" ? { ...l, amountGbp: 5 } : l)),
  });
  // 5 - 18.28 - 0 - 0.34 = -13.62
  const withNote = (note: string | null) => ({ ...loss, lines: loss.lines.map((l) => (l.key === "you_receive" ? { ...l, note } : l)) });

  it("accepts a negative total with note pays_to_sell and does NOT clamp it to 0", () => {
    expect(loss.totals.youReceiveGbp).toBe(-13.62);
    ok(withNote("pays_to_sell"));
    expect(PricedBreakdownSchema.parse(withNote("pays_to_sell")).totals.youReceiveGbp).toBe(-13.62);
  });

  it("REJECTS a negative you_receive without the pays_to_sell flag, and a clamped £0 where the lines say -£13.62", () => {
    expect(PricedBreakdownSchema.safeParse(withNote(null)).success).toBe(false);
    const clamped = { ...withNote("pays_to_sell"), totals: { youReceiveGbp: 0, maxBuyGbp: null, askingPriceOnly: false },
      lines: withNote("pays_to_sell").lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: 0 } : l)) };
    expect(PricedBreakdownSchema.safeParse(clamped).success).toBe(false);
  });

  it("still never lets a sale price or a most-to-pay go negative", () => {
    expect(PricedLineSchema.safeParse(line({ key: "sale_price", amountGbp: -5, source: "request", note: null })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: -1, note: null })).success).toBe(false);
  });
});

describe("postage basis: the eBay policy for a PUBLISHED listing, Dispatch rules for an ESTIMATE", () => {
  const postageLine = (over: Record<string, unknown> = {}) =>
    line({ key: "postage", amountGbp: -3.29, source: "seller_profile", service: "tracked48_sp", postageBasis: "dispatch_rules", note: null, ...over });

  it("accepts an estimate on Dispatch rules with a service, and a published listing on the policy with none", () => {
    expect(PricedLineSchema.safeParse(postageLine()).success).toBe(true);
    expect(PricedLineSchema.safeParse(postageLine({ source: "ebay_policy", service: null, postageBasis: "ebay_policy" })).success).toBe(true);
  });

  it("REJECTS a basis that contradicts the line's source, and a Dispatch service on a policy figure", () => {
    expect(PricedLineSchema.safeParse(postageLine({ postageBasis: "ebay_policy", service: null })).success).toBe(false);       // source seller_profile
    expect(PricedLineSchema.safeParse(postageLine({ source: "ebay_policy" })).success).toBe(false);                            // dispatch_rules from the policy
    expect(PricedLineSchema.safeParse(postageLine({ source: "ebay_policy", postageBasis: "ebay_policy" })).success).toBe(false); // policy + a service
  });

  it("is closed, optional (older servers), and belongs to the postage line only", () => {
    expect(PricedLineSchema.safeParse(postageLine({ postageBasis: "estimate" })).success).toBe(false);
    const { postageBasis: _p, ...none } = postageLine();
    expect(PricedLineSchema.safeParse(none).success).toBe(true);
    expect(PricedLineSchema.safeParse(line({ key: "packing", amountGbp: -0.34, postageBasis: "dispatch_rules" })).success).toBe(false);
  });
});

describe("packing time: the ruled default is 4 minutes a parcel and 2 for each extra card", () => {
  it("computes 4, 6, 8 ... for 1, 2, 3 cards, with no letter/parcel split", () => {
    expect([1, 2, 3, 10].map(defaultPackingMinutes)).toEqual([4, 6, 8, 22]);
  });

  it("refuses a parcel with no cards or a fractional count", () => {
    expect(() => defaultPackingMinutes(0)).toThrow(RangeError);
    expect(() => defaultPackingMinutes(1.5)).toThrow(RangeError);
    expect(() => defaultPackingMinutes(-1)).toThrow(RangeError);
  });

  it("a packing_time line on the default minutes is flagged estimate; the seller's own minutes are not", () => {
    const pt = (estimate: boolean, minutes: number) => line({ key: "packing_time", amountGbp: -1, minutes, estimate, source: "seller_profile", note: estimate ? "estimate" : null });
    expect(PricedLineSchema.safeParse(pt(true, defaultPackingMinutes(1))).success).toBe(true);
    expect(PricedLineSchema.safeParse(pt(false, 7)).success).toBe(true);
  });
});

describe("a figure from asking prices is a CEILING, shown and flagged, not a null (Ben, 2026-10-09; rule 10)", () => {
  const ceiling = { ...BUYING_PRIVATE, totals: { ...BUYING_PRIVATE.totals, askingPriceOnly: true } };

  it("accepts a most-to-pay that is SHOWN with askingPriceOnly true", () => {
    ok(ceiling);
    expect(PricedBreakdownSchema.parse(ceiling).totals.maxBuyGbp).toBe(84);
    expect(PricedBreakdownSchema.parse(ceiling).totals.askingPriceOnly).toBe(true);
  });

  it("asking_price_only is no longer a reason a figure is null: it is not in the vocabulary", () => {
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: null, unknownReason: "asking_price_only", note: null })).success).toBe(false);
    expect(PricedLineSchema.safeParse(line({ key: "max_buy", amountGbp: null, unknownReason: "no_price", note: null })).success).toBe(true);
  });

  it("REJECTS the flag on a figure that is withheld: a ceiling that is not shown is just no_price", () => {
    const r = PricedBreakdownSchema.safeParse({ ...BUYING_FEE_UNSET, totals: { ...BUYING_FEE_UNSET.totals, askingPriceOnly: true } });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /flags a SHOWN figure/.test(i.message))).toBe(true);
  });

  it("REJECTS the flag on a selling breakdown, which has no most-to-pay", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, totals: { ...SELLING_KNOWN.totals, askingPriceOnly: true } }).success).toBe(false);
  });

  it("REQUIRES the flag on totals: an absent key is not 'false'", () => {
    const { askingPriceOnly: _a, ...noFlag } = BUYING_PRIVATE.totals;
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: noFlag }).success).toBe(false);
  });
});
