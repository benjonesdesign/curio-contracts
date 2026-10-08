// Contract for POST /api/pricing/breakdown (pokemon-tool) — Design Spec 06 §2 "live profit
// feedback as the seller edits a price field". `lib/pricing.ts`'s `computeBreakdownForPrice` has
// existed since W3, documented for exactly this use, but nothing exposed it as a route: web calls
// it in-process, iOS cannot reach it at all. Per ADR 0011, fee/tax maths must never be re-derived
// client-side (a UK income-tax provision and an eBay fee with a fixed-plus-percent shape can't be
// reverse-engineered from a displayed total without risking a wrong number at the exact moment a
// seller is deciding a price) — this route is the only correct way for iOS to get live net-profit
// feedback on Spec 06's price step.
import { z } from "zod";
import { FeeNotSetReasonSchema } from "./common.js";
import { PricingSettingsSchema } from "./recommend.js";

export const PricingBreakdownRequestSchema = z.object({
  /** The price the seller is currently considering — recomputed live as they edit it. */
  price: z.number(),
  purchaseCost: z.number(),
  /** eBay sold median (25th-75th trimmed) — the reference point the breakdown is measured
   * against (Spec 06 §7's low/avg/top band, when available). */
  marketMedian: z.number(),
  /** "personal" zeroes the tax rate (CGT chattel-exemption modelling); default "resale". */
  collectionType: z.enum(["personal", "resale"]).optional(),
  /** The market price's own source id (e.g. "ebay-uk-sold", "poketrace-ebay") — used only to
   * derive the response's `priceKind`, so a caller never has to know or string-match the source
   * vocabulary itself. Omit when unknown; `priceKind` then defaults to "asking", the honest
   * default when provenance isn't known. */
  priceSource: z.string().nullable().optional(),
  /** Explicit settings override for a caller that already has its own (e.g. web's local,
   * not-yet-saved Settings -> Pricing draft). Omitted — the common case, and the ONLY option for
   * a caller with no local settings UI (today: iOS, Spec 06 §5) — falls back to the account's
   * saved profile settings, then lib/pricing.ts's DEFAULT_SETTINGS. Mirrors RecommendRequestSchema's
   * identical `pricingSettings` field. */
  settings: PricingSettingsSchema.optional(),
});
export type PricingBreakdownRequest = z.infer<typeof PricingBreakdownRequestSchema>;

/** Where the market price came from, in the only two classes that matter to a seller. Hoisted
 *  from the response's inline enum in v0.2.0 so `PricedBreakdown.price.kind` can reuse it: an
 *  inline copy would have emitted `PriceKind2`. The wire values and the generated name (`PriceKind`)
 *  are unchanged. */
export const PriceKindSchema = z.enum(["realised", "asking"]);
export type PriceKind = z.infer<typeof PriceKindSchema>;

/**
 * v0.2.0 (BREAKING): every figure that CONTAINS the seller's eBay fee is nullable, together, with
 * `feeNotSetReason` saying why. They are one fact:
 *
 *   `ebayFee`, `grossProfit`, `taxProvision`, `netProfit`, `netMarginPct`, `minViablePrice` and
 *   `isMarketBelowMin` are all null with a reason, or all present with no reason.
 *
 * `minViablePrice` is the price at which net-of-fees clears the seller's margin, and
 * `isMarketBelowMin` compares the market to it, so both depend on the fee as surely as `netProfit`
 * does — leaving them numbers would keep the private-seller assumption alive in the two figures a
 * seller acts on. `packagingCost` and `shippingCost` do not depend on seller type and stay numbers.
 *
 * The richer, line-by-line answer is `PricedBreakdown` (./priced-breakdown.ts), which this
 * endpoint will also carry; these flat fields remain for clients that only want the headline.
 */
export const PricingBreakdownResponseSchema = z.object({
  purchaseCost: z.number(),
  marketMedian: z.number(),
  suggestedPrice: z.number(),
  /** Null when the fee position is not set (v0.2.0) — NOT £0, which is a private seller's real fee. */
  ebayFee: z.number().nullable(),
  /** WHY the fee-dependent fields below are null. Null exactly when `ebayFee` is a number. */
  feeNotSetReason: FeeNotSetReasonSchema.nullable(),
  packagingCost: z.number(),
  shippingCost: z.number(),
  grossProfit: z.number().nullable(),
  taxProvision: z.number().nullable(),
  netProfit: z.number().nullable(),
  netMarginPct: z.number().nullable(),
  /** Spec 06 §4 — the floor below which the app should show a "below your minimum — consider
   * bundling" warning. Null with the fee (v0.2.0). */
  minViablePrice: z.number().nullable(),
  /** Null with the fee (v0.2.0): the comparison needs `minViablePrice`. */
  isMarketBelowMin: z.boolean().nullable(),
  warningMsg: z.string().nullable(),
  /** Spec 06 §6's machine-readable price provenance. "realised" only for a confirmed UK-sold
   * source (today: ebay-uk-sold) — every other source (cross-region reference prices, asking
   * listings, catalogue baselines) is "asking". Derived server-side from the request's
   * `priceSource` using the same classification lib/price-confidence.ts already encodes as
   * human-readable caveat text, so a caller gets one machine-readable field instead of having to
   * string-match source ids to guess the distinction. */
  priceKind: PriceKindSchema,
}).superRefine((r, ctx) => {
  const feeNull = r.ebayFee === null;
  if (feeNull !== (r.feeNotSetReason !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feeNotSetReason"],
      message: feeNull
        ? "ebayFee is null, so feeNotSetReason is required: a null fee must say why it is null"
        : "feeNotSetReason is set but ebayFee is a number: a fee that is known has no reason to be missing" });
  }
  for (const k of ["grossProfit", "taxProvision", "netProfit", "netMarginPct", "minViablePrice", "isMarketBelowMin"] as const) {
    if (feeNull !== (r[k] === null)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k],
        message: feeNull
          ? `${k} must be null when ebayFee is null: it contains the fee, so a number assumes one`
          : `${k} is null but ebayFee is a number: it is computable once the fee is known` });
    }
  }
});
export type PricingBreakdownResponse = z.infer<typeof PricingBreakdownResponseSchema>;
