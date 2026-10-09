// Contract for POST /api/pricing/breakdown (pokemon-tool) — Design Spec 06 §2 "live profit
// feedback as the seller edits a price field". `lib/pricing.ts`'s `computeBreakdownForPrice` has
// existed since W3, documented for exactly this use, but nothing exposed it as a route: web calls
// it in-process, iOS cannot reach it at all. Per ADR 0011, fee/tax maths must never be re-derived
// client-side (a UK income-tax provision and an eBay fee with a fixed-plus-percent shape can't be
// reverse-engineered from a displayed total without risking a wrong number at the exact moment a
// seller is deciding a price) — this route is the only correct way for iOS to get live net-profit
// feedback on Spec 06's price step.
import { z } from "zod";
import { cardsInParcelField, FeeNotSetReasonSchema, PostageForSchema, PriceKindSchema } from "./common.js";
import { EbayListingFormatSchema } from "./ebay-publish.js";
import { PostageModeSchema, PricedBreakdownSchema } from "./priced-breakdown.js";
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
    // ── v0.2.0: the seller's INTENT for the line-by-line breakdown (ADR 0028) ───────────────────
    // A client may send what the seller WANTS (a price, a format, who pays postage, a packing
    // choice) and never what the world COSTS: fee rates, postage rates and tax stay on the server.
    /** The copy being priced. With it the server reads the stored game, condition, per-card
     *  overrides and (for an auction) the start price; without it the breakdown is for a loose
     *  price, as before. */
    physicalCardId: z.string().optional(),
    /** AUCTION prices the receipt at the start price, with the line note `at_start_price`. */
    format: EbayListingFormatSchema.optional(),
    /** Who bears postage for this card, for this request. Absent = the seller's Dispatch rule. */
    postageMode: PostageModeSchema.optional(),
    /** A keyed packing choice from the server-owned catalogue (open string: the catalogue is the
     *  server's, and a key a client has never seen must not fail the request). */
    packingKey: z.string().optional(),
    /** `estimate` (default): the seller's Dispatch rules; `published`: the eBay postage policy the
     *  listing uses. The response's postage line says which it used (`postageBasis`). */
    postageFor: PostageForSchema.optional(),
    /** Cards in the parcel, default 1: packing time is the ruled default of 4 minutes + 2 per extra
     *  card (when an hourly rate is set and the seller has no minutes of their own). */
    cardsInParcel: cardsInParcelField.optional(),
});
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
 * The richer, line-by-line answer is `PricedBreakdown` (./priced-breakdown.ts), now carried in
 * `breakdown` (v0.2.0); the flat fields remain for clients that only want the headline, and the
 * two are cross-checked below (a server-side guard: Swift/Kotlin cannot express it).
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
    /** v0.2.0. Every line of "You receive", with its source: sale price, eBay fee, postage, packing,
     *  you receive. `mode` is "selling". A client renders these lines in order and sums nothing. */
    breakdown: PricedBreakdownSchema,
}).superRefine((r, ctx) => {
    const feeNull = r.ebayFee === null;
    if (feeNull !== (r.feeNotSetReason !== null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["feeNotSetReason"],
            message: feeNull
                ? "ebayFee is null, so feeNotSetReason is required: a null fee must say why it is null"
                : "feeNotSetReason is set but ebayFee is a number: a fee that is known has no reason to be missing" });
    }
    for (const k of ["grossProfit", "taxProvision", "netProfit", "netMarginPct", "minViablePrice", "isMarketBelowMin"]) {
        if (feeNull !== (r[k] === null)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: [k],
                message: feeNull
                    ? `${k} must be null when ebayFee is null: it contains the fee, so a number assumes one`
                    : `${k} is null but ebayFee is a number: it is computable once the fee is known` });
        }
    }
    // ── The flat figures and the breakdown are ONE answer ──────────────────────────────────────
    const b = r.breakdown;
    if (b.mode !== "selling") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["breakdown", "mode"],
            message: 'POST /api/pricing/breakdown prices a SALE: breakdown.mode must be "selling"' });
    }
    if (feeNull !== (b.feePosition.feeBasis === "not_set")) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["breakdown", "feePosition", "feeBasis"],
            message: feeNull
                ? 'ebayFee is null, so breakdown.feePosition.feeBasis must be "not_set"'
                : 'ebayFee is a number, so breakdown.feePosition.feeBasis cannot be "not_set"' });
    }
    const feeLine = b.lines.find((l) => l.key === "ebay_fee");
    if (feeLine) {
        // (A null/known disagreement between the flat fee and the fee line is already refused: by the
        // reason check below, and by feeBasis above.)
        if (feeLine.amountGbp !== null && r.ebayFee !== null && Math.abs(-feeLine.amountGbp - r.ebayFee) > 0.005) {
            // The line is a deduction (negative); the flat field is the positive fee. Half a penny of
            // slack: the line is in whole pence, the flat figure may carry the unrounded fee.
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["breakdown"],
                message: `the ebay_fee line (${feeLine.amountGbp}) is not the negative of ebayFee (${r.ebayFee})` });
        }
        if (feeNull && feeLine.unknownReason !== r.feeNotSetReason) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["breakdown"],
                message: `the ebay_fee line's unknownReason (${feeLine.unknownReason ?? "null"}) is not feeNotSetReason (${r.feeNotSetReason ?? "null"}): one fact, reported once` });
        }
    }
    // (A receipt beside a null fee is already refused by PricedBreakdown itself: an unset fee
    // position withholds the mode's total, and feeBasis must be "not_set" here, checked above.)
});
