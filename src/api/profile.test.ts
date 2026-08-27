import { describe, it, expect } from "vitest";
import { ProfileResponseSchema, ProfilePatchSchema } from "./profile.js";

const FULL_PROFILE = {
  sellerType: "private",
  sellerTypeSource: "manual",
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

  it("keeps effectivePricingSettings non-nullable — it is what the engine actually uses", () => {
    expect(() => ProfileResponseSchema.parse({
      ...FULL_PROFILE,
      effectivePricingSettings: { ...FULL_PROFILE.effectivePricingSettings, ebayFeeRate: null },
    })).toThrow();
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
