import { z } from "zod";
export declare const ShotQualityDescriptorSchema: z.ZodObject<{
    side: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
    corner: z.ZodOptional<z.ZodString>;
    region: z.ZodOptional<z.ZodString>;
    /** 0–1 overall sharpness read (e.g. a device-side variance-of-Laplacian style signal) — higher
     * is sharper. */
    sharpness: z.ZodOptional<z.ZodNumber>;
    glare: z.ZodOptional<z.ZodBoolean>;
    cropped: z.ZodOptional<z.ZodBoolean>;
    skewDegrees: z.ZodOptional<z.ZodNumber>;
    orientation: z.ZodOptional<z.ZodEnum<["correct", "rotated_90", "rotated_180", "rotated_270", "unknown"]>>;
    exposure: z.ZodOptional<z.ZodEnum<["under", "over", "ok", "unknown"]>>;
    /** Border/centring offsets measured from the detected card quad, roughly -1..1 (negative = off
     * toward one edge) — device-side geometry, not a grade. Present only when the quad was
     * measurable. */
    centeringLR: z.ZodOptional<z.ZodNumber>;
    centeringTB: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    region?: string | undefined;
    side?: "front" | "back" | undefined;
    corner?: string | undefined;
    sharpness?: number | undefined;
    glare?: boolean | undefined;
    cropped?: boolean | undefined;
    skewDegrees?: number | undefined;
    orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
    exposure?: "unknown" | "under" | "over" | "ok" | undefined;
    centeringLR?: number | undefined;
    centeringTB?: number | undefined;
}, {
    region?: string | undefined;
    side?: "front" | "back" | undefined;
    corner?: string | undefined;
    sharpness?: number | undefined;
    glare?: boolean | undefined;
    cropped?: boolean | undefined;
    skewDegrees?: number | undefined;
    orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
    exposure?: "unknown" | "under" | "over" | "ok" | undefined;
    centeringLR?: number | undefined;
    centeringTB?: number | undefined;
}>;
export type ShotQualityDescriptor = z.infer<typeof ShotQualityDescriptorSchema>;
export declare const CaptureCommitRequestSchema: z.ZodObject<{
    /** Supabase Storage object paths (bucket-relative) — the preferred shape (decisions/0018
     * revision, ROADMAP-COORDINATION.md "iOS-W2-H"/COORD 2026-08-19: capture-commit moves to
     * object paths, not client-minted URLs — the client never mints or signs anything; the server
     * decides how each path is read/served per consumer: a service-role direct read for internal
     * AI processing, a short-TTL signed URL for display, and either a longer-TTL signed URL or an
     * eBay-hosted copy for eBay publish — see lib/storage/signedPhotoUrl.ts and
     * lib/ebay-media.ts). The server converts these to the same public-URL-shaped strings already
     * stored in cards.photo_urls/physical_cards.photo_urls (no DB-shape change) — see
     * lib/storage/photoPath.ts's publicUrlFromPath(). Prefer this over `imageUrls` for any new
     * caller. */
    imagePaths: z.ZodOptional<z.ZodObject<{
        front: z.ZodString;
        back: z.ZodString;
        details: z.ZodOptional<z.ZodArray<z.ZodObject<{
            side: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
            corner: z.ZodOptional<z.ZodString>;
            region: z.ZodOptional<z.ZodString>;
            /** Supabase Storage object path (bucket-relative), not a URL — see imagePaths below. */
            path: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }, {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        front: string;
        back: string;
        details?: {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }, {
        front: string;
        back: string;
        details?: {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    }>>;
    /** Legacy: public URLs (Supabase Storage) — the original path. Superseded by `imagePaths`;
     * kept only for callers that haven't migrated yet (decisions/0018 revision). */
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
    /** Per-shot capture-quality signals — see ShotQualityDescriptorSchema's doc comment. Optional;
     * older clients simply omit it. */
    shotQuality: z.ZodOptional<z.ZodArray<z.ZodObject<{
        side: z.ZodOptional<z.ZodEnum<["front", "back"]>>;
        corner: z.ZodOptional<z.ZodString>;
        region: z.ZodOptional<z.ZodString>;
        /** 0–1 overall sharpness read (e.g. a device-side variance-of-Laplacian style signal) — higher
         * is sharper. */
        sharpness: z.ZodOptional<z.ZodNumber>;
        glare: z.ZodOptional<z.ZodBoolean>;
        cropped: z.ZodOptional<z.ZodBoolean>;
        skewDegrees: z.ZodOptional<z.ZodNumber>;
        orientation: z.ZodOptional<z.ZodEnum<["correct", "rotated_90", "rotated_180", "rotated_270", "unknown"]>>;
        exposure: z.ZodOptional<z.ZodEnum<["under", "over", "ok", "unknown"]>>;
        /** Border/centring offsets measured from the detected card quad, roughly -1..1 (negative = off
         * toward one edge) — device-side geometry, not a grade. Present only when the quad was
         * measurable. */
        centeringLR: z.ZodOptional<z.ZodNumber>;
        centeringTB: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        region?: string | undefined;
        side?: "front" | "back" | undefined;
        corner?: string | undefined;
        sharpness?: number | undefined;
        glare?: boolean | undefined;
        cropped?: boolean | undefined;
        skewDegrees?: number | undefined;
        orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
        exposure?: "unknown" | "under" | "over" | "ok" | undefined;
        centeringLR?: number | undefined;
        centeringTB?: number | undefined;
    }, {
        region?: string | undefined;
        side?: "front" | "back" | undefined;
        corner?: string | undefined;
        sharpness?: number | undefined;
        glare?: boolean | undefined;
        cropped?: boolean | undefined;
        skewDegrees?: number | undefined;
        orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
        exposure?: "unknown" | "under" | "over" | "ok" | undefined;
        centeringLR?: number | undefined;
        centeringTB?: number | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    imagePaths?: {
        front: string;
        back: string;
        details?: {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
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
    shotQuality?: {
        region?: string | undefined;
        side?: "front" | "back" | undefined;
        corner?: string | undefined;
        sharpness?: number | undefined;
        glare?: boolean | undefined;
        cropped?: boolean | undefined;
        skewDegrees?: number | undefined;
        orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
        exposure?: "unknown" | "under" | "over" | "ok" | undefined;
        centeringLR?: number | undefined;
        centeringTB?: number | undefined;
    }[] | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    imagePaths?: {
        front: string;
        back: string;
        details?: {
            path: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    } | undefined;
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
    shotQuality?: {
        region?: string | undefined;
        side?: "front" | "back" | undefined;
        corner?: string | undefined;
        sharpness?: number | undefined;
        glare?: boolean | undefined;
        cropped?: boolean | undefined;
        skewDegrees?: number | undefined;
        orientation?: "unknown" | "correct" | "rotated_90" | "rotated_180" | "rotated_270" | undefined;
        exposure?: "unknown" | "under" | "over" | "ok" | undefined;
        centeringLR?: number | undefined;
        centeringTB?: number | undefined;
    }[] | undefined;
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
