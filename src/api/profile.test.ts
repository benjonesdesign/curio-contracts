// MUTATION-CHECKED 2026-10-08 (v0.2.0 nullable seller type / fee position): red against dropping
// the value<->timestamp pair rule (four tests); dropping effective-fee<->feeNotSetReason; dropping
// each of the two reason-vs-answers consistency rules (seller_type_not_set while a type is on file,
// vat_not_set for a non-business); widening the buying margin to <=100 or removing its rate-vs-pct
// guard; reverting sellerType to non-null; and letting PATCH accept `sellerType: null`; green
// against current.

import { describe, it, expect } from "vitest";
import { ProfileResponseSchema, ProfilePatchSchema } from "./profile.js";

const AT = "2026-10-08T09:30:00.000Z";

const FULL_PROFILE = {
  sellerType: "private",
  sellerTypeConfirmedAt: AT,
  sellerTypeSource: "manual",
  suggestedSellerType: null,
  vatRegistered: null,
  vatConfirmedAt: null,
  feeNotSetReason: null,
  buyingTargetMarginPct: null,
  buyingTargetMarginSetAt: null,
  dispatchAddress: { line1: "1 Test St", city: "London", postcode: "N1 1AA", country: "GB" },
  agedInventoryDays: 60,
  pricingSettings: {
    ebayFeeRate: null, ebayFeeFixed: null, packagingCost: 0.1, shippingCost: 0,
    taxRate: 0.2, minProfitPct: 0.25, minSaleValue: 2.5, postageCost: 1.55,
  },
  effectivePricingSettings: {
    ebayFeeRate: 0, ebayFeeFixed: 0, packagingCost: 0.1, shippingCost: 0,
    taxRate: 0.2, minProfitPct: 0.25, minSaleValue: 2.5, postageCost: 1.55,
  },
  isAdmin: false,
};

describe("ProfileResponseSchema", () => {
  it("parses a full profile", () => {
    const p = ProfileResponseSchema.parse(FULL_PROFILE);
    expect(p.sellerType).toBe("private");
    expect(p.agedInventoryDays).toBe(60);
  });

  it("allows null stored fee fields — null means 'derive from seller type', not zero", () => {
    const p = ProfileResponseSchema.parse(FULL_PROFILE);
    expect(p.pricingSettings.ebayFeeRate).toBeNull();
    // ...while the effective settings the engines consume are always fully resolved.
    expect(p.effectivePricingSettings.ebayFeeRate).toBe(0);
  });

  it("REJECTS a null effective fee that carries no reason — the engine would be guessing", () => {
    // v0.2.0 (was: "keeps effectivePricingSettings non-nullable"). The effective fee is null ONLY
    // while the fee position is not set, and then it must say why.
    expect(() => ProfileResponseSchema.parse({
      ...FULL_PROFILE,
      effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: null, ebayFeeFixed: null },
    })).toThrow(/feeNotSetReason is required/);
  });

  it("rejects an unknown seller type rather than coercing it to private", () => {
    expect(() => ProfileResponseSchema.parse({ ...FULL_PROFILE, sellerType: "sole-trader" })).toThrow();
  });

  it("requires a dispatch country (the column is NOT NULL) but allows the rest to be null", () => {
    const p = ProfileResponseSchema.parse({
      ...FULL_PROFILE,
      dispatchAddress: { line1: null, city: null, postcode: null, country: "GB" },
    });
    expect(p.dispatchAddress.country).toBe("GB");
    expect(() => ProfileResponseSchema.parse({
      ...FULL_PROFILE,
      dispatchAddress: { line1: null, city: null, postcode: null, country: null },
    })).toThrow();
  });
});

