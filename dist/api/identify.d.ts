import { z } from "zod";
export declare const IdentifyRequestSchema: z.ZodObject<{
    /** Public URLs (Supabase Storage) — the original path. OpenAI fetches each URL itself before
     * inference, an extra network hop. */
    imageUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — an alternative to `imageUrls` that
     * skips that fetch hop entirely. WORK-BACKLOG.md Packet 9 (fast identify). Either `imageUrls` or
     * `inlineImages` must be present (validated in the route handler); a caller should not mix both
     * in one request. */
    inlineImages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    taxonomyAspects: z.ZodOptional<z.ZodArray<z.ZodObject<{
        localizedAspectName: z.ZodString;
        aspectConstraint: z.ZodOptional<z.ZodObject<{
            aspectMode: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            aspectMode?: string | undefined;
        }, {
            aspectMode?: string | undefined;
        }>>;
        aspectValues: z.ZodOptional<z.ZodArray<z.ZodObject<{
            localizedValue: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            localizedValue: string;
        }, {
            localizedValue: string;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        localizedAspectName: string;
        aspectConstraint?: {
            aspectMode?: string | undefined;
        } | undefined;
        aspectValues?: {
            localizedValue: string;
        }[] | undefined;
    }, {
        localizedAspectName: string;
        aspectConstraint?: {
            aspectMode?: string | undefined;
        } | undefined;
        aspectValues?: {
            localizedValue: string;
        }[] | undefined;
    }>, "many">>;
    imageHash: z.ZodOptional<z.ZodString>;
    /** Seller-confirmed game (chooser flow) — fixes classification instead of auto-detecting. */
    game: z.ZodOptional<z.ZodString>;
    /** Narrows auto-detection to the seller's enabled games. */
    games: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    game?: string | undefined;
    imageUrls?: string[] | undefined;
    inlineImages?: string[] | undefined;
    taxonomyAspects?: {
        localizedAspectName: string;
        aspectConstraint?: {
            aspectMode?: string | undefined;
        } | undefined;
        aspectValues?: {
            localizedValue: string;
        }[] | undefined;
    }[] | undefined;
    imageHash?: string | undefined;
    games?: string[] | undefined;
}, {
    game?: string | undefined;
    imageUrls?: string[] | undefined;
    inlineImages?: string[] | undefined;
    taxonomyAspects?: {
        localizedAspectName: string;
        aspectConstraint?: {
            aspectMode?: string | undefined;
        } | undefined;
        aspectValues?: {
            localizedValue: string;
        }[] | undefined;
    }[] | undefined;
    imageHash?: string | undefined;
    games?: string[] | undefined;
}>;
export type IdentifyRequest = z.infer<typeof IdentifyRequestSchema>;
export declare const IdentifyResponseSchema: z.ZodObject<{
    game: z.ZodUnion<[z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>, z.ZodString]>;
    game_confidence: z.ZodEnum<["high", "medium", "low"]>;
    game_low_confidence: z.ZodBoolean;
    name: z.ZodString;
    set_name: z.ZodNullable<z.ZodString>;
    card_number: z.ZodNullable<z.ZodString>;
    card_type: z.ZodNullable<z.ZodString>;
    estimated_grade: z.ZodUnion<[z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>, z.ZodString]>;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    attributes: z.ZodArray<z.ZodString, "many">;
    is_promo: z.ZodBoolean;
    language: z.ZodString;
    rarity: z.ZodNullable<z.ZodString>;
    image_roles: z.ZodObject<{
        front: z.ZodNumber;
        back: z.ZodNullable<z.ZodNumber>;
        details: z.ZodArray<z.ZodNumber, "many">;
    }, "strip", z.ZodTypeAny, {
        front: number;
        back: number | null;
        details: number[];
    }, {
        front: number;
        back: number | null;
        details: number[];
    }>;
    flaws: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        region: z.ZodString;
        side: z.ZodEnum<["front", "back", "unknown"]>;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
        severity: z.ZodEnum<["minor", "moderate", "major"]>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        region: string;
        side: "unknown" | "front" | "back";
        x: number;
        y: number;
        w: number;
        h: number;
        severity: "minor" | "moderate" | "major";
    }, {
        description: string;
        region: string;
        side: "unknown" | "front" | "back";
        x: number;
        y: number;
        w: number;
        h: number;
        severity: "minor" | "moderate" | "major";
    }>, "many">;
    field_sources: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        source: z.ZodEnum<["vision", "seller"]>;
        confidence: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: "vision" | "seller";
        confidence: string | null;
    }, {
        source: "vision" | "seller";
        confidence: string | null;
    }>>>;
    _api_usage: z.ZodOptional<z.ZodObject<{
        model: z.ZodEnum<["gpt-4o", "gpt-4o-mini"]>;
        escalated: z.ZodBoolean;
        input_tokens: z.ZodNumber;
        output_tokens: z.ZodNumber;
        estimated_cost_usd: z.ZodNumber;
        cached: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        model: "gpt-4o" | "gpt-4o-mini";
        escalated: boolean;
        input_tokens: number;
        output_tokens: number;
        estimated_cost_usd: number;
        cached: boolean;
    }, {
        model: "gpt-4o" | "gpt-4o-mini";
        escalated: boolean;
        input_tokens: number;
        output_tokens: number;
        estimated_cost_usd: number;
        cached: boolean;
    }>>;
    /** Present + true only on a process-cache hit (same image URLs + game seen before). */
    cached: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    game: string;
    confidence: "high" | "medium" | "low";
    game_confidence: "high" | "medium" | "low";
    game_low_confidence: boolean;
    name: string;
    set_name: string | null;
    card_number: string | null;
    card_type: string | null;
    estimated_grade: string;
    attributes: string[];
    is_promo: boolean;
    language: string;
    rarity: string | null;
    image_roles: {
        front: number;
        back: number | null;
        details: number[];
    };
    flaws: {
        description: string;
        region: string;
        side: "unknown" | "front" | "back";
        x: number;
        y: number;
        w: number;
        h: number;
        severity: "minor" | "moderate" | "major";
    }[];
    cached?: boolean | undefined;
    field_sources?: Record<string, {
        source: "vision" | "seller";
        confidence: string | null;
    }> | undefined;
    _api_usage?: {
        model: "gpt-4o" | "gpt-4o-mini";
        escalated: boolean;
        input_tokens: number;
        output_tokens: number;
        estimated_cost_usd: number;
        cached: boolean;
    } | undefined;
}, {
    game: string;
    confidence: "high" | "medium" | "low";
    game_confidence: "high" | "medium" | "low";
    game_low_confidence: boolean;
    name: string;
    set_name: string | null;
    card_number: string | null;
    card_type: string | null;
    estimated_grade: string;
    attributes: string[];
    is_promo: boolean;
    language: string;
    rarity: string | null;
    image_roles: {
        front: number;
        back: number | null;
        details: number[];
    };
    flaws: {
        description: string;
        region: string;
        side: "unknown" | "front" | "back";
        x: number;
        y: number;
        w: number;
        h: number;
        severity: "minor" | "moderate" | "major";
    }[];
    cached?: boolean | undefined;
    field_sources?: Record<string, {
        source: "vision" | "seller";
        confidence: string | null;
    }> | undefined;
    _api_usage?: {
        model: "gpt-4o" | "gpt-4o-mini";
        escalated: boolean;
        input_tokens: number;
        output_tokens: number;
        estimated_cost_usd: number;
        cached: boolean;
    } | undefined;
}>;
export type IdentifyResponse = z.infer<typeof IdentifyResponseSchema>;
