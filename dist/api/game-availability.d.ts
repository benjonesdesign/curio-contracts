import { z } from "zod";
/** `available` is live; `coming` is shown, labelled "Coming", and cannot be chosen or priced.
 *  Open (ADR 0027): a client reads an unrecognised value as `coming`. */
export declare const GameAvailabilitySchema: z.ZodEnum<["available", "coming"]>;
export type GameAvailability = z.infer<typeof GameAvailabilitySchema>;
export declare const GameInfoSchema: z.ZodObject<{
    game: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
    /** The name to show ("Pokémon", "Yu-Gi-Oh!"). From the server, so a ninth game needs no release. */
    displayName: z.ZodString;
    availability: z.ZodEnum<["available", "coming"]>;
}, "strip", z.ZodTypeAny, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    displayName: string;
    availability: "available" | "coming";
}, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    displayName: string;
    availability: "available" | "coming";
}>;
export type GameInfo = z.infer<typeof GameInfoSchema>;
/** GET /api/games (signed in). One row per game the server knows. */
export declare const GamesResponseSchema: z.ZodObject<{
    games: z.ZodArray<z.ZodObject<{
        game: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
        /** The name to show ("Pokémon", "Yu-Gi-Oh!"). From the server, so a ninth game needs no release. */
        displayName: z.ZodString;
        availability: z.ZodEnum<["available", "coming"]>;
    }, "strip", z.ZodTypeAny, {
        game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
        displayName: string;
        availability: "available" | "coming";
    }, {
        game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
        displayName: string;
        availability: "available" | "coming";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    games: {
        game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
        displayName: string;
        availability: "available" | "coming";
    }[];
}, {
    games: {
        game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
        displayName: string;
        availability: "available" | "coming";
    }[];
}>;
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
export declare const GameRefusalCodeSchema: z.ZodEnum<["game_coming", "game_not_available"]>;
export type GameRefusalCode = z.infer<typeof GameRefusalCodeSchema>;
/**
 * The 422 body: `{ error, code, game, displayName, availability: "coming" }`, all strings.
 * `game` is null for an id this build does not know (never coerced to Pokémon: an ABSENT game is
 * Pokémon for old clients, an UNRECOGNISED one is not). `availability` is always `coming` — a
 * refusal for an available game would be a contradiction, enforced below (server-side guard).
 */
export declare const GameRefusalSchema: z.ZodEffects<z.ZodObject<{
    error: z.ZodString;
    code: z.ZodEnum<["game_coming", "game_not_available"]>;
    game: z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    displayName: z.ZodString;
    availability: z.ZodEnum<["available", "coming"]>;
}, "strip", z.ZodTypeAny, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null;
    error: string;
    code: "game_coming" | "game_not_available";
    displayName: string;
    availability: "available" | "coming";
}, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null;
    error: string;
    code: "game_coming" | "game_not_available";
    displayName: string;
    availability: "available" | "coming";
}>, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null;
    error: string;
    code: "game_coming" | "game_not_available";
    displayName: string;
    availability: "available" | "coming";
}, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null;
    error: string;
    code: "game_coming" | "game_not_available";
    displayName: string;
    availability: "available" | "coming";
}>;
export type GameRefusal = z.infer<typeof GameRefusalSchema>;
/**
 * Additive field on the identify "ambiguous" arm when the card is of a game that is coming:
 * `candidates` is empty and this names the game, so a newer client says "Magic: The Gathering is
 * coming" and an older one renders "not recognised". `game` is a plain string, not `GameId`:
 * the route sends "unknown" for an id it does not recognise.
 */
export declare const UnavailableGameSchema: z.ZodObject<{
    game: z.ZodString;
    displayName: z.ZodString;
    availability: z.ZodEnum<["available", "coming"]>;
}, "strip", z.ZodTypeAny, {
    game: string;
    displayName: string;
    availability: "available" | "coming";
}, {
    game: string;
    displayName: string;
    availability: "available" | "coming";
}>;
export type UnavailableGame = z.infer<typeof UnavailableGameSchema>;
