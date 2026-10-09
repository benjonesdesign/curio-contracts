import { z } from "zod";
export declare const EbayListingFormatSchema: z.ZodEnum<["FIXED_PRICE", "AUCTION"]>;
export type EbayListingFormat = z.infer<typeof EbayListingFormatSchema>;
export declare const EbayPublishRequestSchema: z.ZodObject<{
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
    /**
     * v0.2.0 (BREAKING: new REQUIRED key). The SKU the listing was published under: the copy's own
     * (`SKU-` + 8 hex, given when it was added), or — when a BulkRecord was listed as one lot — the
     * SKU the server minted for that single listing (a pile has none of its own). Non-null, opaque:
     * display and copy it, never parse it, never send one back.
     */
    sku: z.ZodString;
    offerId: z.ZodString;
    listingId: z.ZodNullable<z.ZodString>;
    listingUrl: z.ZodNullable<z.ZodString>;
    production: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "published";
    sku: string;
    offerId: string;
    listingId: string | null;
    listingUrl: string | null;
    production: boolean;
}, {
    status: "published";
    sku: string;
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
}>, z.ZodObject<{
    code: z.ZodLiteral<"no_photos">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "no_photos";
    message: string;
}, {
    code: "no_photos";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"missing_required_aspects">;
    message: z.ZodString;
    missingRequired: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    code: "missing_required_aspects";
    message: string;
    missingRequired: string[];
}, {
    code: "missing_required_aspects";
    message: string;
    missingRequired: string[];
}>, z.ZodObject<{
    code: z.ZodLiteral<"no_dispatch_address">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "no_dispatch_address";
    message: string;
}, {
    code: "no_dispatch_address";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"location_create_failed">;
    message: z.ZodString;
    ebayResponse: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    code: "location_create_failed";
    message: string;
    ebayResponse: string | null;
}, {
    code: "location_create_failed";
    message: string;
    ebayResponse: string | null;
}>, z.ZodObject<{
    code: z.ZodLiteral<"rate_limited">;
    message: z.ZodString;
    partialSuccess: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    code: "rate_limited";
    message: string;
    partialSuccess: boolean;
}, {
    code: "rate_limited";
    message: string;
    partialSuccess: boolean;
}>, z.ZodObject<{
    code: z.ZodLiteral<"publish_failed">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "publish_failed";
    message: string;
}, {
    code: "publish_failed";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"not_connected">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "not_connected";
    message: string;
}, {
    code: "not_connected";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"expired">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "expired";
    message: string;
}, {
    code: "expired";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"refresh_failed">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "refresh_failed";
    message: string;
}, {
    code: "refresh_failed";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"not_configured">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "not_configured";
    message: string;
}, {
    code: "not_configured";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"card_not_listable">;
    message: z.ZodString;
    reason: z.ZodEnum<["mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live", "sold", "archived"]>;
}, "strip", z.ZodTypeAny, {
    code: "card_not_listable";
    message: string;
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
}, {
    code: "card_not_listable";
    message: string;
    reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
}>, z.ZodObject<{
    code: z.ZodLiteral<"game_not_available">;
    message: z.ZodString;
    game: z.ZodNullable<z.ZodString>;
    displayName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    game: string | null;
    code: "game_not_available";
    message: string;
    displayName: string;
}, {
    game: string | null;
    code: "game_not_available";
    message: string;
    displayName: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"sku_required">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "sku_required";
    message: string;
}, {
    code: "sku_required";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"sku_unavailable">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "sku_unavailable";
    message: string;
}, {
    code: "sku_unavailable";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"card_read_failed">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "card_read_failed";
    message: string;
}, {
    code: "card_read_failed";
    message: string;
}>, z.ZodObject<{
    code: z.ZodLiteral<"card_not_found">;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    code: "card_not_found";
    message: string;
}, {
    code: "card_not_found";
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
    }>, z.ZodObject<{
        code: z.ZodLiteral<"no_photos">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "no_photos";
        message: string;
    }, {
        code: "no_photos";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"missing_required_aspects">;
        message: z.ZodString;
        missingRequired: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        code: "missing_required_aspects";
        message: string;
        missingRequired: string[];
    }, {
        code: "missing_required_aspects";
        message: string;
        missingRequired: string[];
    }>, z.ZodObject<{
        code: z.ZodLiteral<"no_dispatch_address">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "no_dispatch_address";
        message: string;
    }, {
        code: "no_dispatch_address";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"location_create_failed">;
        message: z.ZodString;
        ebayResponse: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        code: "location_create_failed";
        message: string;
        ebayResponse: string | null;
    }, {
        code: "location_create_failed";
        message: string;
        ebayResponse: string | null;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"rate_limited">;
        message: z.ZodString;
        partialSuccess: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        code: "rate_limited";
        message: string;
        partialSuccess: boolean;
    }, {
        code: "rate_limited";
        message: string;
        partialSuccess: boolean;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"publish_failed">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "publish_failed";
        message: string;
    }, {
        code: "publish_failed";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"not_connected">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "not_connected";
        message: string;
    }, {
        code: "not_connected";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"expired">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "expired";
        message: string;
    }, {
        code: "expired";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"refresh_failed">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "refresh_failed";
        message: string;
    }, {
        code: "refresh_failed";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"not_configured">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "not_configured";
        message: string;
    }, {
        code: "not_configured";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"card_not_listable">;
        message: z.ZodString;
        reason: z.ZodEnum<["mine", "set_aside", "unmatched", "slab_unverified", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live", "sold", "archived"]>;
    }, "strip", z.ZodTypeAny, {
        code: "card_not_listable";
        message: string;
        reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
    }, {
        code: "card_not_listable";
        message: string;
        reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
    }>, z.ZodObject<{
        code: z.ZodLiteral<"game_not_available">;
        message: z.ZodString;
        game: z.ZodNullable<z.ZodString>;
        displayName: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        game: string | null;
        code: "game_not_available";
        message: string;
        displayName: string;
    }, {
        game: string | null;
        code: "game_not_available";
        message: string;
        displayName: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"sku_required">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "sku_required";
        message: string;
    }, {
        code: "sku_required";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"sku_unavailable">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "sku_unavailable";
        message: string;
    }, {
        code: "sku_unavailable";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"card_read_failed">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "card_read_failed";
        message: string;
    }, {
        code: "card_read_failed";
        message: string;
    }>, z.ZodObject<{
        code: z.ZodLiteral<"card_not_found">;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        code: "card_not_found";
        message: string;
    }, {
        code: "card_not_found";
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
    } | {
        code: "no_photos";
        message: string;
    } | {
        code: "missing_required_aspects";
        message: string;
        missingRequired: string[];
    } | {
        code: "no_dispatch_address";
        message: string;
    } | {
        code: "location_create_failed";
        message: string;
        ebayResponse: string | null;
    } | {
        code: "rate_limited";
        message: string;
        partialSuccess: boolean;
    } | {
        code: "publish_failed";
        message: string;
    } | {
        code: "not_connected";
        message: string;
    } | {
        code: "expired";
        message: string;
    } | {
        code: "refresh_failed";
        message: string;
    } | {
        code: "not_configured";
        message: string;
    } | {
        code: "card_not_listable";
        message: string;
        reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
    } | {
        game: string | null;
        code: "game_not_available";
        message: string;
        displayName: string;
    } | {
        code: "sku_required";
        message: string;
    } | {
        code: "sku_unavailable";
        message: string;
    } | {
        code: "card_read_failed";
        message: string;
    } | {
        code: "card_not_found";
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
    } | {
        code: "no_photos";
        message: string;
    } | {
        code: "missing_required_aspects";
        message: string;
        missingRequired: string[];
    } | {
        code: "no_dispatch_address";
        message: string;
    } | {
        code: "location_create_failed";
        message: string;
        ebayResponse: string | null;
    } | {
        code: "rate_limited";
        message: string;
        partialSuccess: boolean;
    } | {
        code: "publish_failed";
        message: string;
    } | {
        code: "not_connected";
        message: string;
    } | {
        code: "expired";
        message: string;
    } | {
        code: "refresh_failed";
        message: string;
    } | {
        code: "not_configured";
        message: string;
    } | {
        code: "card_not_listable";
        message: string;
        reason: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "slab_unverified" | "condition_not_confirmed" | "no_sku" | "already_live" | "sold" | "archived";
    } | {
        game: string | null;
        code: "game_not_available";
        message: string;
        displayName: string;
    } | {
        code: "sku_required";
        message: string;
    } | {
        code: "sku_unavailable";
        message: string;
    } | {
        code: "card_read_failed";
        message: string;
    } | {
        code: "card_not_found";
        message: string;
    };
    code?: string | undefined;
}>;
export type EbayPublishErrorResponse = z.infer<typeof EbayPublishErrorResponseSchema>;
