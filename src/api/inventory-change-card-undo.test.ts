// MUTATION-CHECKED 2026-11-13: red against `needsReason !== hasReason` removed ("a refused undo must say why" and
// "an undone result has no reason" go red), against the undone-needs-identity check removed ("an undone result carries
// the identity" goes red), against `write_failed` allowed on a refusal ("write_failed is a failure" goes red), against
// the history `available && eventId == null` check removed ("an available undo names its event" goes red), and against
// "changed_since" removed from the reason enum ("the undo reasons are exactly the seven" goes red); green against current.
import { describe, it, expect } from "vitest";
import {
  ChangeCardHistoryResponseSchema,
  ChangeCardUndoRefusalReasonSchema,
  UndoChangeCardRequestSchema,
  UndoChangeCardResponseSchema,
} from "./inventory-change-card-undo.js";
import { ChangeCardResponseSchema } from "./inventory-change-card.js";

const ok = (r: { success: boolean }) => r.success;
const SNAP = {
  game: "pokemon", nativeId: "sv1-1", catalogueCardId: "c0", name: "Bulbasaur", setName: "Scarlet & Violet",
  cardNumber: "1", rarity: "common", language: "English",
};
const IDENTITY = {
  game: "mtg", nativeId: "scry-1", catalogueCardId: "c1", name: "District Mascot", setName: "Aetherdrift",
  cardNumber: "158", rarity: "rare", language: "English", imageRef: null,
};
const EVENT = {
  eventId: "e1", changedAt: "2026-11-13T10:00:00.000Z", previous: SNAP, previousStatus: "RECEIVED",
  previousIdVerifiedBySeller: true, next: IDENTITY, undone: false, restores: ["identity", "status"], notRestored: ["market_price"],
};

describe("change-card undo contract", () => {
  it("the undo reasons are exactly the seven", () => {
    expect([...ChangeCardUndoRefusalReasonSchema.options]).toEqual([
      "no_change_to_undo", "changed_since", "live_on_ebay", "sold", "archived", "not_found", "write_failed",
    ]);
  });

  it("an undo request names the copy and the change", () => {
    expect(ok(UndoChangeCardRequestSchema.safeParse({ physical_card_id: "p1", event_id: "e1" }))).toBe(true);
    expect(ok(UndoChangeCardRequestSchema.safeParse({ physical_card_id: "p1" }))).toBe(false);
    expect(ok(UndoChangeCardRequestSchema.safeParse({ physical_card_id: "p1", event_id: "" }))).toBe(false);
  });

  it("an undone result carries the identity", () => {
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "undone", identity: SNAP, status: "RECEIVED", restored: ["identity"] }))).toBe(true);
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "undone" }))).toBe(false);
  });

  it("an undone result has no reason", () => {
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "undone", identity: SNAP, reason: "sold" }))).toBe(false);
  });

  it("a refused undo must say why", () => {
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "refused", reason: "changed_since" }))).toBe(true);
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "refused" }))).toBe(false);
  });

  it("write_failed is a failure, not a refusal", () => {
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "failed", reason: "write_failed" }))).toBe(true);
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "failed", reason: "sold" }))).toBe(false);
    expect(ok(UndoChangeCardResponseSchema.safeParse({ outcome: "refused", reason: "write_failed" }))).toBe(false);
  });

  it("an available undo names its event; an unavailable one names a reason and no event", () => {
    const base = { physicalCardId: "p1", events: [EVENT] };
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: true, eventId: "e1", reason: null } }))).toBe(true);
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: true, eventId: null, reason: null } }))).toBe(false);
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: false, eventId: null, reason: "sold" } }))).toBe(true);
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: false, eventId: null, reason: null } }))).toBe(false);
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: false, eventId: "e1", reason: "sold" } }))).toBe(false);
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({ ...base, undo: { available: false, eventId: null, reason: "write_failed" } }))).toBe(false);
  });

  it("a never-changed copy has an empty history", () => {
    expect(ok(ChangeCardHistoryResponseSchema.safeParse({
      physicalCardId: "p1", events: [], undo: { available: false, eventId: null, reason: "no_change_to_undo" },
    }))).toBe(true);
  });

  it("the change response gains an optional undoAvailable (older servers still parse)", () => {
    const changed = { outcome: "changed", identity: IDENTITY, status: "NEEDS_ID_REVIEW", idVerifiedBySeller: false };
    expect(ok(ChangeCardResponseSchema.safeParse(changed))).toBe(true);
    expect(ok(ChangeCardResponseSchema.safeParse({ ...changed, undoAvailable: false }))).toBe(true);
  });
});
