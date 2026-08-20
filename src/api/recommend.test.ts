import { describe, it, expect } from "vitest";
import { RecommendRequestSchema, RecommendResponseSchema, RecommendBatchRequestSchema, PricingSettingsSchema } from "./recommend.js";

const PRICING_SETTINGS = {
  ebayFeeRate: 0.128, ebayFeeFixed: 0.30, packagingCost: 0.10, shippingCost: 0,
  taxRate: 0.20, minProfitPct: 0.25, minSaleValue: 2.50, postageCost: 1.55,
};

describe("RecommendRequestSchema", () => {
  it("accepts a bare physicalCardId", () => {
    expect(RecommendRequestSchema.parse({ physicalCardId: "abc-123" })).toEqual({
      physicalCardId: "abc-123",
    });
  });

  it("accepts an optional pricingSettings", () => {
    const parsed = RecommendRequestSchema.parse({ physicalCardId: "abc-123", pricingSettings: PRICING_SETTINGS });
    expect(parsed.pricingSettings).toEqual(PRICING_SETTINGS);
  });
});

describe("RecommendBatchRequestSchema", () => {
  it("accepts a batch with an optional top-level pricingSettings (not per-card)", () => {
    const parsed = RecommendBatchRequestSchema.parse({
      cards: [{
        id: "1", avgGbp: 10, lowGbp: 8, topGbp: 12, priceSource: "ebay-uk-sold",
        saleCount: 3, approxSaleCount: false, condition: "NM", costBasis: 2, collectionType: "resale",
      }],
      pricingSettings: PRICING_SETTINGS,
    });
    expect(parsed.pricingSettings).toEqual(PRICING_SETTINGS);
  });

  it("works without pricingSettings (defaults apply server-side)", () => {
    const parsed = RecommendBatchRequestSchema.parse({
      cards: [{
        id: "1", avgGbp: 10, lowGbp: 8, topGbp: 12, priceSource: "ebay-uk-sold",
        saleCount: 3, approxSaleCount: false, condition: "NM", costBasis: 2, collectionType: "resale",
      }],
    });
    expect(parsed.pricingSettings).toBeUndefined();
  });
});

describe("PricingSettingsSchema", () => {
  it("rejects a missing field", () => {
    const { taxRate: _taxRate, ...incomplete } = PRICING_SETTINGS;
    expect(PricingSettingsSchema.safeParse(incomplete).success).toBe(false);
  });
});

describe("RecommendResponseSchema", () => {
  it("parses a realistic response", () => {
    const res = RecommendResponseSchema.parse({
      route: "list_single",
      alternatives: [{ route: "bundle", expected_net_gbp: 2.5, why: "modest value" }],
      economics: {
        expected_sale_gbp: 10,
        fees_gbp: 1.58,
        postage_gbp: 1.55,
        cost_basis_gbp: 2,
        expected_net_gbp: 4.87,
        liquidity: "high",
      },
      assumptions: ["Seller type: business"],
      explanation: "Solid mid-value card",
      confidence: "high",
      calculation_version: "stub-v2",
      physicalCardId: "abc-123",
      currentRoute: null,
      priceSource: "ebay-uk-sold",
      priceConfidence: "high",
      currencyNote: null,
      gradeEV: null,
      psa10PriceGbp: null,
      p10: null,
      p9: null,
      gradingCostGbp: null,
      rawNetGbp: null,
      gradeEVConfidence: null,
    });
    expect(res.route).toBe("list_single");
  });

  it("parses a grade_review response with EV fields populated", () => {
    const res = RecommendResponseSchema.parse({
      route: "grade_review",
      alternatives: [{ route: "list_single", expected_net_gbp: 40, why: "list ungraded" }],
      economics: {
        expected_sale_gbp: 45, fees_gbp: 0, postage_gbp: 3, cost_basis_gbp: 2,
        expected_net_gbp: 40, liquidity: "medium",
      },
      assumptions: ["Seller type: private"],
      explanation: "Worth checking graded comps",
      confidence: "medium",
      calculation_version: "stub-v2",
      physicalCardId: "abc-123",
      currentRoute: null,
      priceSource: "ebay-uk-sold",
      priceConfidence: "high",
      currencyNote: null,
      gradeEV: 55.2,
      psa10PriceGbp: 200,
      p10: 0.3,
      p9: 0.6,
      gradingCostGbp: 24,
      rawNetGbp: 40,
      gradeEVConfidence: "medium",
    });
    expect(res.gradeEVConfidence).toBe("medium");
  });

  it("rejects an unknown route value", () => {
    expect(() =>
      RecommendResponseSchema.parse({
        route: "sell_immediately", // not in the enum
        alternatives: [],
        economics: {
          expected_sale_gbp: null, fees_gbp: null, postage_gbp: null,
          cost_basis_gbp: null, expected_net_gbp: null, liquidity: null,
        },
        assumptions: [],
        explanation: "",
        confidence: "low",
        calculation_version: "stub-v2",
        physicalCardId: "abc-123",
        currentRoute: null,
        priceSource: null,
        priceConfidence: null,
        currencyNote: null,
        gradeEV: null,
        psa10PriceGbp: null,
        p10: null,
        p9: null,
        gradingCostGbp: null,
        rawNetGbp: null,
        gradeEVConfidence: null,
      }),
    ).toThrow();
  });
});
