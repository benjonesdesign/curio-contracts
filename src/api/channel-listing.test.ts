import { describe, it, expect } from "vitest";
import { ChannelListingRequestSchema, ChannelListingResponseSchema } from "./channel-listing.js";

describe("ChannelListingRequestSchema", () => {
  it("accepts a CardTrader listing request", () => {
    const req = ChannelListingRequestSchema.parse({
      channel: "cardtrader", cardRef: "phys-123", priceGbp: 12.5, condition: "NM",
    });
    expect(req.channel).toBe("cardtrader");
  });

  it("rejects a non-positive price", () => {
    expect(() => ChannelListingRequestSchema.parse({
      channel: "cardtrader", cardRef: "phys-123", priceGbp: 0, condition: "NM",
    })).toThrow();
  });

  it("rejects an empty cardRef", () => {
    expect(() => ChannelListingRequestSchema.parse({
      channel: "cardtrader", cardRef: "", priceGbp: 12.5, condition: "NM",
    })).toThrow();
  });

  it("rejects an unsupported channel", () => {
    expect(() => ChannelListingRequestSchema.parse({
      channel: "whatnot", cardRef: "phys-123", priceGbp: 12.5, condition: "NM",
    })).toThrow();
  });
});

describe("ChannelListingResponseSchema", () => {
  it("parses a successful listing (no public URL — CardTrader's API doesn't expose one)", () => {
    const res = ChannelListingResponseSchema.parse({
      channel: "cardtrader", channelListingId: "999", url: null, status: "listed",
    });
    expect(res.status).toBe("listed");
    expect(res.url).toBeNull();
  });

  it("parses a failed listing", () => {
    const res = ChannelListingResponseSchema.parse({
      channel: "cardtrader", channelListingId: null, url: null, status: "failed", error: "no blueprint match",
    });
    expect(res.status).toBe("failed");
    expect(res.error).toBe("no blueprint match");
  });

  // ── v0.2.0: a refusal made before CardTrader was contacted ──────────────────────────────────
  // pokemon-tool #243 attaches the stable code BESIDE the existing envelope; this makes it part of
  // the contract, with the one closed `reason` list shared by every listing surface.
  const FAILED = { channel: "cardtrader", channelListingId: null, url: null, status: "failed" };

  it("parses a Mine refusal: code card_not_listable WITH its reason, in the failed envelope", () => {
    const res = ChannelListingResponseSchema.parse({ ...FAILED, error: "Kept as yours, so not listed", code: "card_not_listable", reason: "mine" });
    expect(res.code).toBe("card_not_listable");
    expect(res.reason).toBe("mine");
  });

  it("parses a refusal that is not about the copy's state (no reason)", () => {
    for (const code of ["card_read_failed", "card_not_found", "sku_unavailable", "game_not_available"]) {
      expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", code }).success, code).toBe(true);
    }
  });

  it("REJECTS card_not_listable without a reason, and a reason on any other code", () => {
    expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", code: "card_not_listable" }).success).toBe(false);
    expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", code: "card_not_listable", reason: null }).success).toBe(false);
    expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", code: "card_read_failed", reason: "mine" }).success).toBe(false);
    expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", reason: "mine" }).success).toBe(false);
  });

  it("REJECTS a code the contract does not define: the old flat codes are gone", () => {
    for (const code of ["card_mine", "card_set_aside", "condition_not_confirmed"]) {
      expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "x", code }).success, code).toBe(false);
    }
  });

  it("REJECTS a refusal code on a LISTED response", () => {
    expect(ChannelListingResponseSchema.safeParse({ channel: "cardtrader", channelListingId: "9", url: null, status: "listed", code: "card_read_failed" }).success).toBe(false);
  });

  it("stays compatible with a pre-v0.2.0 body: no code, no reason", () => {
    expect(ChannelListingResponseSchema.safeParse({ ...FAILED, error: "no blueprint match" }).success).toBe(true);
  });
});
