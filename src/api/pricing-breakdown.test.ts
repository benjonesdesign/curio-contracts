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
      purchaseCost: 4, marketMedian: 11, suggestedPrice: 12.5, ebayFee: 0, packagingCost: 0.1,
      shippingCost: 0, grossProfit: 8.4, taxProvision: 1.68, netProfit: 6.72, netMarginPct: 168,
      minViablePrice: 6.25, isMarketBelowMin: false, warningMsg: null, priceKind: "realised",
    });
    expect(res.priceKind).toBe("realised");
    expect(res.warningMsg).toBeNull();
  });

  it("rejects a priceKind outside the closed 2-way enum", () => {
    expect(() =>
      PricingBreakdownResponseSchema.parse({
        purchaseCost: 4, marketMedian: 11, suggestedPrice: 12.5, ebayFee: 0, packagingCost: 0.1,
        shippingCost: 0, grossProfit: 8.4, taxProvision: 1.68, netProfit: 6.72, netMarginPct: 168,
        minViablePrice: 6.25, isMarketBelowMin: false, warningMsg: null, priceKind: "estimated",
      }),
    ).toThrow();
  });
});
