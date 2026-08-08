import { describe, it, expect } from "vitest";
import { CatalogueLookupRequestSchema, CatalogueLookupResponseSchema } from "./catalogue-lookup.js";

describe("CatalogueLookupRequestSchema", () => {
  it("accepts a full request", () => {
    const r = CatalogueLookupRequestSchema.parse({ game: "pokemon", name: "Charizard", collectorNumber: "4/102" });
    expect(r.collectorNumber).toBe("4/102");
  });

  it("accepts a name-only request (no collectorNumber)", () => {
    const r = CatalogueLookupRequestSchema.parse({ game: "pokemon", name: "Charizard" });
    expect(r.collectorNumber).toBeUndefined();
  });

  it("rejects an empty name", () => {
    expect(() => CatalogueLookupRequestSchema.parse({ game: "pokemon", name: "" })).toThrow();
  });
});

describe("CatalogueLookupResponseSchema", () => {
  it("parses a high-confidence match", () => {
    const res = CatalogueLookupResponseSchema.parse({
      match: { nativeId: "base1-4", name: "Charizard", setName: "Base Set", cardNumber: "4/102", rarity: "Rare Holo", language: "English" },
      confidence: "high",
    });
    expect(res.match?.name).toBe("Charizard");
  });

  it("parses a genuine miss", () => {
    const res = CatalogueLookupResponseSchema.parse({ match: null, confidence: null });
    expect(res.match).toBeNull();
  });
});
