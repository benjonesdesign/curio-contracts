import { z } from "zod";
export declare const EbayListingFormatSchema: z.ZodEnum<["FIXED_PRICE", "AUCTION"]>;
export type EbayListingFormat = z.infer<typeof EbayListingFormatSchema>;
export declare const EbayPublishRequestSchema: z.ZodObject<{
    sku: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    condition: z.ZodString;
    priceGbp: z.ZodNumber;
    photoUrls: z.ZodArray<z.ZodString, "many">;
    aspectValues: z.ZodRecord<z.ZodString, z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>>;
    physicalCardId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    game: z.ZodDefault<z.ZodString>;
    format: z.ZodDefault<z.ZodEnum<["FIXED_PRICE", "AUCTION"]>>;
    auctionStartPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    auctionDays: z.ZodDefault<z.ZodUnion<[z.ZodLiteral<3>, z.ZodLiteral<5>, z.ZodLiteral<7>, z.ZodLiteral<10>]>>;
}, "strip", z.ZodTypeAny, {
    game: string;
    aspectValues: Record<string, string | string[]>;
    description: string;
    condition: string;
    priceGbp: number;
    sku: string;
    title: string;
    photoUrls: string[];
    format: "FIXED_PRICE" | "AUCTION";
    auctionDays: 5 | 3 | 7 | 10;
    physicalCardId?: string | null | undefined;
    cardId?: string | null | undefined;
    auctionStartPrice?: number | null | undefined;
}, {
    aspectValues: Record<string, string | string[]>;
    description: string;
    condition: string;
    priceGbp: number;
    sku: string;
    title: string;
    photoUrls: string[];
    game?: string | undefined;
    physicalCardId?: string | null | undefined;
    cardId?: string | null | undefined;
    format?: "FIXED_PRICE" | "AUCTION" | undefined;
    auctionStartPrice?: number | null | undefined;
    auctionDays?: 5 | 3 | 7 | 10 | undefined;
}>;
export type EbayPublishRequest = z.infer<typeof EbayPublishRequestSchema>;
export declare const EbayPublishSuccessSchema: z.ZodObject<{
    status: z.ZodLiteral<"published">;
    offerId: z.ZodString;
    listingId: z.ZodNullable<z.ZodString>;
    listingUrl: z.ZodNullable<z.ZodString>;
    production: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "published";
    offerId: string;
    listingId: string | null;
    listingUrl: string | null;
    production: boolean;
}, {
    status: "published";
    offerId: string;
    listingId: string | null;
    listingUrl: string | null;
    production: boolean;
}>;
export type EbayPublishSuccess = z.infer<typeof EbayPublishSuccessSchema>;
export declare const EbayPublishErrorSchema: z.ZodDiscriminatedUnion<"code", [z.ZodObject<{
    code: z.ZodLiteral<"unauthenticated">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "unauthenticated";
    message: string;
}, {
    code: "unauthenticated";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"invalid_request">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "invalid_request";
    message: string;
}, {
    code: "invalid_request";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"title_too_long">;
    message: z.ZodString;
    titleLength: z.ZodNumber;
    maxLength: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: "title_too_long";
    message: string;
    titleLength: number;
    maxLength: number;
}, {
    code: "title_too_long";
    message: string;
    titleLength: number;
    maxLength: number;
}>, z.ZodObject<{
    code: z.ZodLiteral<"graded_not_verified">;
    message: z.ZodString;
    gradingCompany: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: "graded_not_verified";
    message: string;
    gradingCompany: string | null;
}, {
    code: "graded_not_verified";
    message: string;
    gradingCompany: string | null;
}>, z.ZodObject<{
    code: z.ZodLiteral<"scope_error">;
    message: z.ZodString;
    reconnectHint: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "scope_error";
    message: string;
    reconnectHint: string;
}, {
    code: "scope_error";
    message: string;
    reconnectHint: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"no_policies">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "no_policies";
    message: string;
}, {
    code: "no_policies";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"unmappable_condition">;
    message: z.ZodString;
    condition: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "unmappable_condition";
    message: string;
    condition: string;
}, {
    code: "unmappable_condition";
    message: string;
    condition: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"ebay_error">;
    message: z.ZodString;
    ebayCode: z.ZodString;
    httpStatus: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    code: "ebay_error";
    message: string;
    ebayCode: string;
    httpStatus: number;
}, {
    code: "ebay_error";
    message: string;
    ebayCode: string;
    httpStatus: number;
}>, z.ZodObject<{
    code: z.ZodLiteral<"internal_error">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "internal_error";
    message: string;
}, {
    code: "internal_error";
    message: string;
}>]>;
export type EbayPublishError = z.infer<typeof EbayPublishErrorSchema>;
export declare const EbayPublishErrorResponseSchema: z.ZodObject<{
    /** The human message. Unchanged, and the only field older clients read. */
    error: z.ZodString;
    /** Legacy flat code. Retained for the same reason: clients already read it. Equals
     *  `failure.code` for every known arm. */
    code: z.ZodOptional<z.ZodString>;
    /** The structured failure. New; the only field that carries per-arm data. */
    failure: z.ZodDiscriminatedUnion<"code", [z.ZodObject<{
        code: z.ZodLiteral<"unauthenticated">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "unauthenticated";
        message: string;
    }, {
        code: "unauthenticated";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"invalid_request">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "invalid_request";
        message: string;
    }, {
        code: "invalid_request";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"title_too_long">;
        message: z.ZodString;
        titleLength: z.ZodNumber;
        maxLength: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: "title_too_long";
        message: string;
        titleLength: number;
        maxLength: number;
    }, {
        code: "title_too_long";
        message: string;
        titleLength: number;
        maxLength: number;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"graded_not_verified">;
        message: z.ZodString;
        gradingCompany: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: "graded_not_verified";
        message: string;
        gradingCompany: string | null;
    }, {
        code: "graded_not_verified";
        message: string;
        gradingCompany: string | null;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"scope_error">;
        message: z.ZodString;
        reconnectHint: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "scope_error";
        message: string;
        reconnectHint: string;
    }, {
        code: "scope_error";
        message: string;
        reconnectHint: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"no_policies">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "no_policies";
        message: string;
    }, {
        code: "no_policies";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"unmappable_condition">;
        message: z.ZodString;
        condition: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "unmappable_condition";
        message: string;
        condition: string;
    }, {
        code: "unmappable_condition";
        message: string;
        condition: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"ebay_error">;
        message: z.ZodString;
        ebayCode: z.ZodString;
        httpStatus: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        code: "ebay_error";
        message: string;
        ebayCode: string;
        httpStatus: number;
    }, {
        code: "ebay_error";
        message: string;
        ebayCode: string;
        httpStatus: number;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"internal_error">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "internal_error";
        message: string;
    }, {
        code: "internal_error";
        message: string;
    }>]>;
}, "strip", z.ZodTypeAny, {
    error: string;
    failure: {
        code: "unauthenticated";
        message: string;
    } | {
        code: "invalid_request";
        message: string;
    } | {
        code: "title_too_long";
        message: string;
        titleLength: number;
        maxLength: number;
    } | {
        code: "graded_not_verified";
        message: string;
        gradingCompany: string | null;
    } | {
        code: "scope_error";
        message: string;
        reconnectHint: string;
    } | {
        code: "no_policies";
        message: string;
    } | {
        code: "unmappable_condition";
        message: string;
        condition: string;
    } | {
        code: "ebay_error";
        message: string;
        ebayCode: string;
        httpStatus: number;
    } | {
        code: "internal_error";
        message: string;
    };
    code?: string | undefined;
}, {
    error: string;
    failure: {
        code: "unauthenticated";
        message: string;
    } | {
        code: "invalid_request";
        message: string;
    } | {
        code: "title_too_long";
        message: string;
        titleLength: number;
        maxLength: number;
    } | {
        code: "graded_not_verified";
        message: string;
        gradingCompany: string | null;
    } | {
        code: "scope_error";
        message: string;
        reconnectHint: string;
    } | {
        code: "no_policies";
        message: string;
    } | {
        code: "unmappable_condition";
        message: string;
        condition: string;
    } | {
        code: "ebay_error";
        message: string;
        ebayCode: string;
        httpStatus: number;
    } | {
        code: "internal_error";
        message: string;
    };
    code?: string | undefined;
}>;
export type EbayPublishErrorResponse = z.infer<typeof EbayPublishErrorResponseSchema>;
