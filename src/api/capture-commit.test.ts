import { describe, it, expect } from "vitest";
import { CaptureCommitRequestSchema, CaptureCommitResponseSchema } from "./capture-commit.js";

describe("CaptureCommitRequestSchema", () => {
  it("accepts front+back with no details", () => {
    const r = CaptureCommitRequestSchema.parse({
      imageUrls: { front: "https://x/f.jpg", back: "https://x/b.jpg" },
    });
    expect(r.imageUrls?.details).toBeUndefined();
  });

  it("accepts detail shots with the v3 side+corner tags", () => {
    const r = CaptureCommitRequestSchema.parse({
      imageUrls: {
        front: "https://x/f.jpg",
        back: "https://x/b.jpg",
        details: [{ side: "front", corner: "tl", url: "https://x/d1.jpg" }],
      },
    });
    expect(r.imageUrls?.details).toHaveLength(1);
  });

  it("accepts inlineImages instead of imageUrls (WORK-BACKLOG.md Packet 9)", () => {
    const r = CaptureCommitRequestSchema.parse({
      inlineImages: {
        front: "data:image/jpeg;base64,/9j/front",
        back: "data:image/jpeg;base64,/9j/back",
        details: [{ side: "front", corner: "tl", dataUrl: "data:image/jpeg;base64,/9j/d1" }],
      },
    });
    expect(r.imageUrls).toBeUndefined();
    expect(r.inlineImages?.front).toBe("data:image/jpeg;base64,/9j/front");
    expect(r.inlineImages?.details).toHaveLength(1);
  });

  it("accepts neither imageUrls nor inlineImages (schema is shape-only — the 'at least one' rule is route-level)", () => {
    expect(() => CaptureCommitRequestSchema.parse({})).not.toThrow();
  });

  // decisions/0018 revision — capture-commit moves to object paths, not client-minted URLs.
  it("accepts imagePaths with the same front/back/details shape as imageUrls", () => {
    const r = CaptureCommitRequestSchema.parse({
      imagePaths: {
        front: "a1b2c3_master.webp",
        back: "a1b2c3_back.webp",
        details: [{ side: "front", corner: "tl", path: "a1b2c3_d1.webp" }],
      },
    });
    expect(r.imageUrls).toBeUndefined();
    expect(r.imagePaths?.front).toBe("a1b2c3_master.webp");
    expect(r.imagePaths?.details).toHaveLength(1);
    expect(r.imagePaths?.details?.[0].path).toBe("a1b2c3_d1.webp");
  });

  it("accepts a resolvedMatch (on-device OCR + catalogue-lookup hit) alongside inlineImages and game", () => {
    const r = CaptureCommitRequestSchema.parse({
      inlineImages: { front: "data:image/jpeg;base64,f", back: "data:image/jpeg;base64,b" },
      resolvedMatch: {
        nativeId: "base1-4", name: "Charizard", setName: "Base Set", cardNumber: "4/102",
        rarity: "Rare Holo", language: "English",
      },
      game: "pokemon",
    });
    expect(r.resolvedMatch?.name).toBe("Charizard");
    expect(r.game).toBe("pokemon");
  });

  it("rejects an invalid game value", () => {
    expect(() => CaptureCommitRequestSchema.parse({ game: "not-a-real-game" })).toThrow();
  });
});

describe("CaptureCommitResponseSchema", () => {
  it("parses a realistic response", () => {
    const res = CaptureCommitResponseSchema.parse({
      physicalCardId: "abc-123",
      legacyCardId: null,
      game: "pokemon",
      gameDisplayName: "Pokémon",
      name: "Charizard",
      setName: "Base Set",
      cardNumber: "4/102",
      condition: "NM",
      rarity: "Rare Holo",
      suggestedPrice: 120.5,
      ebay: { low: 90, avg: 120.5, top: 180 },
      subGrades: null,
    });
    expect(res.physicalCardId).toBe("abc-123");
  });
});
