// Shared fixtures for the v0.2.0 PricedBreakdown tests. NOT a test file (no `.test.ts` suffix, so
// vitest does not collect it) and EXCLUDED from the published build (tsconfig.build.json), so it
// never reaches `dist/`.
//
// The numbers are the owner's worked examples, not invented ones:
//   - selling, business VAT-registered, £167: fee £18.28 (ex-VAT), buyer pays postage, packing
//     £0.34 -> you receive £148.38 (JTBD-GAP-012's arithmetic shape).
//   - buying, £136 sale, 35% margin, packing £0.34, Dispatch postage £3.29 (PLAN-MOST-TO-PAY #224
//     §4): private £84.77 -> shown £84; business VAT-registered £66.49 -> shown £66.

type Over = Record<string, unknown>;

export const line = (over: Over = {}) => {
  const l: Record<string, unknown> = {
    key: "ebay_fee", label: "eBay fee", amountGbp: -18.28, unknownReason: null, source: "fee_model",
    assumed: false, estimate: false, editable: false, editKey: null,
    minutes: null, perOrderBand: null, feeBasisVerified: null, service: null, postageBasis: null, note: "vat_reclaimed", ...over,
  };
  // The fee line defaults to a banded, UNVERIFIED fee (#244: feeBasisVerified is false until eBay's
  // page confirms the £10 band basis); an unknown fee carries neither.
  if (l.key === "ebay_fee") {
    if (!("feeBasisVerified" in over)) l.feeBasisVerified = l.amountGbp === null ? null : false;
    if (!("perOrderBand" in over)) l.perOrderBand = l.amountGbp === null ? null : "high";
  }
  return l as ReturnType<typeof lineShape>;
};
// (type helper so fixtures stay structurally typed without a second declaration)
declare function lineShape(): {
  key: string; label: string; amountGbp: number | null; unknownReason: string | null; source: string;
  assumed: boolean; estimate: boolean; editable: boolean; editKey: string | null;
  minutes: number | null; perOrderBand: string | null; feeBasisVerified: boolean | null; service: string | null; postageBasis: string | null; note: string | null;
};

const PRICE = { gbp: 136, source: "poketrace-ebay", kind: "asking", asOf: "2026-10-07T18:00:00.000Z", cached: false };
const NO_TOTAL = { youReceiveGbp: null, maxBuyGbp: null, askingPriceOnly: false };

// ── Selling ("You receive") ─────────────────────────────────────────────────────────────────
export const SELLING_KNOWN = {
  mode: "selling",
  lines: [
    line({ key: "sale_price", label: "Sale price", amountGbp: 167, source: "request", note: null }),
    line(),
    line({ key: "postage", label: "Postage", amountGbp: 0, source: "ebay_policy", note: "buyer_pays" }),
    line({ key: "packing", label: "Packing (estimate)", amountGbp: -0.34, source: "default", assumed: true, estimate: true,
          editable: true, editKey: "packingKey", note: "estimate" }),
    line({ key: "you_receive", label: "You receive", amountGbp: 148.38, source: "fee_model", note: null }),
  ],
  totals: { youReceiveGbp: 148.38, maxBuyGbp: null, askingPriceOnly: false },
  compare: null,
  feePosition: { sellerType: "business", vatRegistered: true, channel: "ebay", feeBasis: "derived" },
  notSet: [],
  price: { gbp: 167, source: null, kind: null, asOf: null, cached: false },
  computedAt: "2026-10-08T09:30:00.000Z",
};

