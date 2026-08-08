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
