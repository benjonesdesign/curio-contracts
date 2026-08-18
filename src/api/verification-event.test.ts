import { describe, it, expect } from "vitest";
import { VerificationEventRequestSchema, VerificationEventResponseSchema } from "./verification-event.js";

describe("VerificationEventRequestSchema", () => {
  it("accepts a minimal identity correction", () => {
    const parsed = VerificationEventRequestSchema.parse({
      physicalCardId: "abc-123",
      kind: "identity",
      field: "name",
    });
    expect(parsed.physicalCardId).toBe("abc-123");
    expect(parsed.kind).toBe("identity");
  });

  it("accepts a full condition correction with verdict + before/after + source", () => {
    const parsed = VerificationEventRequestSchema.parse({
      physicalCardId: "abc-123",
      kind: "condition",
      field: "corner_wear",
      verdict: "not_present",
      previousValue: "minor corner wear",
      correctedValue: null,
      source: "ios_capture",
    });
    expect(parsed.verdict).toBe("not_present");
    expect(parsed.correctedValue).toBeNull();
  });

  it("rejects an unknown kind", () => {
    expect(() =>
      VerificationEventRequestSchema.parse({ physicalCardId: "abc-123", kind: "price", field: "avg" }),
    ).toThrow();
  });
});

describe("VerificationEventResponseSchema", () => {
  it("parses a recorded event", () => {
    const res = VerificationEventResponseSchema.parse({ recorded: true, id: "evt-1" });
    expect(res.recorded).toBe(true);
  });

  it("parses a skipped (flag-off) response", () => {
    const res = VerificationEventResponseSchema.parse({ recorded: false, id: null });
    expect(res.recorded).toBe(false);
    expect(res.id).toBeNull();
  });
});
