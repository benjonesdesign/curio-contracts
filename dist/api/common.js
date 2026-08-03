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
