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
});
