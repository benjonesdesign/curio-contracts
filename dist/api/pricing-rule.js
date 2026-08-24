// Contract for the pricing-rule CRUD endpoints (pokemon-tool) — WORK-BACKLOG.md Packet 6 (bulk
// actions + templates/pricing-rule authoring). T3 web owns authoring; iOS only *applies* a saved
// rule to a card + per-card override (decisions/0011), which is why this shape lives here rather
// than staying pokemon-tool-local — iOS's apply UI reads the same PricingRule shape.
//
// Scope fields (`scopeGame`/`scopeSet`/`scopeCondition`) use the same "empty array = matches
// everything" convention pokemon-tool's Inventory facet-filter system already uses for its own
// scoping (an empty selection means unscoped, not zero matches) — one mental model for "does this
// rule apply to this card" across both scoping systems, even though they're unrelated features.
import { z } from "zod";
export const PricingRuleRoundingSchema = z.enum([
    "none", "nearest_10p", "nearest_50p", "nearest_pound", "charm_99",
]);
export const PricingRuleSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    active: z.boolean(),
    scopeGame: z.array(z.string()),
    scopeSet: z.array(z.string()),
    scopeCondition: z.array(z.string()),
    /** Multiplier applied to the base price before rounding, keyed by condition string (e.g. "NM":
     * 1, "LP": 0.85). A condition absent from this map is treated as multiplier 1 (no change), not
     * an error — sellers aren't required to enumerate every condition they might ever see. */
    conditionMultipliers: z.record(z.string(), z.number()),
    rounding: PricingRuleRoundingSchema,
    /** Clamp applied after the multiplier, before rounding. Either bound may be null (no floor/ceiling). */
    minPriceGbp: z.number().nullable(),
    maxPriceGbp: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
// Create/update bodies omit server-assigned fields (id/createdAt/updatedAt) and make `active`
// optional (defaults true server-side) so a minimal create call doesn't need to restate it.
export const PricingRuleInputSchema = PricingRuleSchema.omit({
    id: true, createdAt: true, updatedAt: true,
}).partial({ active: true });
export const PricingRuleListResponseSchema = z.object({
    rules: z.array(PricingRuleSchema),
});
