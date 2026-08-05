import { describe, it, expect } from "vitest";
import { RecommendRequestSchema, RecommendResponseSchema } from "./recommend.js";

describe("RecommendRequestSchema", () => {
  it("accepts a bare physicalCardId", () => {
    expect(RecommendRequestSchema.parse({ physicalCardId: "abc-123" })).toEqual({
      physicalCardId: "abc-123",
    });
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
    });
    expect(res.route).toBe("list_single");
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
      }),
    ).toThrow();
  });
});
