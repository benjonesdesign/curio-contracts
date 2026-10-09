// MUTATION-CHECKED 2026-10-09 (Mine / set aside / put back / stats): see CHANGELOG "Mutation check, round 3".

import { describe, it, expect } from "vitest";
import {
  MineRequestSchema, SetAsideRequestSchema, PutBackRequestSchema, InventoryChangeResponseSchema,
  InventoryChangeRefusalReasonSchema, StatsResponseSchema, CollectionValueSchema,
} from "./inventory-change.js";
import { SetAsideReasonSchema, PhysicalCardSchema } from "./physical-card.js";
import { CARD } from "../test-support/breakdown-fixtures.js";

const issues = (r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  r.success ? [] : r.error!.issues;

describe("the closed lists (pokemon-tool #259 / #260)", () => {
  it("set-aside reasons are exactly the four chips, never free text", () => {
    expect([...SetAsideReasonSchema.options]).toEqual(["looks_off", "altered_or_damaged", "unsupported_game", "other"]);
    for (const bad of ["fake", "counterfeit", "Doesn't look genuine", "Looks off", ""]) {
      expect(SetAsideReasonSchema.safeParse(bad).success, bad).toBe(false);
    }
  });

  it("change-refusal reasons are exactly the six #260 returns", () => {
    expect([...InventoryChangeRefusalReasonSchema.options]).toEqual(["live_on_ebay", "sold", "archived", "set_aside", "not_found", "write_failed"]);
  });
});

describe("requests", () => {
  it("Mine takes ids and a boolean: true marks Mine, false changes to stock", () => {
    expect(MineRequestSchema.parse({ ids: ["a"], mine: true }).mine).toBe(true);
    expect(MineRequestSchema.parse({ ids: ["a"], mine: false }).mine).toBe(false);
    expect(MineRequestSchema.safeParse({ ids: ["a"] }).success).toBe(false);
    expect(MineRequestSchema.safeParse({ ids: ["a"], mine: "yes" }).success).toBe(false);
  });

  it("bounds ids to 1..500 and refuses an empty id", () => {
    const ids = (n: number) => Array.from({ length: n }, (_, i) => `c${i}`);
    expect(PutBackRequestSchema.safeParse({ ids: ids(500) }).success).toBe(true);
    expect(PutBackRequestSchema.safeParse({ ids: ids(501) }).success).toBe(false);
    expect(PutBackRequestSchema.safeParse({ ids: [] }).success).toBe(false);
    expect(PutBackRequestSchema.safeParse({ ids: [""] }).success).toBe(false);
  });

  it("Set aside takes a chip, null or nothing (skipping is allowed) and REFUSES any other reason", () => {
    for (const reason of [...SetAsideReasonSchema.options, null, undefined]) {
      expect(SetAsideRequestSchema.safeParse({ ids: ["a"], reason }).success, String(reason)).toBe(true);
    }
    expect(SetAsideRequestSchema.safeParse({ ids: ["a"], reason: "I just don't like it" }).success).toBe(false);
  });
});

describe("the per-copy answer", () => {
  const changed = (id: string) => ({ id, outcome: "changed" });
  const refused = (id: string, reason = "live_on_ebay") => ({ id, outcome: "refused", reason, error: "End the listing first. It's live on eBay." });
  const sum = (changedN: number, unchanged: number, refusedN: number, failed: number) => ({ changed: changedN, unchanged, refused: refusedN, failed });

  it("accepts a mixed selection: what changed, what was refused and why, and a summary that is the tally", () => {
    const r = InventoryChangeResponseSchema.safeParse({
      results: [changed("a"), refused("b"), { id: "c", outcome: "unchanged" }, { id: "d", outcome: "failed", reason: "write_failed", error: "Couldn't save" }],
      summary: sum(1, 1, 1, 1),
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("carries the Undo information: previousReason on a put-back, droppedChannel / replacedChannel on a set-aside / Mine", () => {
    const r = InventoryChangeResponseSchema.parse({
      results: [
        { id: "a", outcome: "changed", status: "NEEDS_CONDITION", previousReason: "other" },
        { id: "b", outcome: "changed", status: "EXCEPTION", droppedChannel: "bundle" },
        { id: "c", outcome: "changed", replacedChannel: "show" },
      ],
      summary: sum(3, 0, 0, 0),
    });
    expect(r.results[0].previousReason).toBe("other");
    expect(r.results[1].droppedChannel).toBe("bundle");
  });

  it("REJECTS a summary that is not the tally of the results", () => {
    const r = InventoryChangeResponseSchema.safeParse({ results: [changed("a"), refused("b")], summary: sum(2, 0, 0, 0) });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path.join(".") === "summary.changed")).toBe(true);
    expect(InventoryChangeResponseSchema.safeParse({ results: [changed("a")], summary: sum(1, 0, 1, 0) }).success).toBe(false);
  });

  it("REJECTS the same copy twice: one result per copy", () => {
    expect(InventoryChangeResponseSchema.safeParse({ results: [changed("a"), changed("a")], summary: sum(2, 0, 0, 0) }).success).toBe(false);
  });

  it("REQUIRES a reason on a refusal or a failure, and refuses one on a success", () => {
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "refused" }], summary: sum(0, 0, 1, 0) }).success).toBe(false);
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "failed" }], summary: sum(0, 0, 0, 1) }).success).toBe(false);
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "changed", reason: "sold" }], summary: sum(1, 0, 0, 0) }).success).toBe(false);
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "unchanged", reason: "sold" }], summary: sum(0, 1, 0, 0) }).success).toBe(false);
  });

  it("keeps a failure and a refusal apart: write_failed is only ever a failure", () => {
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "refused", reason: "write_failed" }], summary: sum(0, 0, 1, 0) }).success).toBe(false);
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "failed", reason: "sold" }], summary: sum(0, 0, 0, 1) }).success).toBe(false);
  });

  it("REJECTS an unknown reason or outcome (the server never emits one; clients tolerate it)", () => {
    expect(InventoryChangeResponseSchema.safeParse({ results: [refused("a", "frozen")], summary: sum(0, 0, 1, 0) }).success).toBe(false);
    expect(InventoryChangeResponseSchema.safeParse({ results: [{ id: "a", outcome: "skipped" }], summary: sum(0, 0, 0, 0) }).success).toBe(false);
  });
});

