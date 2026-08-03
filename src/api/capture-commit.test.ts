import { describe, it, expect } from "vitest";
import { CaptureCommitRequestSchema, CaptureCommitResponseSchema } from "./capture-commit.js";

describe("CaptureCommitRequestSchema", () => {
  it("accepts front+back with no details", () => {
    const r = CaptureCommitRequestSchema.parse({
      imageUrls: { front: "https://x/f.jpg", back: "https://x/b.jpg" },
    });
    expect(r.imageUrls.details).toBeUndefined();
  });

  it("accepts detail shots with the v3 side+corner tags", () => {
    const r = CaptureCommitRequestSchema.parse({
      imageUrls: {
        front: "https://x/f.jpg",
        back: "https://x/b.jpg",
        details: [{ side: "front", corner: "tl", url: "https://x/d1.jpg" }],
      },
    });
    expect(r.imageUrls.details).toHaveLength(1);
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
