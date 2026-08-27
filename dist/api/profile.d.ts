import { z } from "zod";
export declare const SellerTypeSchema: z.ZodEnum<["private", "business"]>;
export type SellerType = z.infer<typeof SellerTypeSchema>;
/** `manual` = an explicit seller choice (onboarding, or a Settings edit). `auto` = detected from
 *  the connected eBay account at OAuth time. The distinction is what stops the auto-detect pass
 *  silently clobbering a deliberate override — see curio-shared/decisions/0006. */
export declare const SellerTypeSourceSchema: z.ZodEnum<["manual", "auto"]>;
export type SellerTypeSource = z.infer<typeof SellerTypeSourceSchema>;
export declare const DispatchAddressSchema: z.ZodObject<{
    line1: z.ZodNullable<z.ZodString>;
    city: z.ZodNullable<z.ZodString>;
    postcode: z.ZodNullable<z.ZodString>;
    /** ISO-3166 alpha-2. Always present — the column is NOT NULL with a 'GB' default. */
    country: z.ZodString;
}, "strip", z.ZodTypeAny, {
    line1: string | null;
    city: string | null;
    postcode: string | null;
    country: string;
}, {
    line1: string | null;
    city: string | null;
    postcode: string | null;
    country: string;
}>;
export type DispatchAddress = z.infer<typeof DispatchAddressSchema>;
/**
 * The seller's STORED pricing settings, as persisted.
 *
 * Differs from `PricingSettingsSchema` (the fully-resolved shape the engines consume) in exactly
 * one way: the two eBay fee fields are nullable, where null means **"not configured — derive it
 * from my seller type"** rather than "zero". That distinction is what ADR 0006 needs: eBay's fee
 * rate is a fact about the seller's own eBay registration (private pays £0 since Oct 2024;
 * business pays 12.8% + a fixed per-order fee + ~0.35% regulatory), not a preference the user
 * should have to look up and type in. A non-null value is an explicit override — a seller on a
 * shop subscription with negotiated rates, say.
 *
 * The other six are genuine preferences with universal defaults, unrelated to seller type, so
 * they're always populated.
 */
