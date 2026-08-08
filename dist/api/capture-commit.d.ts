import { z } from "zod";
export declare const CaptureCommitRequestSchema: z.ZodObject<{
    /** Public URLs (Supabase Storage) — the original path. */
    imageUrls: z.ZodOptional<z.ZodObject<{
        front: z.ZodString;
        back: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            side: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
            corner: z.ZodOptional<z.ZodString>;
            /** Legacy region tag — older clients only. Prefer `corner`. */
            region: z.ZodOptional<z.ZodString>;
            url: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }, {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }, {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }>>;
    /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — an alternative to `imageUrls` that
     * skips the storage-upload + fetch round trip, forwarded straight through to /api/identify's own
     * `inlineImages`. WORK-BACKLOG.md Packet 9 (fast identify). Mirrors `imageUrls`' front/back/
     * details shape so the server can preserve role ordering when it builds the flat array `/api/
     * identify` expects; a caller should send either this or `imageUrls`, not both. */
    inlineImages: z.ZodOptional<z.ZodObject<{
        front: z.ZodString;
        back: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            side: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
            corner: z.ZodOptional<z.ZodString>;
            dataUrl: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }, {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        front: string;
        back: string;
        details?: {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }, {
        front: string;
        back: string;
        details?: {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }>>;
    /** An already-resolved identity — e.g. iOS's on-device OCR read the printed name + collector
     * number and got an unambiguous hit from the catalogue-lookup endpoint. When present, the server
     * skips its own /api/identify (vision) call entirely and commits directly against this match —
     * the real unit-economics win this packet is chasing (fewer paid vision calls, not just lower
     * latency on the ones that still happen). Reuses CatalogueLookupMatchSchema rather than a
     * parallel identity shape, since it's exactly a resolved catalogue match. */
    resolvedMatch: z.ZodOptional<z.ZodObject<{
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
        nativeId: string;
        setName: string | null;
        cardNumber: string | null;
    }, {
        name: string;
        language: string;
        rarity: string | null;
        nativeId: string;
        setName: string | null;
        cardNumber: string | null;
    }>>;
    /** Required alongside `resolvedMatch` — the match itself carries no game (it's already scoped to
     * one game by the catalogue-lookup call that produced it), but the server needs it to route
     * pricing (registry cataloguer vs. Pokémon's TCG-lookup chain) once vision is skipped. Optional
     * here (shape-only; enforced in the route handler) since a normal identify-driven commit doesn't
     * need it — the vision call detects the game itself. */
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    ocr: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        number: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        number?: string | undefined;
        name?: string | undefined;
    }, {
        number?: string | undefined;
        name?: string | undefined;
    }>>;
    purchaseCost: z.ZodOptional<z.ZodNumber>;
    collectionType: z.ZodOptional<z.ZodEnum<["personal", "resale"]>>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    imageUrls?: {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
    inlineImages?: {
        front: string;
        back: string;
        details?: {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
    resolvedMatch?: {
        name: string;
        language: string;
        rarity: string | null;
        nativeId: string;
        setName: string | null;
        cardNumber: string | null;
    } | undefined;
    ocr?: {
        number?: string | undefined;
        name?: string | undefined;
    } | undefined;
    purchaseCost?: number | undefined;
    collectionType?: "personal" | "resale" | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    imageUrls?: {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
    inlineImages?: {
        front: string;
        back: string;
        details?: {
            dataUrl: string;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
    resolvedMatch?: {
        name: string;
        language: string;
        rarity: string | null;
        nativeId: string;
        setName: string | null;
        cardNumber: string | null;
    } | undefined;
    ocr?: {
        number?: string | undefined;
        name?: string | undefined;
    } | undefined;
    purchaseCost?: number | undefined;
    collectionType?: "personal" | "resale" | undefined;
}>;
export type CaptureCommitRequest = z.infer<typeof CaptureCommitRequestSchema>;
export declare const CaptureCommitResponseSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    legacyCardId: z.ZodNullable<z.ZodString>;
    game: z.ZodString;
    gameDisplayName: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    condition: z.ZodNullable<z.ZodString>;
    rarity: z.ZodNullable<z.ZodString>;
    suggestedPrice: z.ZodNullable<z.ZodNumber>;
    ebay: z.ZodNullable<z.ZodObject<{
        low: z.ZodNullable<z.ZodNumber>;
        avg: z.ZodNullable<z.ZodNumber>;
        top: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        low: number | null;
        avg: number | null;
        top: number | null;
    }, {
        low: number | null;
        avg: number | null;
        top: number | null;
    }>>;
    subGrades: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
}, "strip", z.ZodTypeAny, {
    game: string;
    name: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    physicalCardId: string;
    legacyCardId: string | null;
    gameDisplayName: string;
    condition: string | null;
    suggestedPrice: number | null;
    ebay: {
        low: number | null;
        avg: number | null;
        top: number | null;
    } | null;
    subGrades: Record<string, unknown> | null;
}, {
    game: string;
    name: string;
    rarity: string | null;
    setName: string | null;
    cardNumber: string | null;
    physicalCardId: string;
    legacyCardId: string | null;
    gameDisplayName: string;
    condition: string | null;
    suggestedPrice: number | null;
    ebay: {
        low: number | null;
        avg: number | null;
        top: number | null;
    } | null;
    subGrades: Record<string, unknown> | null;
}>;
export type CaptureCommitResponse = z.infer<typeof CaptureCommitResponseSchema>;
