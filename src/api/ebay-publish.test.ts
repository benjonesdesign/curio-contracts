// MUTATION-CHECKED 2026-09-03 (v0.1.46 arms): red against `missingRequired: z.array(z.string())`
// made `.optional()` (the arm stops requiring the one field it exists to carry), and red against
// the four token arms collapsed into a single `token_error` literal; green against current.
//
// MUTATION-CHECKED 2026-09-02: red against `code: z.string()` in place of the `z.literal(...)` on
// the title_too_long arm (which makes the union non-discriminating), and red against dropping
// `.positive()` from `priceGbp`; green against current.

import { describe, it, expect } from "vitest";
import {
  EbayPublishRequestSchema,
  EbayPublishErrorSchema,
  EbayPublishErrorResponseSchema,
} from "./ebay-publish.js";

describe("EbayPublishRequest", () => {
  const base = {
    sku: "CARD-1", title: "Charizard Base Set 4/102", description: "d", condition: "NM",
    priceGbp: 250, photoUrls: [], aspectValues: {},
  };

  it("applies the documented defaults so a minimal caller is still complete", () => {
    const r = EbayPublishRequestSchema.parse(base);
    expect(r.format).toBe("FIXED_PRICE");
    expect(r.auctionDays).toBe(7);
    expect(r.game).toBe("pokemon");
  });

  it("rejects a non-positive price — this route puts a real price on a real marketplace", () => {
    expect(EbayPublishRequestSchema.safeParse({ ...base, priceGbp: 0 }).success).toBe(false);
    expect(EbayPublishRequestSchema.safeParse({ ...base, priceGbp: -1 }).success).toBe(false);
  });

  it("rejects a title over eBay's 80-character limit at the contract boundary", () => {
    // The route already rejects this, deliberately, rather than truncating — a truncated title
    // can lose the condition token off the tail and misdescribe the card.
    expect(EbayPublishRequestSchema.safeParse({ ...base, title: "x".repeat(81) }).success).toBe(false);
  });

  it("accepts an aspect value that is a string OR an array of strings", () => {
    // eBay's own shape. A contract that allowed only one of the two would reject valid requests.
    const r = EbayPublishRequestSchema.safeParse({
      ...base, aspectValues: { Character: "Charizard", Features: ["Holo", "1st Edition"] },
    });
    expect(r.success).toBe(true);
  });
});

describe("EbayPublishError", () => {
  it("discriminates: each arm requires its own fields, not a union of optionals", () => {
    // The property that makes this worth a discriminated union at all. `title_too_long` without
    // its lengths must FAIL — under `{ code, error, titleLength?: number }` it would pass, and
    // every client would render "Title too long" with no numbers in it.
    expect(EbayPublishErrorSchema.safeParse({ code: "title_too_long", message: "m" }).success).toBe(false);
    expect(
      EbayPublishErrorSchema.safeParse({ code: "title_too_long", message: "m", titleLength: 84, maxLength: 80 }).success
    ).toBe(true);
  });

  it("does not let one arm's fields satisfy another arm", () => {
    expect(
      EbayPublishErrorSchema.safeParse({ code: "unmappable_condition", message: "m", titleLength: 84 }).success
    ).toBe(false);
  });

  it("carries eBay's own code on the ebay_error arm, because that set is open", () => {
    const r = EbayPublishErrorSchema.safeParse({
      code: "ebay_error", message: "m", ebayCode: "25002", httpStatus: 400,
    });
    expect(r.success).toBe(true);
  });

  it("keeps `error` a STRING so existing clients keep rendering a message, not an object", () => {
    // Three web screens render data.error straight into a toast. If this ever becomes an object,
    // they show "[object Object]" to a seller mid-publish.
    const r = EbayPublishErrorResponseSchema.safeParse({
      error: "Title is 84 characters", code: "title_too_long",
      failure: { code: "title_too_long", message: "Title is 84 characters", titleLength: 84, maxLength: 80 },
    });
    expect(r.success).toBe(true);
    if (r.success) expect(typeof r.data.error).toBe("string");
  });

  it("requires the structured failure — the string alone is no longer a complete response", () => {
    expect(EbayPublishErrorResponseSchema.safeParse({ error: "boom" }).success).toBe(false);
  });

  it("covers every code the route can actually return", () => {
    // v0.1.45 declared EIGHT arms; the route returns EIGHTEEN codes. The missing ten decoded to
    // the forward-compatible fallback — safe, and wrong: a client could only render "unknown
    // error" for ten real, actionable failures. This list is the route's own set, and it is the
    // assertion that stops the union drifting back behind it.
    const ROUTE_CODES = [
      "unauthenticated", "invalid_request", "title_too_long", "graded_not_verified",
      "scope_error", "no_policies", "unmappable_condition", "internal_error",
      "no_photos", "missing_required_aspects", "no_dispatch_address", "location_create_failed",
      "rate_limited", "publish_failed", "not_connected", "expired", "refresh_failed",
      "not_configured",
    ];
    const declared = new Set(EbayPublishErrorSchema.options.map((o) => o.shape.code.value as string));
    const missing = ROUTE_CODES.filter((c) => !declared.has(c));
    expect(missing, `these codes decode to the unknown arm: ${missing.join(", ")}`).toEqual([]);
  });

  it("requires missingRequired on the arm that exists to carry it", () => {
    // The sharpest of the ten. The route computes fields.missingRequired and flattens it into an
    // English sentence; without the array a client can only re-parse prose to learn which fields
    // to ask for, which is the case a discriminated union exists for.
    expect(EbayPublishErrorSchema.safeParse({ code: "missing_required_aspects", message: "m" }).success).toBe(false);
    expect(EbayPublishErrorSchema.safeParse({
      code: "missing_required_aspects", message: "m", missingRequired: ["Card Condition", "Set"],
    }).success).toBe(true);
  });

  it("keeps the four eBay token states apart", () => {
    // All four are 503 and all four have a DIFFERENT remedy — reconnect, wait, contact us, and
    // (not_configured) nothing the seller can do, because it is OUR credentials that are absent.
    // A client must not tell a seller to reconnect their account for that one.
    for (const code of ["not_connected", "expired", "refresh_failed", "not_configured"]) {
      const r = EbayPublishErrorSchema.safeParse({ code, message: "m" });
      expect(r.success, code).toBe(true);
      if (r.success) expect(r.data.code).toBe(code);
    }
  });

  it("marks rate_limited as partially successful, because a bulk publish already listed cards", () => {
    // A client that retries the whole batch on this double-lists everything published before the
    // limit. The flag is the difference between a safe retry and duplicate live listings.
    expect(EbayPublishErrorSchema.safeParse({ code: "rate_limited", message: "m" }).success).toBe(false);
    expect(EbayPublishErrorSchema.safeParse({
      code: "rate_limited", message: "m", partialSuccess: true,
    }).success).toBe(true);
  });

  it("refuses an unknown arm — the SERVER must never emit one", () => {
    // The asymmetry from decisions/0027: strict server, lenient clients. The generated Swift and
    // Kotlin decoders tolerate this exact payload; the reference implementation must not.
    expect(
      EbayPublishErrorResponseSchema.safeParse({
        error: "m", failure: { code: "invented_later", message: "m" },
      }).success
    ).toBe(false);
  });
});