describe("ProfilePatchSchema", () => {
  it("accepts a single-field write — the just-in-time-prompt case (W18 §3)", () => {
    const p = ProfilePatchSchema.parse({ sellerType: "business" });
    expect(p.sellerType).toBe("business");
    expect(p.agedInventoryDays).toBeUndefined();
  });

  it("accepts an empty patch (a no-op write is not an error)", () => {
    expect(() => ProfilePatchSchema.parse({})).not.toThrow();
  });

  it("accepts a partial dispatch address — one line without the rest", () => {
    const p = ProfilePatchSchema.parse({ dispatchAddress: { postcode: "SW1A 1AA" } });
    expect(p.dispatchAddress?.postcode).toBe("SW1A 1AA");
    expect(p.dispatchAddress?.line1).toBeUndefined();
  });

  it("accepts a partial pricingSettings write, and an explicit null to clear a fee override", () => {
    const p = ProfilePatchSchema.parse({ pricingSettings: { ebayFeeRate: null } });
    expect(p.pricingSettings?.ebayFeeRate).toBeNull();
  });

  it("strips isAdmin rather than letting a client set it", () => {
    // z.object is non-strict, so an unknown key is dropped, not an error — the guarantee that
    // matters is that it never reaches the parsed value the route writes from. The DB's own
    // UPDATE policy pins is_admin independently (20260711000003_profiles_is_admin.sql).
    const p = ProfilePatchSchema.parse({ sellerType: "business", isAdmin: true });
    expect(p).not.toHaveProperty("isAdmin");
  });

  it("strips sellerTypeSource — the server derives it, a client never asserts it", () => {
    const p = ProfilePatchSchema.parse({ sellerType: "business", sellerTypeSource: "auto" });
    expect(p).not.toHaveProperty("sellerTypeSource");
  });

  it("rejects a non-integer agedInventoryDays", () => {
    expect(() => ProfilePatchSchema.parse({ agedInventoryDays: 30.5 })).toThrow();
  });
});

