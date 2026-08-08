import { describe, it, expect } from "vitest";
import { RepricingFlagsResponseSchema } from "./reprice.js";

describe("RepricingFlagsResponseSchema", () => {
  it("parses a realistic flags list", () => {
    const res = RepricingFlagsResponseSchema.parse({
      flags: [
        {
          cardId: "card-1",
          name: "Charizard",
          setName: "Base Set",
          cardNumber: "4/102",
          condition: "NM",
          currentPriceGbp: 50,
          marketValueGbp: 40,
          deltaPct: 25,
          direction: "above",
        },
      ],
    });
    expect(res.flags).toHaveLength(1);
    expect(res.flags[0].direction).toBe("above");
  });

  it("parses an empty list", () => {
    expect(RepricingFlagsResponseSchema.parse({ flags: [] })).toEqual({ flags: [] });
  });

  it("rejects an unknown direction value", () => {
    expect(() =>
      RepricingFlagsResponseSchema.parse({
        flags: [
          {
            cardId: "card-1", name: "Charizard", setName: null, cardNumber: null, condition: null,
            currentPriceGbp: 50, marketValueGbp: 40, deltaPct: 25, direction: "sideways",
          },
        ],
      }),
    ).toThrow();
  });
});
