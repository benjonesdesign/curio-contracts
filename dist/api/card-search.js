// Contract for POST /api/card-search (pokemon-tool) — cross-game typeahead search, the mobile
// "look up a card" sourcing tool. This is the route iOS's hand-mirrored `CardSearchResult` decoder
// (SupabaseService.swift) duplicated — retired in favour of this contract. See
// pokemon-tool's app/api/card-search/route.ts.
import { z } from "zod";
export const CardSearchRequestSchema = z.object({
    q: z.string(),
    game: z.string().optional(),
    /**
     * Narrow to one set — the set filter (search-ux.md §P1 "The wall").
     *
     * The set is the DIFFERENTIATOR for a card search: the seller is holding the card and can read
     * the set off it, so they already know the answer and only need to find the row. Matched
     * case-insensitively against the result's `setName`.
     */
    setName: z.string().optional(),
});
const PrintingSchema = z.object({
    tcgId: z.string(),
    setName: z.string().nullable(),
    number: z.string().nullable(),
    rarity: z.string().nullable(),
    image: z.string().nullable(),
    marketGbp: z.number().nullable(),
});
export const CardSearchResultSchema = z.object({
    tcgId: z.string(),
    name: z.string(),
    setName: z.string().nullable(),
    number: z.string().nullable(),
    rarity: z.string().nullable(),
    image: z.string().nullable(),
    marketGbp: z.number().nullable(),
    /** Multi-TCG: which game this hit belongs to + its display name (cross-game search). */
    game: z.string().nullable(),
    gameDisplayName: z.string().nullable(),
    /**
     * Printings of THIS card — one card, in one set, at one number.
     *
     * ⚠️ Under canon a printing is one card in one set at one number, and holo / reverse-holo are
     * FINISHES on that row, not separate printings. That differs from TCGplayer's product grouping,
     * which splits each finish into its own product — do not reach for TCGplayer's model to justify
     * collapsing rows here.
     *
     * Almost always 1 today, and that is CORRECT rather than a bug: the axis that would legitimately
     * produce several printings of one card is finish, and `catalogue_cards.finishes` is empty on
     * every Pokémon row. Until something populates it, a card has one printing.
     *
     * Until 2026-08-29 the server grouped on `game::name` alone, so every Charizard in every set
     * collapsed into one row and the app reported "Charizard GX — 24 printings" for 24 DIFFERENT
     * cards at different prices.
     */
    printingCount: z.number().int().nullable(),
    printings: z.array(PrintingSchema).nullable(),
});
export const CardSearchResponseSchema = z.object({
    results: z.array(CardSearchResultSchema),
    /**
     * Which catalogues we COULD NOT REACH for this search — game ids, empty when every catalogue
     * answered.
     *
     * ⚠️ A response without this cannot tell "we looked and found nothing" apart from "we couldn't
     * look", and clients then render the second as the first. On 2026-08-29 pokemontcg.io 500ed for
     * hours, every provider call resolved to `[]` behind a timeout, the route returned 200 with an
     * empty list, and a seller standing in a shop was told Pikachu is not a card.
     *
     * This is the SECOND instance of that exact shape — `/api/quick-scan` returned
     * `value: { typical: null }` for both "no comps" and "the pricing service is down", which hid an
     * INTERNAL_SERVICE_KEY outage for a fortnight. Two instances is a pattern, so treat a nullable
     * or empty field that can mean two things as a defect on sight.
     *
     * A client MUST distinguish them: `results: [], cataloguesUnavailable: []` is a genuine no-match,
     * and `results: [], cataloguesUnavailable: ["pokemon"]` is an outage and must never be phrased as
     * "no cards found". A PARTIAL list matters too — results present alongside a non-empty
     * `cataloguesUnavailable` is an incomplete answer, not a complete one.
     */
    cataloguesUnavailable: z.array(z.string()).default([]),
    /**
     * Every distinct set present in the results BEFORE `setName` narrowed them, most-hit first.
     *
     * The set filter's options, so a client can offer it without a second round trip — and so the
     * filter can be offered at all, since a seller cannot pick from a list they can't see. Returned
     * even when `setName` was supplied, so the control keeps its full option list after a choice.
     */
    setsPresent: z.array(z.string()).default([]),
});
