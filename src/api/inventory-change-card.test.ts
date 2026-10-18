// MUTATION-CHECKED 2026-10-14: red against "target_not_found" removed from the reason enum ("the refusal reasons are
// exactly the seven" goes red), against the `needsReason !== hasReason` check removed ("a refused result must say why"
// and "a changed result has no reason" go red), against the identity requirement removed ("a changed result carries
// the identity" goes red), and against `write_failed` allowed on a refusal ("write_failed is a failure" goes red);
// green against current.
import { describe, it, expect } from "vitest";
import { ChangeCardRequestSchema, ChangeCardResponseSchema, ChangeCardRefusalReasonSchema } from "./inventory-change-card.js";

const ok = (r: { success: boolean }) => r.success;
const IDENTITY = {
  game: "mtg", nativeId: "scry-1", catalogueCardId: "c1", name: "District Mascot", setName: "Aetherdrift",
  cardNumber: "158", rarity: "rare", language: "English", imageRef: null,
};

describe("change-card contract", () => {
  it("the refusal reasons are exactly the seven", () => {
    expect([...ChangeCardRefusalReasonSchema.options]).toEqual([
      "live_on_ebay", "sold", "archived", "not_found", "target_not_found", "game_not_available", "write_failed",
    ]);
  });

  it("a request names a copy and a chosen card (game + native id), nothing else", () => {
    expect(ok(ChangeCardRequestSchema.safeParse({ physical_card_id: "p1", to: { game: "mtg", nativeId: "x" } }))).toBe(true);
    expect(ok(ChangeCardRequestSchema.safeParse({ physical_card_id: "p1", to: { game: "mtg" } }))).toBe(false);
    expect(ok(ChangeCardRequestSchema.safeParse({ physical_card_id: "", to: { game: "mtg", nativeId: "x" } }))).toBe(false);
  });

  it("a changed result carries the identity and no reason", () => {
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "changed", identity: IDENTITY, status: "NEEDS_ID_REVIEW", idVerifiedBySeller: false }))).toBe(true);
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "changed" }))).toBe(false);
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "changed", identity: IDENTITY, reason: "sold" }))).toBe(false);
  });

  it("a refused result must say why", () => {
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "refused", reason: "live_on_ebay", error: "End the listing first. It's live on eBay." }))).toBe(true);
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "refused" }))).toBe(false);
  });

  it("write_failed is a failure, not a refusal", () => {
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "failed", reason: "write_failed" }))).toBe(true);
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "refused", reason: "write_failed" }))).toBe(false);
    expect(ok(ChangeCardResponseSchema.safeParse({ outcome: "failed", reason: "sold" }))).toBe(false);
  });
});
