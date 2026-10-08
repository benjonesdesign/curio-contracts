// MUTATION-CHECKED 2026-10-08 (v0.2.0 nullable most-to-pay / fee position): each guard in
// DecisionSchema / DecisionEconomicsSchema was disabled in turn and the named test went red; green
// against current. Red against: dropping "a null maxBuyGbp needs a reason"; dropping "a number has
// no reason"; dropping offerPctAtMax<->maxBuyGbp; dropping minAcceptGbp<->feeGbp (both
// directions); dropping "no maxBuy without a fee"; dropping reason-equals-economics-reason;
// adding game_not_available to the reason enum; making the reason key `.optional()`; dropping
// feeGbp<->feeNotSetReason; dropping "net and tax follow the fee"; and reverting feeGbp or
// maxBuyGbp to a plain z.number() (the pre-v0.2.0 shape).
//
// The `*Rate` / `*Pct` unit convention, enforced rather than documented.
//
// Both units live in the same request bodies, and confusing them is a money bug: a rate sent to a
// `*Pct` field asks for a target ~100x too small, which RAISES max-buy and tells a seller to
// overpay. `minProfitPct` sitting right beside `targetMarginPct` with the opposite unit and the
// same suffix is the actual hazard.

import { describe, it, expect } from "vitest";
import {
  DecideRequestSchema, DecideBatchResponseSchema, DecisionSchema, DecisionEconomicsSchema,
  MaxBuyUnavailableReasonSchema, QuickScanResponseSchema,
} from "./decide.js";
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

// ── v0.2.0: a null most-to-pay and a null fee ALWAYS say why; a number never does ───────────────
//
// The failure these guard is the conflated null (decisions/0024): `maxBuyGbp: null` with no reason
// is a client unable to tell "set your margin" from "we have no price" from "do not buy", and a
// `maxBuyGbp: 25` that ALSO carries a reason is a client unable to tell which to believe.

const KNOWN_ECONOMICS = {
  marketValueGbp: 136, feeGbp: 18.28, feeNotSetReason: null, postageGbp: 3.29, packagingGbp: 0.34,
  costBasisGbp: null, taxProvisionGbp: 0, expectedNetGbp: 114.09,
};
const UNSET_ECONOMICS = {
  ...KNOWN_ECONOMICS, feeGbp: null, feeNotSetReason: "seller_type_not_set",
  taxProvisionGbp: null, expectedNetGbp: null,
};
const BASE_DECISION = {
  route: "list_single", reason: "sound_single_listing", alternatives: [], confidence: "high",
  liquidity: "high", economics: KNOWN_ECONOMICS,
  maxBuyGbp: 66.49, maxBuyUnavailableReason: null, minAcceptGbp: 12.5, offerPctAtMax: 48.9,
  degraded: false, degradedReasons: [], assumptions: [],
};
// Fee known, margin not chosen: the most common "Not set" a seller will see.
const MARGIN_UNSET = { ...BASE_DECISION, maxBuyGbp: null, maxBuyUnavailableReason: "margin_not_set", offerPctAtMax: null };
// Seller type not answered: the fee, the net, the tax, the floor and most-to-pay are ALL withheld.
const FEE_UNSET = {
  ...BASE_DECISION, economics: UNSET_ECONOMICS, maxBuyGbp: null,
  maxBuyUnavailableReason: "seller_type_not_set", minAcceptGbp: null, offerPctAtMax: null,
};

const issues = (r: { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } }) =>
  r.success ? [] : r.error!.issues;

