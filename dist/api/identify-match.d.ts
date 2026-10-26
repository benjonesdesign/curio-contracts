import { z } from "zod";
export declare const IdentifyMatchRequestSchema: z.ZodObject<{
    /** A narrowing hint. Only Pokémon has an index to start; any other game answers `game_not_indexed`. Defaults to "pokemon". */
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    /** Base64 of ONE JPEG, the whole card cropped and upright. Keep it small (about 400 px on the long side is enough): over
     *  ~400 KB decoded is refused as `image_too_large`. No data-URL prefix. */
    image: z.ZodString;
    /** Optional text read on the device, used to NARROW the candidates before ranking when present. Never required. */
    setCode: z.ZodOptional<z.ZodString>;
    collectorNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    image: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    collectorNumber?: string | undefined;
    setCode?: string | undefined;
}, {
    image: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    collectorNumber?: string | undefined;
    setCode?: string | undefined;
}>;
export type IdentifyMatchRequest = z.infer<typeof IdentifyMatchRequestSchema>;
export declare const IdentifyMatchCandidateSchema: z.ZodObject<{
    /** The catalogue card, in the shape /api/catalogue-lookup already returns (nativeId, name, set, number, rarity, language, image). */
    match: z.ZodObject<{
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    }>;
    /** 0 to 1, higher is more alike. Comparable ONLY within one response: it is not a probability and not stable across index versions. */
    score: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    };
    score: number;
}, {
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        image?: string | null | undefined;
    };
    score: number;
}>;
export type IdentifyMatchCandidate = z.infer<typeof IdentifyMatchCandidateSchema>;
/** Why there are no candidates. Closed, forward-compatible (a client treats an unknown value as "no picture match"). */
export declare const IdentifyMatchUnavailableReasonSchema: z.ZodEnum<["index_not_ready", "game_not_indexed", "image_unreadable", "image_too_large", "no_match"]>;
export type IdentifyMatchUnavailableReason = z.infer<typeof IdentifyMatchUnavailableReasonSchema>;
export declare const IdentifyMatchResponseSchema: z.ZodEffects<z.ZodObject<{
    /** Best first, at most 5. Empty exactly when `unavailableReason` is set. */
    candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        /** The catalogue card, in the shape /api/catalogue-lookup already returns (nativeId, name, set, number, rarity, language, image). */
        match: z.ZodObject<{
            game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
            nativeId: z.ZodString;
            name: z.ZodString;
            setName: z.ZodNullable<z.ZodString>;
            cardNumber: z.ZodNullable<z.ZodString>;
            rarity: z.ZodNullable<z.ZodString>;
            language: z.ZodString;
            image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        }, {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        }>;
        /** 0 to 1, higher is more alike. Comparable ONLY within one response: it is not a probability and not stable across index versions. */
        score: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }, {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }>, "many">>;
    /** null when there are no candidates. "high" = one candidate stands clear of the rest (and agrees with `setCode` /
     *  `collectorNumber` when those were sent): a client may skip the AI call. Anything lower: show the candidates. */
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    /** True when the top candidates share the same artwork, so the picture cannot settle which printing or finish it is. */
    variantUndecided: z.ZodBoolean;
    unavailableReason: z.ZodNullable<z.ZodEnum<["index_not_ready", "game_not_indexed", "image_unreadable", "image_too_large", "no_match"]>>;
    /** Which index answered (for the scan trace and for comparing runs); null when none did. */
    indexVersion: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low" | null;
    candidates: {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }[];
    variantUndecided: boolean;
    unavailableReason: "index_not_ready" | "game_not_indexed" | "image_unreadable" | "image_too_large" | "no_match" | null;
    indexVersion: string | null;
}, {
    confidence: "high" | "medium" | "low" | null;
    variantUndecided: boolean;
    unavailableReason: "index_not_ready" | "game_not_indexed" | "image_unreadable" | "image_too_large" | "no_match" | null;
    indexVersion: string | null;
    candidates?: {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }[] | undefined;
}>, {
    confidence: "high" | "medium" | "low" | null;
    candidates: {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }[];
    variantUndecided: boolean;
    unavailableReason: "index_not_ready" | "game_not_indexed" | "image_unreadable" | "image_too_large" | "no_match" | null;
    indexVersion: string | null;
}, {
    confidence: "high" | "medium" | "low" | null;
    variantUndecided: boolean;
    unavailableReason: "index_not_ready" | "game_not_indexed" | "image_unreadable" | "image_too_large" | "no_match" | null;
    indexVersion: string | null;
    candidates?: {
        match: {
            name: string;
            language: string;
            rarity: string | null;
            setName: string | null;
            cardNumber: string | null;
            nativeId: string;
            game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
            image?: string | null | undefined;
        };
        score: number;
    }[] | undefined;
}>;
export type IdentifyMatchResponse = z.infer<typeof IdentifyMatchResponseSchema>;
