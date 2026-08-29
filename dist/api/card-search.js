// Contract for POST /api/card-search (pokemon-tool) — cross-game typeahead search, the mobile
// "look up a card" sourcing tool. This is the route iOS's hand-mirrored `CardSearchResult` decoder
// (SupabaseService.swift) duplicated — retired in favour of this contract. See
// pokemon-tool's app/api/card-search/route.ts.
import { z } from "zod";
export const CardSearchRequestSchema = z.object({
    q: z.string(),
    game: z.string().optional(),
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
    /** Printing-collapse: this row is one card; the server nests each printing here so the list
     * isn't a dozen near-duplicate rows. */
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
});
