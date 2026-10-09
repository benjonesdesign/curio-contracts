// MUTATION-CHECKED 2026-10-08 (v0.2.0 listing preview): see CHANGELOG "Mutation check, round 2".

import { describe, it, expect } from "vitest";
import { ListingPreviewRequestSchema, ListingPreviewResponseSchema } from "./listing-preview.js";
import { CARD, SELLING_KNOWN, SELLING_FEE_UNSET, BUYING_PRIVATE, line, rebalance } from "../test-support/breakdown-fixtures.js";

const issues = (r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  r.success ? [] : r.error!.issues;

/** A selling breakdown receiving `gbp` (the fixture's other lines are irrelevant to the preview). */
const receiving = (gbp: number) => rebalance({
  ...SELLING_KNOWN,
  // vary the sale price so the lines still add up to exactly `gbp` (18.28 fee + 0.34 packing)
  lines: SELLING_KNOWN.lines.map((l) => (l.key === "sale_price" ? { ...l, amountGbp: Math.round((gbp + 18.62) * 100) / 100 } : l)),
});

const item = (id: string, over: Record<string, unknown> = {}) => ({
  card: { ...CARD, id, sku: `SKU-${id}` },
  listable: true, refusalReason: null, breakdown: receiving(148.38), belowFloor: false, group: "list_now",
  ...over,
});
const totals = (over: Record<string, unknown> = {}) => ({
  count: 2, listableCount: 2, belowFloorCount: 0, youReceiveGbp: 296.76, unknownReason: null, ...over,
});
const RESPONSE = {
  items: [item("a"), item("b")],
  groups: [{ key: "list_now", totals: totals() }],
  totals: totals(),
  floorGbp: 1.5,
  computedAt: "2026-10-08T09:30:00.000Z",
};

describe("ListingPreviewRequest", () => {
  it("accepts copies with the seller's intent: a price, a format, who pays postage, a packing key, a group", () => {
    const r = ListingPreviewRequestSchema.safeParse({
      items: [{ physicalCardId: "a", priceGbp: 167, format: "FIXED_PRICE", postageMode: "buyer_pays", packingKey: "toploader", group: "list_now" }, { physicalCardId: "b" }],
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("takes postageFor once for the batch and cardsInParcel per copy (#255), both optional", () => {
    const r = ListingPreviewRequestSchema.parse({ postageFor: "published", items: [{ physicalCardId: "a", cardsInParcel: 3 }, { physicalCardId: "b" }] });
    expect(r.postageFor).toBe("published");
    expect(r.items[0].cardsInParcel).toBe(3);
    expect(r.items[1].cardsInParcel).toBeUndefined();
    expect(ListingPreviewRequestSchema.parse({ items: [{ physicalCardId: "a" }] }).postageFor).toBeUndefined();
  });

  it("REJECTS an unknown postageFor and a bad parcel size", () => {
    const one = { physicalCardId: "a" };
    expect(ListingPreviewRequestSchema.safeParse({ postageFor: "live", items: [one] }).success).toBe(false);
    for (const cardsInParcel of [0, -2, 2.5, 501]) {
      expect(ListingPreviewRequestSchema.safeParse({ items: [{ ...one, cardsInParcel }] }).success, String(cardsInParcel)).toBe(false);
    }
  });

  it("bounds the batch at 200, as the decide batch, and refuses an empty one", () => {
    const many = (n: number) => ({ items: Array.from({ length: n }, (_, i) => ({ physicalCardId: `c${i}` })) });
    expect(ListingPreviewRequestSchema.safeParse(many(200)).success).toBe(true);
    expect(ListingPreviewRequestSchema.safeParse(many(201)).success).toBe(false);
    expect(ListingPreviewRequestSchema.safeParse({ items: [] }).success).toBe(false);
  });

  it("REJECTS a figure the world sets: a non-positive price, a postage amount in place of a mode", () => {
    expect(ListingPreviewRequestSchema.safeParse({ items: [{ physicalCardId: "a", priceGbp: 0 }] }).success).toBe(false);
    expect(ListingPreviewRequestSchema.safeParse({ items: [{ physicalCardId: "a", postageMode: 3.29 }] }).success).toBe(false);
  });
});

describe("ListingPreviewResponse (v0.2.0)", () => {
  it("accepts a batch whose totals are exactly what the rows add up to: the screen sums nothing", () => {
    const r = ListingPreviewResponseSchema.safeParse(RESPONSE);
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REJECTS a total that is not the sum of the listable rows, to the penny", () => {
    const r = ListingPreviewResponseSchema.safeParse({ ...RESPONSE, totals: totals({ youReceiveGbp: 296.77 }) });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /not the sum of the listable items/.test(i.message))).toBe(true);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, groups: [{ key: "list_now", totals: totals({ youReceiveGbp: 300 }) }] }).success).toBe(false);
  });

  it("sums in whole pence: three figures that float-sum to 0.30000000000000004 still total £0.30", () => {
    const three = [0.1, 0.1, 0.1].map((g, i) => item(`p${i}`, { breakdown: receiving(g), belowFloor: true, group: null }));
    const r = ListingPreviewResponseSchema.safeParse({
      items: three, groups: [], totals: totals({ count: 3, listableCount: 3, belowFloorCount: 3, youReceiveGbp: 0.3 }),
      floorGbp: 1.5, computedAt: "2026-10-08T09:30:00.000Z",
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("sums in whole pence with ROUND, not truncation: £0.29 and £1.13 are 28.999... and 112.999... as floats", () => {
    const two = [0.29, 1.13].map((g, i) => item(`q${i}`, { breakdown: receiving(g), belowFloor: true, group: null }));
    const r = ListingPreviewResponseSchema.safeParse({
      items: two, groups: [], totals: totals({ count: 2, listableCount: 2, belowFloorCount: 2, youReceiveGbp: 1.42 }),
      floorGbp: 1.5, computedAt: "x",
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("a refused copy is listed with its reason and is NOT counted into the total", () => {
    const mine = item("c", { card: { ...CARD, id: "c", sku: "SKU-c" }, listable: false, refusalReason: "mine", breakdown: null, belowFloor: null });
    const r = ListingPreviewResponseSchema.safeParse({
      ...RESPONSE, items: [...RESPONSE.items, mine],
      groups: [{ key: "list_now", totals: totals({ count: 3 }) }], totals: totals({ count: 3 }),
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REJECTS a refused copy counted as listable, and a listable copy with a reason", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { listable: false }), item("b")] }).success).toBe(false);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { refusalReason: "mine" }), item("b")] }).success).toBe(false);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { listable: false, refusalReason: null }), item("b")] }).success).toBe(false);
  });

  it("keeps a copy refused for its CONDITION in the table with what it would receive (WF1b)", () => {
    const noCondition = item("c", {
      card: { ...CARD, id: "c", sku: "SKU-c", condition: null, conditionConfirmed: false },
      listable: false, refusalReason: "condition_not_confirmed",
    });
    const r = ListingPreviewResponseSchema.safeParse({
      ...RESPONSE, items: [...RESPONSE.items, noCondition],
      groups: [{ key: "list_now", totals: totals({ count: 3 }) }], totals: totals({ count: 3 }),
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REQUIRES a breakdown for a listable copy: the seller sees what they receive before they publish", () => {
    // Totals made consistent with a missing receipt, so ONLY the missing breakdown can object.
    const t = totals({ count: 1, listableCount: 1, youReceiveGbp: null, unknownReason: "no_price" });
    const r = ListingPreviewResponseSchema.safeParse({
      items: [item("a", { breakdown: null, belowFloor: null, group: null })], groups: [], totals: t, floorGbp: 1.5, computedAt: "x",
    });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /always carries its breakdown/.test(i.message))).toBe(true);
  });

  it("REJECTS a BUYING breakdown in a listing preview, even a well-formed one with no figure to sum", () => {
    // A valid buying breakdown has no receipt, so the row and totals are consistent about that;
    // only the MODE is wrong.
    const t = totals({ count: 1, listableCount: 1, youReceiveGbp: null, unknownReason: "no_price" });
    const r = ListingPreviewResponseSchema.safeParse({
      items: [item("a", { breakdown: BUYING_PRIVATE, belowFloor: null, group: null })], groups: [], totals: t, floorGbp: 1.5, computedAt: "x",
    });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /prices a SALE/.test(i.message))).toBe(true);
  });

  it("seller type not set: NO receive figure, null WITH a reason, List stays possible (C10-AC5)", () => {
    const unset = (id: string) => item(id, { breakdown: SELLING_FEE_UNSET, belowFloor: null });
    const t = totals({ youReceiveGbp: null, unknownReason: "seller_type_not_set" });
    const r = ListingPreviewResponseSchema.safeParse({
      items: [unset("a"), unset("b")], groups: [{ key: "list_now", totals: t }], totals: t, floorGbp: 1.5, computedAt: "2026-10-08T09:30:00.000Z",
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
    expect(r.success && r.data.items.every((i) => i.listable)).toBe(true);
  });

  it("REJECTS an unknown total reported as £0, and a total with no reason", () => {
    const unset = (id: string) => item(id, { breakdown: SELLING_FEE_UNSET, belowFloor: null });
    const base = { items: [unset("a"), unset("b")], groups: [], floorGbp: 1.5, computedAt: "2026-10-08T09:30:00.000Z" };
    const zero = ListingPreviewResponseSchema.safeParse({ ...base, totals: totals({ youReceiveGbp: 0, unknownReason: null }) });
    expect(zero.success).toBe(false);
    expect(issues(zero).some((i) => /unknown is not £0/.test(i.message))).toBe(true);
    expect(ListingPreviewResponseSchema.safeParse({ ...base, totals: totals({ youReceiveGbp: null, unknownReason: null }) }).success).toBe(false);
  });

  it("REJECTS a total that survives one unknown listable receipt: an unknown poisons the sum", () => {
    const mixed = [item("a"), item("b", { breakdown: SELLING_FEE_UNSET, belowFloor: null })];
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: mixed, groups: [], totals: totals({ youReceiveGbp: 148.38 }) }).success).toBe(false);
  });

  it("a group with no listable copies totals £0, a true sum of nothing", () => {
    const refused = item("a", { listable: false, refusalReason: "set_aside", breakdown: null, belowFloor: null, group: "kept" });
    const t = totals({ count: 1, listableCount: 0, youReceiveGbp: 0 });
    const r = ListingPreviewResponseSchema.safeParse({ items: [refused], groups: [{ key: "kept", totals: t }], totals: t, floorGbp: 1.5, computedAt: "2026-10-08T09:30:00.000Z" });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("counts the cards under the floor, and only the listable ones (\"{3} cards · under your floor\")", () => {
    const low = (id: string) => item(id, { breakdown: receiving(1.2), belowFloor: true, group: "bundle" });
    const t3 = totals({ count: 3, listableCount: 3, belowFloorCount: 3, youReceiveGbp: 3.6 });
    const r = ListingPreviewResponseSchema.safeParse({
      items: [low("a"), low("b"), low("c")], groups: [{ key: "bundle", totals: t3 }], totals: t3, floorGbp: 1.5, computedAt: "x",
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
    expect(ListingPreviewResponseSchema.safeParse({
      items: [low("a"), low("b"), low("c")], groups: [{ key: "bundle", totals: { ...t3, belowFloorCount: 2 } }], totals: t3, floorGbp: 1.5, computedAt: "x",
    }).success).toBe(false);
  });

  it("belowFloor is null exactly when what the seller receives is unknown: never false-by-default", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { belowFloor: null }), item("b")] }).success).toBe(false);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { breakdown: SELLING_FEE_UNSET, belowFloor: false }), item("b")] }).success).toBe(false);
  });

  it("REJECTS belowFloor results when there is no floor to be below", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, floorGbp: null }).success).toBe(false);
  });

  it("REJECTS counts that disagree with the rows", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, totals: totals({ count: 3 }) }).success).toBe(false);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, totals: totals({ listableCount: 1 }) }).success).toBe(false);
  });

  it("REJECTS an item naming a group the response has no totals for, and a duplicate copy", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, groups: [] }).success).toBe(false);
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a"), item("a")] }).success).toBe(false);
  });

  it("carries a SKU on every row, non-null, because every copy has one", () => {
    const noSku = { ...RESPONSE, items: [{ ...item("a"), card: { ...CARD, id: "a", sku: null } }, item("b")] };
    expect(ListingPreviewResponseSchema.safeParse(noSku).success).toBe(false);
  });

  it("REJECTS a reason outside the closed list (the server never emits one)", () => {
    expect(ListingPreviewResponseSchema.safeParse({ ...RESPONSE, items: [item("a", { listable: false, refusalReason: "held" }), item("b")] }).success).toBe(false);
  });

  it("round-trips through JSON", () => {
    const parsed = ListingPreviewResponseSchema.parse(RESPONSE);
    expect(ListingPreviewResponseSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});

void line;
