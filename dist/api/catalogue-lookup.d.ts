import { z } from "zod";
export declare const CatalogueLookupRequestSchema: z.ZodObject<{
    game: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
    name: z.ZodString;
    /** As printed, e.g. "4/102" — optional because a name-only lookup is still meaningful (lower
     * confidence tier), just never the highest-confidence exact tier. */
    collectorNumber: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    name: string;
    collectorNumber?: string | undefined;
}, {
    game: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion";
    name: string;
    collectorNumber?: string | undefined;
}>;
export type CatalogueLookupRequest = z.infer<typeof CatalogueLookupRequestSchema>;
export declare const CatalogueLookupMatchSchema: z.ZodObject<{
    nativeId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    language: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    language: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
}, {
    name: string;
    language: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
}>;
export type CatalogueLookupMatch = z.infer<typeof CatalogueLookupMatchSchema>;
export declare const CatalogueLookupResponseSchema: z.ZodObject<{
    match: z.ZodNullable<z.ZodObject<{
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        rarity: z.ZodNullable<z.ZodString>;
        language: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }, {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }>>;
    /** Null when there's no match at all. Mirrors the resolver's own tier confidence (high = number
     * + name both agree; medium = number+set or name-alone; low = fuzzy). A caller deciding whether
     * to skip the vision call should treat anything below "high" as NOT unambiguous. */
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low" | null;
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    } | null;
}, {
    confidence: "high" | "medium" | "low" | null;
    match: {
        name: string;
        language: string;
        rarity: string | null;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    } | null;
}>;
export type CatalogueLookupResponse = z.infer<typeof CatalogueLookupResponseSchema>;
