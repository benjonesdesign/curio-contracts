// Contract for POST /api/recommend (pokemon-tool) — the route-recommendation engine behind the
// web "Decide"/"Review & list" steps and the iOS Decisions card. See
// curio-shared/canon/specs/recommendation.md and pokemon-tool's app/api/recommend/route.ts +
// lib/types.ts (RouteRecommendation family).
import { z } from "zod";
import { ConfidenceSchema, LiquiditySchema } from "./common.js";
// The seller's own pricing preferences (fee/cost/tax/margin assumptions the recommendation
// engine's economics are computed against) — mirrors pokemon-tool's lib/pricing.ts
// PricingSettings verbatim. Optional everywhere it's used: omitting it means the engine's own
// DEFAULT_SETTINGS apply, exactly as before this field existed (W3, STRATEGIC-ROADMAP.md §6.4
// "seller preference profile" — wiring the account's real settings into recommend, previously a
// dead field on the engine's own Inputs type that no caller ever populated).
export const PricingSettingsSchema = z.object({
    ebayFeeRate: z.number(),
    ebayFeeFixed: z.number(),
    packagingCost: z.number(),
    shippingCost: z.number(),
    taxRate: z.number(),
    minProfitPct: z.number(),
    minSaleValue: z.number(),
    postageCost: z.number(),
});
// ── Single card (an already-saved physical_cards row) ───────────────────────────────────────
export const RecommendRequestSchema = z.object({
    physicalCardId: z.string(),
    /** Explicit override; otherwise derived server-side from the card's set name. */
    isVintage: z.boolean().optional(),
    pricingSettings: PricingSettingsSchema.optional(),
});
export const RecommendedRouteSchema = z.enum([
    "list_single",
    "bundle",
    "bulk",
    "hold",
    "grade_review",
    "restoration_review",
    "do_not_list",
]);
/**
 * ⚠️ SUPERSEDED by `DecisionEconomics` in `./decide.ts`. Retiring — see the mapping below.
 *
 * DECIDED 2026-08-29, because "two shapes for one concept" must not persist by default. This shape
 * and `DecisionEconomics` describe the same money with different names and a different case
 * convention, and a client mapping between two near-identical money shapes is exactly where a
 * transposition bug hides. So the mapping lives HERE, once, rather than being re-derived by each
 * client:
 *
 * | RouteEconomics (legacy)  | DecisionEconomics (successor) |
 * |--------------------------|-------------------------------|
 * | `expected_sale_gbp`      | `marketValueGbp`              |
 * | `fees_gbp`               | `feeGbp`                      |
 * | `postage_gbp`            | `postageGbp`                  |
 * | `cost_basis_gbp`         | `costBasisGbp`                |
 * | `expected_net_gbp`       | `expectedNetGbp`              |
 * | `liquidity`              | `Decision.liquidity` (moved up a level) |
 * | —                        | `packagingGbp` (new)          |
 * | —                        | `taxProvisionGbp` (new)       |
 *
 * NOT renamed in place, deliberately: `/api/recommend` is shipped with two web callers
 * (`app/add/multiple/ReviewListStep.tsx`, `app/inventory/[id]/page.tsx`) and five on iOS, and
 * renaming a shape that is being retired is churn that breaks seven call sites to reach the same
 * end state.
 *
 * RETIREMENT CONDITION, so this is a decision and not a hope: `/api/recommend` goes when its
 * callers move to `/api/decide`, and the one thing blocking that is that **`/api/decide` has no
 * BATCH mode** — `ReviewListStep` prices a whole capture at once. Build that, migrate the callers,
 * delete this. `explanation` retires with it; reason codes plus `@curio/copy` already replace it.
 */
