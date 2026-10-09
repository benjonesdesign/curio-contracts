// MUTATION-CHECKED 2026-10-08 (v0.2.0 PhysicalCard / status): see CHANGELOG "Mutation check, round 2".

import { describe, it, expect } from "vitest";
import { PhysicalCardSchema, PhysicalCardStatusSchema } from "./physical-card.js";
import { CARD } from "../test-support/breakdown-fixtures.js";

describe("PhysicalCardStatus (v0.2.0)", () => {
  it("is the sixteen statuses the web repo already writes, plus UNMATCHED and HELD", () => {
    expect([...PhysicalCardStatusSchema.options]).toEqual([
      "RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION",
      "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED",
      "EXCEPTION", "RETURNED", "ARCHIVED",
      "UNMATCHED", "HELD",
    ]);
  });

  it("accepts UNMATCHED (\"Not identified\") and HELD (\"Held by you\")", () => {
    expect(PhysicalCardStatusSchema.safeParse("UNMATCHED").success).toBe(true);
    expect(PhysicalCardStatusSchema.safeParse("HELD").success).toBe(true);
  });

  it("does not treat Mine as a status: Mine is an allocation (`keep`), reaching a client as a refusal reason", () => {
    expect(PhysicalCardStatusSchema.safeParse("MINE").success).toBe(false);
    expect(PhysicalCardStatusSchema.safeParse("KEEP").success).toBe(false);
  });

  it("is case-sensitive and closed: the server never emits a status it does not define", () => {
    expect(PhysicalCardStatusSchema.safeParse("held").success).toBe(false);
    expect(PhysicalCardStatusSchema.safeParse("PAUSED").success).toBe(false);
  });
});

describe("PhysicalCard.sku (v0.2.0)", () => {
  it("parses a copy with its SKU", () => {
    expect(PhysicalCardSchema.parse(CARD).sku).toBe("SKU-11111111");
  });

  it("is a NON-NULL string on every copy: there is no 'no SKU yet' state", () => {
    const { sku: _s, ...noSku } = CARD;
    expect(PhysicalCardSchema.safeParse(noSku).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, sku: null }).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, sku: "" }).success).toBe(false);
  });

  it("gives an UNMATCHED copy a SKU too (it is added with one, like any copy), with unconfirmed typed details", () => {
    const r = PhysicalCardSchema.safeParse({ ...CARD, status: "UNMATCHED", name: "Charzard", setName: null, cardNumber: null, condition: null, conditionConfirmed: false });
    expect(r.success).toBe(true);
  });

  it("is OPAQUE: the contract constrains nothing but 'a non-empty string'", () => {
    // SKU- + 8 hex (today), the storage spec's A17-B03-0042 shape, and a future recipe nobody has
    // written yet must all be valid, because no client may parse or validate the format.
    for (const sku of ["SKU-11111111", "A17-B03-0042", "0000", "a", "a b", "LOT-1350"]) {
      expect(PhysicalCardSchema.safeParse({ ...CARD, sku }).success, sku).toBe(true);
    }
  });

  it("allows a captured-but-unidentified copy: name null (\"Not identified yet\")", () => {
    expect(PhysicalCardSchema.safeParse({ ...CARD, status: "NEEDS_ID_REVIEW", name: null, setName: null, cardNumber: null }).success).toBe(true);
  });

  it("separates a condition on the copy from the seller CONFIRMING it", () => {
    const { conditionConfirmed: _c, ...noFlag } = CARD;
    expect(PhysicalCardSchema.safeParse(noFlag).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, conditionConfirmed: false }).success).toBe(true);
  });

  it("HELD carries held_at as heldAt, and a HELD copy without one is refused", () => {
    const held = { ...CARD, status: "HELD", heldAt: "2026-10-06T10:15:00.000Z" };
    expect(PhysicalCardSchema.parse(held).heldAt).toBe("2026-10-06T10:15:00.000Z");
    expect(PhysicalCardSchema.safeParse({ ...held, heldAt: null }).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, status: "HELD" }).success).toBe(false);
  });

  it("requires the heldAt key on every copy (null when never held) and rejects a non-timestamp", () => {
    const { heldAt: _h, ...noKey } = CARD;
    expect(PhysicalCardSchema.safeParse(noKey).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, heldAt: "yesterday" }).success).toBe(false);
  });

  it("has no quantity: only a BulkRecord carries a count, and a BulkRecord is not a PhysicalCard", () => {
    // Zod strips unknown keys; the point is that the parsed copy cannot carry one.
    const parsed = PhysicalCardSchema.parse({ ...CARD, quantity: 12 }) as Record<string, unknown>;
    expect("quantity" in parsed).toBe(false);
  });
});
