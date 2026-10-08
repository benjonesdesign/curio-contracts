// MUTATION-CHECKED 2026-10-08 (v0.2.0 nullable fee): red against dropping the
// ebayFee<->feeNotSetReason coupling, and red against dropping the loop that makes grossProfit /
// taxProvision / netProfit / netMarginPct / minViablePrice / isMarketBelowMin follow the fee (a
// surviving figure beside a null fee, and a missing figure beside a known fee); green against
// current.

import { describe, it, expect } from "vitest";
import { PricingBreakdownRequestSchema, PricingBreakdownResponseSchema } from "./pricing-breakdown.js";

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
});

describe("PricingBreakdownResponseSchema", () => {
  it("parses a realistic breakdown", () => {
    const res = PricingBreakdownResponseSchema.parse({
      purchaseCost: 4, marketMedian: 11, suggestedPrice: 12.5, ebayFee: 0, feeNotSetReason: null, packagingCost: 0.1,
      shippingCost: 0, grossProfit: 8.4, taxProvision: 1.68, netProfit: 6.72, netMarginPct: 168,
      minViablePrice: 6.25, isMarketBelowMin: false, warningMsg: null, priceKind: "realised",
    });
    expect(res.priceKind).toBe("realised");
    expect(res.warningMsg).toBeNull();
  });

  it("rejects a priceKind outside the closed 2-way enum", () => {
    expect(() =>
      PricingBreakdownResponseSchema.parse({
        purchaseCost: 4, marketMedian: 11, suggestedPrice: 12.5, ebayFee: 0, feeNotSetReason: null, packagingCost: 0.1,
        shippingCost: 0, grossProfit: 8.4, taxProvision: 1.68, netProfit: 6.72, netMarginPct: 168,
        minViablePrice: 6.25, isMarketBelowMin: false, warningMsg: null, priceKind: "estimated",
      }),
    ).toThrow();
  });
});

describe("PricingBreakdownResponse: a null fee takes every figure that contains it, with a reason (v0.2.0)", () => {
  const KNOWN = {
    purchaseCost: 4, marketMedian: 11, suggestedPrice: 12.5, ebayFee: 1.94, feeNotSetReason: null,
    packagingCost: 0.1, shippingCost: 0, grossProfit: 6.46, taxProvision: 1.29, netProfit: 5.17,
    netMarginPct: 129, minViablePrice: 6.9, isMarketBelowMin: false, warningMsg: null, priceKind: "asking",
  };
  const UNSET = {
    ...KNOWN, ebayFee: null, feeNotSetReason: "seller_type_not_set", grossProfit: null,
    taxProvision: null, netProfit: null, netMarginPct: null, minViablePrice: null, isMarketBelowMin: null,
  };

  it("accepts a known fee with no reason, and an unset fee with one", () => {
    expect(PricingBreakdownResponseSchema.safeParse(KNOWN).success).toBe(true);
    expect(PricingBreakdownResponseSchema.safeParse(UNSET).success).toBe(true);
    expect(PricingBreakdownResponseSchema.safeParse({ ...UNSET, feeNotSetReason: "vat_not_set" }).success).toBe(true);
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
