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
export type Confidence = z.infer<typeof ConfidenceSchema>;
