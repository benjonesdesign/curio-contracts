import { z } from "zod";
export declare const InspectionDepthHintRequestSchema: z.ZodObject<{
    name: z.ZodString;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    tcgId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    tcgId?: string | null | undefined;
}, {
    name: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    tcgId?: string | null | undefined;
}>;
export type InspectionDepthHintRequest = z.infer<typeof InspectionDepthHintRequestSchema>;
export declare const InspectionDepthTierSchema: z.ZodEnum<["minimal", "standard", "thorough"]>;
export type InspectionDepthTier = z.infer<typeof InspectionDepthTierSchema>;
export declare const InspectionDepthHintResponseSchema: z.ZodObject<{
    depthTier: z.ZodEnum<["minimal", "standard", "thorough"]>;
    /** Human-readable "why" a caller can show alongside the prompt — see iOS ticket D's "render
     * the depth prompt + rationale" requirement. */
    rationale: z.ZodString;
    /** How much to trust this hint — "low" today (see file doc comment: policy is a stub). */
    confidence: z.ZodEnum<["high", "medium", "low"]>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    depthTier: "minimal" | "standard" | "thorough";
    rationale: string;
}, {
    confidence: "high" | "medium" | "low";
    depthTier: "minimal" | "standard" | "thorough";
    rationale: string;
}>;
export type InspectionDepthHintResponse = z.infer<typeof InspectionDepthHintResponseSchema>;
