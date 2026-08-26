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

  // W15 Tier 0 — a number+setCode lookup with no name at all (the case Tier 0 exists for: a
  // legible collector number but an unreadable name).
  it("accepts collectorNumber + setCode with no name", () => {
    const r = CatalogueLookupRequestSchema.parse({ game: "yugioh", collectorNumber: "RA04-EN053", setCode: "RA04" });
    expect(r.name).toBeUndefined();
    expect(r.setCode).toBe("RA04");
  });

  it("accepts a request with none of name/collectorNumber/setCode ('at least one' is route-level)", () => {
    expect(() => CatalogueLookupRequestSchema.parse({ game: "pokemon" })).not.toThrow();
  });

  // ROADMAP-COORDINATION.md "Tier 0 returns a confident WRONG match" (2026-08-26) — iOS sends no
  // game at all; requiring it blocked scanning outright.
  it("accepts a request with no game at all — game is a narrowing hint, never a precondition", () => {
    const r = CatalogueLookupRequestSchema.parse({ collectorNumber: "138/221", setCode: "SFD" });
    expect(r.game).toBeUndefined();
    expect(r.collectorNumber).toBe("138/221");
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

  it("carries the catalogue image when the provider has one", () => {
    const res = CatalogueLookupResponseSchema.parse({
      match: { nativeId: "base1-4", name: "Charizard", setName: "Base Set", cardNumber: "4/102", rarity: "Rare Holo", language: "English", image: "https://images.pokemontcg.io/base1/4.png" },
      confidence: "high",
    });
    expect(res.match?.image).toBe("https://images.pokemontcg.io/base1/4.png");
  });

  it("accepts a match with no image field at all — additive, older callers still validate", () => {
    const res = CatalogueLookupResponseSchema.parse({
      match: { nativeId: "base1-4", name: "Charizard", setName: "Base Set", cardNumber: "4/102", rarity: "Rare Holo", language: "English" },
      confidence: "high",
    });
    expect(res.match?.image).toBeUndefined();
  });

  it("defaults candidates to an empty array when the response predates the field", () => {
    const res = CatalogueLookupResponseSchema.parse({ match: null, confidence: null });
    expect(res.candidates).toEqual([]);
  });

  it("carries a match's game, and every cross-game candidate's game, on a genuine tie", () => {
    const res = CatalogueLookupResponseSchema.parse({
      match: null,
      confidence: "low",
      candidates: [
        { game: "mtg", nativeId: "mtg-1", name: "Windsinger", setName: "Some MTG Set", cardNumber: "138", rarity: null, language: "English" },
        { game: "lorcana", nativeId: "lor-1", name: "Windsinger", setName: "Some Lorcana Set", cardNumber: "138", rarity: null, language: "English" },
      ],
    });
    expect(res.candidates.map((c) => c.game)).toEqual(["mtg", "lorcana"]);
  });

  it("carries the matched game so a follow-up call doesn't have to guess it", () => {
    const res = CatalogueLookupResponseSchema.parse({
      match: { game: "yugioh", nativeId: "ra04-en053", name: "Ash Blossom & Joyous Spring", setName: "Rising Rampage", cardNumber: "RA04-EN053", rarity: "Secret Rare", language: "English" },
      confidence: "high",
    });
    expect(res.match?.game).toBe("yugioh");
  });
});
