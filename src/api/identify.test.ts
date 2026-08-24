import { describe, it, expect } from "vitest";
import { IdentifyRequestSchema, IdentifyResponseSchema, IdentifyAmbiguousResponseSchema } from "./identify.js";

describe("IdentifyRequestSchema", () => {
  it("accepts a minimal real request", () => {
    const r = IdentifyRequestSchema.parse({ imageUrls: ["https://x/front.jpg", "https://x/back.jpg"] });
    expect(r.imageUrls).toHaveLength(2);
  });

  it("accepts an empty imageUrls array (the 'at least one image' rule is route-level, not schema-level)", () => {
    const r = IdentifyRequestSchema.parse({ imageUrls: [] });
    expect(r.imageUrls).toEqual([]);
  });

  it("accepts a request with neither imageUrls nor inlineImages (schema is shape-only)", () => {
    expect(() => IdentifyRequestSchema.parse({})).not.toThrow();
  });

  it("accepts inlineImages alone (no imageUrls)", () => {
    const r = IdentifyRequestSchema.parse({ inlineImages: ["data:image/jpeg;base64,/9j/xyz"] });
    expect(r.inlineImages).toHaveLength(1);
    expect(r.imageUrls).toBeUndefined();
  });

  // decisions/0018 revision — capture-commit/identify move to object paths, not client-minted URLs.
  it("accepts imagePaths alone (no imageUrls/inlineImages)", () => {
    const r = IdentifyRequestSchema.parse({ imagePaths: ["a1b2c3_master.webp", "a1b2c3_back.webp"] });
    expect(r.imagePaths).toHaveLength(2);
    expect(r.imageUrls).toBeUndefined();
  });

  // W15 Tier 0 — OCR hints are optional and independent of the image transport.
  it("accepts OCR hints alongside imagePaths", () => {
    const r = IdentifyRequestSchema.parse({
      imagePaths: ["a1b2c3_master.webp"],
      ocrCardNumber: "025/165",
      ocrSetCode: "OBF",
    });
    expect(r.ocrCardNumber).toBe("025/165");
    expect(r.ocrSetCode).toBe("OBF");
  });

  it("accepts a request with no OCR hints at all (vision-only callers are unaffected)", () => {
    const r = IdentifyRequestSchema.parse({ imagePaths: ["a1b2c3_master.webp"] });
    expect(r.ocrCardNumber).toBeUndefined();
  });
});

describe("IdentifyResponseSchema", () => {
  it("parses a realistic success response", () => {
    const res = IdentifyResponseSchema.parse({
      game: "pokemon",
      game_confidence: "high",
      game_low_confidence: false,
      name: "Charizard",
      set_name: "Base Set",
      card_number: "4/102",
      card_type: "Pokémon",
      estimated_grade: "NM",
      confidence: "high",
      attributes: ["Holo"],
      is_promo: false,
      language: "English",
      rarity: "Rare Holo",
      image_roles: { front: 0, back: 1, details: [] },
      flaws: [
        {
          description: "light whitening on top edge",
          region: "top edge",
          side: "front",
          x: 0.1,
          y: 0.05,
          w: 0.2,
          h: 0.05,
          severity: "minor",
        },
      ],
    });
    expect(res.name).toBe("Charizard");
    expect(res.flaws[0].severity).toBe("minor");
  });

  it("rejects an invalid confidence value", () => {
    expect(() =>
      IdentifyResponseSchema.parse({
        game: "pokemon",
        game_confidence: "high",
        game_low_confidence: false,
        name: "Charizard",
        set_name: null,
        card_number: null,
        card_type: null,
        estimated_grade: "NM",
        confidence: "extremely-sure", // invalid
        attributes: [],
        is_promo: false,
        language: "English",
        rarity: null,
        image_roles: { front: 0, back: null, details: [] },
        flaws: [],
      }),
    ).toThrow();
  });

  it("accepts a Tier 0 result with tier + ai_call_avoided", () => {
    const res = IdentifyResponseSchema.parse({
      game: "yugioh",
      game_confidence: "high",
      game_low_confidence: false,
      name: "Ash Blossom & Joyous Spring",
      set_name: "Rising Rampage",
      card_number: "RA04-EN053",
      card_type: null,
      estimated_grade: "NM",
      confidence: "high",
      attributes: [],
      is_promo: false,
      language: "English",
      rarity: null,
      image_roles: { front: 0, back: null, details: [] },
      flaws: [],
      tier: "tier0",
      ai_call_avoided: true,
    });
    expect(res.tier).toBe("tier0");
    expect(res.ai_call_avoided).toBe(true);
  });
});

describe("IdentifyAmbiguousResponseSchema", () => {
  it("parses a bounded candidate list with no definitive identity", () => {
    const res = IdentifyAmbiguousResponseSchema.parse({
      tier: "ambiguous",
      candidates: [
        { game: "pokemon", name: "Pikachu", setName: "Base Set", cardNumber: "58/102", nativeId: "base1-58" },
        { game: "pokemon", name: "Pikachu", setName: "Jungle", cardNumber: "60/64", nativeId: "base2-60" },
      ],
    });
    expect(res.candidates).toHaveLength(2);
  });

  it("rejects a tier value other than 'ambiguous'", () => {
    expect(() => IdentifyAmbiguousResponseSchema.parse({ tier: "tier0", candidates: [] })).toThrow();
  });
});
