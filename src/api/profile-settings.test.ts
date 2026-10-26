// MUTATION-CHECKED 2026-10-19: red against `}).strict();` removed from ProfileSettingsPatchSchema in src/api/profile-settings.ts (the unknown-key test), red against `handlingDays: z.number().int().min(1).max(3).nullable().optional(),` changed to `.max(4)` (the handling-time test), red against `.max(1_000_000)` removed from neverBidAboveGbp (the never-bid ceiling test), red against `.refine((n) => n === 0 || n >= 1)` removed from incomeTaxRatePct (the percent-not-fraction test), red against `z.object({ profile: ProfileSettingsViewSchema })` changed to `ProfileSettingsViewSchema` (the wrapped-response test), red against `code: z.literal("invalid_request")` changed to `z.string()` (the refused-PATCH test), red against `sellerType: SellerTypeSchema.optional(),` changed to `.nullable().optional()` in the patch (the null-clears test), green against current.
import { describe, it, expect } from "vitest";
import {
  ProfileSettingsPatchSchema, ProfileSettingsResponseSchema, ProfileSettingsInvalidSchema, StoredPostageRulesSchema,
} from "./profile-settings.js";

const RULES = {
  v: 1 as const, freePostageAboveGbp: null,
  services: [{ key: "rm48_ll", enabled: true, usedAboveGbp: null, isDefault: true, costOverrideGbp: null }],
};
const VIEW = {
  sellerType: "business", sellerTypeConfirmedAt: "2026-10-18T10:00:00Z", vatRegistered: false, vatConfirmedAt: "2026-10-18T10:01:00Z",
  buyingTargetMarginPct: 35, buyingTargetMarginSetAt: "2026-10-18T10:02:00Z", incomeTaxRatePct: 20, hourlyRateGbp: null,
  handlingDays: 2, neverBidAboveGbp: 250, packingMaterialsGbp: 0.4, packingMinutesPerParcel: 5, postageRules: RULES,
  notSet: { sellerType: false, vatPosition: false, buyingTargetMargin: false, incomeTaxRate: false, hourlyRate: true, packingMaterials: false, packingMinutes: false, handlingDays: false, neverBidAbove: false },
  feeNotSetReason: null, mostToPayReady: true,
};
const ok = (v: unknown) => ProfileSettingsPatchSchema.safeParse(v).success;

