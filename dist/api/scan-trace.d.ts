import { z } from "zod";
/** A card identity as a client saw it. */
export declare const ScanTraceMatchSchema: z.ZodObject<{
    game: z.ZodOptional<z.ZodString>;
    nativeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodString;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    game?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    nativeId?: string | null | undefined;
}, {
    name: string;
    game?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    nativeId?: string | null | undefined;
}>;
export type ScanTraceMatch = z.infer<typeof ScanTraceMatchSchema>;
export declare const ScanTraceOcrSchema: z.ZodObject<{
    /** The collector number as read ("58" or "58/102"); the server joins `total` onto a bare number. */
    number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    total: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    setCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** The OCR engine's own confidence, 0 to 1. */
    confidence: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /** What the OCR read, line by line: card text only. At most 20 lines of 80 characters. */
    lines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** Milliseconds the on-device read took. */
    ms: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    number?: string | null | undefined;
    confidence?: number | null | undefined;
    name?: string | null | undefined;
    setName?: string | null | undefined;
    setCode?: string | null | undefined;
    lines?: string[] | undefined;
    total?: string | null | undefined;
    ms?: number | undefined;
}, {
    number?: string | null | undefined;
    confidence?: number | null | undefined;
    name?: string | null | undefined;
    setName?: string | null | undefined;
    setCode?: string | null | undefined;
    lines?: string[] | undefined;
    total?: string | null | undefined;
    ms?: number | undefined;
}>;
export type ScanTraceOcr = z.infer<typeof ScanTraceOcrSchema>;
export declare const ScanTraceAnswerSchema: z.ZodObject<{
    /** Which step produced the answer the seller was shown. */
    by: z.ZodString;
    /** The narrowing tier that answered, when the client knows it (the server's shadow gives its own). */
    resolverTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    candidateCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    match: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        game: z.ZodOptional<z.ZodString>;
        nativeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    }, {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    }>>>;
    ms: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    by: string;
    match?: {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    } | null | undefined;
    ms?: number | undefined;
    resolverTier?: string | null | undefined;
    candidateCount?: number | null | undefined;
}, {
    by: string;
    match?: {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    } | null | undefined;
    ms?: number | undefined;
    resolverTier?: string | null | undefined;
    candidateCount?: number | null | undefined;
}>;
export type ScanTraceAnswer = z.infer<typeof ScanTraceAnswerSchema>;
export declare const ScanTraceOutcomeSchema: z.ZodObject<{
    /** What the seller did with the answer. */
    sellerAction: z.ZodString;
    /** Which fields the seller changed, when `sellerAction` is "changed". */
    changedFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    /** The identity the seller ended on, when there was one. */
    finalMatch: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        game: z.ZodOptional<z.ZodString>;
        nativeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodString;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    }, {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    sellerAction: string;
    changedFields?: string[] | undefined;
    finalMatch?: {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    } | null | undefined;
}, {
    sellerAction: string;
    changedFields?: string[] | undefined;
    finalMatch?: {
        name: string;
        game?: string | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        nativeId?: string | null | undefined;
    } | null | undefined;
}>;
export type ScanTraceOutcome = z.infer<typeof ScanTraceOutcomeSchema>;
export declare const ScanTracePlatformSchema: z.ZodEnum<["ios", "android", "web"]>;
export type ScanTracePlatform = z.infer<typeof ScanTracePlatformSchema>;
export declare const ScanTraceRequestSchema: z.ZodObject<{
    /** Always 1. */
    v: z.ZodLiteral<1>;
    /** A uuid v4 the client makes once per scan. The same id on every ping of that scan. */
    scanId: z.ZodString;
    platform: z.ZodEnum<["ios", "android", "web"]>;
    appVersion: z.ZodOptional<z.ZodString>;
    /** The game the client thought it was looking at, if it had a guess. A hint only. */
    gameHint: z.ZodOptional<z.ZodString>;
    ocr: z.ZodOptional<z.ZodObject<{
        /** The collector number as read ("58" or "58/102"); the server joins `total` onto a bare number. */
        number: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        total: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        setCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** The OCR engine's own confidence, 0 to 1. */
        confidence: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        /** What the OCR read, line by line: card text only. At most 20 lines of 80 characters. */
        lines: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        /** Milliseconds the on-device read took. */
        ms: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        number?: string | null | undefined;
        confidence?: number | null | undefined;
        name?: string | null | undefined;
        setName?: string | null | undefined;
        setCode?: string | null | undefined;
        lines?: string[] | undefined;
        total?: string | null | undefined;
        ms?: number | undefined;
    }, {
        number?: string | null | undefined;
        confidence?: number | null | undefined;
        name?: string | null | undefined;
        setName?: string | null | undefined;
        setCode?: string | null | undefined;
        lines?: string[] | undefined;
        total?: string | null | undefined;
        ms?: number | undefined;
    }>>;
    answer: z.ZodObject<{
        /** Which step produced the answer the seller was shown. */
        by: z.ZodString;
        /** The narrowing tier that answered, when the client knows it (the server's shadow gives its own). */
        resolverTier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        candidateCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        match: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            game: z.ZodOptional<z.ZodString>;
            nativeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
            setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        }, {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        }>>>;
        ms: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        by: string;
        match?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
        ms?: number | undefined;
        resolverTier?: string | null | undefined;
        candidateCount?: number | null | undefined;
    }, {
        by: string;
        match?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
        ms?: number | undefined;
        resolverTier?: string | null | undefined;
        candidateCount?: number | null | undefined;
    }>;
    outcome: z.ZodObject<{
        /** What the seller did with the answer. */
        sellerAction: z.ZodString;
        /** Which fields the seller changed, when `sellerAction` is "changed". */
        changedFields: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        /** The identity the seller ended on, when there was one. */
        finalMatch: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            game: z.ZodOptional<z.ZodString>;
            nativeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            name: z.ZodString;
            setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        }, {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        }>>>;
    }, "strip", z.ZodTypeAny, {
        sellerAction: string;
        changedFields?: string[] | undefined;
        finalMatch?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
    }, {
        sellerAction: string;
        changedFields?: string[] | undefined;
        finalMatch?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    v: 1;
    scanId: string;
    platform: "ios" | "android" | "web";
    answer: {
        by: string;
        match?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
        ms?: number | undefined;
        resolverTier?: string | null | undefined;
        candidateCount?: number | null | undefined;
    };
    outcome: {
        sellerAction: string;
        changedFields?: string[] | undefined;
        finalMatch?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
    };
    ocr?: {
        number?: string | null | undefined;
        confidence?: number | null | undefined;
        name?: string | null | undefined;
        setName?: string | null | undefined;
        setCode?: string | null | undefined;
        lines?: string[] | undefined;
        total?: string | null | undefined;
        ms?: number | undefined;
    } | undefined;
    appVersion?: string | undefined;
    gameHint?: string | undefined;
}, {
    v: 1;
    scanId: string;
    platform: "ios" | "android" | "web";
    answer: {
        by: string;
        match?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
        ms?: number | undefined;
        resolverTier?: string | null | undefined;
        candidateCount?: number | null | undefined;
    };
    outcome: {
        sellerAction: string;
        changedFields?: string[] | undefined;
        finalMatch?: {
            name: string;
            game?: string | undefined;
            setName?: string | null | undefined;
            cardNumber?: string | null | undefined;
            nativeId?: string | null | undefined;
        } | null | undefined;
    };
    ocr?: {
        number?: string | null | undefined;
        confidence?: number | null | undefined;
        name?: string | null | undefined;
        setName?: string | null | undefined;
        setCode?: string | null | undefined;
        lines?: string[] | undefined;
        total?: string | null | undefined;
        ms?: number | undefined;
    } | undefined;
    appVersion?: string | undefined;
    gameHint?: string | undefined;
}>;
export type ScanTraceRequest = z.infer<typeof ScanTraceRequestSchema>;
export declare const ScanTraceResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
}, "strip", z.ZodTypeAny, {
    ok: true;
}, {
    ok: true;
}>;
export type ScanTraceResponse = z.infer<typeof ScanTraceResponseSchema>;