export declare const StoredPricingSettingsSchema: z.ZodObject<{
    ebayFeeRate: z.ZodNullable<z.ZodNumber>;
    ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
    packagingCost: z.ZodNumber;
    shippingCost: z.ZodNumber;
    taxRate: z.ZodNumber;
    minProfitPct: z.ZodNumber;
    minSaleValue: z.ZodNumber;
    postageCost: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    ebayFeeRate: number | null;
    ebayFeeFixed: number | null;
    packagingCost: number;
    shippingCost: number;
    taxRate: number;
    minProfitPct: number;
    minSaleValue: number;
    postageCost: number;
}, {
    ebayFeeRate: number | null;
    ebayFeeFixed: number | null;
    packagingCost: number;
    shippingCost: number;
    taxRate: number;
    minProfitPct: number;
    minSaleValue: number;
    postageCost: number;
}>;
export type StoredPricingSettings = z.infer<typeof StoredPricingSettingsSchema>;
export declare const ProfileSchema: z.ZodObject<{
    sellerType: z.ZodEnum<["private", "business"]>;
    sellerTypeSource: z.ZodEnum<["manual", "auto"]>;
    dispatchAddress: z.ZodObject<{
        line1: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        postcode: z.ZodNullable<z.ZodString>;
        /** ISO-3166 alpha-2. Always present — the column is NOT NULL with a 'GB' default. */
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    }, {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    }>;
    /** Days before unsold stock is flagged as aged on the dashboard. */
    agedInventoryDays: z.ZodNumber;
    /** As persisted — see StoredPricingSettingsSchema on why the fee fields are nullable. Render
     *  a null fee field as empty-with-a-placeholder, not as "0". */
    pricingSettings: z.ZodObject<{
        ebayFeeRate: z.ZodNullable<z.ZodNumber>;
        ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }, {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }>;
    /** What the server will ACTUALLY use: `pricingSettings` with ADR 0006's seller-type derivation
     *  already applied to any null fee field. Read-only (PATCH `pricingSettings` to change it) and
     *  the honest thing to show beside a blank input, so a business seller never sees a £0 fee
     *  estimate and has to work out for themselves that it's wrong. */
    effectivePricingSettings: z.ZodObject<{
        ebayFeeRate: z.ZodNumber;
        ebayFeeFixed: z.ZodNumber;
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }>;
    /** Read-only. Only the service role can flip it — never accepted on PATCH. */
    isAdmin: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    pricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    sellerType: "private" | "business";
    sellerTypeSource: "manual" | "auto";
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}, {
    pricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    sellerType: "private" | "business";
    sellerTypeSource: "manual" | "auto";
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}>;
export type Profile = z.infer<typeof ProfileSchema>;
export declare const DispatchAddressPatchSchema: z.ZodObject<{
    line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    postcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    country: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    line1?: string | null | undefined;
    city?: string | null | undefined;
    postcode?: string | null | undefined;
    country?: string | undefined;
}, {
    line1?: string | null | undefined;
    city?: string | null | undefined;
    postcode?: string | null | undefined;
    country?: string | undefined;
}>;
export type DispatchAddressPatch = z.infer<typeof DispatchAddressPatchSchema>;
export declare const StoredPricingSettingsPatchSchema: z.ZodObject<{
    ebayFeeRate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    ebayFeeFixed: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    packagingCost: z.ZodOptional<z.ZodNumber>;
    shippingCost: z.ZodOptional<z.ZodNumber>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    minProfitPct: z.ZodOptional<z.ZodNumber>;
    minSaleValue: z.ZodOptional<z.ZodNumber>;
    postageCost: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    ebayFeeRate?: number | null | undefined;
    ebayFeeFixed?: number | null | undefined;
    packagingCost?: number | undefined;
    shippingCost?: number | undefined;
    taxRate?: number | undefined;
    minProfitPct?: number | undefined;
    minSaleValue?: number | undefined;
    postageCost?: number | undefined;
}, {
    ebayFeeRate?: number | null | undefined;
    ebayFeeFixed?: number | null | undefined;
    packagingCost?: number | undefined;
    shippingCost?: number | undefined;
    taxRate?: number | undefined;
    minProfitPct?: number | undefined;
    minSaleValue?: number | undefined;
    postageCost?: number | undefined;
}>;
export type StoredPricingSettingsPatch = z.infer<typeof StoredPricingSettingsPatchSchema>;
export declare const ProfilePatchSchema: z.ZodObject<{
    sellerType: z.ZodOptional<z.ZodEnum<["private", "business"]>>;
    dispatchAddress: z.ZodOptional<z.ZodObject<{
        line1: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        city: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        postcode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        country: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        line1?: string | null | undefined;
        city?: string | null | undefined;
        postcode?: string | null | undefined;
        country?: string | undefined;
    }, {
        line1?: string | null | undefined;
        city?: string | null | undefined;
        postcode?: string | null | undefined;
        country?: string | undefined;
    }>>;
    agedInventoryDays: z.ZodOptional<z.ZodNumber>;
    pricingSettings: z.ZodOptional<z.ZodObject<{
        ebayFeeRate: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        ebayFeeFixed: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        packagingCost: z.ZodOptional<z.ZodNumber>;
        shippingCost: z.ZodOptional<z.ZodNumber>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        minProfitPct: z.ZodOptional<z.ZodNumber>;
        minSaleValue: z.ZodOptional<z.ZodNumber>;
        postageCost: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate?: number | null | undefined;
        ebayFeeFixed?: number | null | undefined;
        packagingCost?: number | undefined;
        shippingCost?: number | undefined;
        taxRate?: number | undefined;
        minProfitPct?: number | undefined;
        minSaleValue?: number | undefined;
        postageCost?: number | undefined;
    }, {
        ebayFeeRate?: number | null | undefined;
        ebayFeeFixed?: number | null | undefined;
        packagingCost?: number | undefined;
        shippingCost?: number | undefined;
        taxRate?: number | undefined;
        minProfitPct?: number | undefined;
        minSaleValue?: number | undefined;
        postageCost?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    pricingSettings?: {
        ebayFeeRate?: number | null | undefined;
        ebayFeeFixed?: number | null | undefined;
        packagingCost?: number | undefined;
        shippingCost?: number | undefined;
        taxRate?: number | undefined;
        minProfitPct?: number | undefined;
        minSaleValue?: number | undefined;
        postageCost?: number | undefined;
    } | undefined;
    sellerType?: "private" | "business" | undefined;
    dispatchAddress?: {
        line1?: string | null | undefined;
        city?: string | null | undefined;
        postcode?: string | null | undefined;
        country?: string | undefined;
    } | undefined;
    agedInventoryDays?: number | undefined;
}, {
    pricingSettings?: {
        ebayFeeRate?: number | null | undefined;
        ebayFeeFixed?: number | null | undefined;
        packagingCost?: number | undefined;
        shippingCost?: number | undefined;
        taxRate?: number | undefined;
        minProfitPct?: number | undefined;
        minSaleValue?: number | undefined;
        postageCost?: number | undefined;
    } | undefined;
    sellerType?: "private" | "business" | undefined;
    dispatchAddress?: {
        line1?: string | null | undefined;
        city?: string | null | undefined;
        postcode?: string | null | undefined;
        country?: string | undefined;
    } | undefined;
    agedInventoryDays?: number | undefined;
}>;
export type ProfilePatch = z.infer<typeof ProfilePatchSchema>;
/** Both GET and PATCH return the full, post-write profile, so a caller never has to re-fetch to
 *  see what its own partial write resolved to (notably `effectivePricingSettings`, which can
 *  change as a side effect of a `sellerType` write). */
export declare const ProfileResponseSchema: z.ZodObject<{
    sellerType: z.ZodEnum<["private", "business"]>;
    sellerTypeSource: z.ZodEnum<["manual", "auto"]>;
    dispatchAddress: z.ZodObject<{
        line1: z.ZodNullable<z.ZodString>;
        city: z.ZodNullable<z.ZodString>;
        postcode: z.ZodNullable<z.ZodString>;
        /** ISO-3166 alpha-2. Always present — the column is NOT NULL with a 'GB' default. */
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    }, {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    }>;
    /** Days before unsold stock is flagged as aged on the dashboard. */
    agedInventoryDays: z.ZodNumber;
    /** As persisted — see StoredPricingSettingsSchema on why the fee fields are nullable. Render
     *  a null fee field as empty-with-a-placeholder, not as "0". */
    pricingSettings: z.ZodObject<{
        ebayFeeRate: z.ZodNullable<z.ZodNumber>;
        ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }, {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }>;
    /** What the server will ACTUALLY use: `pricingSettings` with ADR 0006's seller-type derivation
     *  already applied to any null fee field. Read-only (PATCH `pricingSettings` to change it) and
     *  the honest thing to show beside a blank input, so a business seller never sees a £0 fee
     *  estimate and has to work out for themselves that it's wrong. */
    effectivePricingSettings: z.ZodObject<{
        ebayFeeRate: z.ZodNumber;
        ebayFeeFixed: z.ZodNumber;
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }, {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    }>;
    /** Read-only. Only the service role can flip it — never accepted on PATCH. */
    isAdmin: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    pricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    sellerType: "private" | "business";
    sellerTypeSource: "manual" | "auto";
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}, {
    pricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    sellerType: "private" | "business";
    sellerTypeSource: "manual" | "auto";
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
