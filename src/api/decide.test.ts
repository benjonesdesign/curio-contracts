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
  DecideRequestSchema, DecideResponseSchema, DecideBatchRequestSchema, DecideBatchResponseSchema,
  DecisionSchema, DecisionEconomicsSchema, QuickScanRequestSchema, QuickScanResponseSchema,
} from "./decide.js";
import { MaxBuyUnavailableReasonSchema } from "./common.js";
import { BUYING_BUSINESS, BUYING_FEE_UNSET, BUYING_PRIVATE, SELLING_KNOWN } from "../test-support/breakdown-fixtures.js";
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

// The breakdown that tells the same story as MARGIN_UNSET: business fee known, margin not chosen.
const MARGIN_UNSET_BREAKDOWN = {
  ...BUYING_BUSINESS,
  lines: BUYING_BUSINESS.lines.map((l) =>
    l.key === "target_margin" || l.key === "max_buy" ? { ...l, amountGbp: null, unknownReason: "margin_not_set" } : l),
  totals: { youReceiveGbp: null, maxBuyGbp: null },
  compare: null,
  notSet: ["targetMargin"],
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
    const quick = QuickScanResponseSchema.safeParse({ identified: true, candidates: [], decision: FEE_UNSET, breakdown: BUYING_FEE_UNSET });
    expect(quick.success, JSON.stringify(issues(quick))).toBe(true);
    const bad = QuickScanResponseSchema.safeParse({
      identified: true, candidates: [], decision: { ...FEE_UNSET, maxBuyUnavailableReason: null }, breakdown: BUYING_FEE_UNSET,
    });
    expect(bad.success).toBe(false);
    const batch = DecideBatchResponseSchema.safeParse({ results: [{ id: "a", decision: MARGIN_UNSET, breakdown: MARGIN_UNSET_BREAKDOWN }] });
    expect(batch.success, JSON.stringify(issues(batch))).toBe(true);
    const badBatch = DecideBatchResponseSchema.safeParse({
      results: [{ id: "a", decision: { ...MARGIN_UNSET, maxBuyUnavailableReason: null }, breakdown: MARGIN_UNSET_BREAKDOWN }],
    });
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

// ── v0.2.0: the breakdown BESIDE the decision (attached to /api/decide, /api/quick-scan, batch) ────
//
// One calculation, two renderings. The headline figure and the line-by-line answer must agree, or a
// seller sees "£66" on one screen and "£66.49" or "Not set" on the next.

describe("DecideResponse: the breakdown beside the decision (v0.2.0)", () => {
  const PRICE = { source: "poketrace-ebay", confidence: "medium", currencyNote: null };
  const known = { decision: BASE_DECISION, price: PRICE, breakdown: BUYING_BUSINESS };

  it("accepts a decision with its breakdown: £66.49 on the decision, SHOWN £66 on the lines", () => {
    const r = DecideResponseSchema.safeParse(known);
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REQUIRES the breakdown on /api/decide: a most-to-pay without its lines is a screen computing money", () => {
    expect(DecideResponseSchema.safeParse({ decision: BASE_DECISION, price: PRICE }).success).toBe(false);
  });

  it("accepts a decision whose most-to-pay is ALREADY a whole pound (floor of a floored figure)", () => {
    expect(DecideResponseSchema.safeParse({ ...known, decision: { ...BASE_DECISION, maxBuyGbp: 66 } }).success).toBe(true);
  });

  it("REJECTS a breakdown total that is not the decision's most-to-pay rounded DOWN", () => {
    // rounded UP (67), rounded to nearest-pence (66.49 -> not an integer is caught elsewhere), or
    // simply a different figure: the headline and the lines would disagree.
    const up = { ...BUYING_BUSINESS, totals: { youReceiveGbp: null, maxBuyGbp: 67 },
      lines: BUYING_BUSINESS.lines.map((l) => (l.key === "max_buy" ? { ...l, amountGbp: 67 } : l)) };
    const r = DecideResponseSchema.safeParse({ ...known, breakdown: up });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /rounded down to the pound/.test(i.message))).toBe(true);
  });

  it("accepts the owner's private-seller example: engine £84.77 on the decision, SHOWN £84 (round DOWN, not nearest)", () => {
    const privateDecision = { ...BASE_DECISION, economics: { ...KNOWN_ECONOMICS, feeGbp: 0, expectedNetGbp: 132.37 }, maxBuyGbp: 84.77, offerPctAtMax: 62.3 };
    const r = DecideResponseSchema.safeParse({ decision: privateDecision, price: PRICE, breakdown: BUYING_PRIVATE });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
    // 84.77 rounds to 85 to the nearest pound: a breakdown saying 85 would overstate what to pay
    const nearest = { ...BUYING_PRIVATE, totals: { youReceiveGbp: null, maxBuyGbp: 85 },
      lines: BUYING_PRIVATE.lines.map((l) => (l.key === "max_buy" ? { ...l, amountGbp: 85 } : l)) };
    expect(DecideResponseSchema.safeParse({ decision: privateDecision, price: PRICE, breakdown: nearest }).success).toBe(false);
  });

  it("REJECTS a decision with a most-to-pay beside a breakdown whose most-to-pay is null for want of a margin", () => {
    // Isolated: fee known on both sides, so ONLY the null-vs-number rule can object.
    const r = DecideResponseSchema.safeParse({ decision: BASE_DECISION, price: PRICE, breakdown: MARGIN_UNSET_BREAKDOWN });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /decision.maxBuyGbp is a number but the breakdown's most-to-pay is null/.test(i.message))).toBe(true);
  });

  it("REJECTS a fee basis that contradicts the economics block when no fee line is there to disagree", () => {
    const noFeeLine = { ...BUYING_FEE_UNSET, lines: BUYING_FEE_UNSET.lines.filter((l) => l.key !== "ebay_fee"),
      feePosition: { sellerType: null, vatRegistered: null, channel: "direct", feeBasis: "seller_override" }, notSet: [] };
    const r = DecideResponseSchema.safeParse({ decision: FEE_UNSET, price: PRICE, breakdown: noFeeLine });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /feeBasis must be "not_set"/.test(i.message))).toBe(true);
  });

  it("REJECTS a SELLING breakdown beside a decision even when every figure in it agrees", () => {
    // Margin unset => no most-to-pay on either side; the fee matches; only the MODE is wrong.
    const sellingBeside = { decision: MARGIN_UNSET, price: PRICE, breakdown: SELLING_KNOWN };
    const r = DecideResponseSchema.safeParse(sellingBeside);
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /prices a PURCHASE/.test(i.message))).toBe(true);
  });

  it("REJECTS a number on one side and a null on the other", () => {
    expect(DecideResponseSchema.safeParse({ ...known, breakdown: BUYING_FEE_UNSET }).success).toBe(false);
    expect(DecideResponseSchema.safeParse({ decision: FEE_UNSET, price: PRICE, breakdown: BUYING_BUSINESS }).success).toBe(false);
  });

  it("REJECTS a max_buy line whose reason is not the decision's: one reason, reported once", () => {
    const wrong = { ...BUYING_FEE_UNSET, lines: BUYING_FEE_UNSET.lines.map((l) => (l.key === "max_buy" ? { ...l, unknownReason: "margin_not_set" } : l)) };
    const r = DecideResponseSchema.safeParse({ decision: FEE_UNSET, price: PRICE, breakdown: wrong });
    expect(r.success).toBe(false);
    expect(issues(r).some((i) => /one reason, reported once/.test(i.message))).toBe(true);
  });

  it("accepts the unset-seller-type decision with its null breakdown", () => {
    const r = DecideResponseSchema.safeParse({ decision: FEE_UNSET, price: PRICE, breakdown: BUYING_FEE_UNSET });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REJECTS a fee that differs between the economics block and the fee line", () => {
    const off = { ...BUYING_BUSINESS, lines: BUYING_BUSINESS.lines.map((l) => (l.key === "ebay_fee" ? { ...l, amountGbp: -22.36 } : l)) };
    expect(DecideResponseSchema.safeParse({ ...known, breakdown: off }).success).toBe(false);
  });

  it("REJECTS a SELLING breakdown beside a decision", () => {
    expect(DecideResponseSchema.safeParse({ ...known, breakdown: { ...BUYING_BUSINESS, mode: "selling" } }).success).toBe(false);
  });

  it("REJECTS a fee-basis that contradicts the economics block", () => {
    const r = DecideResponseSchema.safeParse({
      ...known, breakdown: { ...BUYING_BUSINESS, feePosition: { ...BUYING_BUSINESS.feePosition, feeBasis: "not_set" }, notSet: ["sellerType"] },
    });
    expect(r.success).toBe(false);
  });
});

