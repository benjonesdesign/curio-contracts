import { z } from "zod";
/** Shared by every route's failure path — `NextResponse.json({ error }, { status })`. Not
 * validated against a route's success schema; callers check for this shape first. */
export const ApiErrorSchema = z.object({
    error: z.string(),
});
export const GameIdSchema = z.enum([
    "pokemon",
    "pokemon-jp",
    "mtg",
    "yugioh",
    "lorcana",
    "one-piece",
    "digimon",
    "dbs-fusion",
]);
export const ConditionSchema = z.enum(["NM", "LP", "MP", "HP", "DMG", "Graded"]);
export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
/** How readily a card sells, from comparable-sale volume. Shared by /api/recommend's economics and
 *  /api/decide — one concept, so one type. Declared inline in both before 2026-08-28, which
 *  generated a `Liquidity` and a `Liquidity2` on every client for the same three values. */
export const LiquiditySchema = z.enum(["high", "medium", "low"]);
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
export const DecisionUnavailableSchema = z.enum([
    /** Identity did not resolve — nothing to price yet. Expected, not a fault. */
    "identity_unresolved",
    /** Card identified, but no market value is known for it. A real answer about a real card. */
    "no_market_value",
    /** The pricing path itself failed. An OUTAGE — never show this as "no data for this card". */
    "pricing_unavailable",
]);