export const RouteEconomicsSchema = z.object({
    expected_sale_gbp: z.number().nullable(),
    fees_gbp: z.number().nullable(),
    postage_gbp: z.number().nullable(),
    cost_basis_gbp: z.number().nullable(),
    expected_net_gbp: z.number().nullable(),
    liquidity: LiquiditySchema.nullable(),
});
export const RouteAlternativeSchema = z.object({
    route: RecommendedRouteSchema,
    expected_net_gbp: z.number().nullable(),
    why: z.string(),
});
// The market value's own provenance — distinct from `confidence` above, which is the engine's
// confidence in the *route* decision. A UK-realised value (`priceSource: "ebay-uk-sold"`) needs
// no caveat; a US/EU reference value carries `currencyNote` so a seller can see why to double-check
// it. See WORK-BACKLOG.md Packet 1 and pokemon-tool's lib/price-confidence.ts (the one place this
// is computed — never re-derived per platform).
// Whether-to-grade EV — only populated when route === "grade_review" and a PSA-10/9 value could
// be resolved (live graded-asking comp or the era-multiple fallback). See WORK-BACKLOG.md Packet
// 7 and decisions/0013-graded-price-data.md. `gradeEVConfidence` is confidence in the EV *call*
// itself — distinct from `confidence` above (the route decision) and `priceConfidence` below (the
// raw market value) — and is deliberately capped at "medium": P10/P9 are coarse era-band
// estimates (GRADING-RULESET.md), never per-card data, so this can never read as "high". It drops
// to "low" whenever either PSA-10 or PSA-9 leg came from the era-multiple fallback rather than a
// real graded-asking comp — never let a fallback-derived EV imply the same confidence as a real
// comp (asking ≠ sold, and a comp is still not a sold price).
export const GradeEVConfidenceSchema = z.enum(["medium", "low"]);
export const RecommendResponseSchema = z.object({
    route: RecommendedRouteSchema,
    alternatives: z.array(RouteAlternativeSchema),
    economics: RouteEconomicsSchema,
    assumptions: z.array(z.string()),
    explanation: z.string(),
    confidence: ConfidenceSchema,
    calculation_version: z.string(),
    physicalCardId: z.string(),
    currentRoute: RecommendedRouteSchema.nullable(),
    priceSource: z.string().nullable(),
    priceConfidence: ConfidenceSchema.nullable(),
    currencyNote: z.string().nullable(),
    gradeEV: z.number().nullable(),
    psa10PriceGbp: z.number().nullable(),
    p10: z.number().nullable(),
    p9: z.number().nullable(),
    gradingCostGbp: z.number().nullable(),
    rawNetGbp: z.number().nullable(),
    gradeEVConfidence: GradeEVConfidenceSchema.nullable(),
});
// ── Batch (pre-save cards — the add/multiple review flow) ───────────────────────────────────
//
// A batch card hasn't been written to physical_cards yet, so there's no physicalCardId to key
// a lookup on — the caller sends the pricing/condition data it already has (identical shape to
// what the client used to hand straight to computeRecommendation) and gets back a real,
// server-computed recommendation using the account's actual sellerType. This is the same engine
// and the same per-account sellerType lookup as the single-card path above — just batched, and
// without requiring a save first. See decisions/0012-cross-platform-delivery-model.md
// ("contract-first... one source of the number") and decisions/0011 §"decision-first" pattern.
export const RecommendBatchCardInputSchema = z.object({
    /** Caller-assigned id (e.g. the client-side listing id) — echoed back to match results up. */
    id: z.string(),
    avgGbp: z.number().nullable(),
    lowGbp: z.number().nullable(),
    topGbp: z.number().nullable(),
    priceSource: z.string().nullable(),
    saleCount: z.number().int().nullable(),
    approxSaleCount: z.boolean().nullable(),
    condition: z.string().nullable(),
    costBasis: z.number().nullable(),
    collectionType: z.enum(["personal", "resale"]).nullable(),
    isVintage: z.boolean().optional(),
});
export const RecommendBatchRequestSchema = z.object({
    cards: z.array(RecommendBatchCardInputSchema).min(1).max(200),
    /** One seller's settings apply to the whole batch — not per-card, it's an account-wide
     *  preference, not something that varies card-to-card within one review session. */
    pricingSettings: PricingSettingsSchema.optional(),
});
export const RecommendBatchResultSchema = z.object({
    id: z.string(),
    /** Null only when the input card has no pricing yet (avgGbp was null) — matches
     * computeRecommendation's own null-on-no-data contract, per card instead of per request. */
    route: RecommendedRouteSchema.nullable(),
    alternatives: z.array(RouteAlternativeSchema),
    economics: RouteEconomicsSchema.nullable(),
    assumptions: z.array(z.string()),
    explanation: z.string().nullable(),
    confidence: ConfidenceSchema.nullable(),
    calculation_version: z.string().nullable(),
    priceSource: z.string().nullable(),
    priceConfidence: ConfidenceSchema.nullable(),
    currencyNote: z.string().nullable(),
});
export const RecommendBatchResponseSchema = z.object({
    results: z.array(RecommendBatchResultSchema),
});