describe("QuickScan and the decide batch carry the breakdown, null exactly when the decision is (v0.2.0)", () => {
  it("accepts an unidentified card: no decision, no breakdown", () => {
    const r = QuickScanResponseSchema.safeParse({ identified: false, candidates: [], decision: null, breakdown: null });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
  });

  it("REJECTS a decision with no breakdown, and a breakdown with no decision", () => {
    expect(QuickScanResponseSchema.safeParse({ identified: true, candidates: [], decision: BASE_DECISION, breakdown: null }).success).toBe(false);
    expect(QuickScanResponseSchema.safeParse({ identified: false, candidates: [], decision: null, breakdown: BUYING_BUSINESS }).success).toBe(false);
  });

  it("makes the key REQUIRED on quick-scan: it cannot be omitted instead of nulled", () => {
    expect(QuickScanResponseSchema.safeParse({ identified: false, candidates: [], decision: null }).success).toBe(false);
  });

  it("a card with no market value is a null decision with a null breakdown in a batch; the others are unaffected", () => {
    const r = DecideBatchResponseSchema.safeParse({
      results: [
        { id: "a", decision: BASE_DECISION, breakdown: BUYING_BUSINESS },
        { id: "b", decision: null, decisionUnavailable: "no_market_value", breakdown: null },
      ],
    });
    expect(r.success, JSON.stringify(issues(r))).toBe(true);
    expect(DecideBatchResponseSchema.safeParse({ results: [{ id: "b", decision: null, breakdown: BUYING_PRIVATE }] }).success).toBe(false);
  });

  it("a batch breakdown must match ITS card's decision", () => {
    const r = DecideBatchResponseSchema.safeParse({ results: [{ id: "a", decision: BASE_DECISION, breakdown: BUYING_FEE_UNSET }] });
    expect(r.success).toBe(false);
    expect(issues(r)[0].path.slice(0, 3)).toEqual(["results", 0, "breakdown"]);
  });
});

describe("the buying breakdown's editable inputs are seller INTENT only (ADR 0028)", () => {
  it("accepts their price, a postage mode and a packing key on decide, the batch and quick scan", () => {
    expect(DecideRequestSchema.safeParse({ marketValueGbp: 136, theirPriceGbp: 120, postageMode: "buyer_pays", packingKey: "toploader" }).success).toBe(true);
    expect(QuickScanRequestSchema.safeParse({ name: "Charizard", theirPriceGbp: 120, postageMode: "seller_pays" }).success).toBe(true);
    expect(DecideBatchRequestSchema.safeParse({
      cards: [{ id: "a", marketValueGbp: 136, costBasisGbp: null, theirPriceGbp: 120 }, { id: "b", marketValueGbp: 5, costBasisGbp: null, theirPriceGbp: null }],
      postageMode: "seller_pays",
    }).success).toBe(true);
  });

  it("REJECTS a negative asking price and a postage figure in place of a postage mode", () => {
    expect(DecideRequestSchema.safeParse({ marketValueGbp: 136, theirPriceGbp: -1 }).success).toBe(false);
    expect(DecideRequestSchema.safeParse({ marketValueGbp: 136, postageMode: 3.29 }).success).toBe(false);
  });
});
