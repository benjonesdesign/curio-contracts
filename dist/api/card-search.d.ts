import { z } from "zod";
export declare const CardSearchRequestSchema: z.ZodObject<{
    q: z.ZodString;
    game: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    q: string;
    game?: string | undefined;
}, {
    q: string;
    game?: string | undefined;
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
    /** Printing-collapse: this row is one card; the server nests each printing here so the list
     * isn't a dozen near-duplicate rows. */
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
        /** Printing-collapse: this row is one card; the server nests each printing here so the list
         * isn't a dozen near-duplicate rows. */
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
}>;
export type CardSearchResponse = z.infer<typeof CardSearchResponseSchema>;
