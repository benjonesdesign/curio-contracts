import { describe, it, expect } from "vitest";
import { SignedPhotoUrlRequestSchema, SignedPhotoUrlResponseSchema } from "./signed-photo-url.js";

describe("SignedPhotoUrlRequestSchema", () => {
  it("accepts a batch of urls with no ttl", () => {
    const req = SignedPhotoUrlRequestSchema.parse({
      urls: ["https://x.supabase.co/storage/v1/object/public/card-photos/a.jpg"],
    });
    expect(req.urls).toHaveLength(1);
    expect(req.ttlSeconds).toBeUndefined();
  });

  it("accepts an explicit ttl within the 7-day Storage max", () => {
    const req = SignedPhotoUrlRequestSchema.parse({
      urls: ["https://x.supabase.co/storage/v1/object/public/card-photos/a.jpg"],
      ttlSeconds: 172800,
    });
    expect(req.ttlSeconds).toBe(172800);
  });

  it("rejects an empty urls array", () => {
    expect(() => SignedPhotoUrlRequestSchema.parse({ urls: [] })).toThrow();
  });

  it("rejects more than 100 urls in one batch", () => {
    const urls = Array.from({ length: 101 }, (_, i) => `https://x.supabase.co/card-photos/${i}.jpg`);
    expect(() => SignedPhotoUrlRequestSchema.parse({ urls })).toThrow();
  });

  it("rejects a ttl beyond Storage's 7-day signed-URL maximum", () => {
    expect(() => SignedPhotoUrlRequestSchema.parse({
      urls: ["https://x.supabase.co/card-photos/a.jpg"], ttlSeconds: 604801,
    })).toThrow();
  });
});

describe("SignedPhotoUrlResponseSchema", () => {
  it("parses a mix of successful and failed results in one batch", () => {
    const res = SignedPhotoUrlResponseSchema.parse({
      results: [
        { url: "https://x.supabase.co/card-photos/a.jpg", signedUrl: "https://x.supabase.co/signed/a.jpg?token=1", error: null },
        { url: "https://x.supabase.co/card-photos/b.jpg", signedUrl: null, error: "not found or not owned by caller" },
      ],
    });
    expect(res.results).toHaveLength(2);
    expect(res.results[0].signedUrl).not.toBeNull();
    expect(res.results[1].signedUrl).toBeNull();
    expect(res.results[1].error).toMatch(/not owned/);
  });
});
