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
/**
 * `PricingSettingsSchema` with the two fee fields nullable (v0.2.0, BREAKING for `Profile`).
 *
 * `effectivePricingSettings` is "what the server will ACTUALLY use", with the seller-type
 * derivation applied to a null fee. When the seller type has never been confirmed there is nothing
 * to derive from, and answering with the private-seller fee (0) is the assumption this release
 * removes. So `ebayFeeRate`/`ebayFeeFixed` are null — together — exactly when `feeNotSetReason` is
 * set. A separate schema, not a loosened `PricingSettingsSchema`: that one is also a REQUEST body,
 * where the client asserts a fee and null would mean nothing.
 */
export declare const EffectivePricingSettingsSchema: z.ZodEffects<z.ZodObject<{
    packagingCost: z.ZodNumber;
    shippingCost: z.ZodNumber;
    taxRate: z.ZodNumber;
    minProfitPct: z.ZodNumber;
    minSaleValue: z.ZodNumber;
    postageCost: z.ZodNumber;
} & {
    ebayFeeRate: z.ZodNullable<z.ZodNumber>;
    ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
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
}>, {
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
export type EffectivePricingSettings = z.infer<typeof EffectivePricingSettingsSchema>;
export declare const ProfileSchema: z.ZodEffects<z.ZodObject<{
    /**
     * v0.2.0 (BREAKING): NULL until the seller has answered "private or business?" (asked once, on
     * first opening Sell or connecting eBay). Was non-null with `not null default 'private'`, so a
     * seller who had never been asked read as private and every fee downstream assumed £0.
     * Null exactly when `sellerTypeConfirmedAt` is null. An eBay-detected type is NOT an answer — it
     * is `suggestedSellerType`.
     */
    sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
    /** ISO time the seller answered. Null = never asked/answered. "Set" means this is non-null and
     *  nothing else (PLAN-SELLER-TYPE-FIRST-ASK §2). Read-only: written by PATCH `sellerType`. */
    sellerTypeConfirmedAt: z.ZodNullable<z.ZodString>;
    sellerTypeSource: z.ZodEnum<["manual", "auto"]>;
    /** eBay's detected type (`sellerTypeSource` "auto"), offered as a SUGGESTION the seller
     *  confirms — never applied on its own, and only ever "business" (absence of
     *  `BusinessSellerDetails` is not evidence of a private seller). Null when there is none. */
    suggestedSellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
    /** Only meaningful for a business seller. Null = the VAT question is unanswered (or the seller
     *  type is not set / private). Null exactly when `vatConfirmedAt` is null. */
    vatRegistered: z.ZodNullable<z.ZodBoolean>;
    vatConfirmedAt: z.ZodNullable<z.ZodString>;
    /** Read-only. Why the seller's fee is unknown, or null when it is known — either from the
     *  answers above or because the seller set their own fee override (a stated cost). The same
     *  fact the server reports as `feeNotSetReason` on every priced response. */
    feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
    /**
     * The seller's BUYING margin, as a % of the SALE price (PLAN-MOST-TO-PAY #224 §2). Its own
     * setting with NO fallback to the selling floor (`pricingSettings.minProfitPct`): null =
     * "Not set" and there is no most-to-pay (`maxBuyUnavailableReason: "margin_not_set"`). A stored
     * default is not a choice. Null exactly when `buyingTargetMarginSetAt` is null.
     */
    buyingTargetMarginPct: z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>;
    buyingTargetMarginSetAt: z.ZodNullable<z.ZodString>;
    /** The tax set-aside applied to buying, as a FRACTION. Null = no provision (not set); 0 = the
     *  seller chose "none". Separate from `pricingSettings.taxRate`, which is `not null default 0.20`
     *  and is therefore a default, not a choice (#224 §5). Selling-side tax is unchanged. */
    buyingTaxRate: z.ZodNullable<z.ZodNumber>;
    buyingTaxRateSetAt: z.ZodNullable<z.ZodString>;
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
     *  already applied to any null fee field. v0.2.0: the fee fields are NULL while the fee position
     *  is not set (`feeNotSetReason`) — the type is now `EffectivePricingSettings`, not
     *  `PricingSettings`. Read-only (PATCH `pricingSettings` to change it). */
    effectivePricingSettings: z.ZodEffects<z.ZodObject<{
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    } & {
        ebayFeeRate: z.ZodNullable<z.ZodNumber>;
        ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
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
    }>, {
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}>, {
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
    /** Writing this CONFIRMS the seller type (sets `sellerTypeSource` "manual" and
     *  `sellerTypeConfirmedAt`). There is no way to PATCH it back to unset. */
    sellerType: z.ZodOptional<z.ZodEnum<["private", "business"]>>;
    /** v0.2.0. Writing this answers the VAT question (sets `vatConfirmedAt`). */
    vatRegistered: z.ZodOptional<z.ZodBoolean>;
    /** v0.2.0. Writing a margin sets `buyingTargetMarginSetAt`. Number only: PLAN-MOST-TO-PAY #224
     *  defines no way to clear a chosen margin back to "Not set". */
    buyingTargetMarginPct: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    /** v0.2.0. 0 is a legal, deliberate "no provision". */
    buyingTaxRate: z.ZodOptional<z.ZodNumber>;
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
    vatRegistered?: boolean | undefined;
    buyingTargetMarginPct?: number | undefined;
    buyingTaxRate?: number | undefined;
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
    vatRegistered?: boolean | undefined;
    buyingTargetMarginPct?: number | undefined;
    buyingTaxRate?: number | undefined;
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
export declare const ProfileResponseSchema: z.ZodEffects<z.ZodObject<{
    /**
     * v0.2.0 (BREAKING): NULL until the seller has answered "private or business?" (asked once, on
     * first opening Sell or connecting eBay). Was non-null with `not null default 'private'`, so a
     * seller who had never been asked read as private and every fee downstream assumed £0.
     * Null exactly when `sellerTypeConfirmedAt` is null. An eBay-detected type is NOT an answer — it
     * is `suggestedSellerType`.
     */
    sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
    /** ISO time the seller answered. Null = never asked/answered. "Set" means this is non-null and
     *  nothing else (PLAN-SELLER-TYPE-FIRST-ASK §2). Read-only: written by PATCH `sellerType`. */
    sellerTypeConfirmedAt: z.ZodNullable<z.ZodString>;
    sellerTypeSource: z.ZodEnum<["manual", "auto"]>;
    /** eBay's detected type (`sellerTypeSource` "auto"), offered as a SUGGESTION the seller
     *  confirms — never applied on its own, and only ever "business" (absence of
     *  `BusinessSellerDetails` is not evidence of a private seller). Null when there is none. */
    suggestedSellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
    /** Only meaningful for a business seller. Null = the VAT question is unanswered (or the seller
     *  type is not set / private). Null exactly when `vatConfirmedAt` is null. */
    vatRegistered: z.ZodNullable<z.ZodBoolean>;
    vatConfirmedAt: z.ZodNullable<z.ZodString>;
    /** Read-only. Why the seller's fee is unknown, or null when it is known — either from the
     *  answers above or because the seller set their own fee override (a stated cost). The same
     *  fact the server reports as `feeNotSetReason` on every priced response. */
    feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
    /**
     * The seller's BUYING margin, as a % of the SALE price (PLAN-MOST-TO-PAY #224 §2). Its own
     * setting with NO fallback to the selling floor (`pricingSettings.minProfitPct`): null =
     * "Not set" and there is no most-to-pay (`maxBuyUnavailableReason: "margin_not_set"`). A stored
     * default is not a choice. Null exactly when `buyingTargetMarginSetAt` is null.
     */
    buyingTargetMarginPct: z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>;
    buyingTargetMarginSetAt: z.ZodNullable<z.ZodString>;
    /** The tax set-aside applied to buying, as a FRACTION. Null = no provision (not set); 0 = the
     *  seller chose "none". Separate from `pricingSettings.taxRate`, which is `not null default 0.20`
     *  and is therefore a default, not a choice (#224 §5). Selling-side tax is unchanged. */
    buyingTaxRate: z.ZodNullable<z.ZodNumber>;
    buyingTaxRateSetAt: z.ZodNullable<z.ZodString>;
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
     *  already applied to any null fee field. v0.2.0: the fee fields are NULL while the fee position
     *  is not set (`feeNotSetReason`) — the type is now `EffectivePricingSettings`, not
     *  `PricingSettings`. Read-only (PATCH `pricingSettings` to change it). */
    effectivePricingSettings: z.ZodEffects<z.ZodObject<{
        packagingCost: z.ZodNumber;
        shippingCost: z.ZodNumber;
        taxRate: z.ZodNumber;
        minProfitPct: z.ZodNumber;
        minSaleValue: z.ZodNumber;
        postageCost: z.ZodNumber;
    } & {
        ebayFeeRate: z.ZodNullable<z.ZodNumber>;
        ebayFeeFixed: z.ZodNullable<z.ZodNumber>;
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
    }>, {
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    };
    isAdmin: boolean;
}>, {
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    sellerTypeSource: "manual" | "auto";
    suggestedSellerType: "private" | "business" | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    buyingTaxRate: number | null;
    buyingTaxRateSetAt: string | null;
    dispatchAddress: {
        line1: string | null;
        city: string | null;
        postcode: string | null;
        country: string;
    };
    agedInventoryDays: number;
    effectivePricingSettings: {
        ebayFeeRate: number | null;
        ebayFeeFixed: number | null;
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