describe("Decision.maxBuyGbp is number | null with a reason (v0.2.0)", () => {
  it("accepts a number with a null reason", () => {
    expect(DecisionSchema.safeParse(BASE_DECISION).success).toBe(true);
  });

  it("accepts null WITH a reason, for every reason", () => {
    for (const reason of MaxBuyUnavailableReasonSchema.options) {
      // The two fee reasons must agree with the economics block, so give them one that does.
      const fee = reason === "seller_type_not_set" || reason === "vat_not_set";
      const d = fee
        ? { ...FEE_UNSET, economics: { ...UNSET_ECONOMICS, feeNotSetReason: reason }, maxBuyUnavailableReason: reason }
        : { ...MARGIN_UNSET, maxBuyUnavailableReason: reason };
      const r = DecisionSchema.safeParse(d);
      expect(r.success, `${reason}: ${JSON.stringify(issues(r))}`).toBe(true);
    }
  });

  it("REJECTS null without a reason", () => {
    const r = DecisionSchema.safeParse({ ...MARGIN_UNSET, maxBuyUnavailableReason: null });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "maxBuyUnavailableReason" && /must say why/.test(i.message))).toBe(true);
  });

  it("REJECTS a number WITH a reason", () => {
    const r = DecisionSchema.safeParse({ ...BASE_DECISION, maxBuyUnavailableReason: "margin_not_set" });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "maxBuyUnavailableReason" && /has no reason to be missing/.test(i.message))).toBe(true);
  });

  it("REQUIRES the reason key even when it is null — a server that omits it is wrong", () => {
    // The null case is the one that matters: an ABSENT key beside a null maxBuyGbp is exactly the
    // unexplained null. (For the number case the refinement happens to reject `undefined` too.)
    const { maxBuyUnavailableReason: _omit, ...without } = MARGIN_UNSET;
    const r = DecisionSchema.safeParse(without);
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "maxBuyUnavailableReason")).toBe(true);
    const { maxBuyUnavailableReason: _omit2, ...withoutNumber } = BASE_DECISION;
    expect(DecisionSchema.safeParse(withoutNumber).success).toBe(false);
  });

  it("REJECTS a reason outside the set — game_not_available is an HTTP refusal, not a Decision", () => {
    expect(DecisionSchema.safeParse({ ...MARGIN_UNSET, maxBuyUnavailableReason: "game_not_available" }).success).toBe(false);
  });

  it("REJECTS a percentage of nothing: offerPctAtMax is null exactly when maxBuyGbp is", () => {
    expect(DecisionSchema.safeParse({ ...MARGIN_UNSET, offerPctAtMax: 0 }).success).toBe(false);
    expect(DecisionSchema.safeParse({ ...BASE_DECISION, offerPctAtMax: null }).success).toBe(false);
  });

  it("does not let null collapse into zero: 0 is a legal most-to-pay and stays a number", () => {
    const r = DecisionSchema.safeParse({ ...BASE_DECISION, maxBuyGbp: 0, offerPctAtMax: 0 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.maxBuyGbp).toBe(0);
  });
});

describe("Decision.economics.feeGbp is number | null with a reason (v0.2.0)", () => {
  it("accepts a known fee with a null reason", () => {
    expect(DecisionEconomicsSchema.safeParse(KNOWN_ECONOMICS).success).toBe(true);
  });

  it("accepts a null fee with each reason, with the profit figures null alongside it", () => {
    for (const reason of ["seller_type_not_set", "vat_not_set"]) {
      expect(DecisionEconomicsSchema.safeParse({ ...UNSET_ECONOMICS, feeNotSetReason: reason }).success).toBe(true);
    }
  });

  it("REJECTS a null fee without a reason", () => {
    const r = DecisionEconomicsSchema.safeParse({ ...UNSET_ECONOMICS, feeNotSetReason: null });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "feeNotSetReason" && /must say why/.test(i.message))).toBe(true);
  });

  it("REJECTS a known fee that carries a reason", () => {
    const r = DecisionEconomicsSchema.safeParse({ ...KNOWN_ECONOMICS, feeNotSetReason: "vat_not_set" });
    expect(r.success).toBe(false);
  });

  it("REJECTS a net or a tax provision computed around a fee nobody knows", () => {
    // The private-seller assumption survives a nullable fee if the figures built on it do not
    // move with it: £114.09 here is a net that silently assumed a £0 fee.
    expect(DecisionEconomicsSchema.safeParse({ ...UNSET_ECONOMICS, expectedNetGbp: 114.09 }).success).toBe(false);
    expect(DecisionEconomicsSchema.safeParse({ ...UNSET_ECONOMICS, taxProvisionGbp: 0 }).success).toBe(false);
  });

  it("REJECTS a missing net when the fee IS known — the profit is computable", () => {
    expect(DecisionEconomicsSchema.safeParse({ ...KNOWN_ECONOMICS, expectedNetGbp: null }).success).toBe(false);
  });

  it("REJECTS an unknown reason", () => {
    expect(DecisionEconomicsSchema.safeParse({ ...UNSET_ECONOMICS, feeNotSetReason: "private_assumed" }).success).toBe(false);
  });
});

