import { z } from "zod";
/**
 * What a price CANNOT distinguish. Null for almost every card.
 *
 * A Base Set Charizard #4 exists as 1st Edition, Shadowless and Unlimited — roughly thousands,
 * high hundreds and low hundreds of pounds — and NOTHING in the pricing pipeline models edition:
 * `catalogue_cards` has no edition column, `PriceLookupParams` has no field for one so no provider
 * is ever asked, and the price cache key is `name|set_name|card_number|condition`, so two editions
 * SHARE A CACHE ENTRY. The comps blend them.
 *
 * ⚠️ A CLIENT MUST SURFACE THIS. The number is wrong in both directions, and the direction that
 * matters is the undervaluing one: a seller sells a four-figure card for hundreds. Every other
 * money defect in this contract costs a seller margin; this one costs them the card. Rendering the
 * price without the caveat is worse than showing no price, because it looks certain.
 *
 * English lives in `@curio/copy`'s `editionAmbiguityLabels` (ADR 0024) — and both strings name
 * what to LOOK AT, because a caveat a seller cannot act on is noise on the number.
 */
export declare const EditionAmbiguitySchema: z.ZodEnum<["first_edition_shadowless_unlimited", "first_edition_unlimited"]>;
export type EditionAmbiguity = z.infer<typeof EditionAmbiguitySchema>;
export declare const CardValueRequestSchema: z.ZodObject<{
    name: z.ZodString;
    set_name: z.ZodOptional<z.ZodString>;
    card_number: z.ZodOptional<z.ZodString>;
    condition: z.ZodOptional<z.ZodString>;
    /** Omitted → auto/best finish; set → price that exact variant. */
    finish: z.ZodOptional<z.ZodString>;
    /** Omitted → pokemon, for back-compat. */
    game: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    game?: string | undefined;
    set_name?: string | undefined;
    card_number?: string | undefined;
    condition?: string | undefined;
    finish?: string | undefined;
}, {
    name: string;
    game?: string | undefined;
    set_name?: string | undefined;
    card_number?: string | undefined;
    condition?: string | undefined;
    finish?: string | undefined;
}>;
export type CardValueRequest = z.infer<typeof CardValueRequestSchema>;
export declare const CardValueResponseSchema: z.ZodObject<{
    game: z.ZodNullable<z.ZodString>;
    gameDisplayName: z.ZodNullable<z.ZodString>;
    suggestedPrice: z.ZodNullable<z.ZodNumber>;
    /** ⚠️ Named "ebay" for back-compat, and populated ONLY when the source really is eBay — the
     *  provider chain resolves to CardTrader/PokeTrace/pokemontcg.io by default. Null otherwise. */
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
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    priceWarning: z.ZodNullable<z.ZodString>;
    priceSource: z.ZodNullable<z.ZodString>;
    currencyNote: z.ZodNullable<z.ZodString>;
    possibleFinishes: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    finishUsed: z.ZodNullable<z.ZodString>;
    tcgId: z.ZodNullable<z.ZodString>;
    /** See EditionAmbiguitySchema. Null when there is nothing to disclose. */
    editionAmbiguity: z.ZodDefault<z.ZodNullable<z.ZodEnum<["first_edition_shadowless_unlimited", "first_edition_unlimited"]>>>;
    /**
     * ⚠️ LEGACY coefficients, for installed builds that predate /api/decide. Nothing new should
     * consume this — a client computing its own economics from raw coefficients is exactly what
     * ADR 0026 exists to stop. Declared here because it IS on the wire and an undeclared field is a
     * silently-stripped one; declaring it is not an endorsement.
     */
    economics: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        feeRate: z.ZodNumber;
        feeFixed: z.ZodNumber;
        postage: z.ZodNumber;
        packaging: z.ZodNumber;
        taxRate: z.ZodNumber;
        sellerType: z.ZodString;
        vatRegistered: z.ZodBoolean;
        /** "seller_override" | "derived_from_seller_type" — WHY the numbers are what they are, so the
         *  response stops being a set of unattributed constants. */
        feeBasis: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taxRate: number;
        feeRate: number;
        feeFixed: number;
        postage: number;
        packaging: number;
        sellerType: string;
        vatRegistered: boolean;
        feeBasis: string;
    }, {
        taxRate: number;
        feeRate: number;
        feeFixed: number;
        postage: number;
        packaging: number;
        sellerType: string;
        vatRegistered: boolean;
        feeBasis: string;
    }>>>;
    /** Do you already hold one? Powers "You already own N" + jump-to-it. An anonymous caller owns
     *  nothing by definition, so this is `{count: 0, physicalCardId: null}` rather than absent. */
    owned: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        count: z.ZodNumber;
        physicalCardId: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        physicalCardId: string | null;
        count: number;
    }, {
        physicalCardId: string | null;
        count: number;
    }>>>;
}, "strip", z.ZodTypeAny, {
    game: string | null;
    confidence: "high" | "medium" | "low" | null;
    gameDisplayName: string | null;
    suggestedPrice: number | null;
    ebay: {
        low: number | null;
        avg: number | null;
        top: number | null;
    } | null;
    priceSource: string | null;
    currencyNote: string | null;
    tcgId: string | null;
    priceWarning: string | null;
    possibleFinishes: string[] | null;
    finishUsed: string | null;
    editionAmbiguity: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null;
    economics?: {
        taxRate: number;
        feeRate: number;
        feeFixed: number;
        postage: number;
        packaging: number;
        sellerType: string;
        vatRegistered: boolean;
        feeBasis: string;
    } | null | undefined;
    owned?: {
        physicalCardId: string | null;
        count: number;
    } | null | undefined;
}, {
    game: string | null;
    confidence: "high" | "medium" | "low" | null;
    gameDisplayName: string | null;
    suggestedPrice: number | null;
    ebay: {
        low: number | null;
        avg: number | null;
        top: number | null;
    } | null;
    priceSource: string | null;
    currencyNote: string | null;
    tcgId: string | null;
    priceWarning: string | null;
    possibleFinishes: string[] | null;
    finishUsed: string | null;
    economics?: {
        taxRate: number;
        feeRate: number;
        feeFixed: number;
        postage: number;
        packaging: number;
        sellerType: string;
        vatRegistered: boolean;
        feeBasis: string;
    } | null | undefined;
    editionAmbiguity?: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null | undefined;
    owned?: {
        physicalCardId: string | null;
        count: number;
    } | null | undefined;
}>;
export type CardValueResponse = z.infer<typeof CardValueResponseSchema>;
