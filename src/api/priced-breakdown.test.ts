// MUTATION-CHECKED 2026-10-08 (v0.2.0 PricedBreakdown): red against dropping the feeBasis<->notSet
// rule, the sellerType-must-be-null and vatRegistered-must-be-null rules, and the null-fee-line
// rule (one test each); against `source` becoming an open string; and against `amountGbp` coercing
// null to 0 (four tests). Green against current.

import { describe, it, expect } from "vitest";
import { PricedBreakdownSchema, PricedLineSchema } from "./priced-breakdown.js";

const line = (over: Record<string, unknown> = {}) => ({
  key: "ebay_fee", label: "eBay fee", amountGbp: -18.28, source: "fee_model", assumed: false,
  editable: false, editKey: null, note: "vat_reclaimed", ...over,
});
const KNOWN = {
  mode: "selling",
  lines: [
    line({ key: "sale_price", label: "Sale price", amountGbp: 167, source: "request", note: null }),
    line(),
    line({ key: "postage", amountGbp: 0, source: "ebay_policy", note: "buyer_pays" }),
    line({ key: "packing", amountGbp: -0.34, source: "seller_profile", editable: true, editKey: "packingKey", note: null }),
    line({ key: "you_receive", amountGbp: 148.38, source: "fee_model", note: null }),
  ],
  totals: { youReceiveGbp: 148.38, maxBuyGbp: null },
  compare: null,
  feePosition: { sellerType: "business", vatRegistered: true, channel: "ebay", feeBasis: "derived" },
  notSet: [],
  price: { gbp: 167, source: null, kind: null, asOf: null, cached: false },
  computedAt: "2026-10-08T09:30:00.000Z",
};
const UNSET = {
  ...KNOWN,
  lines: [line({ key: "sale_price", amountGbp: 167, source: "request", note: null }), line({ amountGbp: null, note: null })],
  totals: { youReceiveGbp: null, maxBuyGbp: null },
  feePosition: { sellerType: null, vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
  notSet: ["sellerType"],
};

describe("PricedBreakdown (v0.2.0, additive)", () => {
  it("accepts a fully-known selling breakdown", () => {
    const r = PricedBreakdownSchema.safeParse(KNOWN);
    expect(r.success, JSON.stringify(r.success ? [] : r.error.issues)).toBe(true);
  });

  it("accepts a breakdown whose fee position is NOT SET: null fee line, null total, notSet names why", () => {
    const r = PricedBreakdownSchema.safeParse(UNSET);
    expect(r.success, JSON.stringify(r.success ? [] : r.error.issues)).toBe(true);
  });

  it("accepts a business seller with the VAT question open", () => {
    expect(PricedBreakdownSchema.safeParse({
      ...UNSET, notSet: ["vatPosition"],
      feePosition: { sellerType: "business", vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
    }).success).toBe(true);
  });

  it("accepts a seller-set override with the type unset: a stated cost, so the fee shows", () => {
    expect(PricedBreakdownSchema.safeParse({
      ...KNOWN,
      feePosition: { sellerType: null, vatRegistered: null, channel: "ebay", feeBasis: "seller_override" },
    }).success).toBe(true);
  });

  it("accepts a buying breakdown with a null most-to-pay and an unset margin", () => {
    expect(PricedBreakdownSchema.safeParse({
      ...KNOWN, mode: "buying", totals: { youReceiveGbp: null, maxBuyGbp: null }, notSet: ["targetMargin"],
      compare: { theirPriceGbp: 90, overUnderGbp: 5 },
      price: { gbp: 136, source: "cardtrader", kind: "asking", asOf: "2026-10-07T18:00:00.000Z", cached: true },
    }).success).toBe(true);
  });

  it("REJECTS 'not set' that contradicts the fee basis, in both directions", () => {
    expect(PricedBreakdownSchema.safeParse({ ...UNSET, feePosition: { ...UNSET.feePosition, feeBasis: "derived" } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({ ...KNOWN, feePosition: { ...KNOWN.feePosition, feeBasis: "not_set" } }).success).toBe(false);
  });

  it("REJECTS a seller type or VAT answer reported alongside the notSet that says it is unknown", () => {
    expect(PricedBreakdownSchema.safeParse({ ...UNSET, feePosition: { ...UNSET.feePosition, sellerType: "private" } }).success).toBe(false);
    expect(PricedBreakdownSchema.safeParse({
      ...UNSET, notSet: ["vatPosition"],
      feePosition: { sellerType: "business", vatRegistered: false, channel: "ebay", feeBasis: "not_set" },
    }).success).toBe(false);
  });

  it("REJECTS a fee line carrying a figure while the fee position is not set", () => {
    const r = PricedBreakdownSchema.safeParse({ ...UNSET, lines: [line({ amountGbp: -18.28 })] });
    expect(r.success).toBe(false);
  });

  it("does not make a margin gap look like a fee gap: notSet [targetMargin] alone is a known fee position", () => {
    expect(PricedBreakdownSchema.safeParse({ ...KNOWN, mode: "buying", notSet: ["targetMargin"] }).success).toBe(true);
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

  it("keeps an unknown amount null, never coerced to 0", () => {
    const parsed = PricedLineSchema.parse(line({ amountGbp: null }));
    expect(parsed.amountGbp).toBeNull();
  });

  it("round-trips through JSON", () => {
    for (const b of [KNOWN, UNSET]) {
      const parsed = PricedBreakdownSchema.parse(b);
      expect(PricedBreakdownSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    }
  });
});
