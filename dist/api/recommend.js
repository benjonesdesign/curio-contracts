// Contract for POST /api/recommend (pokemon-tool) — the route-recommendation engine behind the
// web "Decide"/"Review & list" steps and the iOS Decisions card. See
// curio-shared/canon/specs/recommendation.md and pokemon-tool's app/api/recommend/route.ts +
// lib/types.ts (RouteRecommendation family).
import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
// ── Single card (an already-saved physical_cards row) ───────────────────────────────────────
export const RecommendRequestSchema = z.object({
    physicalCardId: z.string(),
    /** Explicit override; otherwise derived server-side from the card's set name. */
    isVintage: z.boolean().optional(),
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
export const RouteEconomicsSchema = z.object({
    expected_sale_gbp: z.number().nullable(),
    fees_gbp: z.number().nullable(),
    postage_gbp: z.number().nullable(),
    cost_basis_gbp: z.number().nullable(),
    expected_net_gbp: z.number().nullable(),
    liquidity: z.enum(["high", "medium", "low"]).nullable(),
});
export const RouteAlternativeSchema = z.object({
    route: RecommendedRouteSchema,
    expected_net_gbp: z.number().nullable(),
    why: z.string(),
});
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
});
export const RecommendBatchResponseSchema = z.object({
    results: z.array(RecommendBatchResultSchema),
});
