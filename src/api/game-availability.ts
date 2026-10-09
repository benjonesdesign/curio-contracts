// Game availability: GET /api/games and the 422 refusals of the beta game gate (v0.2.0).
//
// Source: Ben's ruling 8 (PLAN-POKEMON-ONLY-BETA-GATE #228, built in pokemon-tool #246): Pokémon
// only at beta; Japanese is "coming"; existing Magic and Yu-Gi-Oh! copies stay visible and editable
// but are not priced and not listed. #246 defined every shape below route-local and said
// "move to @curio/contracts at the next minor"; v0.2.0 is that carrier.
//
// ⚠️ THE SHAPE FOLLOWS #228/#246, NOT THE BRIEF'S SHORTHAND. The task description said
// "id, name, enabled". The plan and the PR both say `{ game, displayName, availability }` with
// `availability: "available" | "coming"`, and the contract matches them: an `enabled` boolean
// cannot say "coming" (a state the UI labels) as distinct from "off", and an unrecognised future
// game must read as "coming" (ADR 0027's fail-closed case) which a closed enum can say and a
// boolean cannot. If Ben wants `id`/`name`/`enabled`, that is a rename in the web route and here.
//
// Not carried: `PLAN-POKEMON-ONLY-BETA-GATE` §6's per-seller choice (B3/H13 are undrawn). Every
// client renders the list from this response, never from its own array of eight games.
import { z } from "zod";
import { GameIdSchema } from "./common.js";

/** `available` is live; `coming` is shown, labelled "Coming", and cannot be chosen or priced.
 *  Open (ADR 0027): a client reads an unrecognised value as `coming`. */
export const GameAvailabilitySchema = z.enum(["available", "coming"]);
export type GameAvailability = z.infer<typeof GameAvailabilitySchema>;

export const GameInfoSchema = z.object({
  game: GameIdSchema,
  /** The name to show ("Pokémon", "Yu-Gi-Oh!"). From the server, so a ninth game needs no release. */
  displayName: z.string(),
  availability: GameAvailabilitySchema,
});
export type GameInfo = z.infer<typeof GameInfoSchema>;

/** GET /api/games (signed in). One row per game the server knows. */
export const GamesResponseSchema = z.object({
  games: z.array(GameInfoSchema),
});
export type GamesResponse = z.infer<typeof GamesResponseSchema>;

/**
 * Which surface refused.
 *  - `game_coming`        422 — acquiring or pricing a card of a game that is not live: identify,
 *                         quick-scan, card-value, log-buy, capture-commit, validate-identity,
 *                         price, decide, recommend, reprice.
 *  - `game_not_available` 422 — LISTING a copy of a game that is not live: ebay-publish,
 *                         ebay-draft, channel-listing. (The same fact, per card, is the
 *                         `game_not_available` ListingRefusalReason in a preview/bulk list.)
 */
export const GameRefusalCodeSchema = z.enum(["game_coming", "game_not_available"]);
export type GameRefusalCode = z.infer<typeof GameRefusalCodeSchema>;

/**
 * The 422 body: `{ error, code, game, displayName, availability: "coming" }`, all strings.
 * `game` is null for an id this build does not know (never coerced to Pokémon: an ABSENT game is
 * Pokémon for old clients, an UNRECOGNISED one is not). `availability` is always `coming` — a
 * refusal for an available game would be a contradiction, enforced below (server-side guard).
 */
export const GameRefusalSchema = z.object({
  error: z.string(),
  code: GameRefusalCodeSchema,
  game: GameIdSchema.nullable(),
  displayName: z.string(),
  availability: GameAvailabilitySchema,
}).superRefine((r, ctx) => {
  if (r.availability !== "coming") {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["availability"],
      message: 'a game refusal is always availability "coming": a game that is available is not refused' });
  }
});
export type GameRefusal = z.infer<typeof GameRefusalSchema>;

/**
 * Additive field on the identify "ambiguous" arm when the card is of a game that is coming:
 * `candidates` is empty and this names the game, so a newer client says "Magic: The Gathering is
 * coming" and an older one renders "not recognised". `game` is a plain string, not `GameId`:
 * the route sends "unknown" for an id it does not recognise.
 */
export const UnavailableGameSchema = z.object({
  game: z.string(),
  displayName: z.string(),
  availability: GameAvailabilitySchema,
});
export type UnavailableGame = z.infer<typeof UnavailableGameSchema>;
