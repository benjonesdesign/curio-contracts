// MUTATION-CHECKED 2026-10-08 (v0.2.0 listing refusals): see CHANGELOG "Mutation check, round 2".

import { describe, it, expect } from "vitest";
import {
  ListingRefusalSchema, ListingRefusalReasonSchema, ListingRefusalCodeSchema, LISTING_REFUSAL_HTTP_STATUS,
} from "./listing-refusal.js";

describe("the one closed list of reasons a copy cannot be listed (v0.2.0)", () => {
  it("is exactly the nine reasons the plans, the spec, the guards and the slab ruling name", () => {
    // Pinned as a list on purpose: adding a reason is a lockstep release, and this is the test
    // that makes it a decision rather than an edit.
    expect([...ListingRefusalReasonSchema.options]).toEqual([
      "mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live",
    ]);
  });

  it("does NOT include `held`: a held copy may be listed on purpose, so holding is a suggestion rule, not a refusal", () => {
    expect(ListingRefusalReasonSchema.safeParse("held").success).toBe(false);
  });

  it("has slab_unverified, and the flat graded_not_verified is NOT a reason or a code (it converts at the server switch)", () => {
    expect(ListingRefusalReasonSchema.safeParse("slab_unverified").success).toBe(true);
    expect(ListingRefusalReasonSchema.safeParse("graded_not_verified").success).toBe(false);
    expect(ListingRefusalCodeSchema.safeParse("graded_not_verified").success).toBe(false);
    expect(ListingRefusalSchema.safeParse({ error: "Not verified", code: "card_not_listable", reason: "slab_unverified" }).success).toBe(true);
  });

  it("does not include #243's separate flat codes as reasons or as codes", () => {
    for (const flat of ["card_mine", "card_set_aside"]) {
      expect(ListingRefusalReasonSchema.safeParse(flat).success, flat).toBe(false);
      expect(ListingRefusalCodeSchema.safeParse(flat).success, flat).toBe(false);
    }
    // condition_not_confirmed is a REASON of card_not_listable here, not a code of its own
    expect(ListingRefusalCodeSchema.safeParse("condition_not_confirmed").success).toBe(false);
  });

  it("gives every code exactly one HTTP status, and card_not_listable is 409", () => {
    expect(Object.keys(LISTING_REFUSAL_HTTP_STATUS).sort()).toEqual([...ListingRefusalCodeSchema.options].sort());
    expect(LISTING_REFUSAL_HTTP_STATUS).toEqual({
      card_not_listable: 409, game_not_available: 422, sku_required: 422,
      sku_unavailable: 503, card_read_failed: 503, card_not_found: 404,
    });
  });
});

describe("ListingRefusal: { error, code, reason }", () => {
  const notListable = (reason: unknown) => ({ error: "Kept as yours, so not listed", code: "card_not_listable", reason });

  it("accepts card_not_listable with every reason", () => {
    for (const reason of ListingRefusalReasonSchema.options) {
      expect(ListingRefusalSchema.safeParse(notListable(reason)).success, reason).toBe(true);
    }
  });

  it("REJECTS card_not_listable with no reason, null or absent: a refusal must say why", () => {
    expect(ListingRefusalSchema.safeParse(notListable(null)).success).toBe(false);
    expect(ListingRefusalSchema.safeParse({ error: "x", code: "card_not_listable" }).success).toBe(false);
  });

  it("REJECTS a reason on any other code: only card_not_listable carries one", () => {
    for (const code of ListingRefusalCodeSchema.options.filter((c) => c !== "card_not_listable")) {
      const r = ListingRefusalSchema.safeParse({ error: "x", code, reason: "mine" });
      expect(r.success, code).toBe(false);
    }
  });

  it("accepts the other codes with a null reason", () => {
    for (const code of ListingRefusalCodeSchema.options.filter((c) => c !== "card_not_listable")) {
      expect(ListingRefusalSchema.safeParse({ error: "x", code, reason: null }).success, code).toBe(true);
    }
  });

  it("keeps `error` a STRING, the field every other failure body already uses", () => {
    expect(ListingRefusalSchema.safeParse({ error: { message: "x" }, code: "card_not_found", reason: null }).success).toBe(false);
  });

  it("REJECTS an unknown code or reason: the server must never emit one (clients tolerate it)", () => {
    expect(ListingRefusalSchema.safeParse({ error: "x", code: "card_exploded", reason: null }).success).toBe(false);
    expect(ListingRefusalSchema.safeParse(notListable("exploded")).success).toBe(false);
  });

  it("round-trips through JSON", () => {
    const parsed = ListingRefusalSchema.parse(notListable("set_aside"));
    expect(ListingRefusalSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});
