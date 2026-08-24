import { z } from "zod";
export declare const IdentifyRequestSchema: z.ZodObject<{
    /** Supabase Storage object paths (bucket-relative, e.g. "a1b2c3_master.webp") — the preferred
     * shape (decisions/0018 revision, ROADMAP-COORDINATION.md "iOS-W2-H"/COORD 2026-08-19: capture
     * analysis moves to object paths, not client-minted URLs, so the server decides how each image
     * is read — no client-side signature to go stale). The server reads these directly with the
     * service role (never a signed URL, since OpenAI itself never sees the path — the server
     * downloads the bytes and sends them inline) and treats them exactly like `inlineImages` from
     * that point on. Prefer this over `imageUrls` for any new caller. */
    imagePaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Legacy: public URLs (Supabase Storage). OpenAI fetches each URL itself before inference, an
     * extra network hop — and depends on the bucket staying public. Superseded by `imagePaths`;
     * kept only for callers that haven't migrated yet (decisions/0018 revision). */
    imageUrls: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — skips both the fetch hop and the
     * service-role read. WORK-BACKLOG.md Packet 9 (fast identify). Exactly one of `imagePaths`/
     * `imageUrls`/`inlineImages` should be present per request (validated in the route handler). */
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
    /** OCR'd collector number, e.g. "025/165" or "RA04-EN053". Required for Tier 0 to run at all. */
    ocrCardNumber: z.ZodOptional<z.ZodString>;
    /** OCR'd set code printed on the card (e.g. "OTJ", "OBF") — the strongest set signal OCR can
     * read; matched against catalogue_sets.printed_code first, then set_code. */
    ocrSetCode: z.ZodOptional<z.ZodString>;
    /** OCR'd set name, when legible. */
    ocrSetName: z.ZodOptional<z.ZodString>;
    /** OCR'd card name, when legible — used only to break ties within Tier 0, never required. */
    ocrName: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game?: string | undefined;
    imagePaths?: string[] | undefined;
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
    ocrCardNumber?: string | undefined;
    ocrSetCode?: string | undefined;
    ocrSetName?: string | undefined;
    ocrName?: string | undefined;
}, {
    game?: string | undefined;
    imagePaths?: string[] | undefined;
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
    ocrCardNumber?: string | undefined;
    ocrSetCode?: string | undefined;
    ocrSetName?: string | undefined;
    ocrName?: string | undefined;
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
    /** How this result was produced. "tier0" = deterministic catalogue lookup
     * (lib/catalogue/resolve-by-number.ts), no model call, no possibility of a fabricated identity.
     * "vision" = the existing AI path. Absent on responses from before this field existed. */
    tier: z.ZodOptional<z.ZodEnum<["tier0", "vision"]>>;
    /** True when this result was produced without calling the AI vision model — the business
     * metric W15 exists to move. Always true when tier === "tier0"; present so a caller doesn't
     * need to know the tier enum to report the number that matters. */
    ai_call_avoided: z.ZodOptional<z.ZodBoolean>;
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
    tier?: "vision" | "tier0" | undefined;
    ai_call_avoided?: boolean | undefined;
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
    tier?: "vision" | "tier0" | undefined;
    ai_call_avoided?: boolean | undefined;
}>;
export type IdentifyResponse = z.infer<typeof IdentifyResponseSchema>;
export declare const IdentifyCandidateSchema: z.ZodObject<{
    game: z.ZodUnion<[z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>, z.ZodString]>;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    /** Catalogue row id — pass back verbatim when the seller taps a candidate, to resolve without
     * re-querying. */
    nativeId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    game: string;
    name: string;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
}, {
    game: string;
    name: string;
    setName: string | null;
    cardNumber: string | null;
    nativeId: string;
}>;
export declare const IdentifyAmbiguousTierSchema: z.ZodEnum<["ambiguous"]>;
export declare const IdentifyAmbiguousResponseSchema: z.ZodObject<{
    tier: z.ZodEnum<["ambiguous"]>;
    candidates: z.ZodArray<z.ZodObject<{
        game: z.ZodUnion<[z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>, z.ZodString]>;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        /** Catalogue row id — pass back verbatim when the seller taps a candidate, to resolve without
         * re-querying. */
        nativeId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        game: string;
        name: string;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }, {
        game: string;
        name: string;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    tier: "ambiguous";
    candidates: {
        game: string;
        name: string;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }[];
}, {
    tier: "ambiguous";
    candidates: {
        game: string;
        name: string;
        setName: string | null;
        cardNumber: string | null;
        nativeId: string;
    }[];
}>;
export type IdentifyAmbiguousResponse = z.infer<typeof IdentifyAmbiguousResponseSchema>;
