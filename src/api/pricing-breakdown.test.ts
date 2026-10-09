// MUTATION-CHECKED 2026-10-08 (v0.2.0 attached breakdown): see CHANGELOG "Mutation check, round 2".
//
// MUTATION-CHECKED 2026-10-08 (v0.2.0 nullable fee): red against dropping the
// ebayFee<->feeNotSetReason coupling, and red against dropping the loop that makes grossProfit /
// taxProvision / netProfit / netMarginPct / minViablePrice / isMarketBelowMin follow the fee (a
// surviving figure beside a null fee, and a missing figure beside a known fee); green against
// current.

import { describe, it, expect } from "vitest";
import { PricingBreakdownRequestSchema, PricingBreakdownResponseSchema } from "./pricing-breakdown.js";
import { SELLING_KNOWN, SELLING_FEE_UNSET, BUYING_PRIVATE } from "../test-support/breakdown-fixtures.js";

describe("PricingBreakdownRequestSchema", () => {
  it("accepts a minimal request (no settings override, the iOS case)", () => {
    const r = PricingBreakdownRequestSchema.parse({ price: 12.5, purchaseCost: 4, marketMedian: 11 });
    expect(r.price).toBe(12.5);
    expect(r.settings).toBeUndefined();
  });

  it("accepts an explicit settings override (web's local not-yet-saved draft)", () => {
    const r = PricingBreakdownRequestSchema.parse({
      price: 12.5, purchaseCost: 4, marketMedian: 11,
      settings: {
        ebayFeeRate: 0.128, ebayFeeFixed: 0.3, packagingCost: 0.1, shippingCost: 0,
        taxRate: 0.2, minProfitPct: 0.25, minSaleValue: 2.5, postageCost: 1.55,
      },
    });
    expect(r.settings?.ebayFeeRate).toBe(0.128);
  });

  it("accepts priceSource and collectionType", () => {
    const r = PricingBreakdownRequestSchema.parse({
      price: 12.5, purchaseCost: 4, marketMedian: 11,
      priceSource: "ebay-uk-sold", collectionType: "personal",
    });
    expect(r.priceSource).toBe("ebay-uk-sold");
    expect(r.collectionType).toBe("personal");
  });

  it("accepts a null priceSource (provenance unknown)", () => {
    const r = PricingBreakdownRequestSchema.parse({ price: 12.5, purchaseCost: 4, marketMedian: 11, priceSource: null });
    expect(r.priceSource).toBeNull();
  });
  it("accepts the seller's INTENT for the breakdown: a copy, a format, who pays postage, a packing key", () => {
    const r = PricingBreakdownRequestSchema.parse({
      price: 167, purchaseCost: 96, marketMedian: 150,
      physicalCardId: "11111111-2222-4333-8444-555555555555", format: "AUCTION",
      postageMode: "buyer_pays", packingKey: "toploader_bubble",
    });
    expect(r.format).toBe("AUCTION");
    expect(r.postageMode).toBe("buyer_pays");
  });

  it("accepts postageFor (estimate | published) and cardsInParcel, both optional (#255)", () => {
    const base = { price: 167, purchaseCost: 96, marketMedian: 150 };
    expect(PricingBreakdownRequestSchema.parse({ ...base, postageFor: "published", cardsInParcel: 3 })).toMatchObject({ postageFor: "published", cardsInParcel: 3 });
    expect(PricingBreakdownRequestSchema.parse({ ...base, postageFor: "estimate" }).cardsInParcel).toBeUndefined();
    expect(PricingBreakdownRequestSchema.parse(base).postageFor).toBeUndefined();
  });

  it("REJECTS an unknown postageFor and a bad parcel size (0, fractional, over 500)", () => {
    const base = { price: 167, purchaseCost: 96, marketMedian: 150 };
    for (const bad of [{ postageFor: "live" }, { postageFor: "" }, { cardsInParcel: 0 }, { cardsInParcel: -1 }, { cardsInParcel: 1.5 }, { cardsInParcel: 501 }]) {
      expect(PricingBreakdownRequestSchema.safeParse({ ...base, ...bad }).success, JSON.stringify(bad)).toBe(false);
    }
    expect(PricingBreakdownRequestSchema.safeParse({ ...base, cardsInParcel: 500 }).success).toBe(true);
    expect(PricingBreakdownRequestSchema.safeParse({ ...base, cardsInParcel: 1 }).success).toBe(true);
  });

  it("REJECTS a postage mode that is not a keyed choice: a client sends WHO pays, never a £ figure", () => {
    const base = { price: 167, purchaseCost: 96, marketMedian: 150 };
    expect(PricingBreakdownRequestSchema.safeParse({ ...base, postageMode: "free" }).success).toBe(false);
    expect(PricingBreakdownRequestSchema.safeParse({ ...base, postageMode: 3.29 }).success).toBe(false);
  });
});
describe("PricingBreakdownResponseSchema", () => {
  const FLAT = {
    purchaseCost: 96, marketMedian: 150, suggestedPrice: 167, ebayFee: 18.28, feeNotSetReason: null, packagingCost: 0.34,
    shippingCost: 0, grossProfit: 52.38, taxProvision: 10.48, netProfit: 41.9, netMarginPct: 43.6,
    minViablePrice: 112, isMarketBelowMin: false, warningMsg: null, priceKind: "realised",
  };
  const KNOWN = { ...FLAT, breakdown: SELLING_KNOWN };

  it("parses a realistic breakdown, with the line-by-line answer attached", () => {
    const res = PricingBreakdownResponseSchema.parse(KNOWN);
    expect(res.priceKind).toBe("realised");
    expect(res.warningMsg).toBeNull();
    expect(res.breakdown.mode).toBe("selling");
    expect(res.breakdown.totals.youReceiveGbp).toBe(148.38);
  });

  it("REQUIRES the breakdown: a response without its lines is a screen left to compute money", () => {
    const { breakdown: _b, ...noBreakdown } = KNOWN;
    expect(PricingBreakdownResponseSchema.safeParse(noBreakdown).success).toBe(false);
  });

  it("rejects a priceKind outside the closed 2-way enum", () => {
    expect(() => PricingBreakdownResponseSchema.parse({ ...KNOWN, priceKind: "estimated" })).toThrow();
  });

  it("REJECTS a BUYING breakdown on the selling endpoint", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, breakdown: BUYING_PRIVATE }).success).toBe(false);
  });
});

