import { z } from "zod";
export declare const CardSearchRequestSchema: z.ZodObject<{
    q: z.ZodString;
    game: z.ZodOptional<z.ZodString>;
    /**
     * Narrow to one set — the set filter (search-ux.md §P1 "The wall").
     *
     * The set is the DIFFERENTIATOR for a card search: the seller is holding the card and can read
     * the set off it, so they already know the answer and only need to find the row. Matched
     * case-insensitively against the result's `setName`.
     */
    setName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q: string;
    game?: string | undefined;
    setName?: string | undefined;
}, {
    q: string;
    game?: string | undefined;
    setName?: string | undefined;
}>;
export type CardSearchRequest = z.infer<typeof CardSearchRequestSchema>;
export declare const CardSearchResultSchema: z.ZodObject<{
    tcgId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    number: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    image: z.ZodNullable<z.ZodString>;
    marketGbp: z.ZodNullable<z.ZodNumber>;
    /** Multi-TCG: which game this hit belongs to + its display name (cross-game search). */
    game: z.ZodNullable<z.ZodString>;
    gameDisplayName: z.ZodNullable<z.ZodString>;
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
    printingCount: z.ZodNullable<z.ZodNumber>;
    printings: z.ZodNullable<z.ZodArray<z.ZodObject<{
        tcgId: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        number: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        image: z.ZodNullable<z.ZodString>;
        marketGbp: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        tcgId: string;
        marketGbp: number | null;
    }, {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        tcgId: string;
        marketGbp: number | null;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    number: string | null;
    game: string | null;
    name: string;
    rarity: string | null;
    setName: string | null;
    image: string | null;
    gameDisplayName: string | null;
    tcgId: string;
    marketGbp: number | null;
    printingCount: number | null;
    printings: {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        tcgId: string;
        marketGbp: number | null;
    }[] | null;
}, {
    number: string | null;
    game: string | null;
    name: string;
    rarity: string | null;
    setName: string | null;
    image: string | null;
    gameDisplayName: string | null;
    tcgId: string;
    marketGbp: number | null;
    printingCount: number | null;
    printings: {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        tcgId: string;
        marketGbp: number | null;
    }[] | null;
}>;
export type CardSearchResult = z.infer<typeof CardSearchResultSchema>;
export declare const CardSearchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        tcgId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        number: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        image: z.ZodNullable<z.ZodString>;
        marketGbp: z.ZodNullable<z.ZodNumber>;
        /** Multi-TCG: which game this hit belongs to + its display name (cross-game search). */
        game: z.ZodNullable<z.ZodString>;
        gameDisplayName: z.ZodNullable<z.ZodString>;
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
        printingCount: z.ZodNullable<z.ZodNumber>;
        printings: z.ZodNullable<z.ZodArray<z.ZodObject<{
            tcgId: z.ZodString;
            setName: z.ZodNullable<z.ZodString>;
            number: z.ZodNullable<z.ZodString>;
            rarity: z.ZodNullable<z.ZodString>;
            image: z.ZodNullable<z.ZodString>;
            marketGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }, {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        gameDisplayName: string | null;
        tcgId: string;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }[] | null;
    }, {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        gameDisplayName: string | null;
        tcgId: string;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }[] | null;
    }>, "many">;
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
    cataloguesUnavailable: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /**
     * Every distinct set present in the results BEFORE `setName` narrowed them, most-hit first.
     *
     * The set filter's options, so a client can offer it without a second round trip — and so the
     * filter can be offered at all, since a seller cannot pick from a list they can't see. Returned
     * even when `setName` was supplied, so the control keeps its full option list after a choice.
     */
    setsPresent: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    /**
     * True when a `marketGbp: null` on this page may be an OUTAGE rather than a card we genuinely
     * have no price for. A dash means two different things and this is how a client tells them apart.
     *
     * Set when either half of pricing failed:
     *   • a catalogue provider flapped, so the row came from our own `catalogue_cards` — which
     *     carries IDENTITY and has no price column at all; or
     *   • the FX rate could not be fetched, which nulls every non-GBP price on the page at once.
     *
     * ⚠️ A client MUST NOT render a bare dash when this is true. iOS observed the symptom before the
     * field existed: a card priced at 09:22 and dashed at 09:24 on the same query, with the response
     * looking complete both times. Say "price unavailable right now", not nothing.
     */
    pricesUnavailable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    results: {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        gameDisplayName: string | null;
        tcgId: string;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }[] | null;
    }[];
    cataloguesUnavailable: string[];
    setsPresent: string[];
    pricesUnavailable: boolean;
}, {
    results: {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        setName: string | null;
        image: string | null;
        gameDisplayName: string | null;
        tcgId: string;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            image: string | null;
            tcgId: string;
            marketGbp: number | null;
        }[] | null;
    }[];
    cataloguesUnavailable?: string[] | undefined;
    setsPresent?: string[] | undefined;
    pricesUnavailable?: boolean | undefined;
}>;
export type CardSearchResponse = z.infer<typeof CardSearchResponseSchema>;
