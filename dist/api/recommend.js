// Contract for POST /api/recommend (pokemon-tool) — the route-recommendation engine behind the
// web "Decide" step and the iOS Decisions card. See curio-shared/canon/specs/recommendation.md
// and pokemon-tool's app/api/recommend/route.ts + lib/types.ts (RouteRecommendation family).
import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
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
const RouteEconomicsSchema = z.object({
    expected_sale_gbp: z.number().nullable(),
    fees_gbp: z.number().nullable(),
    postage_gbp: z.number().nullable(),
    cost_basis_gbp: z.number().nullable(),
    expected_net_gbp: z.number().nullable(),
    liquidity: z.enum(["high", "medium", "low"]).nullable(),
});
const RouteAlternativeSchema = z.object({
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
