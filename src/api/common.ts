import { z } from "zod";

/** Shared by every route's failure path — `NextResponse.json({ error }, { status })`. Not
 * validated against a route's success schema; callers check for this shape first. */
export const ApiErrorSchema = z.object({
  error: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

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
export type GameId = z.infer<typeof GameIdSchema>;

export const ConditionSchema = z.enum(["NM", "LP", "MP", "HP", "DMG", "Graded"]);
export type Condition = z.infer<typeof ConditionSchema>;

export const ConfidenceSchema = z.enum(["high", "medium", "low"]);
/** How readily a card sells, from comparable-sale volume. Shared by /api/recommend's economics and
 *  /api/decide — one concept, so one type. Declared inline in both before 2026-08-28, which
 *  generated a `Liquidity` and a `Liquidity2` on every client for the same three values. */
export const LiquiditySchema = z.enum(["high", "medium", "low"]);
export type Liquidity = z.infer<typeof LiquiditySchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
