// MUTATION-CHECKED 2026-10-26: red against `.max(5)` removed from IdentifyMatchResponseSchema.candidates in src/api/identify-match.ts (the at-most-five test), red against `if (r.unavailableReason !== null && (r.candidates.length > 0 || r.confidence !== null)) {` changed to `if (false) {` (the unavailable-has-nothing test), red against `if (r.unavailableReason === null && r.candidates.length === 0) {` changed to `if (false) {` (the no-candidates-needs-a-reason test), red against `if (r.candidates.length > 0 && r.confidence === null) {` changed to `if (false) {` (the candidates-need-a-confidence test), red against `score: z.number().min(0).max(1)` changed to `z.number()` (the score range test), red against `if (r.unavailableReason === "crop_loose" && r.crop !== "loose") {` changed to `if (false) {` (the crop_loose-needs-loose test), red against `.default("unknown")` removed from `crop` (the omitted-crop-is-unknown test), green against current.
import { describe, it, expect } from "vitest";
import { IdentifyMatchRequestSchema, IdentifyMatchResponseSchema } from "./identify-match.js";

const MATCH = { game: "pokemon", nativeId: "base1-4", name: "Charizard", setName: "Base Set", cardNumber: "4/102", rarity: "Rare Holo", language: "English", image: null };
const CAND = (score: number) => ({ match: MATCH, score });

describe("POST /api/identify/match: request", () => {
  it("accepts one base64 image, with or without the optional text hints and game", () => {
    expect(IdentifyMatchRequestSchema.safeParse({ image: "/9j/4AAQ" }).success).toBe(true);
    expect(IdentifyMatchRequestSchema.safeParse({ image: "/9j/4AAQ", game: "pokemon", setCode: "BS", collectorNumber: "4/102" }).success).toBe(true);
  });
  it("refuses a missing or empty image", () => {
    expect(IdentifyMatchRequestSchema.safeParse({}).success).toBe(false);
    expect(IdentifyMatchRequestSchema.safeParse({ image: "" }).success).toBe(false);
  });
  it("refuses a game this app does not know", () => {
    expect(IdentifyMatchRequestSchema.safeParse({ image: "x", game: "chess" }).success).toBe(false);
  });
});

describe("POST /api/identify/match: response", () => {
  it("a confident match: candidates best first, a confidence, and an honest 'variant undecided'", () => {
    const r = IdentifyMatchResponseSchema.parse({ candidates: [CAND(0.97), CAND(0.61)], confidence: "high", variantUndecided: true, unavailableReason: null, indexVersion: "w15-0" });
    expect(r.candidates).toHaveLength(2);
    expect(r.variantUndecided).toBe(true);
  });

  it("the stub answer a client can build against today: index not ready, no candidates, no confidence", () => {
    const r = IdentifyMatchResponseSchema.parse({ candidates: [], confidence: null, variantUndecided: false, unavailableReason: "index_not_ready", indexVersion: null });
    expect(r.candidates).toEqual([]);
  });

  it("candidates default to empty when the key is omitted", () => {
    expect(IdentifyMatchResponseSchema.parse({ confidence: null, variantUndecided: false, unavailableReason: "no_match", indexVersion: "w15-0" }).candidates).toEqual([]);
  });

  it("returns at most five candidates", () => {
    const five = Array.from({ length: 5 }, () => CAND(0.5));
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: five, confidence: "low", variantUndecided: false, unavailableReason: null, indexVersion: "i" }).success).toBe(true);
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [...five, CAND(0.4)], confidence: "low", variantUndecided: false, unavailableReason: null, indexVersion: "i" }).success).toBe(false);
  });

  it("an unavailable answer carries no candidates and no confidence", () => {
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [CAND(0.9)], confidence: "high", variantUndecided: false, unavailableReason: "no_match", indexVersion: "i" }).success).toBe(false);
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [], confidence: "low", variantUndecided: false, unavailableReason: "no_match", indexVersion: "i" }).success).toBe(false);
  });

  it("no candidates without a reason is refused (say no_match)", () => {
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [], confidence: null, variantUndecided: false, unavailableReason: null, indexVersion: "i" }).success).toBe(false);
  });

  it("candidates without a confidence are refused", () => {
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [CAND(0.9)], confidence: null, variantUndecided: false, unavailableReason: null, indexVersion: "i" }).success).toBe(false);
  });

  it("a score is 0 to 1", () => {
    for (const score of [-0.1, 1.2]) {
      expect(IdentifyMatchResponseSchema.safeParse({ candidates: [CAND(score)], confidence: "low", variantUndecided: false, unavailableReason: null, indexVersion: "i" }).success, String(score)).toBe(false);
    }
  });

  it("an unknown unavailable reason is refused (the list is closed here; a client treats a future one as 'no picture match')", () => {
    expect(IdentifyMatchResponseSchema.safeParse({ candidates: [], confidence: null, variantUndecided: false, unavailableReason: "on_fire", indexVersion: null }).success).toBe(false);
  });

  it("crop: the server's read of the crop. Omitted means unknown; ok, loose and unknown are the only values", () => {
    const base = { candidates: [CAND(0.9)], confidence: "high", variantUndecided: false, unavailableReason: null, indexVersion: "i" };
    expect(IdentifyMatchResponseSchema.parse(base).crop).toBe("unknown");
    for (const crop of ["ok", "loose", "unknown"]) expect(IdentifyMatchResponseSchema.safeParse({ ...base, crop }).success, crop).toBe(true);
    expect(IdentifyMatchResponseSchema.safeParse({ ...base, crop: "tight" }).success).toBe(false);
  });

  it("crop_loose is an unavailable answer and says the crop was loose", () => {
    const loose = { candidates: [], confidence: null, variantUndecided: false, unavailableReason: "crop_loose", indexVersion: "i" };
    expect(IdentifyMatchResponseSchema.safeParse({ ...loose, crop: "loose" }).success).toBe(true);
    expect(IdentifyMatchResponseSchema.safeParse({ ...loose, crop: "ok" }).success).toBe(false);
    expect(IdentifyMatchResponseSchema.safeParse(loose).success).toBe(false);   // omitted crop is "unknown"
  });
});