describe("PATCH /api/profile (settings): the request", () => {
  it("accepts any single setting, and the full set", () => {
    for (const one of [{ sellerType: "private" }, { vatRegistered: true }, { incomeTaxRatePct: 20 }, { buyingTargetMarginPct: 35 }, { hourlyRateGbp: 12.5 },
      { packingMaterialsGbp: 0.4 }, { packingMinutesPerParcel: 5 }, { postageRules: RULES }, { handlingDays: 2 }, { neverBidAboveGbp: 250 }]) {
      expect(ok(one), JSON.stringify(one)).toBe(true);
    }
    expect(ok({ sellerType: "business", vatRegistered: false, incomeTaxRatePct: 20, buyingTargetMarginPct: 35, hourlyRateGbp: 12.5, packingMaterialsGbp: 0.4,
      packingMinutesPerParcel: 5, postageRules: RULES, handlingDays: 3, neverBidAboveGbp: 1_000_000 })).toBe(true);
  });

  it("null clears a setting (every one except the seller type and the VAT answer)", () => {
    for (const k of ["incomeTaxRatePct", "buyingTargetMarginPct", "hourlyRateGbp", "packingMaterialsGbp", "packingMinutesPerParcel", "postageRules", "handlingDays", "neverBidAboveGbp"]) {
      expect(ok({ [k]: null }), k).toBe(true);
    }
    expect(ok({ sellerType: null })).toBe(false);
    expect(ok({ vatRegistered: null })).toBe(false);
  });

  it("refuses an unknown key (strict): a setting you cannot change here is a 400, not silently dropped", () => {
    expect(ok({ handlingDays: 2, isAdmin: true })).toBe(false);
    expect(ok({ sellerTypeConfirmedAt: "2026-10-18T10:00:00Z" })).toBe(false);
  });

  it("handling time is whole working days 1 to 3", () => {
    for (const n of [1, 2, 3]) expect(ok({ handlingDays: n })).toBe(true);
    for (const n of [0, 4, 1.5, -1]) expect(ok({ handlingDays: n }), String(n)).toBe(false);
  });

  it("never-bid ceiling is 0 to 1,000,000 pounds", () => {
    expect(ok({ neverBidAboveGbp: 0 })).toBe(true);
    expect(ok({ neverBidAboveGbp: 1_000_000 })).toBe(true);
    for (const n of [1_000_001, -1, Number.NaN, Infinity]) expect(ok({ neverBidAboveGbp: n }), String(n)).toBe(false);
  });

  it("an income tax rate is a plain percent: 0 or 1 to 60, so 0.2 (a fraction sent by mistake) is refused", () => {
    for (const n of [0, 1, 20, 60]) expect(ok({ incomeTaxRatePct: n }), String(n)).toBe(true);
    for (const n of [0.2, 0.99, 61, -1]) expect(ok({ incomeTaxRatePct: n }), String(n)).toBe(false);
  });

  it("buying margin 0 to 95, hourly rate to 1,000, packing materials to 100, packing minutes whole 1 to 60", () => {
    expect(ok({ buyingTargetMarginPct: 95 })).toBe(true);
    expect(ok({ buyingTargetMarginPct: 96 })).toBe(false);
    expect(ok({ hourlyRateGbp: 1001 })).toBe(false);
    expect(ok({ packingMaterialsGbp: 101 })).toBe(false);
    for (const n of [0, 61, 2.5]) expect(ok({ packingMinutesPerParcel: n }), String(n)).toBe(false);
  });

  it("postage rules need version 1 and at least one service", () => {
    expect(StoredPostageRulesSchema.safeParse({ ...RULES, v: 2 }).success).toBe(false);
    expect(StoredPostageRulesSchema.safeParse({ ...RULES, services: [] }).success).toBe(false);
    expect(StoredPostageRulesSchema.safeParse({ ...RULES, freePostageAboveGbp: -1 }).success).toBe(false);
  });
});

describe("GET/PATCH /api/profile (settings): the response", () => {
  it("parses a view with unset settings as null, and says why in notSet", () => {
    expect(ProfileSettingsResponseSchema.safeParse({ profile: VIEW }).success).toBe(true);
    const blank = { ...VIEW, sellerType: null, sellerTypeConfirmedAt: null, vatRegistered: null, vatConfirmedAt: null, buyingTargetMarginPct: null,
      buyingTargetMarginSetAt: null, incomeTaxRatePct: null, handlingDays: null, neverBidAboveGbp: null, postageRules: null, feeNotSetReason: "seller_type_not_set", mostToPayReady: false };
    expect(ProfileSettingsResponseSchema.safeParse({ profile: blank }).success).toBe(true);
  });

  it("the profile is wrapped: a bare view is not a response", () => {
    expect(ProfileSettingsResponseSchema.safeParse(VIEW).success).toBe(false);
  });

  it("the fee reason is one of the two the server uses, or null", () => {
    expect(ProfileSettingsResponseSchema.safeParse({ profile: { ...VIEW, feeNotSetReason: "vat_not_set" } }).success).toBe(true);
    expect(ProfileSettingsResponseSchema.safeParse({ profile: { ...VIEW, feeNotSetReason: "whatever" } }).success).toBe(false);
  });

  it("handling days in a view is a whole number", () => {
    expect(ProfileSettingsResponseSchema.safeParse({ profile: { ...VIEW, handlingDays: 1.5 } }).success).toBe(false);
  });
});

describe("a refused PATCH", () => {
  it("is invalid_request with one sentence per field", () => {
    const body = { error: "Some of those settings aren't valid.", code: "invalid_request", requestId: "req_1", fields: { handlingDays: "Choose 1 to 3 working days." } };
    expect(ProfileSettingsInvalidSchema.safeParse(body).success).toBe(true);
    expect(ProfileSettingsInvalidSchema.safeParse({ ...body, code: "other" }).success).toBe(false);
    expect(ProfileSettingsInvalidSchema.safeParse({ ...body, fields: { handlingDays: 3 } }).success).toBe(false);
  });
});
