import { z } from "zod";
export declare const PricingSettingsSchema: z.ZodObject<{
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
export type PricingSettings = z.infer<typeof PricingSettingsSchema>;
export declare const RecommendRequestSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** Explicit override; otherwise derived server-side from the card's set name. */
    isVintage: z.ZodOptional<z.ZodBoolean>;
    pricingSettings: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    isVintage?: boolean | undefined;
    pricingSettings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}, {
    physicalCardId: string;
    isVintage?: boolean | undefined;
    pricingSettings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}>;
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
export declare const RecommendedRouteSchema: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
export type RecommendedRoute = z.infer<typeof RecommendedRouteSchema>;
export declare const RouteEconomicsSchema: z.ZodObject<{
    expected_sale_gbp: z.ZodNullable<z.ZodNumber>;
    fees_gbp: z.ZodNullable<z.ZodNumber>;
    postage_gbp: z.ZodNullable<z.ZodNumber>;
    cost_basis_gbp: z.ZodNullable<z.ZodNumber>;
    expected_net_gbp: z.ZodNullable<z.ZodNumber>;
    liquidity: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
}, "strip", z.ZodTypeAny, {
    expected_sale_gbp: number | null;
    fees_gbp: number | null;
    postage_gbp: number | null;
    cost_basis_gbp: number | null;
    expected_net_gbp: number | null;
    liquidity: "high" | "medium" | "low" | null;
}, {
    expected_sale_gbp: number | null;
    fees_gbp: number | null;
    postage_gbp: number | null;
    cost_basis_gbp: number | null;
    expected_net_gbp: number | null;
    liquidity: "high" | "medium" | "low" | null;
}>;
export declare const RouteAlternativeSchema: z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    expected_net_gbp: z.ZodNullable<z.ZodNumber>;
    why: z.ZodString;
}, "strip", z.ZodTypeAny, {
    expected_net_gbp: number | null;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    why: string;
}, {
    expected_net_gbp: number | null;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    why: string;
}>;
export declare const GradeEVConfidenceSchema: z.ZodEnum<["medium", "low"]>;
export declare const RecommendResponseSchema: z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    alternatives: z.ZodArray<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        why: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }>, "many">;
    economics: z.ZodObject<{
        expected_sale_gbp: z.ZodNullable<z.ZodNumber>;
        fees_gbp: z.ZodNullable<z.ZodNumber>;
        postage_gbp: z.ZodNullable<z.ZodNumber>;
        cost_basis_gbp: z.ZodNullable<z.ZodNumber>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        liquidity: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }>;
    assumptions: z.ZodArray<z.ZodString, "many">;
    explanation: z.ZodString;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    calculation_version: z.ZodString;
    physicalCardId: z.ZodString;
    currentRoute: z.ZodNullable<z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>>;
    priceSource: z.ZodNullable<z.ZodString>;
    priceConfidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    currencyNote: z.ZodNullable<z.ZodString>;
    gradeEV: z.ZodNullable<z.ZodNumber>;
    psa10PriceGbp: z.ZodNullable<z.ZodNumber>;
    p10: z.ZodNullable<z.ZodNumber>;
    p9: z.ZodNullable<z.ZodNumber>;
    gradingCostGbp: z.ZodNullable<z.ZodNumber>;
    rawNetGbp: z.ZodNullable<z.ZodNumber>;
    gradeEVConfidence: z.ZodNullable<z.ZodEnum<["medium", "low"]>>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    physicalCardId: string;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    };
    assumptions: string[];
    explanation: string;
    calculation_version: string;
    currentRoute: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
    priceSource: string | null;
    priceConfidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
    gradeEV: number | null;
    psa10PriceGbp: number | null;
    p10: number | null;
    p9: number | null;
    gradingCostGbp: number | null;
    rawNetGbp: number | null;
    gradeEVConfidence: "medium" | "low" | null;
}, {
    confidence: "high" | "medium" | "low";
    physicalCardId: string;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    };
    assumptions: string[];
    explanation: string;
    calculation_version: string;
    currentRoute: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
    priceSource: string | null;
    priceConfidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
    gradeEV: number | null;
    psa10PriceGbp: number | null;
    p10: number | null;
    p9: number | null;
    gradingCostGbp: number | null;
    rawNetGbp: number | null;
    gradeEVConfidence: "medium" | "low" | null;
}>;
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
export declare const RecommendBatchCardInputSchema: z.ZodObject<{
    /** Caller-assigned id (e.g. the client-side listing id) — echoed back to match results up. */
    id: z.ZodString;
    avgGbp: z.ZodNullable<z.ZodNumber>;
    lowGbp: z.ZodNullable<z.ZodNumber>;
    topGbp: z.ZodNullable<z.ZodNumber>;
    priceSource: z.ZodNullable<z.ZodString>;
    saleCount: z.ZodNullable<z.ZodNumber>;
    approxSaleCount: z.ZodNullable<z.ZodBoolean>;
    condition: z.ZodNullable<z.ZodString>;
    costBasis: z.ZodNullable<z.ZodNumber>;
    collectionType: z.ZodNullable<z.ZodEnum<["personal", "resale"]>>;
    isVintage: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    collectionType: "personal" | "resale" | null;
    condition: string | null;
    priceSource: string | null;
    avgGbp: number | null;
    lowGbp: number | null;
    topGbp: number | null;
    saleCount: number | null;
    approxSaleCount: boolean | null;
    costBasis: number | null;
    isVintage?: boolean | undefined;
}, {
    id: string;
    collectionType: "personal" | "resale" | null;
    condition: string | null;
    priceSource: string | null;
    avgGbp: number | null;
    lowGbp: number | null;
    topGbp: number | null;
    saleCount: number | null;
    approxSaleCount: boolean | null;
    costBasis: number | null;
    isVintage?: boolean | undefined;
}>;
export type RecommendBatchCardInput = z.infer<typeof RecommendBatchCardInputSchema>;
export declare const RecommendBatchRequestSchema: z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        /** Caller-assigned id (e.g. the client-side listing id) — echoed back to match results up. */
        id: z.ZodString;
        avgGbp: z.ZodNullable<z.ZodNumber>;
        lowGbp: z.ZodNullable<z.ZodNumber>;
        topGbp: z.ZodNullable<z.ZodNumber>;
        priceSource: z.ZodNullable<z.ZodString>;
        saleCount: z.ZodNullable<z.ZodNumber>;
        approxSaleCount: z.ZodNullable<z.ZodBoolean>;
        condition: z.ZodNullable<z.ZodString>;
        costBasis: z.ZodNullable<z.ZodNumber>;
        collectionType: z.ZodNullable<z.ZodEnum<["personal", "resale"]>>;
        isVintage: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        collectionType: "personal" | "resale" | null;
        condition: string | null;
        priceSource: string | null;
        avgGbp: number | null;
        lowGbp: number | null;
        topGbp: number | null;
        saleCount: number | null;
        approxSaleCount: boolean | null;
        costBasis: number | null;
        isVintage?: boolean | undefined;
    }, {
        id: string;
        collectionType: "personal" | "resale" | null;
        condition: string | null;
        priceSource: string | null;
        avgGbp: number | null;
        lowGbp: number | null;
        topGbp: number | null;
        saleCount: number | null;
        approxSaleCount: boolean | null;
        costBasis: number | null;
        isVintage?: boolean | undefined;
    }>, "many">;
    /** One seller's settings apply to the whole batch — not per-card, it's an account-wide
     *  preference, not something that varies card-to-card within one review session. */
    pricingSettings: z.ZodOptional<z.ZodObject<{
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
    }>>;
}, "strip", z.ZodTypeAny, {
    cards: {
        id: string;
        collectionType: "personal" | "resale" | null;
        condition: string | null;
        priceSource: string | null;
        avgGbp: number | null;
        lowGbp: number | null;
        topGbp: number | null;
        saleCount: number | null;
        approxSaleCount: boolean | null;
        costBasis: number | null;
        isVintage?: boolean | undefined;
    }[];
    pricingSettings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}, {
    cards: {
        id: string;
        collectionType: "personal" | "resale" | null;
        condition: string | null;
        priceSource: string | null;
        avgGbp: number | null;
        lowGbp: number | null;
        topGbp: number | null;
        saleCount: number | null;
        approxSaleCount: boolean | null;
        costBasis: number | null;
        isVintage?: boolean | undefined;
    }[];
    pricingSettings?: {
        ebayFeeRate: number;
        ebayFeeFixed: number;
        packagingCost: number;
        shippingCost: number;
        taxRate: number;
        minProfitPct: number;
        minSaleValue: number;
        postageCost: number;
    } | undefined;
}>;
export type RecommendBatchRequest = z.infer<typeof RecommendBatchRequestSchema>;
export declare const RecommendBatchResultSchema: z.ZodObject<{
    id: z.ZodString;
    /** Null only when the input card has no pricing yet (avgGbp was null) — matches
     * computeRecommendation's own null-on-no-data contract, per card instead of per request. */
    route: z.ZodNullable<z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>>;
    alternatives: z.ZodArray<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        why: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }>, "many">;
    economics: z.ZodNullable<z.ZodObject<{
        expected_sale_gbp: z.ZodNullable<z.ZodNumber>;
        fees_gbp: z.ZodNullable<z.ZodNumber>;
        postage_gbp: z.ZodNullable<z.ZodNumber>;
        cost_basis_gbp: z.ZodNullable<z.ZodNumber>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        liquidity: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }>>;
    assumptions: z.ZodArray<z.ZodString, "many">;
    explanation: z.ZodNullable<z.ZodString>;
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    calculation_version: z.ZodNullable<z.ZodString>;
    priceSource: z.ZodNullable<z.ZodString>;
    priceConfidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    currencyNote: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    confidence: "high" | "medium" | "low" | null;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    } | null;
    assumptions: string[];
    explanation: string | null;
    calculation_version: string | null;
    priceSource: string | null;
    priceConfidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
}, {
    id: string;
    confidence: "high" | "medium" | "low" | null;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    } | null;
    assumptions: string[];
    explanation: string | null;
    calculation_version: string | null;
    priceSource: string | null;
    priceConfidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
}>;
export type RecommendBatchResult = z.infer<typeof RecommendBatchResultSchema>;
export declare const RecommendBatchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        /** Null only when the input card has no pricing yet (avgGbp was null) — matches
         * computeRecommendation's own null-on-no-data contract, per card instead of per request. */
        route: z.ZodNullable<z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>>;
        alternatives: z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            expected_net_gbp: z.ZodNullable<z.ZodNumber>;
            why: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }, {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }>, "many">;
        economics: z.ZodNullable<z.ZodObject<{
            expected_sale_gbp: z.ZodNullable<z.ZodNumber>;
            fees_gbp: z.ZodNullable<z.ZodNumber>;
            postage_gbp: z.ZodNullable<z.ZodNumber>;
            cost_basis_gbp: z.ZodNullable<z.ZodNumber>;
            expected_net_gbp: z.ZodNullable<z.ZodNumber>;
            liquidity: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        }, "strip", z.ZodTypeAny, {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        }, {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        }>>;
        assumptions: z.ZodArray<z.ZodString, "many">;
        explanation: z.ZodNullable<z.ZodString>;
        confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        calculation_version: z.ZodNullable<z.ZodString>;
        priceSource: z.ZodNullable<z.ZodString>;
        priceConfidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        currencyNote: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        confidence: "high" | "medium" | "low" | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
        alternatives: {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }[];
        economics: {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        } | null;
        assumptions: string[];
        explanation: string | null;
        calculation_version: string | null;
        priceSource: string | null;
        priceConfidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }, {
        id: string;
        confidence: "high" | "medium" | "low" | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
        alternatives: {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }[];
        economics: {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        } | null;
        assumptions: string[];
        explanation: string | null;
        calculation_version: string | null;
        priceSource: string | null;
        priceConfidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    results: {
        id: string;
        confidence: "high" | "medium" | "low" | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
        alternatives: {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }[];
        economics: {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        } | null;
        assumptions: string[];
        explanation: string | null;
        calculation_version: string | null;
        priceSource: string | null;
        priceConfidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }[];
}, {
    results: {
        id: string;
        confidence: "high" | "medium" | "low" | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
        alternatives: {
            expected_net_gbp: number | null;
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            why: string;
        }[];
        economics: {
            expected_sale_gbp: number | null;
            fees_gbp: number | null;
            postage_gbp: number | null;
            cost_basis_gbp: number | null;
            expected_net_gbp: number | null;
            liquidity: "high" | "medium" | "low" | null;
        } | null;
        assumptions: string[];
        explanation: string | null;
        calculation_version: string | null;
        priceSource: string | null;
        priceConfidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }[];
}>;
export type RecommendBatchResponse = z.infer<typeof RecommendBatchResponseSchema>;
