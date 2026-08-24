import { describe, it, expect } from "vitest";
import { PricingRuleSchema, PricingRuleInputSchema } from "./pricing-rule.js";

const realistic = {
  id: "rule-1",
  name: "Charm graded",
  active: true,
  scopeGame: ["pokemon"],
  scopeSet: [],
  scopeCondition: ["NM", "LP"],
  conditionMultipliers: { NM: 1, LP: 0.85 },
  rounding: "charm_99" as const,
  minPriceGbp: 2,
  maxPriceGbp: null,
  createdAt: "2026-08-24T00:00:00.000Z",
  updatedAt: "2026-08-24T00:00:00.000Z",
};

describe("PricingRuleSchema", () => {
  it("parses a realistic rule", () => {
    expect(PricingRuleSchema.parse(realistic)).toEqual(realistic);
  });

  it("accepts empty scope arrays (unscoped = matches everything)", () => {
    const unscoped = { ...realistic, scopeGame: [], scopeSet: [], scopeCondition: [] };
    expect(PricingRuleSchema.parse(unscoped).scopeGame).toEqual([]);
  });

  it("rejects an unknown rounding value", () => {
    expect(() => PricingRuleSchema.parse({ ...realistic, rounding: "nearest_fiver" })).toThrow();
  });
});

describe("PricingRuleInputSchema", () => {
  it("allows omitting server-assigned fields and active", () => {
    const { id, createdAt, updatedAt, active, ...rest } = realistic;
    const parsed = PricingRuleInputSchema.parse(rest);
    expect(parsed.name).toBe("Charm graded");
    expect(parsed.active).toBeUndefined();
  });
});
