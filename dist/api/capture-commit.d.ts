import { z } from "zod";
export declare const CaptureCommitRequestSchema: z.ZodObject<{
    imageUrls: z.ZodObject<{
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
    }>;
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
    imageUrls: {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    };
    ocr?: {
        number?: string | undefined;
        name?: string | undefined;
    } | undefined;
    purchaseCost?: number | undefined;
    collectionType?: "personal" | "resale" | undefined;
}, {
    imageUrls: {
        front: string;
        back: string;
        details?: {
            url: string;
            region?: string | undefined;
            side?: "front" | "back" | undefined;
            corner?: string | undefined;
        }[] | undefined;
    };
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
    physicalCardId: string;
    legacyCardId: string | null;
    gameDisplayName: string;
    setName: string | null;
    cardNumber: string | null;
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
    physicalCardId: string;
    legacyCardId: string | null;
    gameDisplayName: string;
    setName: string | null;
    cardNumber: string | null;
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
