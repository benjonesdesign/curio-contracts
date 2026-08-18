import { describe, it, expect } from "vitest";
import { InspectionDepthHintRequestSchema, InspectionDepthHintResponseSchema } from "./inspection-depth.js";

describe("InspectionDepthHintRequestSchema", () => {
  it("accepts a bare name (minimal, right after fastIdentify)", () => {
    const parsed = InspectionDepthHintRequestSchema.parse({ name: "Charizard" });
    expect(parsed.name).toBe("Charizard");
  });

  it("accepts the full identity shape", () => {
    const parsed = InspectionDepthHintRequestSchema.parse({
      name: "Charizard", setName: "Base Set", cardNumber: "4/102", game: "pokemon", tcgId: "12345",
    });
    expect(parsed.game).toBe("pokemon");
  });

  it("rejects an unknown game id", () => {
    expect(() =>
      InspectionDepthHintRequestSchema.parse({ name: "Charizard", game: "not-a-real-game" }),
    ).toThrow();
  });
});

describe("InspectionDepthHintResponseSchema", () => {
  it("parses the default stub response shape", () => {
    const res = InspectionDepthHintResponseSchema.parse({
      depthTier: "standard",
      rationale: "default tier — value-based policy not yet implemented",
      confidence: "low",
    });
    expect(res.depthTier).toBe("standard");
    expect(res.confidence).toBe("low");
  });

  it("rejects an unknown depth tier", () => {
    expect(() =>
      InspectionDepthHintResponseSchema.parse({ depthTier: "maximal", rationale: "x", confidence: "low" }),
    ).toThrow();
  });
});
