import { z } from "zod";
export declare const PricingRuleRoundingSchema: z.ZodEnum<["none", "nearest_10p", "nearest_50p", "nearest_pound", "charm_99"]>;
export type PricingRuleRounding = z.infer<typeof PricingRuleRoundingSchema>;
export declare const PricingRuleSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    active: z.ZodBoolean;
    scopeGame: z.ZodArray<z.ZodString, "many">;
    scopeSet: z.ZodArray<z.ZodString, "many">;
    scopeCondition: z.ZodArray<z.ZodString, "many">;
    /** Multiplier applied to the base price before rounding, keyed by condition string (e.g. "NM":
     * 1, "LP": 0.85). A condition absent from this map is treated as multiplier 1 (no change), not
     * an error — sellers aren't required to enumerate every condition they might ever see. */
    conditionMultipliers: z.ZodRecord<z.ZodString, z.ZodNumber>;
    rounding: z.ZodEnum<["none", "nearest_10p", "nearest_50p", "nearest_pound", "charm_99"]>;
    /** Clamp applied after the multiplier, before rounding. Either bound may be null (no floor/ceiling). */
    minPriceGbp: z.ZodNullable<z.ZodNumber>;
    maxPriceGbp: z.ZodNullable<z.ZodNumber>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    active: boolean;
    updatedAt: string;
    scopeGame: string[];
    scopeSet: string[];
    scopeCondition: string[];
    conditionMultipliers: Record<string, number>;
    rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
    minPriceGbp: number | null;
    maxPriceGbp: number | null;
    createdAt: string;
}, {
    id: string;
    name: string;
    active: boolean;
    updatedAt: string;
    scopeGame: string[];
    scopeSet: string[];
    scopeCondition: string[];
    conditionMultipliers: Record<string, number>;
    rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
    minPriceGbp: number | null;
    maxPriceGbp: number | null;
    createdAt: string;
}>;
export type PricingRule = z.infer<typeof PricingRuleSchema>;
export declare const PricingRuleInputSchema: z.ZodObject<{
    name: z.ZodString;
    active: z.ZodOptional<z.ZodBoolean>;
    scopeGame: z.ZodArray<z.ZodString, "many">;
    scopeSet: z.ZodArray<z.ZodString, "many">;
    scopeCondition: z.ZodArray<z.ZodString, "many">;
    conditionMultipliers: z.ZodRecord<z.ZodString, z.ZodNumber>;
    rounding: z.ZodEnum<["none", "nearest_10p", "nearest_50p", "nearest_pound", "charm_99"]>;
    minPriceGbp: z.ZodNullable<z.ZodNumber>;
    maxPriceGbp: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scopeGame: string[];
    scopeSet: string[];
    scopeCondition: string[];
    conditionMultipliers: Record<string, number>;
    rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
    minPriceGbp: number | null;
    maxPriceGbp: number | null;
    active?: boolean | undefined;
}, {
    name: string;
    scopeGame: string[];
    scopeSet: string[];
    scopeCondition: string[];
    conditionMultipliers: Record<string, number>;
    rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
    minPriceGbp: number | null;
    maxPriceGbp: number | null;
    active?: boolean | undefined;
}>;
export type PricingRuleInput = z.infer<typeof PricingRuleInputSchema>;
export declare const PricingRuleListResponseSchema: z.ZodObject<{
    rules: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        active: z.ZodBoolean;
        scopeGame: z.ZodArray<z.ZodString, "many">;
        scopeSet: z.ZodArray<z.ZodString, "many">;
        scopeCondition: z.ZodArray<z.ZodString, "many">;
        /** Multiplier applied to the base price before rounding, keyed by condition string (e.g. "NM":
         * 1, "LP": 0.85). A condition absent from this map is treated as multiplier 1 (no change), not
         * an error — sellers aren't required to enumerate every condition they might ever see. */
        conditionMultipliers: z.ZodRecord<z.ZodString, z.ZodNumber>;
        rounding: z.ZodEnum<["none", "nearest_10p", "nearest_50p", "nearest_pound", "charm_99"]>;
        /** Clamp applied after the multiplier, before rounding. Either bound may be null (no floor/ceiling). */
        minPriceGbp: z.ZodNullable<z.ZodNumber>;
        maxPriceGbp: z.ZodNullable<z.ZodNumber>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        scopeCondition: string[];
        conditionMultipliers: Record<string, number>;
        rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
        minPriceGbp: number | null;
        maxPriceGbp: number | null;
        createdAt: string;
    }, {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        scopeCondition: string[];
        conditionMultipliers: Record<string, number>;
        rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
        minPriceGbp: number | null;
        maxPriceGbp: number | null;
        createdAt: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    rules: {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        scopeCondition: string[];
        conditionMultipliers: Record<string, number>;
        rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
        minPriceGbp: number | null;
        maxPriceGbp: number | null;
        createdAt: string;
    }[];
}, {
    rules: {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        scopeCondition: string[];
        conditionMultipliers: Record<string, number>;
        rounding: "none" | "nearest_10p" | "nearest_50p" | "nearest_pound" | "charm_99";
        minPriceGbp: number | null;
        maxPriceGbp: number | null;
        createdAt: string;
    }[];
}>;
export type PricingRuleListResponse = z.infer<typeof PricingRuleListResponseSchema>;
