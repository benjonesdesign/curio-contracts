import { z } from "zod";
/** Shared by every route's failure path — `NextResponse.json({ error }, { status })`. Not
 * validated against a route's success schema; callers check for this shape first. */
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
}, {
    error: string;
}>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export declare const GameIdSchema: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
export type GameId = z.infer<typeof GameIdSchema>;
export declare const ConditionSchema: z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>;
export type Condition = z.infer<typeof ConditionSchema>;
export declare const ConfidenceSchema: z.ZodEnum<["high", "medium", "low"]>;
/** How readily a card sells, from comparable-sale volume. Shared by /api/recommend's economics and
 *  /api/decide — one concept, so one type. Declared inline in both before 2026-08-28, which
 *  generated a `Liquidity` and a `Liquidity2` on every client for the same three values. */
export declare const LiquiditySchema: z.ZodEnum<["high", "medium", "low"]>;
export type Liquidity = z.infer<typeof LiquiditySchema>;
/**
 * Why a decision could not be produced. THREE distinct meanings, never one null.
 *
 * "We couldn't identify this card", "we know the card but have no price for it" and "the pricing
 * path is unavailable" are a normal result, a normal result, and an OUTAGE. A client must render
 * the third differently, and we must be able to tell which is happening in production — an
 * anonymous scan once returned `decision: null` for every card tried and diagnosing it required
 * guessing.
 *
 * ⚠️ DECLARED ONCE, HERE, AND REFERENCED EVERYWHERE. It was previously written inline in both
 * QuickScanResponseSchema and DecideBatchResultSchema, and the emitters cannot know two structurally
 * identical inline enums are the same type — so Kotlin got `DecisionUnavailable` AND
 * `DecisionUnavailable2`, `QuickScanResponse.getDecisionUnavailable()` returned the `2` variant, and
 * Android's code written against the plain name stopped compiling.
 *
 * That is the SECOND time: v0.1.29 fixed `Liquidity`/`Liquidity2` by hoisting it to this file, and
 * because only the instance was fixed and not the rule, the next inline declaration recreated it.
 * The rule is now in decisions/0024 and enforced by a test that fails on any generated type name
 * ending in a digit.
 */
export declare const DecisionUnavailableSchema: z.ZodEnum<["identity_unresolved", "no_market_value", "pricing_unavailable"]>;
export type DecisionUnavailable = z.infer<typeof DecisionUnavailableSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
