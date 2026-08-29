import { z } from "zod";
export declare const RepricingDirectionSchema: z.ZodEnum<["above", "below"]>;
export type RepricingDirection = z.infer<typeof RepricingDirectionSchema>;
export declare const RepricingFlagSchema: z.ZodObject<{
    cardId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    condition: z.ZodNullable<z.ZodString>;
    currentPriceGbp: z.ZodNumber;
    marketValueGbp: z.ZodNumber;
    deltaPct: z.ZodNumber;
    direction: z.ZodEnum<["above", "below"]>;
}, "strip", z.ZodTypeAny, {
    name: string;
    setName: string | null;
    cardNumber: string | null;
    condition: string | null;
    cardId: string;
    currentPriceGbp: number;
    marketValueGbp: number;
    deltaPct: number;
    direction: "above" | "below";
}, {
    name: string;
    setName: string | null;
    cardNumber: string | null;
    condition: string | null;
    cardId: string;
    currentPriceGbp: number;
    marketValueGbp: number;
    deltaPct: number;
    direction: "above" | "below";
}>;
export type RepricingFlag = z.infer<typeof RepricingFlagSchema>;
export declare const RepricingFlagsResponseSchema: z.ZodObject<{
    flags: z.ZodArray<z.ZodObject<{
        cardId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodNullable<z.ZodString>;
        cardNumber: z.ZodNullable<z.ZodString>;
        condition: z.ZodNullable<z.ZodString>;
        currentPriceGbp: z.ZodNumber;
        marketValueGbp: z.ZodNumber;
        deltaPct: z.ZodNumber;
        direction: z.ZodEnum<["above", "below"]>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        setName: string | null;
        cardNumber: string | null;
        condition: string | null;
        cardId: string;
        currentPriceGbp: number;
        marketValueGbp: number;
        deltaPct: number;
        direction: "above" | "below";
    }, {
        name: string;
        setName: string | null;
        cardNumber: string | null;
        condition: string | null;
        cardId: string;
        currentPriceGbp: number;
        marketValueGbp: number;
        deltaPct: number;
        direction: "above" | "below";
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    flags: {
        name: string;
        setName: string | null;
        cardNumber: string | null;
        condition: string | null;
        cardId: string;
        currentPriceGbp: number;
        marketValueGbp: number;
        deltaPct: number;
        direction: "above" | "below";
    }[];
}, {
    flags: {
        name: string;
        setName: string | null;
        cardNumber: string | null;
        condition: string | null;
        cardId: string;
        currentPriceGbp: number;
        marketValueGbp: number;
        deltaPct: number;
        direction: "above" | "below";
    }[];
}>;
export type RepricingFlagsResponse = z.infer<typeof RepricingFlagsResponseSchema>;
export declare const RepriceApplyItemSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** Must be > 0. A zero or negative price is rejected rather than clamped — silently correcting a
     *  money value a caller asked for is how a wrong number becomes an accepted one. */
    newPriceGbp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    newPriceGbp: number;
}, {
    physicalCardId: string;
    newPriceGbp: number;
}>;
export type RepriceApplyItem = z.infer<typeof RepriceApplyItemSchema>;
export declare const RepriceApplyRequestSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        physicalCardId: z.ZodString;
        /** Must be > 0. A zero or negative price is rejected rather than clamped — silently correcting a
         *  money value a caller asked for is how a wrong number becomes an accepted one. */
        newPriceGbp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        physicalCardId: string;
        newPriceGbp: number;
    }, {
        physicalCardId: string;
        newPriceGbp: number;
    }>, "many">;
    /**
     * Which eBay environment to write to. Omitted means production.
     *
     * Exists so this call can be proven in SANDBOX before it is trusted against a real listing: the
     * adapter hardcoded production until 2026-08-29, which made the one untested money-writing call
     * the one call that could not be exercised anywhere else. Sandbox is necessary and not
     * sufficient — eBay's sandbox diverges on policies and fees — so it is the first test, not the
     * only one.
     */
    environment: z.ZodOptional<z.ZodEnum<["ebay_production", "ebay_sandbox"]>>;
}, "strip", z.ZodTypeAny, {
    items: {
        physicalCardId: string;
        newPriceGbp: number;
    }[];
    environment?: "ebay_production" | "ebay_sandbox" | undefined;
}, {
    items: {
        physicalCardId: string;
        newPriceGbp: number;
    }[];
    environment?: "ebay_production" | "ebay_sandbox" | undefined;
}>;
export type RepriceApplyRequest = z.infer<typeof RepriceApplyRequestSchema>;
export declare const RepriceChannelOutcomeSchema: z.ZodObject<{
    channel: z.ZodEnum<["ebay", "cardtrader"]>;
    ok: z.ZodBoolean;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    channel: "ebay" | "cardtrader";
    error?: string | undefined;
}, {
    ok: boolean;
    channel: "ebay" | "cardtrader";
    error?: string | undefined;
}>;
export declare const RepriceApplyResultSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** True when AT LEAST ONE channel accepted the new price — which is also the condition under
     *  which the route updates `suggested_price`. The two are the same fact, deliberately. */
    ok: z.ZodBoolean;
    /** Per-channel outcomes, so a client can say WHICH listing moved rather than "some did". */
    channels: z.ZodArray<z.ZodObject<{
        channel: z.ZodEnum<["ebay", "cardtrader"]>;
        ok: z.ZodBoolean;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ok: boolean;
        channel: "ebay" | "cardtrader";
        error?: string | undefined;
    }, {
        ok: boolean;
        channel: "ebay" | "cardtrader";
        error?: string | undefined;
    }>, "many">;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    ok: boolean;
    physicalCardId: string;
    channels: {
        ok: boolean;
        channel: "ebay" | "cardtrader";
        error?: string | undefined;
    }[];
    error?: string | undefined;
}, {
    ok: boolean;
    physicalCardId: string;
    channels: {
        ok: boolean;
        channel: "ebay" | "cardtrader";
        error?: string | undefined;
    }[];
    error?: string | undefined;
}>;
export type RepriceApplyResult = z.infer<typeof RepriceApplyResultSchema>;
export declare const RepriceApplyResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        physicalCardId: z.ZodString;
        /** True when AT LEAST ONE channel accepted the new price — which is also the condition under
         *  which the route updates `suggested_price`. The two are the same fact, deliberately. */
        ok: z.ZodBoolean;
        /** Per-channel outcomes, so a client can say WHICH listing moved rather than "some did". */
        channels: z.ZodArray<z.ZodObject<{
            channel: z.ZodEnum<["ebay", "cardtrader"]>;
            ok: z.ZodBoolean;
            error: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }, {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }>, "many">;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        ok: boolean;
        physicalCardId: string;
        channels: {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }[];
        error?: string | undefined;
    }, {
        ok: boolean;
        physicalCardId: string;
        channels: {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }[];
        error?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    results: {
        ok: boolean;
        physicalCardId: string;
        channels: {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }[];
        error?: string | undefined;
    }[];
}, {
    results: {
        ok: boolean;
        physicalCardId: string;
        channels: {
            ok: boolean;
            channel: "ebay" | "cardtrader";
            error?: string | undefined;
        }[];
        error?: string | undefined;
    }[];
}>;
export type RepriceApplyResponse = z.infer<typeof RepriceApplyResponseSchema>;
