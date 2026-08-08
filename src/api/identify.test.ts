import { describe, it, expect } from "vitest";
import { IdentifyRequestSchema, IdentifyResponseSchema } from "./identify.js";

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
});