describe("PhysicalCard: Mine and set aside", () => {
  const AT = "2026-10-09T10:00:00.000Z";
  const aside = { ...CARD, status: "EXCEPTION", setAsideAt: AT, setAsideReason: "looks_off" };

  it("carries isMine and mineSetAt (stamped by the database)", () => {
    const c = PhysicalCardSchema.parse({ ...CARD, isMine: true, mineSetAt: AT });
    expect(c.isMine).toBe(true);
    expect(c.mineSetAt).toBe(AT);
  });

  it("allows a legacy Mine row with no stamp, but never a stamp on a copy that is not Mine", () => {
    expect(PhysicalCardSchema.safeParse({ ...CARD, isMine: true, mineSetAt: null }).success).toBe(true);
    expect(PhysicalCardSchema.safeParse({ ...CARD, isMine: false, mineSetAt: AT }).success).toBe(false);
  });

  it("a set-aside copy says since when and may say why; a skipped reason is null", () => {
    expect(PhysicalCardSchema.safeParse(aside).success).toBe(true);
    expect(PhysicalCardSchema.safeParse({ ...aside, setAsideReason: null }).success).toBe(true);
  });

  it("REJECTS EXCEPTION without setAsideAt, setAsideAt on a copy that is not set aside, and a reason without it", () => {
    expect(PhysicalCardSchema.safeParse({ ...aside, setAsideAt: null }).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, setAsideAt: AT }).success).toBe(false);
    expect(PhysicalCardSchema.safeParse({ ...CARD, setAsideReason: "other" }).success).toBe(false);
  });

  it("a copy can be BOTH Mine and set aside: they are independent", () => {
    expect(PhysicalCardSchema.safeParse({ ...aside, isMine: true, mineSetAt: AT }).success).toBe(true);
  });

  it("REQUIRES the four new keys on every copy", () => {
    for (const k of ["isMine", "mineSetAt", "setAsideReason", "setAsideAt"]) {
      const { [k]: _omit, ...rest } = CARD as Record<string, unknown>;
      expect(PhysicalCardSchema.safeParse(rest).success, k).toBe(false);
    }
  });
});

describe("GET /api/stats", () => {
  const collection = { count: 3, pricedCount: 2, notPricedCount: 1, lowGbp: 30, highGbp: 45.5, sources: ["cardtrader"] };
  const STATS = {
    statusCounts: { READY_TO_LIST: 4, LISTED: 1, EXCEPTION: 1, HELD: 1, UNMATCHED: 1 },
    costBasis: 120, estValue: 65, realisedGain: 12.5, agedListings: 0, totalCards: 8,
    counts: { stock: 5, mine: 2, setAside: 1 },
    collectionValue: collection,
  };

  it("parses the stats with counts and the Mine collection valued apart", () => {
    const s = StatsResponseSchema.parse(STATS);
    expect(s.counts).toEqual({ stock: 5, mine: 2, setAside: 1 });
    expect(s.collectionValue.lowGbp).toBe(30);
  });

  it("an unpriced Mine collection is null, never 0", () => {
    const none = { count: 2, pricedCount: 0, notPricedCount: 2, lowGbp: null, highGbp: null, sources: [] };
    expect(CollectionValueSchema.safeParse(none).success).toBe(true);
    expect(CollectionValueSchema.safeParse({ ...none, lowGbp: 0, highGbp: 0 }).success).toBe(false);
    expect(CollectionValueSchema.safeParse({ ...collection, lowGbp: null }).success).toBe(false);
    expect(CollectionValueSchema.safeParse({ ...collection, highGbp: null }).success).toBe(false);
  });

  it("REJECTS a collection whose count is not priced + not priced, or whose range is upside down", () => {
    expect(CollectionValueSchema.safeParse({ ...collection, count: 4 }).success).toBe(false);
    expect(CollectionValueSchema.safeParse({ ...collection, lowGbp: 50, highGbp: 45.5 }).success).toBe(false);
  });

  it("keeps status counts open (a status this build does not know is just another key)", () => {
    expect(StatsResponseSchema.safeParse({ ...STATS, statusCounts: { QUARANTINED: 2 } }).success).toBe(true);
    expect(StatsResponseSchema.safeParse({ ...STATS, statusCounts: { LISTED: -1 } }).success).toBe(false);
  });

  it("requires counts and collectionValue: a stats response without them would value Mine as stock", () => {
    const { counts: _c, ...noCounts } = STATS;
    const { collectionValue: _v, ...noValue } = STATS;
    expect(StatsResponseSchema.safeParse(noCounts).success).toBe(false);
    expect(StatsResponseSchema.safeParse(noValue).success).toBe(false);
  });
});
