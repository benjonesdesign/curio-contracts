import { z } from "zod";
/** The Dispatch panel as it is stored. The service KEYS are the server's catalogue (open string here: the catalogue, and the
 *  rule that exactly one enabled service is the default, are checked by the server, which answers 400 `postageRules`). */
export declare const StoredPostageServiceSchema: z.ZodObject<{
    key: z.ZodString;
    enabled: z.ZodBoolean;
    /** Used for items priced strictly above this. null = no threshold. */
    usedAboveGbp: z.ZodNullable<z.ZodNumber>;
    isDefault: z.ZodBoolean;
    costOverrideGbp: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    key: string;
    enabled: boolean;
    usedAboveGbp: number | null;
    isDefault: boolean;
    costOverrideGbp: number | null;
}, {
    key: string;
    enabled: boolean;
    usedAboveGbp: number | null;
    isDefault: boolean;
    costOverrideGbp: number | null;
}>;
export type StoredPostageService = z.infer<typeof StoredPostageServiceSchema>;
export declare const StoredPostageRulesSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    /** Item price strictly above which postage is free to the buyer. null = never free. */
    freePostageAboveGbp: z.ZodNullable<z.ZodNumber>;
    services: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        enabled: z.ZodBoolean;
        /** Used for items priced strictly above this. null = no threshold. */
        usedAboveGbp: z.ZodNullable<z.ZodNumber>;
        isDefault: z.ZodBoolean;
        costOverrideGbp: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        key: string;
        enabled: boolean;
        usedAboveGbp: number | null;
        isDefault: boolean;
        costOverrideGbp: number | null;
    }, {
        key: string;
        enabled: boolean;
        usedAboveGbp: number | null;
        isDefault: boolean;
        costOverrideGbp: number | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    v: 1;
    freePostageAboveGbp: number | null;
    services: {
        key: string;
        enabled: boolean;
        usedAboveGbp: number | null;
        isDefault: boolean;
        costOverrideGbp: number | null;
    }[];
}, {
    v: 1;
    freePostageAboveGbp: number | null;
    services: {
        key: string;
        enabled: boolean;
        usedAboveGbp: number | null;
        isDefault: boolean;
        costOverrideGbp: number | null;
    }[];
}>;
export type StoredPostageRules = z.infer<typeof StoredPostageRulesSchema>;
export declare const ProfileSettingsPatchSchema: z.ZodObject<{
    sellerType: z.ZodOptional<z.ZodEnum<["private", "business"]>>;
    /** Business sellers only. */
    vatRegistered: z.ZodOptional<z.ZodBoolean>;
    /** A plain percent (20 = 20%); 0 is stored as not set. */
    incomeTaxRatePct: z.ZodOptional<z.ZodNullable<z.ZodEffects<z.ZodNumber, number, number>>>;
    /** Percent of the SALE price, 0..95; null = not set (then there is no most-to-pay). */
    buyingTargetMarginPct: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    hourlyRateGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    packingMaterialsGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    packingMinutesPerParcel: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    postageRules: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        v: z.ZodLiteral<1>;
        /** Item price strictly above which postage is free to the buyer. null = never free. */
        freePostageAboveGbp: z.ZodNullable<z.ZodNumber>;
        services: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            enabled: z.ZodBoolean;
            /** Used for items priced strictly above this. null = no threshold. */
            usedAboveGbp: z.ZodNullable<z.ZodNumber>;
            isDefault: z.ZodBoolean;
            costOverrideGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }, {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    }, {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    }>>>;
    /** Whole working days promised on every listing, 1..3. */
    handlingDays: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /** A hard bidding ceiling in pounds across every search; 0 or null = none. */
    neverBidAboveGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    sellerType?: "private" | "business" | undefined;
    vatRegistered?: boolean | undefined;
    buyingTargetMarginPct?: number | null | undefined;
    incomeTaxRatePct?: number | null | undefined;
    hourlyRateGbp?: number | null | undefined;
    packingMaterialsGbp?: number | null | undefined;
    packingMinutesPerParcel?: number | null | undefined;
    postageRules?: {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    } | null | undefined;
    handlingDays?: number | null | undefined;
    neverBidAboveGbp?: number | null | undefined;
}, {
    sellerType?: "private" | "business" | undefined;
    vatRegistered?: boolean | undefined;
    buyingTargetMarginPct?: number | null | undefined;
    incomeTaxRatePct?: number | null | undefined;
    hourlyRateGbp?: number | null | undefined;
    packingMaterialsGbp?: number | null | undefined;
    packingMinutesPerParcel?: number | null | undefined;
    postageRules?: {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    } | null | undefined;
    handlingDays?: number | null | undefined;
    neverBidAboveGbp?: number | null | undefined;
}>;
export type ProfileSettingsPatch = z.infer<typeof ProfileSettingsPatchSchema>;
/** WHY a figure is missing, so a screen shows the reason beside the input. true = not set. */
export declare const ProfileSettingsNotSetSchema: z.ZodObject<{
    sellerType: z.ZodBoolean;
    vatPosition: z.ZodBoolean;
    buyingTargetMargin: z.ZodBoolean;
    incomeTaxRate: z.ZodBoolean;
    hourlyRate: z.ZodBoolean;
    packingMaterials: z.ZodBoolean;
    packingMinutes: z.ZodBoolean;
    handlingDays: z.ZodBoolean;
    neverBidAbove: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    sellerType: boolean;
    vatPosition: boolean;
    handlingDays: boolean;
    buyingTargetMargin: boolean;
    incomeTaxRate: boolean;
    hourlyRate: boolean;
    packingMaterials: boolean;
    packingMinutes: boolean;
    neverBidAbove: boolean;
}, {
    sellerType: boolean;
    vatPosition: boolean;
    handlingDays: boolean;
    buyingTargetMargin: boolean;
    incomeTaxRate: boolean;
    hourlyRate: boolean;
    packingMaterials: boolean;
    packingMinutes: boolean;
    neverBidAbove: boolean;
}>;
export type ProfileSettingsNotSet = z.infer<typeof ProfileSettingsNotSetSchema>;
export declare const ProfileSettingsViewSchema: z.ZodObject<{
    /** null until the seller has answered. */
    sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
    sellerTypeConfirmedAt: z.ZodNullable<z.ZodString>;
    /** null until a business seller has answered (and always null for a private seller). */
    vatRegistered: z.ZodNullable<z.ZodBoolean>;
    vatConfirmedAt: z.ZodNullable<z.ZodString>;
    /** A plain percent (35 = 35%) of the SALE price; null = not set. */
    buyingTargetMarginPct: z.ZodNullable<z.ZodNumber>;
    buyingTargetMarginSetAt: z.ZodNullable<z.ZodString>;
    /** A plain percent (20 = 20%); null = not set (no tax line). */
    incomeTaxRatePct: z.ZodNullable<z.ZodNumber>;
    hourlyRateGbp: z.ZodNullable<z.ZodNumber>;
    handlingDays: z.ZodNullable<z.ZodNumber>;
    neverBidAboveGbp: z.ZodNullable<z.ZodNumber>;
    packingMaterialsGbp: z.ZodNullable<z.ZodNumber>;
    packingMinutesPerParcel: z.ZodNullable<z.ZodNumber>;
    postageRules: z.ZodNullable<z.ZodObject<{
        v: z.ZodLiteral<1>;
        /** Item price strictly above which postage is free to the buyer. null = never free. */
        freePostageAboveGbp: z.ZodNullable<z.ZodNumber>;
        services: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            enabled: z.ZodBoolean;
            /** Used for items priced strictly above this. null = no threshold. */
            usedAboveGbp: z.ZodNullable<z.ZodNumber>;
            isDefault: z.ZodBoolean;
            costOverrideGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }, {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    }, {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    }>>;
    notSet: z.ZodObject<{
        sellerType: z.ZodBoolean;
        vatPosition: z.ZodBoolean;
        buyingTargetMargin: z.ZodBoolean;
        incomeTaxRate: z.ZodBoolean;
        hourlyRate: z.ZodBoolean;
        packingMaterials: z.ZodBoolean;
        packingMinutes: z.ZodBoolean;
        handlingDays: z.ZodBoolean;
        neverBidAbove: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        sellerType: boolean;
        vatPosition: boolean;
        handlingDays: boolean;
        buyingTargetMargin: boolean;
        incomeTaxRate: boolean;
        hourlyRate: boolean;
        packingMaterials: boolean;
        packingMinutes: boolean;
        neverBidAbove: boolean;
    }, {
        sellerType: boolean;
        vatPosition: boolean;
        handlingDays: boolean;
        buyingTargetMargin: boolean;
        incomeTaxRate: boolean;
        hourlyRate: boolean;
        packingMaterials: boolean;
        packingMinutes: boolean;
        neverBidAbove: boolean;
    }>;
    /** The eBay fee position: known (null), or the one reason it is not. */
    feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
    /** True when the ruled most-to-pay can produce a figure: the fee is known AND a buying margin is set. */
    mostToPayReady: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    notSet: {
        sellerType: boolean;
        vatPosition: boolean;
        handlingDays: boolean;
        buyingTargetMargin: boolean;
        incomeTaxRate: boolean;
        hourlyRate: boolean;
        packingMaterials: boolean;
        packingMinutes: boolean;
        neverBidAbove: boolean;
    };
    incomeTaxRatePct: number | null;
    hourlyRateGbp: number | null;
    packingMaterialsGbp: number | null;
    packingMinutesPerParcel: number | null;
    postageRules: {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    } | null;
    handlingDays: number | null;
    neverBidAboveGbp: number | null;
    mostToPayReady: boolean;
}, {
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    sellerType: "private" | "business" | null;
    vatRegistered: boolean | null;
    sellerTypeConfirmedAt: string | null;
    vatConfirmedAt: string | null;
    buyingTargetMarginPct: number | null;
    buyingTargetMarginSetAt: string | null;
    notSet: {
        sellerType: boolean;
        vatPosition: boolean;
        handlingDays: boolean;
        buyingTargetMargin: boolean;
        incomeTaxRate: boolean;
        hourlyRate: boolean;
        packingMaterials: boolean;
        packingMinutes: boolean;
        neverBidAbove: boolean;
    };
    incomeTaxRatePct: number | null;
    hourlyRateGbp: number | null;
    packingMaterialsGbp: number | null;
    packingMinutesPerParcel: number | null;
    postageRules: {
        v: 1;
        freePostageAboveGbp: number | null;
        services: {
            key: string;
            enabled: boolean;
            usedAboveGbp: number | null;
            isDefault: boolean;
            costOverrideGbp: number | null;
        }[];
    } | null;
    handlingDays: number | null;
    neverBidAboveGbp: number | null;
    mostToPayReady: boolean;
}>;
export type ProfileSettingsView = z.infer<typeof ProfileSettingsViewSchema>;
/** GET and a successful PATCH both answer with the post-write view. */
export declare const ProfileSettingsResponseSchema: z.ZodObject<{
    profile: z.ZodObject<{
        /** null until the seller has answered. */
        sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
        sellerTypeConfirmedAt: z.ZodNullable<z.ZodString>;
        /** null until a business seller has answered (and always null for a private seller). */
        vatRegistered: z.ZodNullable<z.ZodBoolean>;
        vatConfirmedAt: z.ZodNullable<z.ZodString>;
        /** A plain percent (35 = 35%) of the SALE price; null = not set. */
        buyingTargetMarginPct: z.ZodNullable<z.ZodNumber>;
        buyingTargetMarginSetAt: z.ZodNullable<z.ZodString>;
        /** A plain percent (20 = 20%); null = not set (no tax line). */
        incomeTaxRatePct: z.ZodNullable<z.ZodNumber>;
        hourlyRateGbp: z.ZodNullable<z.ZodNumber>;
        handlingDays: z.ZodNullable<z.ZodNumber>;
        neverBidAboveGbp: z.ZodNullable<z.ZodNumber>;
        packingMaterialsGbp: z.ZodNullable<z.ZodNumber>;
        packingMinutesPerParcel: z.ZodNullable<z.ZodNumber>;
        postageRules: z.ZodNullable<z.ZodObject<{
            v: z.ZodLiteral<1>;
            /** Item price strictly above which postage is free to the buyer. null = never free. */
            freePostageAboveGbp: z.ZodNullable<z.ZodNumber>;
            services: z.ZodArray<z.ZodObject<{
                key: z.ZodString;
                enabled: z.ZodBoolean;
                /** Used for items priced strictly above this. null = no threshold. */
                usedAboveGbp: z.ZodNullable<z.ZodNumber>;
                isDefault: z.ZodBoolean;
                costOverrideGbp: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }, {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        }, {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        }>>;
        notSet: z.ZodObject<{
            sellerType: z.ZodBoolean;
            vatPosition: z.ZodBoolean;
            buyingTargetMargin: z.ZodBoolean;
            incomeTaxRate: z.ZodBoolean;
            hourlyRate: z.ZodBoolean;
            packingMaterials: z.ZodBoolean;
            packingMinutes: z.ZodBoolean;
            handlingDays: z.ZodBoolean;
            neverBidAbove: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        }, {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        }>;
        /** The eBay fee position: known (null), or the one reason it is not. */
        feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
        /** True when the ruled most-to-pay can produce a figure: the fee is known AND a buying margin is set. */
        mostToPayReady: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        sellerType: "private" | "business" | null;
        vatRegistered: boolean | null;
        sellerTypeConfirmedAt: string | null;
        vatConfirmedAt: string | null;
        buyingTargetMarginPct: number | null;
        buyingTargetMarginSetAt: string | null;
        notSet: {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        };
        incomeTaxRatePct: number | null;
        hourlyRateGbp: number | null;
        packingMaterialsGbp: number | null;
        packingMinutesPerParcel: number | null;
        postageRules: {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        } | null;
        handlingDays: number | null;
        neverBidAboveGbp: number | null;
        mostToPayReady: boolean;
    }, {
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        sellerType: "private" | "business" | null;
        vatRegistered: boolean | null;
        sellerTypeConfirmedAt: string | null;
        vatConfirmedAt: string | null;
        buyingTargetMarginPct: number | null;
        buyingTargetMarginSetAt: string | null;
        notSet: {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        };
        incomeTaxRatePct: number | null;
        hourlyRateGbp: number | null;
        packingMaterialsGbp: number | null;
        packingMinutesPerParcel: number | null;
        postageRules: {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        } | null;
        handlingDays: number | null;
        neverBidAboveGbp: number | null;
        mostToPayReady: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    profile: {
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        sellerType: "private" | "business" | null;
        vatRegistered: boolean | null;
        sellerTypeConfirmedAt: string | null;
        vatConfirmedAt: string | null;
        buyingTargetMarginPct: number | null;
        buyingTargetMarginSetAt: string | null;
        notSet: {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        };
        incomeTaxRatePct: number | null;
        hourlyRateGbp: number | null;
        packingMaterialsGbp: number | null;
        packingMinutesPerParcel: number | null;
        postageRules: {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        } | null;
        handlingDays: number | null;
        neverBidAboveGbp: number | null;
        mostToPayReady: boolean;
    };
}, {
    profile: {
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        sellerType: "private" | "business" | null;
        vatRegistered: boolean | null;
        sellerTypeConfirmedAt: string | null;
        vatConfirmedAt: string | null;
        buyingTargetMarginPct: number | null;
        buyingTargetMarginSetAt: string | null;
        notSet: {
            sellerType: boolean;
            vatPosition: boolean;
            handlingDays: boolean;
            buyingTargetMargin: boolean;
            incomeTaxRate: boolean;
            hourlyRate: boolean;
            packingMaterials: boolean;
            packingMinutes: boolean;
            neverBidAbove: boolean;
        };
        incomeTaxRatePct: number | null;
        hourlyRateGbp: number | null;
        packingMaterialsGbp: number | null;
        packingMinutesPerParcel: number | null;
        postageRules: {
            v: 1;
            freePostageAboveGbp: number | null;
            services: {
                key: string;
                enabled: boolean;
                usedAboveGbp: number | null;
                isDefault: boolean;
                costOverrideGbp: number | null;
            }[];
        } | null;
        handlingDays: number | null;
        neverBidAboveGbp: number | null;
        mostToPayReady: boolean;
    };
}>;
export type ProfileSettingsResponse = z.infer<typeof ProfileSettingsResponseSchema>;
/** 400 for a refused PATCH: one sentence per field, written to be shown beside the input. */
export declare const ProfileSettingsInvalidSchema: z.ZodObject<{
    error: z.ZodString;
    code: z.ZodLiteral<"invalid_request">;
    requestId: z.ZodOptional<z.ZodString>;
    fields: z.ZodRecord<z.ZodString, z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error: string;
    code: "invalid_request";
    fields: Record<string, string>;
    requestId?: string | undefined;
}, {
    error: string;
    code: "invalid_request";
    fields: Record<string, string>;
    requestId?: string | undefined;
}>;
export type ProfileSettingsInvalid = z.infer<typeof ProfileSettingsInvalidSchema>;
