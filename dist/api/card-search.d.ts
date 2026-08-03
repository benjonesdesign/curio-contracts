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
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
    }, {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    number: string | null;
    game: string | null;
    name: string;
    rarity: string | null;
    gameDisplayName: string | null;
    setName: string | null;
    tcgId: string;
    image: string | null;
    marketGbp: number | null;
    printingCount: number | null;
    printings: {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
    }[] | null;
}, {
    number: string | null;
    game: string | null;
    name: string;
    rarity: string | null;
    gameDisplayName: string | null;
    setName: string | null;
    tcgId: string;
    image: string | null;
    marketGbp: number | null;
    printingCount: number | null;
    printings: {
        number: string | null;
        rarity: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
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
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }, {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        gameDisplayName: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }[] | null;
    }, {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        gameDisplayName: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }[] | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    results: {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        gameDisplayName: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }[] | null;
    }[];
}, {
    results: {
        number: string | null;
        game: string | null;
        name: string;
        rarity: string | null;
        gameDisplayName: string | null;
        setName: string | null;
        tcgId: string;
        image: string | null;
        marketGbp: number | null;
        printingCount: number | null;
        printings: {
            number: string | null;
            rarity: string | null;
            setName: string | null;
            tcgId: string;
            image: string | null;
            marketGbp: number | null;
        }[] | null;
    }[];
}>;
export type CardSearchResponse = z.infer<typeof CardSearchResponseSchema>;
