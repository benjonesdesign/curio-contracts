// MUTATION-CHECKED 2026-10-08 (v0.2.0): red against dropping the feeRate<->feeNotSetReason
// coupling (both "null without a reason" and "known fee with a reason" go red) and against
// dropping the feeRate<->feeFixed coupling (the half-a-fee test); green against current.

import { describe, it, expect } from "vitest";
import { CardValueEconomicsSchema, CardValueResponseSchema } from "./card-value.js";

const KNOWN = {
  feeRate: 0.1315, feeFixed: 0.4, feeNotSetReason: null, postage: 1.55, packaging: 0.1, taxRate: 0.2,
  sellerType: "business", vatRegistered: true, feeBasis: "derived_from_seller_type",
};
const UNSET = {
  ...KNOWN, feeRate: null, feeFixed: null, feeNotSetReason: "seller_type_not_set",
  sellerType: null, vatRegistered: null, feeBasis: "not_set",
};

describe("CardValueEconomics.feeRate / feeFixed are number | null with a reason (v0.2.0)", () => {
  it("accepts a known fee with a null reason", () => {
    expect(CardValueEconomicsSchema.safeParse(KNOWN).success).toBe(true);
  });

  it("accepts a null fee WITH a reason, for both reasons", () => {
    expect(CardValueEconomicsSchema.safeParse(UNSET).success).toBe(true);
    // Business seller, VAT unanswered: the type IS known, the VAT position is not.
    expect(CardValueEconomicsSchema.safeParse({
      ...UNSET, feeNotSetReason: "vat_not_set", sellerType: "business",
    }).success).toBe(true);
  });

  it("REJECTS a null fee without a reason", () => {
    const r = CardValueEconomicsSchema.safeParse({ ...UNSET, feeNotSetReason: null });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues.some((i) => /must say why/.test(i.message))).toBe(true);
  });

  it("REJECTS a known fee that carries a reason", () => {
    expect(CardValueEconomicsSchema.safeParse({ ...KNOWN, feeNotSetReason: "seller_type_not_set" }).success).toBe(false);
  });

  it("REJECTS half a fee: the rate and the fixed part are one fee", () => {
    expect(CardValueEconomicsSchema.safeParse({ ...KNOWN, feeFixed: null }).success).toBe(false);
    expect(CardValueEconomicsSchema.safeParse({ ...UNSET, feeFixed: 0.4 }).success).toBe(false);
  });

  it("keeps a 0 rate a NUMBER: a private seller's fee is 0, which is not 'not set'", () => {
    const r = CardValueEconomicsSchema.safeParse({
      ...KNOWN, feeRate: 0, feeFixed: 0, sellerType: "private", vatRegistered: false,
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.feeRate).toBe(0);
  });

  it("round-trips nulls through JSON, nested under the response", () => {
    const body = {
      game: "pokemon", gameDisplayName: "Pokémon", suggestedPrice: 40, ebay: null, confidence: "high",
      priceWarning: null, priceSource: "cardtrader", currencyNote: null, possibleFinishes: null,
      finishUsed: null, tcgId: null, editionAmbiguity: null, pricingDegraded: false, economics: UNSET,
    };
    const parsed = CardValueResponseSchema.parse(body);
    const again = CardValueResponseSchema.parse(JSON.parse(JSON.stringify(parsed)));
    expect(again.economics?.feeRate).toBeNull();
    expect(again.economics?.feeNotSetReason).toBe("seller_type_not_set");
    expect(again).toEqual(parsed);
  });
});