// ── v0.2.0: "Not set" is representable, and a confirmation is one fact, not two ─────────────────
describe("Profile: seller type, VAT and fee position can be NOT SET (v0.2.0)", () => {
  const NEVER_ASKED = {
    ...FULL_PROFILE,
    sellerType: null, sellerTypeConfirmedAt: null,
    feeNotSetReason: "seller_type_not_set",
    effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: null, ebayFeeFixed: null },
  };
  const BUSINESS_NO_VAT_ANSWER = {
    ...FULL_PROFILE,
    sellerType: "business", sellerTypeConfirmedAt: AT,
    feeNotSetReason: "vat_not_set",
    effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: null, ebayFeeFixed: null },
  };
  const BUSINESS_VAT = {
    ...FULL_PROFILE,
    sellerType: "business", sellerTypeConfirmedAt: AT, vatRegistered: true, vatConfirmedAt: AT,
    effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: 0.1315, ebayFeeFixed: 0.4 },
  };

  it("accepts a seller who has never been asked: type null, no confirmation, fee unknown with a reason", () => {
    const r = ProfileResponseSchema.safeParse(NEVER_ASKED);
    expect(r.success, JSON.stringify(r.success ? [] : r.error.issues)).toBe(true);
    if (r.success) {
      expect(r.data.sellerType).toBeNull();
      expect(r.data.effectivePricingSettings.ebayFeeRate).toBeNull();
    }
  });

  it("accepts a business seller whose VAT question is open (fee unknown: vat_not_set)", () => {
    expect(ProfileResponseSchema.safeParse(BUSINESS_NO_VAT_ANSWER).success).toBe(true);
  });

  it("accepts an answered business + VAT seller with a real fee and no reason", () => {
    expect(ProfileResponseSchema.safeParse(BUSINESS_VAT).success).toBe(true);
  });

  it("accepts an eBay SUGGESTION without treating it as an answer", () => {
    const r = ProfileResponseSchema.safeParse({ ...NEVER_ASKED, suggestedSellerType: "business", sellerTypeSource: "auto" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.sellerType).toBeNull();
  });

  it("REJECTS a seller type with no confirmation time, and a confirmation time with no seller type", () => {
    // 'Set' means confirmed_at is non-null and nothing else (PLAN-SELLER-TYPE-FIRST-ASK §2). A
    // type without a timestamp is today's bug: a placeholder 'private' read as an answer.
    expect(ProfileResponseSchema.safeParse({ ...FULL_PROFILE, sellerTypeConfirmedAt: null }).success).toBe(false);
    expect(ProfileResponseSchema.safeParse({ ...NEVER_ASKED, sellerTypeConfirmedAt: AT }).success).toBe(false);
  });

  it("REJECTS VAT answered without a timestamp, and a timestamp without an answer", () => {
    expect(ProfileResponseSchema.safeParse({ ...BUSINESS_VAT, vatConfirmedAt: null }).success).toBe(false);
    expect(ProfileResponseSchema.safeParse({ ...FULL_PROFILE, vatConfirmedAt: AT }).success).toBe(false);
  });

  it("REJECTS a null effective fee with no reason, and a reason beside a real fee", () => {
    expect(ProfileResponseSchema.safeParse({ ...NEVER_ASKED, feeNotSetReason: null }).success).toBe(false);
    expect(ProfileResponseSchema.safeParse({ ...BUSINESS_VAT, feeNotSetReason: "vat_not_set" }).success).toBe(false);
  });

  it("REJECTS a reason that contradicts the answers it is derived from", () => {
    // seller_type_not_set while a type is on file
    expect(ProfileResponseSchema.safeParse({ ...NEVER_ASKED, sellerType: "private", sellerTypeConfirmedAt: AT }).success).toBe(false);
    // vat_not_set for a private seller (VAT is only asked of a business)
    expect(ProfileResponseSchema.safeParse({ ...NEVER_ASKED, sellerType: "private", sellerTypeConfirmedAt: AT, feeNotSetReason: "vat_not_set" }).success).toBe(false);
  });

  it("accepts a seller-set fee override with the type unset: a stated cost, so no reason", () => {
    const r = ProfileResponseSchema.safeParse({
      ...FULL_PROFILE,
      sellerType: null, sellerTypeConfirmedAt: null,
      effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: 0.09, ebayFeeFixed: 0.3 },
    });
    expect(r.success).toBe(true);
  });

  it("round-trips a never-asked profile through JSON", () => {
    const parsed = ProfileResponseSchema.parse(NEVER_ASKED);
    expect(ProfileResponseSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});

describe("Profile: the buying margin and tax are 'Not set' until chosen (v0.2.0, PLAN-MOST-TO-PAY #224 §5)", () => {
  const MARGIN_SET = { ...FULL_PROFILE, buyingTargetMarginPct: 35, buyingTargetMarginSetAt: AT };

  it("accepts a margin set with its timestamp, and null/null for 'Not set'", () => {
    expect(ProfileResponseSchema.safeParse(MARGIN_SET).success).toBe(true);
    expect(ProfileResponseSchema.safeParse(FULL_PROFILE).success).toBe(true);
  });

  it("REJECTS a margin with no timestamp, and a timestamp with no margin", () => {
    expect(ProfileResponseSchema.safeParse({ ...MARGIN_SET, buyingTargetMarginSetAt: null }).success).toBe(false);
    expect(ProfileResponseSchema.safeParse({ ...FULL_PROFILE, buyingTargetMarginSetAt: AT }).success).toBe(false);
  });

  it("treats 0% as a real choice but 100% as impossible (a share of the SALE price)", () => {
    expect(ProfileResponseSchema.safeParse({ ...MARGIN_SET, buyingTargetMarginPct: 0 }).success).toBe(true);
    expect(ProfileResponseSchema.safeParse({ ...MARGIN_SET, buyingTargetMarginPct: 100 }).success).toBe(false);
  });

  it("REJECTS a rate sent as a percentage: 0.35 would be read as 0.35%", () => {
    expect(ProfileResponseSchema.safeParse({ ...MARGIN_SET, buyingTargetMarginPct: 0.35 }).success).toBe(false);
  });

  it("has ONE tax rate: the separate buying rate is gone from the profile and from PATCH (Ben, 2026-10-09)", () => {
    const parsed = ProfileResponseSchema.parse({ ...FULL_PROFILE, buyingTaxRate: 0.2, buyingTaxRateSetAt: AT }) as Record<string, unknown>;
    expect("buyingTaxRate" in parsed).toBe(false);
    expect("buyingTaxRateSetAt" in parsed).toBe(false);
    const patched = ProfilePatchSchema.parse({ buyingTaxRate: 0.2 } as never) as Record<string, unknown>;
    expect("buyingTaxRate" in patched).toBe(false);
  });

  it("bounds the one rate to 0 <= t < 1 (the formula divides by 1 - t), and keeps 0 'none' apart from null 'not set'", () => {
    const rate = (taxRate: number | null) => ({
      ...FULL_PROFILE,
      pricingSettings: { ...FULL_PROFILE.pricingSettings, taxRate },
      effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, taxRate },
    });
    expect(ProfileResponseSchema.safeParse(rate(0)).success).toBe(true);
    expect(ProfileResponseSchema.safeParse(rate(0.2)).success).toBe(true);
    expect(ProfileResponseSchema.safeParse(rate(1)).success).toBe(false);
    expect(ProfileResponseSchema.safeParse(rate(-0.1)).success).toBe(false);
    expect(ProfilePatchSchema.safeParse({ pricingSettings: { taxRate: 1 } }).success).toBe(false);
  });

  it("PATCH accepts the new fields singly, and still cannot un-set the seller type", () => {
    expect(ProfilePatchSchema.parse({ vatRegistered: false }).vatRegistered).toBe(false);
    expect(ProfilePatchSchema.parse({ buyingTargetMarginPct: 35 }).buyingTargetMarginPct).toBe(35);
    expect(() => ProfilePatchSchema.parse({ sellerType: null })).toThrow();
    expect(() => ProfilePatchSchema.parse({ buyingTargetMarginPct: 0.35 })).toThrow();
    expect(() => ProfilePatchSchema.parse({ buyingTargetMarginPct: 100 })).toThrow();
  });

  it("PATCH strips the server-derived timestamps and reason — a client never asserts them", () => {
    const p = ProfilePatchSchema.parse({ vatRegistered: true, vatConfirmedAt: AT, feeNotSetReason: "vat_not_set" });
    expect(p).not.toHaveProperty("vatConfirmedAt");
    expect(p).not.toHaveProperty("feeNotSetReason");
  });
});