describe("PricingBreakdownResponse: a null fee takes every figure that contains it, with a reason (v0.2.0)", () => {
  const FLAT = {
    purchaseCost: 96, marketMedian: 150, suggestedPrice: 167, ebayFee: 18.28, feeNotSetReason: null,
    packagingCost: 0.34, shippingCost: 0, grossProfit: 52.38, taxProvision: 10.48, netProfit: 41.9,
    netMarginPct: 43.6, minViablePrice: 112, isMarketBelowMin: false, warningMsg: null, priceKind: "asking",
  };
  const KNOWN = { ...FLAT, breakdown: SELLING_KNOWN };
  const UNSET = {
    ...FLAT, ebayFee: null, feeNotSetReason: "seller_type_not_set", grossProfit: null,
    taxProvision: null, netProfit: null, netMarginPct: null, minViablePrice: null, isMarketBelowMin: null,
    breakdown: SELLING_FEE_UNSET,
  };
  const issues = (r: { success: boolean; error?: { issues: { message: string }[] } }) => (r.success ? [] : r.error!.issues);

  it("accepts a known fee with no reason, and an unset fee with one", () => {
    expect(PricingBreakdownResponseSchema.safeParse(KNOWN).success).toBe(true);
    expect(PricingBreakdownResponseSchema.safeParse(UNSET).success).toBe(true);
  });

  it("accepts a business seller with the VAT question open", () => {
    const vat = {
      ...UNSET, feeNotSetReason: "vat_not_set",
      breakdown: {
        ...SELLING_FEE_UNSET, notSet: ["vatPosition"],
        feePosition: { sellerType: "business", vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
        lines: SELLING_FEE_UNSET.lines.map((l) => (l.unknownReason ? { ...l, unknownReason: "vat_not_set" } : l)),
      },
    };
    const r = PricingBreakdownResponseSchema.safeParse(vat);
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REJECTS a null fee without a reason", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, feeNotSetReason: null }).success).toBe(false);
  });

  it("REJECTS a known fee with a reason", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, feeNotSetReason: "vat_not_set" }).success).toBe(false);
  });

  it("REJECTS every fee-dependent figure that survives a null fee — each is a private-seller guess", () => {
    for (const k of ["grossProfit", "taxProvision", "netProfit", "netMarginPct", "minViablePrice"] as const) {
      expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, [k]: 1 }).success, k).toBe(false);
    }
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, isMarketBelowMin: false }).success).toBe(false);
  });

  it("REJECTS a figure missing when the fee is known", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, netProfit: null }).success).toBe(false);
  });

  it("keeps priceKind a closed enum after being hoisted to PriceKindSchema", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, priceKind: "estimated" }).success).toBe(false);
  });

  it("round-trips through JSON", () => {
    const parsed = PricingBreakdownResponseSchema.parse(UNSET);
    expect(PricingBreakdownResponseSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});

describe("PricingBreakdownResponse: the flat figures and the breakdown are ONE answer (v0.2.0)", () => {
  const FLAT = {
    purchaseCost: 96, marketMedian: 150, suggestedPrice: 167, ebayFee: 18.28, feeNotSetReason: null,
    packagingCost: 0.34, shippingCost: 0, grossProfit: 52.38, taxProvision: 10.48, netProfit: 41.9,
    netMarginPct: 43.6, minViablePrice: 112, isMarketBelowMin: false, warningMsg: null, priceKind: "asking",
  };
  const KNOWN = { ...FLAT, breakdown: SELLING_KNOWN };
  const UNSET = {
    ...FLAT, ebayFee: null, feeNotSetReason: "seller_type_not_set", grossProfit: null,
    taxProvision: null, netProfit: null, netMarginPct: null, minViablePrice: null, isMarketBelowMin: null,
    breakdown: SELLING_FEE_UNSET,
  };
  const issues = (r: { success: boolean; error?: { issues: { message: string }[] } }) => (r.success ? [] : r.error!.issues);

  it("REJECTS a BUYING breakdown on the selling endpoint even when every figure in it agrees with the flat ones", () => {
    // A private seller's fee is £0 in both, so only the MODE is wrong.
    const flat = { ...KNOWN, ebayFee: 0, grossProfit: 70.66, taxProvision: 14.13, netProfit: 56.53, netMarginPct: 58.9 };
    const r = PricingBreakdownResponseSchema.safeParse({ ...flat, breakdown: BUYING_PRIVATE });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /prices a SALE/.test(i.message))).toBe(true);
  });

  it("REJECTS a fee basis that contradicts a null flat fee when there is NO fee line to compare (the direct channel)", () => {
    const noFeeLine = {
      ...SELLING_KNOWN, lines: SELLING_KNOWN.lines.filter((l) => l.key !== "ebay_fee"),
      feePosition: { sellerType: "business", vatRegistered: true, channel: "direct", feeBasis: "derived" },
    };
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, breakdown: { ...noFeeLine, totals: { youReceiveGbp: null, maxBuyGbp: null, askingPriceOnly: false },
      lines: noFeeLine.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: null, unknownReason: "seller_type_not_set" } : l)) } }).success).toBe(false);
  });

  it("REJECTS a flat fee that is not the negative of the ebay_fee line", () => {
    const r = PricingBreakdownResponseSchema.safeParse({ ...KNOWN, ebayFee: 22.36 });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /negative of ebayFee/.test(i.message))).toBe(true);
  });

  it("allows half a penny of slack between the unrounded flat fee and the whole-pence line", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, ebayFee: 18.2846 }).success).toBe(true);
  });

  it("REJECTS a null flat fee beside a known fee line, and a known flat fee beside a null line", () => {
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, breakdown: SELLING_KNOWN }).success).toBe(false);
    expect(PricingBreakdownResponseSchema.safeParse({ ...KNOWN, breakdown: SELLING_FEE_UNSET }).success).toBe(false);
  });

  it("REJECTS a fee line whose reason differs from feeNotSetReason: one reason, reported once", () => {
    const r = PricingBreakdownResponseSchema.safeParse({ ...UNSET, feeNotSetReason: "vat_not_set" });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /one fact, reported once/.test(i.message))).toBe(true);
  });

  it("REJECTS a receipt beside an unknown fee, and a 'not_set' fee basis beside a known fee", () => {
    const withReceipt = {
      ...UNSET.breakdown, totals: { youReceiveGbp: 166.66, maxBuyGbp: null, askingPriceOnly: false },
      lines: UNSET.breakdown.lines.map((l) => (l.key === "you_receive" ? { ...l, amountGbp: 166.66, unknownReason: null } : l)),
    };
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, breakdown: withReceipt }).success).toBe(false);
    expect(PricingBreakdownResponseSchema.safeParse({
      ...KNOWN, breakdown: { ...SELLING_KNOWN, feePosition: { ...SELLING_KNOWN.feePosition, feeBasis: "not_set" }, notSet: ["sellerType"] },
    }).success).toBe(false);
  });
});
