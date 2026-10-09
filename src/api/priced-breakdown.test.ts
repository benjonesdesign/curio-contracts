// MUTATION-CHECKED 2026-10-08 (v0.2.0 PricedBreakdown, as declared): red against dropping the
// feeBasis<->notSet rule, the sellerType-must-be-null and vatRegistered-must-be-null rules, and the
// null-fee-line rule (one test each); against `source` becoming an open string; and against
// `amountGbp` coercing null to 0 (four tests). Green against current.
//
// MUTATION-CHECKED 2026-10-08 (v0.2.0 attached breakdown): see CHANGELOG "Mutation check, round 2"
// for the list; each rule below names the test that goes red.

import { describe, it, expect } from "vitest";
import { PricedBreakdownSchema, PricedLineSchema } from "./priced-breakdown.js";
import { PostageServiceSchema } from "./common.js";
import {
  line, SELLING_KNOWN, SELLING_FEE_UNSET, BUYING_PRIVATE, BUYING_BUSINESS, BUYING_MARGIN_UNSET, BUYING_FEE_UNSET,
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
    const withTime = {
      ...BUYING_PRIVATE,
      lines: [
        ...BUYING_PRIVATE.lines.slice(0, 3),
        line({ key: "packing_time", label: "Packing time (estimate)", amountGbp: -1, minutes: 4, source: "seller_profile", estimate: true, note: "estimate" }),
        ...BUYING_PRIVATE.lines.slice(3),
      ],
    };
    ok(withTime);
    ok(BUYING_PRIVATE);
    expect(BUYING_PRIVATE.lines.some((l) => l.key === "packing_time")).toBe(false);
    expect(BUYING_PRIVATE.lines.some((l) => l.key === "tax_set_aside")).toBe(false);
  });

  const LISTING = (over: Record<string, unknown> = {}) =>
    line({ key: "listing_time", label: "Listing time (estimate)", amountGbp: 1, minutes: 5, source: "seller_profile", estimate: true, included: false, note: "not_included", ...over });

  it("carries LISTING time in `beside`, never in `lines`: a positive magnitude, minutes, included false", () => {
    ok({ ...BUYING_PRIVATE, beside: [LISTING()] });
    expect(BUYING_PRIVATE.beside).toEqual([]);   // no hourly rate: nothing beside
  });

  it("REJECTS listing time anywhere in the arithmetic, taken off, or beside but included", () => {
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: [...BUYING_PRIVATE.lines, LISTING()] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: [...BUYING_PRIVATE.lines, LISTING({ included: true })] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, beside: [LISTING({ included: true })] }).success).toBe(false);
    expect(PricedLineSchema.safeParse(LISTING({ included: true })).success).toBe(false);
  });

  it("isolates the container rules with an UNKNOWN key (no key-specific rule can be what rejects it)", () => {
    const extra = (over: Record<string, unknown>) => line({ key: "a_new_line", amountGbp: 1, ...over });
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: [...BUYING_PRIVATE.lines, extra({ included: false })] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, beside: [extra({ included: true })] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, beside: [extra({ included: false })] }).success).toBe(true);
  });

  it("REJECTS a beside line repeating a key, in beside or in lines", () => {
    const x = line({ key: "a_new_line", amountGbp: 1, included: false });
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, beside: [x, x] }).success).toBe(false);
    const inLines = line({ key: "a_new_line", amountGbp: 1 });
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: [...BUYING_PRIVATE.lines, inLines], beside: [x] }).success).toBe(false);
  });

  it("REJECTS a NEGATIVE listing time (it is a magnitude beside the sum, not a deduction) and one with no minutes", () => {
    expect(PricedLineSchema.safeParse(LISTING({ amountGbp: -1 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(LISTING({ minutes: null })).success).toBe(false);
    expect(PricedLineSchema.safeParse(LISTING({ minutes: 4.5 })).success).toBe(false);
    expect(PricedLineSchema.safeParse(LISTING({ minutes: -1 })).success).toBe(false);
  });

  it("REQUIRES the `beside` key (empty without a rate) and refuses a sum line in it", () => {
    const { beside: _b, ...noBeside } = BUYING_PRIVATE;
    expect(PricedBreakdownSchema.safeParse(noBeside).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, beside: [line({ key: "packing", amountGbp: -0.34, included: false })] }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, lines: BUYING_PRIVATE.lines.map((l) => (l.key === "packing" ? { ...l, included: false } : l)) }).success).toBe(false);
  });

  it("packing time IS taken off (included true, NEGATIVE, with minutes); a sum line may not be marked excluded", () => {
    const pt = (over: Record<string, unknown> = {}) => line({ key: "packing_time", amountGbp: -1, minutes: 4, estimate: true, ...over });
    expect(PricedLineSchema.safeParse(pt()).success).toBe(true);
    expect(PricedLineSchema.safeParse(pt({ included: false })).success).toBe(false);
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

  it("REQUIRES `included` on an UNKNOWN key too: a client never decides it from the key", () => {
    const { included: _i, ...noIncluded } = line({ key: "a_new_line" });
    expect(PricedLineSchema.safeParse(noIncluded).success).toBe(false);
  });

  it("REQUIRES `included` on every line", () => {
    const { included: _i, ...noIncluded } = line();
    expect(PricedLineSchema.safeParse(noIncluded).success).toBe(false);
  });

  it("carries tax set aside ONLY as a line, a deduction, when the seller has set a rate", () => {
    ok({
      ...BUYING_PRIVATE,
      lines: [
        ...BUYING_PRIVATE.lines.slice(0, 5),
        line({ key: "tax_set_aside", label: "Tax set aside", amountGbp: -11.9, source: "seller_profile", note: null }),
        ...BUYING_PRIVATE.lines.slice(5),
      ],
    });
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

  it("accepts every reason in the shared six-value vocabulary, and REJECTS an unlisted one", () => {
    for (const reason of ["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]) {
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
      ...SELLING_FEE_UNSET, totals: { youReceiveGbp: 166.66, maxBuyGbp: null },
      lines: SELLING_FEE_UNSET.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: 166.66, unknownReason: null } : l)),
    });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /fee position is not set/.test(i.message))).toBe(true);
  });

  it("REJECTS a most-to-pay while the buying margin is unset: no fallback to the selling floor", () => {
    const r = PricedBreakdownSchema.safeParse({
      ...BUYING_MARGIN_UNSET, totals: { youReceiveGbp: null, maxBuyGbp: 70 },
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
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, totals: { youReceiveGbp: 150, maxBuyGbp: null } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: 85 } }).success).toBe(false);
  });

  it("REJECTS the OTHER mode's total: a sale has no most-to-pay and a purchase has no receipt", () => {
    expect(PricedBreakdownSchema.safeParse({ ...SELLING_KNOWN, totals: { youReceiveGbp: 148.38, maxBuyGbp: 84 } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: 12, maxBuyGbp: 84 } }).success).toBe(false);
  });

  it("REJECTS a fractional most-to-pay total", () => {
    expect(PricedBreakdownSchema.safeParse({ ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: 84.77 } }).success).toBe(false);
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
      ...SELLING_KNOWN,
      lines: SELLING_KNOWN.lines.filter((l) => l.key !== "ebay_fee"),
      feePosition: { sellerType: null, vatRegistered: null, channel: "direct", feeBasis: "seller_override" },
    });
  });
});