/** Seller type never answered: the fee and what you receive are null WITH a reason, never £0. */
export const SELLING_FEE_UNSET = {
  ...SELLING_KNOWN,
  lines: [
    line({ key: "sale_price", label: "Sale price", amountGbp: 167, source: "request", note: null }),
    line({ amountGbp: null, unknownReason: "seller_type_not_set", note: null }),
    line({ key: "postage", label: "Postage", amountGbp: 0, source: "ebay_policy", note: "buyer_pays" }),
    line({ key: "packing", label: "Packing (estimate)", amountGbp: -0.34, source: "default", assumed: true, estimate: true,
          editable: true, editKey: "packingKey", note: "estimate" }),
    line({ key: "you_receive", label: "You receive", amountGbp: null, unknownReason: "seller_type_not_set", source: "fee_model", note: null }),
  ],
  totals: NO_TOTAL,
  feePosition: { sellerType: null, vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
  notSet: ["sellerType"],
};

// ── Buying ("Most to pay") ──────────────────────────────────────────────────────────────────
const buyingLines = (fee: Over, margin: Over, total: Over) => [
  line({ key: "sale_price", label: "Sale price", amountGbp: 136, source: "price_provider", note: "asking_basis" }),
  line({ key: "ebay_fee", label: "eBay fee", ...fee }),
  line({ key: "packing", label: "Packing (estimate)", amountGbp: -0.34, source: "default", assumed: true, estimate: true,
         editable: true, editKey: "packingKey", note: "estimate" }),
  line({ key: "postage", label: "Postage", amountGbp: -3.29, source: "seller_profile", editable: true, editKey: "postageMode", service: "tracked48_sp", note: null }),
  line({ key: "target_margin", label: "Your margin", source: "seller_profile", editable: true, editKey: "targetMarginPct", note: null, ...margin }),
  line({ key: "max_buy", label: "Most to pay", source: "fee_model", note: null, ...total }),
];

/** Private seller, 35%: engine £84.77, SHOWN £84 (rounded down by the server). */
export const BUYING_PRIVATE = {
  mode: "buying",
  lines: buyingLines(
    { amountGbp: 0, source: "fee_model", perOrderBand: null, note: null },
    { amountGbp: -47.6 },
    { amountGbp: 84 },
  ),
  totals: { youReceiveGbp: null, maxBuyGbp: 84, askingPriceOnly: false },
  compare: { theirPriceGbp: 120, overUnderGbp: -36 },
  feePosition: { sellerType: "private", vatRegistered: null, channel: "ebay", feeBasis: "derived" },
  notSet: [],
  price: PRICE,
  computedAt: "2026-10-08T09:30:00.000Z",
};

/** Business, VAT-registered, 35%: engine £66.49, SHOWN £66. Matches decide.test's BASE_DECISION. */
export const BUYING_BUSINESS = {
  ...BUYING_PRIVATE,
  lines: buyingLines(
    { amountGbp: -18.28, source: "fee_model", note: "vat_reclaimed" },
    { amountGbp: -47.6 },
    { amountGbp: 66 },
  ),
  totals: { youReceiveGbp: null, maxBuyGbp: 66, askingPriceOnly: false },
  feePosition: { sellerType: "business", vatRegistered: true, channel: "ebay", feeBasis: "derived" },
};

/** The seller never chose a buying margin: no fallback to the selling floor, so no figure. */
export const BUYING_MARGIN_UNSET = {
  ...BUYING_PRIVATE,
  lines: buyingLines(
    { amountGbp: 0, source: "fee_model", perOrderBand: null, note: null },
    { amountGbp: null, unknownReason: "margin_not_set", assumed: false },
    { amountGbp: null, unknownReason: "margin_not_set" },
  ),
  totals: NO_TOTAL,
  compare: null,
  notSet: ["targetMargin"],
};

/** Seller type never answered: the fee and the most to pay are null with that reason. */
export const BUYING_FEE_UNSET = {
  ...BUYING_PRIVATE,
  lines: buyingLines(
    { amountGbp: null, unknownReason: "seller_type_not_set", note: null },
    { amountGbp: -47.6 },
    { amountGbp: null, unknownReason: "seller_type_not_set" },
  ),
  totals: NO_TOTAL,
  compare: null,
  feePosition: { sellerType: null, vatRegistered: null, channel: "ebay", feeBasis: "not_set" },
  notSet: ["sellerType"],
};

// ── A copy ──────────────────────────────────────────────────────────────────────────────────
export const CARD = {
  id: "11111111-2222-4333-8444-555555555555",
  sku: "SKU-11111111",
  status: "READY_TO_LIST",
  game: "pokemon",
  name: "Charizard ex",
  setName: "Obsidian Flames",
  cardNumber: "125/197",
  condition: "NM",
  conditionConfirmed: true,
  heldAt: null,
  isMine: false,
  mineSetAt: null,
  setAsideReason: null,
  setAsideAt: null,
};

/**
 * Re-derive a fixture's total from its own lines, the way the server must: selling = the sum of the
 * rounded lines in whole pence; buying = that sum rounded DOWN to the pound (never negative). Use
 * it after adding or removing a line, so a test varies ONE thing and the arithmetic stays true.
 */
export function rebalance<T extends { mode: string; lines: ReturnType<typeof line>[]; totals: { youReceiveGbp: number | null; maxBuyGbp: number | null; askingPriceOnly: boolean } }>(b: T): T {
  const own = b.mode === "selling" ? "you_receive" : "max_buy";
  const pence = b.lines.filter((l) => l.key !== own).reduce((a, l) => a + Math.round((l.amountGbp as number) * 100), 0);
  const total = b.mode === "selling" ? pence / 100 : Math.max(0, Math.floor(pence / 100));
  return {
    ...b,
    lines: b.lines.map((l) => (l.key === own ? { ...l, amountGbp: total } : l)),
    totals: b.mode === "selling" ? { youReceiveGbp: total, maxBuyGbp: null, askingPriceOnly: false } : { youReceiveGbp: null, maxBuyGbp: total, askingPriceOnly: (b.totals as { askingPriceOnly?: boolean }).askingPriceOnly ?? false },
  };
}