describe("Decision: the fee position and the figures built on it move together (v0.2.0)", () => {
  it("accepts a decision with the fee position unset and everything that contains the fee withheld", () => {
    expect(DecisionSchema.safeParse(FEE_UNSET).success).toBe(true);
  });

  it("REJECTS a most-to-pay computed with an unknown fee", () => {
    expect(DecisionSchema.safeParse({ ...FEE_UNSET, maxBuyGbp: 60, maxBuyUnavailableReason: null, offerPctAtMax: 44 }).success).toBe(false);
  });

  it("REJECTS a sell floor computed with an unknown fee — a floor that is too low accepts losing offers", () => {
    const r = DecisionSchema.safeParse({ ...FEE_UNSET, minAcceptGbp: 12.5 });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => i.path[0] === "minAcceptGbp")).toBe(true);
  });

  it("REJECTS a missing sell floor when the fee is known", () => {
    expect(DecisionSchema.safeParse({ ...BASE_DECISION, minAcceptGbp: null }).success).toBe(false);
  });

  it("REJECTS a most-to-pay reason that contradicts the economics block about the fee position", () => {
    // Two fields reporting one fact must agree; a client is left choosing which to believe.
    const r = DecisionSchema.safeParse({ ...FEE_UNSET, maxBuyUnavailableReason: "vat_not_set" });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /one fact, reported once/.test(i.message))).toBe(true);
  });

  it("allows a HIGHER-precedence reason than the fee when both are unset (margin_not_set, fee unset)", () => {
    expect(DecisionSchema.safeParse({ ...FEE_UNSET, maxBuyUnavailableReason: "margin_not_set" }).success).toBe(true);
  });

  it("reaches the decision wherever it is nested: QuickScan and the batch result", () => {
    const quick = QuickScanResponseSchema.safeParse({ identified: true, candidates: [], decision: FEE_UNSET });
    expect(quick.success, JSON.stringify(issues(quick))).toBe(true);
    const bad = QuickScanResponseSchema.safeParse({ identified: true, candidates: [], decision: { ...FEE_UNSET, maxBuyUnavailableReason: null } });
    expect(bad.success).toBe(false);
    const batch = DecideBatchResponseSchema.safeParse({ results: [{ id: "a", decision: MARGIN_UNSET }] });
    expect(batch.success).toBe(true);
    const badBatch = DecideBatchResponseSchema.safeParse({ results: [{ id: "a", decision: { ...MARGIN_UNSET, maxBuyUnavailableReason: null } }] });
    expect(badBatch.success).toBe(false);
  });

  it("round-trips through JSON unchanged: nulls survive and reasons stay attached", () => {
    for (const d of [BASE_DECISION, MARGIN_UNSET, FEE_UNSET]) {
      const parsed = DecisionSchema.parse(d);
      const again = DecisionSchema.parse(JSON.parse(JSON.stringify(parsed)));
      expect(again).toEqual(parsed);
    }
    expect(DecisionSchema.parse(FEE_UNSET).economics.feeGbp).toBeNull();
    expect(DecisionSchema.parse(FEE_UNSET).maxBuyUnavailableReason).toBe("seller_type_not_set");
  });
});
