import { z } from "zod";
/** Why a route was chosen. A CODE — the shared engine does not own English; each platform renders
 *  its own copy from @curio/copy. */
export declare const RouteReasonSchema: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
export declare const AlternativeReasonSchema: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
/** What was missing when a decision had to be made without complete information. */
export declare const DegradedReasonSchema: z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>;
/**
 * An alternative route, carrying a REASON CODE.
 *
 * Deliberately NOT /api/recommend's `RouteAlternativeSchema`, which carries `why: string` — a
 * rendered English sentence. That is the legacy shape: it makes the server the owner of copy for
 * three platforms. This one supersedes it. Two shapes exist during the transition because
 * /api/recommend is shipped and iOS calls it; when its callers move to /api/decide, the English
 * one goes.
 */
export declare const DecisionAlternativeSchema: z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
}, "strip", z.ZodTypeAny, {
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
}, {
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
}>;
export declare const DecisionEconomicsSchema: z.ZodObject<{
    marketValueGbp: z.ZodNumber;
    /** What the seller actually pays eBay, with their VAT position applied (ADR 0025). */
    feeGbp: z.ZodNumber;
    postageGbp: z.ZodNumber;
    packagingGbp: z.ZodNumber;
    /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
     *  free acquisition inflates every net figure on the screen people scan with. */
    costBasisGbp: z.ZodNullable<z.ZodNumber>;
    taxProvisionGbp: z.ZodNumber;
    expectedNetGbp: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    marketValueGbp: number;
    feeGbp: number;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number;
    expectedNetGbp: number;
}, {
    marketValueGbp: number;
    feeGbp: number;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number;
    expectedNetGbp: number;
}>;
export declare const DecisionSchema: z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
    alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
    }, "strip", z.ZodTypeAny, {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    }, {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    }>, "many">>;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    liquidity: z.ZodEnum<["high", "medium", "low"]>;
    economics: z.ZodObject<{
        marketValueGbp: z.ZodNumber;
        /** What the seller actually pays eBay, with their VAT position applied (ADR 0025). */
        feeGbp: z.ZodNumber;
        postageGbp: z.ZodNumber;
        packagingGbp: z.ZodNumber;
        /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
         *  free acquisition inflates every net figure on the screen people scan with. */
        costBasisGbp: z.ZodNullable<z.ZodNumber>;
        taxProvisionGbp: z.ZodNumber;
        expectedNetGbp: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        marketValueGbp: number;
        feeGbp: number;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number;
        expectedNetGbp: number;
    }, {
        marketValueGbp: number;
        feeGbp: number;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number;
        expectedNetGbp: number;
    }>;
    /** ACQUISITION: the most the seller should PAY for this card. */
    maxBuyGbp: z.ZodNumber;
    /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
     *  floor, the auction start price (a start price is a free reserve), and the
     *  "this shouldn't be an auction" test against the top realised comp. */
    minAcceptGbp: z.ZodNumber;
    /** `maxBuyGbp` as a % of market value, to one decimal place. */
    offerPctAtMax: z.ZodNumber;
    /**
     * True when the decision was made without complete information — an offline client with no
     * comps and no fee context. The route is still the best available call; degraded means "trust
     * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
     * can never present as more certain than a complete one.
     */
    degraded: z.ZodBoolean;
    degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    }[];
    economics: {
        marketValueGbp: number;
        feeGbp: number;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number;
        expectedNetGbp: number;
    };
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number;
    minAcceptGbp: number;
    offerPctAtMax: number;
    degraded: boolean;
    degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
}, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    economics: {
        marketValueGbp: number;
        feeGbp: number;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number;
        expectedNetGbp: number;
    };
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number;
    minAcceptGbp: number;
    offerPctAtMax: number;
    degraded: boolean;
    alternatives?: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    }[] | undefined;
    degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
}>;
export type Decision = z.infer<typeof DecisionSchema>;
export declare const DecideRequestSchema: z.ZodObject<{
    /** The card to decide about, when the seller already owns it. */
    physicalCardId: z.ZodOptional<z.ZodString>;
    /** Market value to decide against. Omitted for an owned card — the server reads its valuation. */
    marketValueGbp: z.ZodOptional<z.ZodNumber>;
    condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    isVintage: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    collectionType: z.ZodOptional<z.ZodEnum<["personal", "resale"]>>;
    /**
     * The seller's target return on this card, as a % of what they pay (e.g. 20, 30, 40). Optional;
     * absent uses their saved profile value.
     *
     * ── WHY THIS IS ALLOWED WHEN pricingSettings IS DISCOURAGED ────────────────────────────────
     *
     * The line is: A CLIENT MAY SEND WHAT THE SELLER WANTS, NEVER WHAT THE WORLD COSTS.
     *
     * Fees, tax and postage are facts about the world, and the server owns them — a client asserting
     * them is how max-buy came to charge every seller £0 in eBay fees. `pricingSettings` carries all
     * eight of those at once, so sending it to express one preference means asserting a whole fee
     * position the client does not own. iOS dropped its 20/30/40% picker rather than do that, which
     * was the right refusal.
     *
     * Target margin is not in that category. It is a seller PREFERENCE, and a legitimately
     * per-moment one — 20% on a fast-moving card, 40% on a slow one, decided standing in a shop.
     * A scalar for it costs nothing and asserts nothing.
     *
     * Three consumers before it ships: the appraise screen's target-return picker, Best Offer's
     * auto-decline floor, and W20's auction start price.
     */
    targetMarginPct: z.ZodOptional<z.ZodNumber>;
    /** Explicit settings override; omitted falls back to the account's saved profile. Prefer
     *  `targetMarginPct` above for the common case — see its note on what a client may assert. */
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
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    physicalCardId?: string | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    isVintage?: boolean | null | undefined;
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
    marketValueGbp?: number | undefined;
    targetMarginPct?: number | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    physicalCardId?: string | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    isVintage?: boolean | null | undefined;
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
    marketValueGbp?: number | undefined;
    targetMarginPct?: number | undefined;
}>;
export type DecideRequest = z.infer<typeof DecideRequestSchema>;
export declare const DecideResponseSchema: z.ZodObject<{
    decision: z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
        }, "strip", z.ZodTypeAny, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }>, "many">>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        liquidity: z.ZodEnum<["high", "medium", "low"]>;
        economics: z.ZodObject<{
            marketValueGbp: z.ZodNumber;
            /** What the seller actually pays eBay, with their VAT position applied (ADR 0025). */
            feeGbp: z.ZodNumber;
            postageGbp: z.ZodNumber;
            packagingGbp: z.ZodNumber;
            /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
             *  free acquisition inflates every net figure on the screen people scan with. */
            costBasisGbp: z.ZodNullable<z.ZodNumber>;
            taxProvisionGbp: z.ZodNumber;
            expectedNetGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        }, {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        }>;
        /** ACQUISITION: the most the seller should PAY for this card. */
        maxBuyGbp: z.ZodNumber;
        /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
         *  floor, the auction start price (a start price is a free reserve), and the
         *  "this shouldn't be an auction" test against the top realised comp. */
        minAcceptGbp: z.ZodNumber;
        /** `maxBuyGbp` as a % of market value, to one decimal place. */
        offerPctAtMax: z.ZodNumber;
        /**
         * True when the decision was made without complete information — an offline client with no
         * comps and no fee context. The route is still the best available call; degraded means "trust
         * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
         * can never present as more certain than a complete one.
         */
        degraded: z.ZodBoolean;
        degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[];
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[];
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    };
}, {
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    };
}>;
export type DecideResponse = z.infer<typeof DecideResponseSchema>;
export declare const QuickScanRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** A narrowing HINT, never a precondition — number+set is decisive for ~99.3% of the catalogue
     *  across all games combined. */
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    finish: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** As on DecideRequest — a seller preference, not a cost assertion. More useful here, if
     *  anything: an anonymous scanner has no saved profile to default from. */
    targetMarginPct: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    targetMarginPct?: number | undefined;
    finish?: string | null | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    targetMarginPct?: number | undefined;
    finish?: string | null | undefined;
}>;
export type QuickScanRequest = z.infer<typeof QuickScanRequestSchema>;
export declare const QuickScanCandidateSchema: z.ZodObject<{
    game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
    nativeId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * Catalogue reference image. `CatalogueLookupMatch` has carried one since v0.1.19; this was
     * simply omitted, because quick-scan predates the rule-13 amendment that makes the thumbnail the
     * picker's differentiator.
     *
     * Its absence forced a SECOND card-search round trip purely to fetch images already held on the
     * server — and anonymous scanning is already two calls through one shared 60/5min bucket, so a
     * third would cut a brand-new user from ~30 scans per five minutes to ~20. That is the wedge's
     * rate limit getting worse for exactly the audience it exists to convert.
     *
     * ⚠️ Until a server populates this, anyone collapsing those two calls into one silently loses
     * the images. Display-only, hotlinked at render time per decisions/0022 — never downloaded,
     * cached or re-hosted.
     */
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    nativeId: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    image?: string | null | undefined;
}, {
    name: string;
    nativeId: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    image?: string | null | undefined;
}>;
export declare const QuickScanResponseSchema: z.ZodObject<{
    /** Whether the scanned identity resolved to a real catalogue card. */
    identified: z.ZodBoolean;
    /** Cross-game candidates when the identity is ambiguous. Empty otherwise. */
    candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * Catalogue reference image. `CatalogueLookupMatch` has carried one since v0.1.19; this was
         * simply omitted, because quick-scan predates the rule-13 amendment that makes the thumbnail the
         * picker's differentiator.
         *
         * Its absence forced a SECOND card-search round trip purely to fetch images already held on the
         * server — and anonymous scanning is already two calls through one shared 60/5min bucket, so a
         * third would cut a brand-new user from ~30 scans per five minutes to ~20. That is the wedge's
         * rate limit getting worse for exactly the audience it exists to convert.
         *
         * ⚠️ Until a server populates this, anyone collapsing those two calls into one silently loses
         * the images. Display-only, hotlinked at render time per decisions/0022 — never downloaded,
         * cached or re-hosted.
         */
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }>, "many">>;
    /** The resolved card, when `identified`. */
    match: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * Catalogue reference image. `CatalogueLookupMatch` has carried one since v0.1.19; this was
         * simply omitted, because quick-scan predates the rule-13 amendment that makes the thumbnail the
         * picker's differentiator.
         *
         * Its absence forced a SECOND card-search round trip purely to fetch images already held on the
         * server — and anonymous scanning is already two calls through one shared 60/5min bucket, so a
         * third would cut a brand-new user from ~30 scans per five minutes to ~20. That is the wedge's
         * rate limit getting worse for exactly the audience it exists to convert.
         *
         * ⚠️ Until a server populates this, anyone collapsing those two calls into one silently loses
         * the images. Display-only, hotlinked at render time per decisions/0022 — never downloaded,
         * cached or re-hosted.
         */
        image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }>>>;
    /**
     * NULL when identity is unresolved — an ambiguous or unrecognised card has no decision to make,
     * because there is no card to price yet. Deliberately absent rather than an empty Decision with
     * zeroed money in it, which a client would render as "£0 max buy" rather than "we don't know
     * what this is".
     */
    decision: z.ZodNullable<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
        }, "strip", z.ZodTypeAny, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }>, "many">>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        liquidity: z.ZodEnum<["high", "medium", "low"]>;
        economics: z.ZodObject<{
            marketValueGbp: z.ZodNumber;
            /** What the seller actually pays eBay, with their VAT position applied (ADR 0025). */
            feeGbp: z.ZodNumber;
            postageGbp: z.ZodNumber;
            packagingGbp: z.ZodNumber;
            /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
             *  free acquisition inflates every net figure on the screen people scan with. */
            costBasisGbp: z.ZodNullable<z.ZodNumber>;
            taxProvisionGbp: z.ZodNumber;
            expectedNetGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        }, {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        }>;
        /** ACQUISITION: the most the seller should PAY for this card. */
        maxBuyGbp: z.ZodNumber;
        /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
         *  floor, the auction start price (a start price is a free reserve), and the
         *  "this shouldn't be an auction" test against the top realised comp. */
        minAcceptGbp: z.ZodNumber;
        /** `maxBuyGbp` as a % of market value, to one decimal place. */
        offerPctAtMax: z.ZodNumber;
        /**
         * True when the decision was made without complete information — an offline client with no
         * comps and no fee context. The route is still the best available call; degraded means "trust
         * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
         * can never present as more certain than a complete one.
         */
        degraded: z.ZodBoolean;
        degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[];
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>>;
    /** Whether a condition assessment fed the decision, or the default was assumed. */
    conditionAssessed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    candidates: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[];
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[];
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    } | null;
    identified: boolean;
    conditionAssessed: boolean;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
}, {
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeGbp: number;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number;
            expectedNetGbp: number;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number;
        minAcceptGbp: number;
        offerPctAtMax: number;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    } | null;
    identified: boolean;
    candidates?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[] | undefined;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
    conditionAssessed?: boolean | undefined;
}>;
export type QuickScanResponse = z.infer<typeof QuickScanResponseSchema>;
