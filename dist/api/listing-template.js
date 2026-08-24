// Contract for the listing-template CRUD endpoints (pokemon-tool) — WORK-BACKLOG.md Packet 6 (bulk
// actions + templates/pricing-rule authoring). T3 web owns authoring; iOS only *applies* a saved
// template to a card + per-card override (decisions/0011), which is why this shape lives here
// rather than staying pokemon-tool-local.
//
// Token set is deliberately small — exactly the fields the existing (fixed) `ebayTitle()` builder
// in pokemon-tool already reads off a card, no new derived data invented for this feature.
import { z } from "zod";
export const LISTING_TEMPLATE_TOKENS = [
    "name", "setName", "cardNumber", "condition", "rarity", "game",
];
export const ListingTemplateTokenSchema = z.enum(LISTING_TEMPLATE_TOKENS);
export const ListingTemplateSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    active: z.boolean(),
    scopeGame: z.array(z.string()),
    scopeSet: z.array(z.string()),
    /** e.g. "{name} {setName} #{cardNumber} {condition}". Unknown {tokens} are left literal at
     * render time rather than rejected — see pokemon-tool's lib/listingTemplates.ts. */
    titlePattern: z.string().min(1),
    descriptionPattern: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export const ListingTemplateInputSchema = ListingTemplateSchema.omit({
    id: true, createdAt: true, updatedAt: true,
}).partial({ active: true });
export const ListingTemplateListResponseSchema = z.object({
    templates: z.array(ListingTemplateSchema),
});
