// MUTATION-CHECKED 2026-10-08 (v0.2.0 game availability): see CHANGELOG "Mutation check, round 2".

import { describe, it, expect } from "vitest";
import {
  GamesResponseSchema, GameRefusalSchema, GameRefusalCodeSchema, GameAvailabilitySchema, UnavailableGameSchema,
} from "./game-availability.js";
import { GameIdSchema } from "./common.js";

describe("GET /api/games (v0.2.0)", () => {
  const POKEMON_ONLY = {
    games: [
      { game: "pokemon", displayName: "Pokémon", availability: "available" },
      { game: "pokemon-jp", displayName: "Pokémon (Japanese)", availability: "coming" },
      { game: "mtg", displayName: "Magic: The Gathering", availability: "coming" },
    ],
  };

  it("parses the beta list: Pokémon available, everything else coming", () => {
    const r = GamesResponseSchema.parse(POKEMON_ONLY);
    expect(r.games.filter((g) => g.availability === "available").map((g) => g.game)).toEqual(["pokemon"]);
  });

  it("says COMING, not off: availability is a two-value closed enum, not a boolean", () => {
    expect([...GameAvailabilitySchema.options]).toEqual(["available", "coming"]);
    expect(GamesResponseSchema.safeParse({ games: [{ game: "pokemon", displayName: "Pokémon", enabled: true }] }).success).toBe(false);
  });

  it("types `game` as the shared GameId, so a ninth game is a forward-compat decode, not a free-form string", () => {
    expect(GamesResponseSchema.safeParse({ games: [{ game: "riftbound", displayName: "Riftbound", availability: "coming" }] }).success).toBe(false);
    for (const g of GameIdSchema.options) {
      expect(GamesResponseSchema.safeParse({ games: [{ game: g, displayName: g, availability: "coming" }] }).success, g).toBe(true);
    }
  });

  it("accepts an empty list (a fail-closed server with nothing readable still answers)", () => {
    expect(GamesResponseSchema.safeParse({ games: [] }).success).toBe(true);
  });
});

describe("the 422 game refusal (v0.2.0)", () => {
  const coming = (over: Record<string, unknown> = {}) => ({
    error: "Pricing for Yu-Gi-Oh! is coming.", code: "game_coming", game: "yugioh", displayName: "Yu-Gi-Oh!", availability: "coming", ...over,
  });

  it("has exactly the two codes #246 returns: game_coming (acquire, price) and game_not_available (list)", () => {
    expect([...GameRefusalCodeSchema.options]).toEqual(["game_coming", "game_not_available"]);
  });

  it("parses both, with a named game and with an unrecognised one (null, never coerced to Pokémon)", () => {
    expect(GameRefusalSchema.safeParse(coming()).success).toBe(true);
    expect(GameRefusalSchema.safeParse(coming({ code: "game_not_available", error: "Magic isn't available to list yet.", game: "mtg" })).success).toBe(true);
    expect(GameRefusalSchema.safeParse(coming({ game: null, displayName: "This game" })).success).toBe(true);
  });

  it("is ALWAYS availability coming: refusing an available game would be a contradiction", () => {
    expect(GameRefusalSchema.safeParse(coming({ availability: "available" })).success).toBe(false);
  });

  it("requires every field, all strings: `error` is a sentence, not an object", () => {
    for (const k of ["error", "code", "game", "displayName", "availability"]) {
      const { [k]: _omitted, ...rest } = coming() as Record<string, unknown>;
      expect(GameRefusalSchema.safeParse(rest).success, k).toBe(false);
    }
    expect(GameRefusalSchema.safeParse(coming({ error: { message: "x" } })).success).toBe(false);
  });

  it("REJECTS a code other than the two: not the listing family's codes", () => {
    expect(GameRefusalSchema.safeParse(coming({ code: "card_not_listable" })).success).toBe(false);
  });
});

describe("UnavailableGame on the identify ambiguous arm", () => {
  it("takes a plain string for `game` (the route sends \"unknown\" for an unrecognised id)", () => {
    expect(UnavailableGameSchema.safeParse({ game: "unknown", displayName: "This game", availability: "coming" }).success).toBe(true);
  });
});
