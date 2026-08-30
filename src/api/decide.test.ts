// The `*Rate` / `*Pct` unit convention, enforced rather than documented.
//
// Both units live in the same request bodies, and confusing them is a money bug: a rate sent to a
// `*Pct` field asks for a target ~100x too small, which RAISES max-buy and tells a seller to
// overpay. `minProfitPct` sitting right beside `targetMarginPct` with the opposite unit and the
// same suffix is the actual hazard.

import { describe, it, expect } from "vitest";
import { DecideRequestSchema } from "./decide.js";
import { PricingSettingsSchema } from "./recommend.js";

describe("targetMarginPct is a percentage, not a rate", () => {
  const base = { marketValueGbp: 40 };

  it("accepts a percentage", () => {
    expect(DecideRequestSchema.safeParse({ ...base, targetMarginPct: 25 }).success).toBe(true);
  });

  it("REJECTS a rate — 0.25 meaning 25% asked for 0.25% and raised max-buy", () => {
    // The dangerous direction: a target so small it barely constrains anything, so the seller is
    // told they can pay more. Undetectable from the response, which looks like a normal decision.
    const r = DecideRequestSchema.safeParse({ ...base, targetMarginPct: 0.25 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toContain("percentage");
  });

  it("still allows 0 — 'accept any profit at all' is a real position", () => {
    expect(DecideRequestSchema.safeParse({ ...base, targetMarginPct: 0 }).success).toBe(true);
  });

  it("allows a large target — 500% on a 50p buy is ordinary", () => {
    expect(DecideRequestSchema.safeParse({ ...base, targetMarginPct: 500 }).success).toBe(true);
  });
});

describe("minProfitPct is a RATE, and is bounded so the mix-up fails loudly", () => {
  it("accepts a rate", () => {
    expect(PricingSettingsSchema.safeParse({
      ebayFeeRate: 0.128, ebayFeeFixed: 0.3, packagingCost: 0.1, shippingCost: 0,
      taxRate: 0.2, minProfitPct: 0.25, minSaleValue: 2.5, postageCost: 1.55,
    }).success).toBe(true);
  });

  it("rejects 25 — the natural mistake, given the Pct suffix", () => {
    expect(PricingSettingsSchema.safeParse({
      ebayFeeRate: 0.128, ebayFeeFixed: 0.3, packagingCost: 0.1, shippingCost: 0,
      taxRate: 0.2, minProfitPct: 25, minSaleValue: 2.5, postageCost: 1.55,
    }).success).toBe(false);
  });
});
