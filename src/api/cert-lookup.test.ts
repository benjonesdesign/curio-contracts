import { describe, it, expect } from "vitest";
import { CertLookupRequestSchema, CertLookupResponseSchema } from "./cert-lookup.js";

describe("CertLookupRequestSchema", () => {
  it("accepts a PSA cert number", () => {
    expect(CertLookupRequestSchema.parse({ grader: "PSA", certNumber: "12345678" })).toEqual({
      grader: "PSA", certNumber: "12345678",
    });
  });

  it("rejects an empty cert number", () => {
    expect(() => CertLookupRequestSchema.parse({ grader: "PSA", certNumber: "" })).toThrow();
  });

  it("rejects a non-PSA grader (not supported yet)", () => {
    expect(() => CertLookupRequestSchema.parse({ grader: "CGC", certNumber: "12345678" })).toThrow();
  });
});

describe("CertLookupResponseSchema", () => {
  it("parses a found cert", () => {
    const res = CertLookupResponseSchema.parse({
      found: true,
      grader: "PSA",
      certNumber: "12345678",
      grade: "9",
      gradeDescription: "MINT",
      subject: "Charizard",
      year: "1999",
      brand: "Pokemon",
      category: "TCG",
      cardNumber: "4",
      variety: "Holo",
      labelType: "Standard",
    });
    expect(res.found).toBe(true);
    expect(res.grade).toBe("9");
  });

  it("parses a not-found cert (still a valid response, not an error)", () => {
    const res = CertLookupResponseSchema.parse({
      found: false,
      grader: "PSA",
      certNumber: "00000000",
      grade: null,
      gradeDescription: null,
      subject: null,
      year: null,
      brand: null,
      category: null,
      cardNumber: null,
      variety: null,
      labelType: null,
    });
    expect(res.found).toBe(false);
  });
});