// ── v0.2.0: tax applies only when the seller sets a rate, buying AND selling ──────────────────────
// MUTATION-CHECKED 2026-10-08 (tax nullable): see CHANGELOG "Mutation check, round 2".
describe("a null tax rate is 'not set', so no tax is set aside (owner, 2026-10-08)", () => {
  const noTax = {
    ...FULL_PROFILE,
    pricingSettings: { ...FULL_PROFILE.pricingSettings, taxRate: null },
    effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, taxRate: null },
  };

  it("parses a profile whose stored and effective tax rate are null", () => {
    const p = ProfileResponseSchema.parse(noTax);
    expect(p.pricingSettings.taxRate).toBeNull();
    expect(p.effectivePricingSettings.taxRate).toBeNull();
  });

  it("keeps 0 and null apart: 0 is a chosen 'no provision', null is never set", () => {
    const zero = ProfileResponseSchema.parse({ ...noTax, pricingSettings: { ...noTax.pricingSettings, taxRate: 0 }, effectivePricingSettings: { ...noTax.effectivePricingSettings, taxRate: 0 } });
    expect(zero.pricingSettings.taxRate).toBe(0);
    expect(zero.pricingSettings.taxRate).not.toBeNull();
  });

  it("still accepts the number the server sends until the migration runs (0.2)", () => {
    expect(ProfileResponseSchema.parse(FULL_PROFILE).pricingSettings.taxRate).toBe(0.2);
  });

  it("lets PATCH clear a chosen rate back to 'not set' with an explicit null", () => {
    expect(ProfilePatchSchema.parse({ pricingSettings: { taxRate: null } }).pricingSettings?.taxRate).toBeNull();
    expect(ProfilePatchSchema.parse({ pricingSettings: { taxRate: 0.2 } }).pricingSettings?.taxRate).toBe(0.2);
    expect(ProfilePatchSchema.parse({ pricingSettings: {} }).pricingSettings?.taxRate).toBeUndefined();
  });

  it("round-trips a null tax rate through JSON without becoming 0", () => {
    const parsed = ProfileResponseSchema.parse(noTax);
    expect(ProfileResponseSchema.parse(JSON.parse(JSON.stringify(parsed))).pricingSettings.taxRate).toBeNull();
  });
});
