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
export type Confidence = z.infer<typeof ConfidenceSchema>;
