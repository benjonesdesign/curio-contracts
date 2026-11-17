// MUTATION-CHECKED 2026-11-16: red against `retryable` check removed ("a failure says whether to retry" goes red), against `sku` made nullable ("a copy always has a SKU" goes red), against the `copies.length !== count` check removed ("copies must list exactly
// count" goes red), against the `listedOnEbayCount > count` check removed ("cannot list more on eBay than owned" goes
// red), against the added-needs-copy check removed ("an added result carries its copy and ordinal" goes red), against
// the refused-needs-reason check removed ("a refused keep names why" goes red), and against `lowGbp > highGbp` removed
// ("a low above the high is refused" goes red). 2026-11-17: also red against the undo `retryable` check removed ("a failed undo says
// whether to retry"), the market no-range-needs-reason check removed and `fetchedAt` made a bare string ("no range needs a reason");
// green against current.
import { describe, it, expect } from "vitest";
import { UndoKeepItResponseSchema, OwnedCopiesSummarySchema, QuickScanMarketSchema, KeepItRequestSchema, KeepItResponseSchema } from "./quick-scan-owned.js";
import { QuickScanResponseSchema } from "./decide.js";

const COPY = { physicalCardId: "p1", sku: "SKU-0001", condition: "NM", conditionConfirmedBySeller: true, status: "READY_TO_LIST", listed: false, channel: null };
const ok = (r: { success: boolean }) => r.success;

describe("owned copies summary", () => {
  it("copies must list exactly count", () => {
    expect(ok(OwnedCopiesSummarySchema.safeParse({ count: 2, conditions: ["NM"], listedOnEbayCount: 0, copies: [COPY] }))).toBe(false);
    expect(ok(OwnedCopiesSummarySchema.safeParse({ count: 1, conditions: ["NM"], listedOnEbayCount: 0, copies: [COPY] }))).toBe(true);
  });
  it("owning none is count 0 with no copies", () => {
    expect(ok(OwnedCopiesSummarySchema.safeParse({ count: 0, listedOnEbayCount: 0 }))).toBe(true);
  });
  it("cannot list more on eBay than owned", () => {
    expect(ok(OwnedCopiesSummarySchema.safeParse({ count: 1, listedOnEbayCount: 2, copies: [COPY] }))).toBe(false);
  });
});

describe("quick-scan market", () => {
  it("a low above the high is refused", () => {
    const base = { medianAskGbp: 5, listingCount: 3, source: "ebay-uk-sold", fetchedAt: "2026-11-16T10:00:00Z" };
    expect(ok(QuickScanMarketSchema.safeParse({ ...base, lowGbp: 9, highGbp: 4 }))).toBe(false);
    expect(ok(QuickScanMarketSchema.safeParse({ ...base, lowGbp: 4, highGbp: 9 }))).toBe(true);
  });
  it("unknown is null, not zero", () => {
    expect(ok(QuickScanMarketSchema.safeParse({ lowGbp: null, highGbp: null, medianAskGbp: null, listingCount: null, source: null, fetchedAt: null, unavailableReason: "no_listings" }))).toBe(true);
  });
  it("no range needs a reason, and a range has none", () => {
    const none = { lowGbp: null, highGbp: null, medianAskGbp: null, listingCount: null, source: null, fetchedAt: null };
    expect(ok(QuickScanMarketSchema.safeParse(none))).toBe(false);
    const range = { lowGbp: 1, highGbp: 2, medianAskGbp: 1.5, listingCount: 4, source: "x", fetchedAt: "2026-11-16T10:00:00Z" };
    expect(ok(QuickScanMarketSchema.safeParse({ ...range, unavailableReason: "not_priced" }))).toBe(false);
    expect(ok(QuickScanMarketSchema.safeParse({ ...range, fetchedAt: "yesterday" }))).toBe(false);
  });
});

describe("Keep it", () => {
  it("the request needs the scanned identity", () => {
    expect(ok(KeepItRequestSchema.safeParse({ game: "pokemon", nativeId: "sv1-1" }))).toBe(true);
    expect(ok(KeepItRequestSchema.safeParse({ game: "pokemon" }))).toBe(false);
  });
  it("an added result carries its copy and ordinal", () => {
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "added", copy: COPY, ordinal: 2, ownedCount: 2 }))).toBe(true);
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "added", copy: null, ordinal: null, ownedCount: 2 }))).toBe(false);
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "added", copy: null, ordinal: 1, ownedCount: 1 }))).toBe(false);
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "added", copy: COPY, ordinal: null, ownedCount: 1 }))).toBe(false);
  });
  it("a refused keep names why", () => {
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "refused", copy: null, ordinal: null, ownedCount: null, reason: "card_unknown" }))).toBe(true);
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "refused", copy: null, ordinal: null, ownedCount: null }))).toBe(false);
  });
  it("a failure says whether to retry", () => {
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "failed", copy: null, ordinal: null, ownedCount: null, retryable: true }))).toBe(true);
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "failed", copy: null, ordinal: null, ownedCount: null }))).toBe(false);
  });
  it("a copy always has a SKU", () => {
    expect(ok(KeepItResponseSchema.safeParse({ outcome: "added", copy: { ...COPY, sku: null }, ordinal: 1, ownedCount: 1 }))).toBe(false);
  });
});

describe("Undo Keep it", () => {
  it("undone carries the new count, refused carries a reason", () => {
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "undone", ownedCount: 1 }))).toBe(true);
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "undone", ownedCount: null }))).toBe(false);
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "refused", ownedCount: null, reason: "changed_since" }))).toBe(true);
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "refused", ownedCount: null }))).toBe(false);
  });
  it("a failed undo says whether to retry", () => {
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "failed", ownedCount: null }))).toBe(false);
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "failed", ownedCount: null, retryable: true }))).toBe(true);
    expect(ok(UndoKeepItResponseSchema.safeParse({ outcome: "undone", ownedCount: 1, retryable: true }))).toBe(false);
  });
});

describe("QuickScanResponse stays backward compatible", () => {
  it("a response without the new fields still parses", () => {
    const r = QuickScanResponseSchema.safeParse({ identified: false, candidates: [], match: null, decision: null, breakdown: null, decisionUnavailable: "identity_unresolved" });
    expect(r.success).toBe(true);
  });
});
