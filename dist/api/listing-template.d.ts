import { z } from "zod";
export declare const LISTING_TEMPLATE_TOKENS: readonly ["name", "setName", "cardNumber", "condition", "rarity", "game"];
export declare const ListingTemplateTokenSchema: z.ZodEnum<["name", "setName", "cardNumber", "condition", "rarity", "game"]>;
export type ListingTemplateToken = z.infer<typeof ListingTemplateTokenSchema>;
export declare const ListingTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    active: z.ZodBoolean;
    scopeGame: z.ZodArray<z.ZodString, "many">;
    scopeSet: z.ZodArray<z.ZodString, "many">;
    /** e.g. "{name} {setName} #{cardNumber} {condition}". Unknown {tokens} are left literal at
     * render time rather than rejected — see pokemon-tool's lib/listingTemplates.ts. */
    titlePattern: z.ZodString;
    descriptionPattern: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    active: boolean;
    updatedAt: string;
    scopeGame: string[];
    scopeSet: string[];
    createdAt: string;
    titlePattern: string;
    descriptionPattern: string | null;
}, {
    id: string;
    name: string;
    active: boolean;
    updatedAt: string;
    scopeGame: string[];
    scopeSet: string[];
    createdAt: string;
    titlePattern: string;
    descriptionPattern: string | null;
}>;
export type ListingTemplate = z.infer<typeof ListingTemplateSchema>;
export declare const ListingTemplateInputSchema: z.ZodObject<{
    name: z.ZodString;
    active: z.ZodOptional<z.ZodBoolean>;
    scopeGame: z.ZodArray<z.ZodString, "many">;
    scopeSet: z.ZodArray<z.ZodString, "many">;
    titlePattern: z.ZodString;
    descriptionPattern: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    scopeGame: string[];
    scopeSet: string[];
    titlePattern: string;
    descriptionPattern: string | null;
    active?: boolean | undefined;
}, {
    name: string;
    scopeGame: string[];
    scopeSet: string[];
    titlePattern: string;
    descriptionPattern: string | null;
    active?: boolean | undefined;
}>;
export type ListingTemplateInput = z.infer<typeof ListingTemplateInputSchema>;
export declare const ListingTemplateListResponseSchema: z.ZodObject<{
    templates: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        active: z.ZodBoolean;
        scopeGame: z.ZodArray<z.ZodString, "many">;
        scopeSet: z.ZodArray<z.ZodString, "many">;
        /** e.g. "{name} {setName} #{cardNumber} {condition}". Unknown {tokens} are left literal at
         * render time rather than rejected — see pokemon-tool's lib/listingTemplates.ts. */
        titlePattern: z.ZodString;
        descriptionPattern: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        createdAt: string;
        titlePattern: string;
        descriptionPattern: string | null;
    }, {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        createdAt: string;
        titlePattern: string;
        descriptionPattern: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    templates: {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        createdAt: string;
        titlePattern: string;
        descriptionPattern: string | null;
    }[];
}, {
    templates: {
        id: string;
        name: string;
        active: boolean;
        updatedAt: string;
        scopeGame: string[];
        scopeSet: string[];
        createdAt: string;
        titlePattern: string;
        descriptionPattern: string | null;
    }[];
}>;
export type ListingTemplateListResponse = z.infer<typeof ListingTemplateListResponseSchema>;
