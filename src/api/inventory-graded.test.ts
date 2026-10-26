// MUTATION-CHECKED 2026-10-09 (graded slab record): see CHANGELOG "Mutation check, round 3". 2026-10-19 (v0.2.2, grade an existing copy): red against `r.batchId !== undefined && r.physicalCardId !== undefined` changed to `false` in src/api/inventory-graded.ts (the both-together test), red against `r.batchId === undefined && r.physicalCardId === undefined` changed to `false` (the neither test and the adding-needs-batchId test), red against `r.physicalCardId === undefined && r.name === undefined` changed to `false` (the adding-needs-name test), red against `physicalCardId: z.string().uuid().optional()` changed to `z.string().optional()` (the uuid test), green against current.

import { describe, it, expect } from "vitest";
import {
  GradedCreateRequestSchema, GradedCreateResponseSchema, SlabGraderSchema, CertCheckSchema,
} from "./inventory-graded.js";

const BATCH = "11111111-2222-4333-8444-555555555555";
const CARD_ID = "aaaaaaaa-2222-4333-8444-555555555555";
const REQ = { batchId: BATCH, name: "Charizard", grader: "PSA", grade: "10", certNumber: "87402113" };
const RES = {
  physicalCardId: CARD_ID, legacyCardId: null, sku: "SKU-AAAAAAAA", status: "NEEDS_DECISION",
  created: true, certVerified: true, certCheck: "verified", catalogueMatched: true,
};

describe("POST /api/inventory/graded: request", () => {
  it("accepts the minimum: a batch id, the typed identity, grader, grade and cert", () => {
    expect(GradedCreateRequestSchema.safeParse(REQ).success).toBe(true);
  });

  it("accepts the full request and keeps unknown cost / price as null, never 0", () => {
    const r = GradedCreateRequestSchema.parse({
      ...REQ, game: "pokemon", setName: "Base Set", cardNumber: "4/102", language: "English",
      purchaseCost: null, suggestedPrice: null, collectionType: "resale",
      photoPaths: ["u/a.jpg"], thumbPaths: ["u/a-t.jpg"], notes: null,
    });
    expect(r.purchaseCost).toBeNull();
    expect(r.suggestedPrice).toBeNull();
    expect(GradedCreateRequestSchema.parse({ ...REQ, purchaseCost: 0 }).purchaseCost).toBe(0);   // a gift: a real £0
  });

  it("ADDING a slab still REQUIRES a uuid batchId: it is what makes a retry return the same copy and SKU", () => {
    const { batchId: _b, ...none } = REQ;
    expect(GradedCreateRequestSchema.safeParse(none).success).toBe(false);
    expect(GradedCreateRequestSchema.safeParse({ ...REQ, batchId: "not-a-uuid" }).success).toBe(false);
  });

  it("ADDING a slab still REQUIRES the typed name", () => {
    const { name: _n, ...noName } = REQ;
    expect(GradedCreateRequestSchema.safeParse(noName).success).toBe(false);
  });

  // v0.2.2: grade a copy that already exists (capture-commit made it, with its SKU).
  describe("grading an EXISTING copy (physicalCardId, v0.2.2)", () => {
    const GRADE = { physicalCardId: CARD_ID, grader: "PSA", grade: "10", certNumber: "87402113" };

    it("accepts a physicalCardId with grader, grade and cert, and NO batchId and NO name", () => {
      expect(GradedCreateRequestSchema.safeParse(GRADE).success).toBe(true);
    });

    it("refuses batchId and physicalCardId together: one or the other", () => {
      const r = GradedCreateRequestSchema.safeParse({ ...GRADE, batchId: BATCH });
      expect(r.success).toBe(false);
      expect(r.success ? [] : r.error.issues.map((i) => i.path.join("."))).toContain("physicalCardId");
    });

    it("refuses neither", () => {
      const r = GradedCreateRequestSchema.safeParse({ grader: "PSA", grade: "10", certNumber: "87402113", name: "Charizard" });
      expect(r.success).toBe(false);
      expect(r.success ? [] : r.error.issues.map((i) => i.path.join("."))).toContain("batchId");
    });

    it("physicalCardId must be a uuid", () => {
      expect(GradedCreateRequestSchema.safeParse({ ...GRADE, physicalCardId: "not-a-uuid" }).success).toBe(false);
    });

    it("still needs a real grader, grade and cert", () => {
      for (const bad of [{ grade: "" }, { certNumber: " " }, { grader: "Acme" }]) {
        expect(GradedCreateRequestSchema.safeParse({ ...GRADE, ...bad }).success, JSON.stringify(bad)).toBe(false);
      }
      const { grader: _g, ...noGrader } = GRADE;
      expect(GradedCreateRequestSchema.safeParse(noGrader).success).toBe(false);
    });

    it("tolerates the identity fields (the server ignores them on this path) and still carries no verification flag", () => {
      const parsed = GradedCreateRequestSchema.parse({ ...GRADE, name: "Charizard", setName: "Base Set", certVerified: true } as never) as Record<string, unknown>;
      expect(parsed.name).toBe("Charizard");
      expect("certVerified" in parsed).toBe(false);
    });
  });

  it("carries NO verification flag and NO sku: the server alone decides both", () => {
    const parsed = GradedCreateRequestSchema.parse({ ...REQ, certVerified: true, sku: "SKU-X" } as never) as Record<string, unknown>;
    expect("certVerified" in parsed).toBe(false);
    expect("sku" in parsed).toBe(false);
  });

  it("refuses a blank name, grade or cert, a negative price, and a grader the form does not offer", () => {
    for (const bad of [{ name: "  " }, { grade: "" }, { certNumber: " " }, { purchaseCost: -1 }, { suggestedPrice: -0.01 }, { grader: "Acme" }, { collectionType: "gift" }]) {
      expect(GradedCreateRequestSchema.safeParse({ ...REQ, ...bad }).success, JSON.stringify(bad)).toBe(false);
    }
  });

  it("bounds the photos at 12", () => {
    const paths = (n: number) => Array.from({ length: n }, (_, i) => `u/${i}.jpg`);
    expect(GradedCreateRequestSchema.safeParse({ ...REQ, photoPaths: paths(12) }).success).toBe(true);
    expect(GradedCreateRequestSchema.safeParse({ ...REQ, photoPaths: paths(13) }).success).toBe(false);
  });

  it("offers exactly the seven graders on the form", () => {
    expect([...SlabGraderSchema.options]).toEqual(["PSA", "BGS / Beckett", "CGC", "ACE", "TAG", "SGC", "Other"]);
  });
});

