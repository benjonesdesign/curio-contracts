// MUTATION-CHECKED 2026-10-18: red against `scanId: z.string().uuid()` changed to `z.string()` ("a scanId must be a uuid" goes red), against `v: z.literal(1)` changed to `z.number()` ("the version must be 1" goes red), against `platform` widened to a free string ("only ios, android and web" goes red), and against `ok: z.literal(true)` changed to `z.boolean()` ("the response is exactly ok:true" goes red); green against current.
import { describe, it, expect } from "vitest";
import { ScanTraceRequestSchema, ScanTraceResponseSchema } from "./scan-trace.js";

const SCAN = "3f2a9c1e-7b4d-4e8a-9f10-a5c6d7e8f901";
const BASE = {
  v: 1, scanId: SCAN, platform: "android",
  answer: { by: "lookup" },
  outcome: { sellerAction: "kept" },
};

describe("scan-trace contract", () => {
  it("accepts the minimal request: version, scanId, platform, answer, outcome", () => {
    expect(ScanTraceRequestSchema.safeParse(BASE).success).toBe(true);
  });

  it("accepts a full request: OCR fields, a match, a final match, changed fields", () => {
    const full = {
      ...BASE, appVersion: "1.4.0", gameHint: "pokemon",
      ocr: { number: "58", total: "102", setCode: "BS", setName: null, name: "Pikachu", confidence: 0.91, lines: ["Pikachu", "58/102"], ms: 120 },
      answer: { by: "tier0", resolverTier: "number+total", candidateCount: 1, match: { game: "pokemon", nativeId: "base1-58", name: "Pikachu", setName: "Base Set", cardNumber: "58/102" }, ms: 300 },
      outcome: { sellerAction: "changed", changedFields: ["number"], finalMatch: { name: "Pikachu", cardNumber: "57/102" } },
    };
    expect(ScanTraceRequestSchema.safeParse(full).success).toBe(true);
  });

  it("a scanId must be a uuid", () => {
    expect(ScanTraceRequestSchema.safeParse({ ...BASE, scanId: "scan-1" }).success).toBe(false);
  });

  it("the version must be 1", () => {
    expect(ScanTraceRequestSchema.safeParse({ ...BASE, v: 2 }).success).toBe(false);
  });

  it("only ios, android and web", () => {
    expect(ScanTraceRequestSchema.safeParse({ ...BASE, platform: "palm" }).success).toBe(false);
  });

  it("answer.by and sellerAction are open strings: a value from a newer client is not an error (ADR 0027)", () => {
    expect(ScanTraceRequestSchema.safeParse({ ...BASE, answer: { by: "embedding" }, outcome: { sellerAction: "zoomed" } }).success).toBe(true);
  });

  it("the response is exactly ok:true", () => {
    expect(ScanTraceResponseSchema.safeParse({ ok: true }).success).toBe(true);
    expect(ScanTraceResponseSchema.safeParse({ ok: false }).success).toBe(false);
  });
});
