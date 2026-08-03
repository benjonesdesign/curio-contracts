import { describe, it, expect } from "vitest";
import { CardSearchRequestSchema, CardSearchResponseSchema } from "./card-search.js";

describe("CardSearchRequestSchema", () => {
  it("accepts a query with no game filter", () => {
    expect(CardSearchRequestSchema.parse({ q: "char" })).toEqual({ q: "char" });
  });
});

describe("CardSearchResponseSchema", () => {
  it("parses a result with nested printings (the printing-collapse shape)", () => {
    const res = CardSearchResponseSchema.parse({
      results: [
        {
          tcgId: "base1-4",
          name: "Charizard",
          setName: "Base Set",
          number: "4/102",
          rarity: "Rare Holo",
          image: "https://x/img.png",
          marketGbp: 120.5,
          game: "pokemon",
          gameDisplayName: "Pokémon",
          printingCount: 2,
          printings: [
            { tcgId: "base1-4", setName: "Base Set", number: "4/102", rarity: "Rare Holo", image: null, marketGbp: 120.5 },
            { tcgId: "base1-4-shadowless", setName: "Base Set (Shadowless)", number: "4/102", rarity: "Rare Holo", image: null, marketGbp: 300 },
          ],
        },
      ],
    });
    expect(res.results[0].printings).toHaveLength(2);
  });

  it("accepts an empty result set", () => {
    expect(CardSearchResponseSchema.parse({ results: [] }).results).toEqual([]);
  });
});