describe("POST /api/inventory/graded: response", () => {
  it("parses a verified slab on first create, with a non-null opaque SKU and a closed status", () => {
    const r = GradedCreateResponseSchema.parse(RES);
    expect(r.sku).toBe("SKU-AAAAAAAA");
    expect(r.status).toBe("NEEDS_DECISION");
  });

  it("accepts NEEDS_ID_REVIEW when the typed identity did not match the catalogue, and a retry (created false)", () => {
    expect(GradedCreateResponseSchema.safeParse({ ...RES, status: "NEEDS_ID_REVIEW", catalogueMatched: false }).success).toBe(true);
    expect(GradedCreateResponseSchema.safeParse({ ...RES, created: false }).success).toBe(true);
  });

  it("an unverified slab says why, and is never certVerified", () => {
    for (const certCheck of ["not_found", "grade_mismatch", "unavailable", "unsupported_grader"]) {
      expect(GradedCreateResponseSchema.safeParse({ ...RES, certVerified: false, certCheck }).success, certCheck).toBe(true);
    }
  });

  it("REJECTS certVerified that disagrees with certCheck, in both directions (server-side guard)", () => {
    expect(GradedCreateResponseSchema.safeParse({ ...RES, certVerified: true, certCheck: "grade_mismatch" }).success).toBe(false);
    expect(GradedCreateResponseSchema.safeParse({ ...RES, certVerified: true, certCheck: "unsupported_grader" }).success).toBe(false);
    expect(GradedCreateResponseSchema.safeParse({ ...RES, certVerified: false, certCheck: "verified" }).success).toBe(false);
  });

  it("REQUIRES the SKU, non-empty: there is no 'no SKU yet' state", () => {
    expect(GradedCreateResponseSchema.safeParse({ ...RES, sku: "" }).success).toBe(false);
    expect(GradedCreateResponseSchema.safeParse({ ...RES, sku: null }).success).toBe(false);
    const { sku: _s, ...none } = RES;
    expect(GradedCreateResponseSchema.safeParse(none).success).toBe(false);
  });

  it("keeps cert checks a closed five-value list", () => {
    expect([...CertCheckSchema.options]).toEqual(["verified", "not_found", "grade_mismatch", "unavailable", "unsupported_grader"]);
    expect(GradedCreateResponseSchema.safeParse({ ...RES, certVerified: false, certCheck: "pending" }).success).toBe(false);
  });

  it("REJECTS a status this server does not define", () => {
    expect(GradedCreateResponseSchema.safeParse({ ...RES, status: "GRADED" }).success).toBe(false);
  });
});
