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
    /**
     * What this alternative nets, when that is knowable.
     *
     * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
     * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
     * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
     * was a regression in decision quality rather than in polish.
     *
     * NULL where the net genuinely cannot be computed for that route rather than where it was merely
     * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
     * quoting this card's net beside "Bundle" would be a number that answers a different question.
     */
    expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    expectedNetGbp?: number | null | undefined;
}, {
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
    expectedNetGbp?: number | null | undefined;
}>;
/**
 * v0.2.0 (BREAKING): the three figures that CONTAIN the seller's fee are nullable, and a null fee
 * carries its reason.
 *
 * `feeGbp` was `z.number()`, so a seller who had never said whether they are private or a business
 * was costed as a private seller (fee £0) and shown a net that was wrong in the optimistic
 * direction. Ben's ruling (owner.DESIGN-REVIEW-2026-10, round 2, item 1) is that nothing assumes a
 * private seller; this is the contract half of it.
 *
 * The fee position is ONE fact, so it moves as one:
 *   `feeGbp`, `taxProvisionGbp` and `expectedNetGbp` are all null together, with `feeNotSetReason`
 *   set; or all three are numbers, with `feeNotSetReason` null. `taxProvisionGbp` is tax on the
 *   profit and `expectedNetGbp` is the profit, so with an unknown fee both are unknown too — a
 *   number there would be a guess wearing a figure. Enforced by the refinement below (a SERVER-SIDE
 *   guard: the generated Swift/Kotlin types cannot express it, see CHANGELOG v0.2.0).
 *
 * `postageGbp` and `packagingGbp` stay numbers: neither depends on seller type.
 *
 * Why not a discriminated union (`z.discriminatedUnion("feeState", ...)`) when the generators now
 * emit them (v0.1.45)? Because it would change `DecisionEconomics` from a struct into an enum on
 * both platforms: every `decision.economics.postageGbp` read would become a `switch`. The ruling is
 * "a `Double` becomes a `Double?`", which is a one-token fix per site; a union is a rewrite of every
 * site that reads a field which did not change.
 */
export declare const DecisionEconomicsSchema: z.ZodEffects<z.ZodObject<{
    marketValueGbp: z.ZodNumber;
    /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
     *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
     *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
    feeGbp: z.ZodNullable<z.ZodNumber>;
    /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
    feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
    postageGbp: z.ZodNumber;
    packagingGbp: z.ZodNumber;
    /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
     *  free acquisition inflates every net figure on the screen people scan with. */
    costBasisGbp: z.ZodNullable<z.ZodNumber>;
    /** Null with `feeGbp` (tax on a profit that cannot be computed). */
    taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
    /** Null with `feeGbp` (the profit includes the fee). */
    expectedNetGbp: z.ZodNullable<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    marketValueGbp: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    expectedNetGbp: number | null;
    feeGbp: number | null;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number | null;
}, {
    marketValueGbp: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    expectedNetGbp: number | null;
    feeGbp: number | null;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number | null;
}>, {
    marketValueGbp: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    expectedNetGbp: number | null;
    feeGbp: number | null;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number | null;
}, {
    marketValueGbp: number;
    feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
    expectedNetGbp: number | null;
    feeGbp: number | null;
    postageGbp: number;
    packagingGbp: number;
    costBasisGbp: number | null;
    taxProvisionGbp: number | null;
}>;
export type DecisionEconomics = z.infer<typeof DecisionEconomicsSchema>;
/**
 * What the engine had to fill in for itself, because the seller had not said.
 *
 * The successor to `/api/recommend`'s `assumptions: string[]`, which was English and so could not
 * live in the contract. iOS deleted its assumptions surface during the hero migration and
 * deliberately did NOT backfill it from `degradedReasons` — correctly, because "what was missing"
 * and "what was ASSUMED" are different claims and conflating them is the near-enough mapping this
 * project has spent a fortnight removing. A decision can be complete (nothing degraded) and still
 * rest on assumptions.
 *
 * ⚠️ THE SHAPE IS DECIDED NOW, AHEAD OF THE CHANNEL WORK, so it is not a second contract bump.
 * W21 decision 7.1 requires that the assumed default channel be LABELLED AS AN ASSUMPTION and never
 * presented as a choice the seller made — which needs exactly this surface. `channel` is in the
 * code list already; the engine starts populating it when channel reaches SellerCostModel (W21
 * step 1). Everything else here is populatable today.
 *
 * ONLY genuinely assumed things appear. A value the seller chose, or that came from their profile
 * or their eBay policy, is not an assumption and must not be listed as one — the entire point is
 * the distinction.
 */
export declare const DecisionAssumptionCodeSchema: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
export declare const DecisionAssumptionSchema: z.ZodObject<{
    code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
    /**
     * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
     * sentence — the label comes from @curio/copy, same as every other code in this module, so the
     * server does not become the owner of English for three platforms.
     */
    value: z.ZodNullable<z.ZodString>;
    /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
    valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    value: string | null;
    code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
    valueGbp?: number | null | undefined;
}, {
    value: string | null;
    code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
    valueGbp?: number | null | undefined;
}>;
export type DecisionAssumption = z.infer<typeof DecisionAssumptionSchema>;
export declare const DecisionSchema: z.ZodEffects<z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
    alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
        /**
         * What this alternative nets, when that is knowable.
         *
         * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
         * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
         * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
         * was a regression in decision quality rather than in polish.
         *
         * NULL where the net genuinely cannot be computed for that route rather than where it was merely
         * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
         * quoting this card's net beside "Bundle" would be a number that answers a different question.
         */
        expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }, {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }>, "many">>;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    liquidity: z.ZodEnum<["high", "medium", "low"]>;
    economics: z.ZodEffects<z.ZodObject<{
        marketValueGbp: z.ZodNumber;
        /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
         *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
         *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
        feeGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
        feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
        postageGbp: z.ZodNumber;
        packagingGbp: z.ZodNumber;
        /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
         *  free acquisition inflates every net figure on the screen people scan with. */
        costBasisGbp: z.ZodNullable<z.ZodNumber>;
        /** Null with `feeGbp` (tax on a profit that cannot be computed). */
        taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
        /** Null with `feeGbp` (the profit includes the fee). */
        expectedNetGbp: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    }, {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    }>, {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    }, {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    }>;
    /**
     * ACQUISITION: the most the seller should PAY for this card.
     *
     * v0.2.0 (BREAKING): WHOLE POUNDS, rounded DOWN by the server (Ben, 2026-10-09: "most to pay"
     * is shown to the pound everywhere, and it is the same figure as the breakdown's `max_buy` line).
     * A pence figure here is refused by the server-side guard below. NULL when no honest figure
     * exists, with `maxBuyUnavailableReason` saying why. Null is "we are not telling you a number", NEVER "£0" — £0 is a real answer ("pay
     * nothing") and rendering null as £0 is the original bug, from the other side. A client renders
     * the reason ("Set your buying margin", "Not set"), never a figure.
     */
    maxBuyGbp: z.ZodNullable<z.ZodNumber>;
    /** WHY `maxBuyGbp` is null. Null exactly when `maxBuyGbp` is a number. Required key (never
     *  absent from the server's output) so a null most-to-pay cannot reach a client unexplained. */
    maxBuyUnavailableReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
    /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
     *  floor, the auction start price (a start price is a free reserve), and the
     *  "this shouldn't be an auction" test against the top realised comp.
     *
     *  v0.2.0 (BREAKING): null exactly when `economics.feeGbp` is null. The floor is the price at
     *  which net-of-fees clears the seller's minimum profit, so it contains the fee; computed with an
     *  assumed £0 private-seller fee it would be LOWER than the true floor for a business seller,
     *  and an auto-decline floor that is too low accepts offers that lose money. A consumer must
     *  not arm Best Offer's auto-decline, nor propose an auction start price, from a null here. */
    minAcceptGbp: z.ZodNullable<z.ZodNumber>;
    /** `maxBuyGbp` as a % of market value, to one decimal place. v0.2.0: null exactly when
     *  `maxBuyGbp` is null (a percentage of nothing). */
    offerPctAtMax: z.ZodNullable<z.ZodNumber>;
    /**
     * True when the decision was made without complete information — an offline client with no
     * comps and no fee context. The route is still the best available call; degraded means "trust
     * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
     * can never present as more certain than a complete one.
     */
    degraded: z.ZodBoolean;
    degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
    /**
     * What the engine assumed. Distinct from `degradedReasons`: a decision can be entirely
     * un-degraded and still rest on assumptions the seller never stated.
     */
    assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
        /**
         * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
         * sentence — the label comes from @curio/copy, same as every other code in this module, so the
         * server does not become the owner of English for three platforms.
         */
        value: z.ZodNullable<z.ZodString>;
        /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
        valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }, {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }[];
    economics: {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    };
    assumptions: {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }[];
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number | null;
    maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    minAcceptGbp: number | null;
    offerPctAtMax: number | null;
    degraded: boolean;
    degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
}, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    economics: {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    };
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number | null;
    maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    minAcceptGbp: number | null;
    offerPctAtMax: number | null;
    degraded: boolean;
    alternatives?: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }[] | undefined;
    assumptions?: {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }[] | undefined;
    degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
}>, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }[];
    economics: {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    };
    assumptions: {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }[];
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number | null;
    maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    minAcceptGbp: number | null;
    offerPctAtMax: number | null;
    degraded: boolean;
    degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
}, {
    confidence: "high" | "medium" | "low";
    liquidity: "high" | "medium" | "low";
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    economics: {
        marketValueGbp: number;
        feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
        expectedNetGbp: number | null;
        feeGbp: number | null;
        postageGbp: number;
        packagingGbp: number;
        costBasisGbp: number | null;
        taxProvisionGbp: number | null;
    };
    reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
    maxBuyGbp: number | null;
    maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
    minAcceptGbp: number | null;
    offerPctAtMax: number | null;
    degraded: boolean;
    alternatives?: {
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
        expectedNetGbp?: number | null | undefined;
    }[] | undefined;
    assumptions?: {
        value: string | null;
        code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
        valueGbp?: number | null | undefined;
    }[] | undefined;
    degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
}>;
export type Decision = z.infer<typeof DecisionSchema>;
export declare const PriceProvenanceSchema: z.ZodObject<{
    /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
    source: z.ZodNullable<z.ZodString>;
    /** How much the price itself is trusted — distinct from the DECISION's confidence. */
    confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    /** Set when the figure was converted from another currency, so a UK seller is told. */
    currencyNote: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    source: string | null;
    confidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
}, {
    source: string | null;
    confidence: "high" | "medium" | "low" | null;
    currencyNote: string | null;
}>;
export type PriceProvenance = z.infer<typeof PriceProvenanceSchema>;
/** Whether-to-grade economics. Optional and flag-gated — ADR 0016 parks the real numbers on
 *  Marketplace Insights, so this is present only where a caller has them. */
export declare const DecisionGradeEVSchema: z.ZodObject<{
    gradeEVGbp: z.ZodNullable<z.ZodNumber>;
    psa10PriceGbp: z.ZodNullable<z.ZodNumber>;
    p10: z.ZodNullable<z.ZodNumber>;
    p9: z.ZodNullable<z.ZodNumber>;
    gradingCostGbp: z.ZodNullable<z.ZodNumber>;
    rawNetGbp: z.ZodNullable<z.ZodNumber>;
    confidence: z.ZodNullable<z.ZodEnum<["medium", "low"]>>;
}, "strip", z.ZodTypeAny, {
    confidence: "medium" | "low" | null;
    psa10PriceGbp: number | null;
    p10: number | null;
    p9: number | null;
    gradingCostGbp: number | null;
    rawNetGbp: number | null;
    gradeEVGbp: number | null;
}, {
    confidence: "medium" | "low" | null;
    psa10PriceGbp: number | null;
    p10: number | null;
    p9: number | null;
    gradingCostGbp: number | null;
    rawNetGbp: number | null;
    gradeEVGbp: number | null;
}>;
export type DecisionGradeEV = z.infer<typeof DecisionGradeEVSchema>;
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
    targetMarginPct: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
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
    /** What they are asking for the card. The server computes the over/under once
     *  (`breakdown.compare`) so no screen subtracts two figures. */
    theirPriceGbp: z.ZodOptional<z.ZodNumber>;
    /** Who bears postage on the resale, for this card. Absent = the seller's Dispatch rule. */
    postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
    /** A keyed packing choice (open string; the catalogue is the server's). */
    packingKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    physicalCardId?: string | undefined;
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
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    theirPriceGbp?: number | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    physicalCardId?: string | undefined;
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
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    theirPriceGbp?: number | undefined;
}>;
export type DecideRequest = z.infer<typeof DecideRequestSchema>;
export declare const DecideResponseSchema: z.ZodEffects<z.ZodObject<{
    decision: z.ZodEffects<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
            /**
             * What this alternative nets, when that is knowable.
             *
             * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
             * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
             * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
             * was a regression in decision quality rather than in polish.
             *
             * NULL where the net genuinely cannot be computed for that route rather than where it was merely
             * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
             * quoting this card's net beside "Bundle" would be a number that answers a different question.
             */
            expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }>, "many">>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        liquidity: z.ZodEnum<["high", "medium", "low"]>;
        economics: z.ZodEffects<z.ZodObject<{
            marketValueGbp: z.ZodNumber;
            /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
             *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
             *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
            feeGbp: z.ZodNullable<z.ZodNumber>;
            /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
            feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
            postageGbp: z.ZodNumber;
            packagingGbp: z.ZodNumber;
            /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
             *  free acquisition inflates every net figure on the screen people scan with. */
            costBasisGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (tax on a profit that cannot be computed). */
            taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (the profit includes the fee). */
            expectedNetGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>;
        /**
         * ACQUISITION: the most the seller should PAY for this card.
         *
         * v0.2.0 (BREAKING): WHOLE POUNDS, rounded DOWN by the server (Ben, 2026-10-09: "most to pay"
         * is shown to the pound everywhere, and it is the same figure as the breakdown's `max_buy` line).
         * A pence figure here is refused by the server-side guard below. NULL when no honest figure
         * exists, with `maxBuyUnavailableReason` saying why. Null is "we are not telling you a number", NEVER "£0" — £0 is a real answer ("pay
         * nothing") and rendering null as £0 is the original bug, from the other side. A client renders
         * the reason ("Set your buying margin", "Not set"), never a figure.
         */
        maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `maxBuyGbp` is null. Null exactly when `maxBuyGbp` is a number. Required key (never
         *  absent from the server's output) so a null most-to-pay cannot reach a client unexplained. */
        maxBuyUnavailableReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
         *  floor, the auction start price (a start price is a free reserve), and the
         *  "this shouldn't be an auction" test against the top realised comp.
         *
         *  v0.2.0 (BREAKING): null exactly when `economics.feeGbp` is null. The floor is the price at
         *  which net-of-fees clears the seller's minimum profit, so it contains the fee; computed with an
         *  assumed £0 private-seller fee it would be LOWER than the true floor for a business seller,
         *  and an auto-decline floor that is too low accepts offers that lose money. A consumer must
         *  not arm Best Offer's auto-decline, nor propose an auction start price, from a null here. */
        minAcceptGbp: z.ZodNullable<z.ZodNumber>;
        /** `maxBuyGbp` as a % of market value, to one decimal place. v0.2.0: null exactly when
         *  `maxBuyGbp` is null (a percentage of nothing). */
        offerPctAtMax: z.ZodNullable<z.ZodNumber>;
        /**
         * True when the decision was made without complete information — an offline client with no
         * comps and no fee context. The route is still the best available call; degraded means "trust
         * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
         * can never present as more certain than a complete one.
         */
        degraded: z.ZodBoolean;
        degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
        /**
         * What the engine assumed. Distinct from `degradedReasons`: a decision can be entirely
         * un-degraded and still rest on assumptions the seller never stated.
         */
        assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
            /**
             * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
             * sentence — the label comes from @curio/copy, same as every other code in this module, so the
             * server does not become the owner of English for three platforms.
             */
            value: z.ZodNullable<z.ZodString>;
            /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
            valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>;
    /** Where the market value came from. Beside the decision, never inside it — see above. */
    price: z.ZodObject<{
        /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
        source: z.ZodNullable<z.ZodString>;
        /** How much the price itself is trusted — distinct from the DECISION's confidence. */
        confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        /** Set when the figure was converted from another currency, so a UK seller is told. */
        currencyNote: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }>;
    gradeEV: z.ZodOptional<z.ZodObject<{
        gradeEVGbp: z.ZodNullable<z.ZodNumber>;
        psa10PriceGbp: z.ZodNullable<z.ZodNumber>;
        p10: z.ZodNullable<z.ZodNumber>;
        p9: z.ZodNullable<z.ZodNumber>;
        gradingCostGbp: z.ZodNullable<z.ZodNumber>;
        rawNetGbp: z.ZodNullable<z.ZodNumber>;
        confidence: z.ZodNullable<z.ZodEnum<["medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    }, {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    }>>;
    /** v0.2.0. Every line of the most to pay, with its source: sale price, eBay fee, packing,
     *  [packing time], postage, your margin, [tax set aside], most to pay. Beside the decision, as
     *  `price` and `gradeEV` are — it is the line-by-line answer to the same calculation, and a
     *  screen renders it instead of computing anything. Consistent with `decision` (guarded). */
    breakdown: z.ZodEffects<z.ZodObject<{
        mode: z.ZodEnum<["selling", "buying"]>;
        lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        totals: z.ZodObject<{
            youReceiveGbp: z.ZodNullable<z.ZodNumber>;
            maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }>;
        compare: z.ZodNullable<z.ZodObject<{
            theirPriceGbp: z.ZodNumber;
            overUnderGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }>>;
        feePosition: z.ZodObject<{
            sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
            vatRegistered: z.ZodNullable<z.ZodBoolean>;
            channel: z.ZodEnum<["ebay", "direct"]>;
            feeBasis: z.ZodEnum<["derived", "seller_override", "not_set"]>;
        }, "strip", z.ZodTypeAny, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }>;
        notSet: z.ZodArray<z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>, "many">;
        price: z.ZodObject<{
            gbp: z.ZodNullable<z.ZodNumber>;
            source: z.ZodNullable<z.ZodString>;
            kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
            asOf: z.ZodNullable<z.ZodString>;
            cached: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }>;
        computedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>;
}, "strip", z.ZodTypeAny, {
    price: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    };
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    };
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
}, {
    price: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    };
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    };
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
}>, {
    price: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    };
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    };
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
}, {
    price: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    };
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    };
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    };
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
}>;
export type DecideResponse = z.infer<typeof DecideResponseSchema>;
export declare const DecideBatchCardSchema: z.ZodObject<{
    /** Caller-assigned id (e.g. the client-side listing id) — echoed back to match results up. */
    id: z.ZodString;
    marketValueGbp: z.ZodNullable<z.ZodNumber>;
    costBasisGbp: z.ZodNullable<z.ZodNumber>;
    condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    isVintage: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    saleCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    priceSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Null = not counted, which is NOT the same as 0 = counted, none. See DecisionInput. */
    compatibleCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    collectionType: z.ZodOptional<z.ZodEnum<["personal", "resale"]>>;
    /** What they are asking for this card (v0.2.0); the server computes the over/under. */
    theirPriceGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    marketValueGbp: number | null;
    costBasisGbp: number | null;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    isVintage?: boolean | null | undefined;
    priceSource?: string | null | undefined;
    saleCount?: number | null | undefined;
    theirPriceGbp?: number | null | undefined;
    compatibleCount?: number | null | undefined;
}, {
    id: string;
    marketValueGbp: number | null;
    costBasisGbp: number | null;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    collectionType?: "personal" | "resale" | undefined;
    isVintage?: boolean | null | undefined;
    priceSource?: string | null | undefined;
    saleCount?: number | null | undefined;
    theirPriceGbp?: number | null | undefined;
    compatibleCount?: number | null | undefined;
}>;
export type DecideBatchCard = z.infer<typeof DecideBatchCardSchema>;
export declare const DecideBatchRequestSchema: z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        /** Caller-assigned id (e.g. the client-side listing id) — echoed back to match results up. */
        id: z.ZodString;
        marketValueGbp: z.ZodNullable<z.ZodNumber>;
        costBasisGbp: z.ZodNullable<z.ZodNumber>;
        condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
        isVintage: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        saleCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        priceSource: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Null = not counted, which is NOT the same as 0 = counted, none. See DecisionInput. */
        compatibleCount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        collectionType: z.ZodOptional<z.ZodEnum<["personal", "resale"]>>;
        /** What they are asking for this card (v0.2.0); the server computes the over/under. */
        theirPriceGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        marketValueGbp: number | null;
        costBasisGbp: number | null;
        condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
        collectionType?: "personal" | "resale" | undefined;
        isVintage?: boolean | null | undefined;
        priceSource?: string | null | undefined;
        saleCount?: number | null | undefined;
        theirPriceGbp?: number | null | undefined;
        compatibleCount?: number | null | undefined;
    }, {
        id: string;
        marketValueGbp: number | null;
        costBasisGbp: number | null;
        condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
        collectionType?: "personal" | "resale" | undefined;
        isVintage?: boolean | null | undefined;
        priceSource?: string | null | undefined;
        saleCount?: number | null | undefined;
        theirPriceGbp?: number | null | undefined;
        compatibleCount?: number | null | undefined;
    }>, "many">;
    /** Applies to the whole batch — a seller preference, not a per-card fact. v0.2.0: so are
     *  `postageMode` and `packingKey` below. */
    targetMarginPct: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
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
    postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
    packingKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cards: {
        id: string;
        marketValueGbp: number | null;
        costBasisGbp: number | null;
        condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
        collectionType?: "personal" | "resale" | undefined;
        isVintage?: boolean | null | undefined;
        priceSource?: string | null | undefined;
        saleCount?: number | null | undefined;
        theirPriceGbp?: number | null | undefined;
        compatibleCount?: number | null | undefined;
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
    targetMarginPct?: number | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
}, {
    cards: {
        id: string;
        marketValueGbp: number | null;
        costBasisGbp: number | null;
        condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
        collectionType?: "personal" | "resale" | undefined;
        isVintage?: boolean | null | undefined;
        priceSource?: string | null | undefined;
        saleCount?: number | null | undefined;
        theirPriceGbp?: number | null | undefined;
        compatibleCount?: number | null | undefined;
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
    targetMarginPct?: number | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
}>;
export type DecideBatchRequest = z.infer<typeof DecideBatchRequestSchema>;
export declare const DecideBatchResultSchema: z.ZodEffects<z.ZodObject<{
    id: z.ZodString;
    /**
     * NULL when that card has no market value yet — the same principle as quick-scan's null
     * decision: a decision computed from a value we do not have is a guess wearing a number. One
     * unpriceable card does not fail the batch.
     */
    decision: z.ZodNullable<z.ZodEffects<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
            /**
             * What this alternative nets, when that is knowable.
             *
             * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
             * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
             * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
             * was a regression in decision quality rather than in polish.
             *
             * NULL where the net genuinely cannot be computed for that route rather than where it was merely
             * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
             * quoting this card's net beside "Bundle" would be a number that answers a different question.
             */
            expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }>, "many">>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        liquidity: z.ZodEnum<["high", "medium", "low"]>;
        economics: z.ZodEffects<z.ZodObject<{
            marketValueGbp: z.ZodNumber;
            /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
             *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
             *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
            feeGbp: z.ZodNullable<z.ZodNumber>;
            /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
            feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
            postageGbp: z.ZodNumber;
            packagingGbp: z.ZodNumber;
            /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
             *  free acquisition inflates every net figure on the screen people scan with. */
            costBasisGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (tax on a profit that cannot be computed). */
            taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (the profit includes the fee). */
            expectedNetGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>;
        /**
         * ACQUISITION: the most the seller should PAY for this card.
         *
         * v0.2.0 (BREAKING): WHOLE POUNDS, rounded DOWN by the server (Ben, 2026-10-09: "most to pay"
         * is shown to the pound everywhere, and it is the same figure as the breakdown's `max_buy` line).
         * A pence figure here is refused by the server-side guard below. NULL when no honest figure
         * exists, with `maxBuyUnavailableReason` saying why. Null is "we are not telling you a number", NEVER "£0" — £0 is a real answer ("pay
         * nothing") and rendering null as £0 is the original bug, from the other side. A client renders
         * the reason ("Set your buying margin", "Not set"), never a figure.
         */
        maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `maxBuyGbp` is null. Null exactly when `maxBuyGbp` is a number. Required key (never
         *  absent from the server's output) so a null most-to-pay cannot reach a client unexplained. */
        maxBuyUnavailableReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
         *  floor, the auction start price (a start price is a free reserve), and the
         *  "this shouldn't be an auction" test against the top realised comp.
         *
         *  v0.2.0 (BREAKING): null exactly when `economics.feeGbp` is null. The floor is the price at
         *  which net-of-fees clears the seller's minimum profit, so it contains the fee; computed with an
         *  assumed £0 private-seller fee it would be LOWER than the true floor for a business seller,
         *  and an auto-decline floor that is too low accepts offers that lose money. A consumer must
         *  not arm Best Offer's auto-decline, nor propose an auction start price, from a null here. */
        minAcceptGbp: z.ZodNullable<z.ZodNumber>;
        /** `maxBuyGbp` as a % of market value, to one decimal place. v0.2.0: null exactly when
         *  `maxBuyGbp` is null (a percentage of nothing). */
        offerPctAtMax: z.ZodNullable<z.ZodNumber>;
        /**
         * True when the decision was made without complete information — an offline client with no
         * comps and no fee context. The route is still the best available call; degraded means "trust
         * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
         * can never present as more certain than a complete one.
         */
        degraded: z.ZodBoolean;
        degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
        /**
         * What the engine assumed. Distinct from `degradedReasons`: a decision can be entirely
         * un-degraded and still rest on assumptions the seller never stated.
         */
        assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
            /**
             * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
             * sentence — the label comes from @curio/copy, same as every other code in this module, so the
             * server does not become the owner of English for three platforms.
             */
            value: z.ZodNullable<z.ZodString>;
            /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
            valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>>;
    decisionUnavailable: z.ZodOptional<z.ZodNullable<z.ZodEnum<["identity_unresolved", "no_market_value", "pricing_unavailable"]>>>;
    price: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
        source: z.ZodNullable<z.ZodString>;
        /** How much the price itself is trusted — distinct from the DECISION's confidence. */
        confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        /** Set when the figure was converted from another currency, so a UK seller is told. */
        currencyNote: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }>>>;
    /** v0.2.0. The lines behind this card's decision; null exactly when `decision` is null (a card
     *  with no market value has nothing to itemise — not a breakdown of zeros). */
    breakdown: z.ZodNullable<z.ZodEffects<z.ZodObject<{
        mode: z.ZodEnum<["selling", "buying"]>;
        lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        totals: z.ZodObject<{
            youReceiveGbp: z.ZodNullable<z.ZodNumber>;
            maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }>;
        compare: z.ZodNullable<z.ZodObject<{
            theirPriceGbp: z.ZodNumber;
            overUnderGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }>>;
        feePosition: z.ZodObject<{
            sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
            vatRegistered: z.ZodNullable<z.ZodBoolean>;
            channel: z.ZodEnum<["ebay", "direct"]>;
            feeBasis: z.ZodEnum<["derived", "seller_override", "not_set"]>;
        }, "strip", z.ZodTypeAny, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }>;
        notSet: z.ZodArray<z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>, "many">;
        price: z.ZodObject<{
            gbp: z.ZodNullable<z.ZodNumber>;
            source: z.ZodNullable<z.ZodString>;
            kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
            asOf: z.ZodNullable<z.ZodString>;
            cached: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }>;
        computedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}, {
    id: string;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}>, {
    id: string;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}, {
    id: string;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}>;
export type DecideBatchResult = z.infer<typeof DecideBatchResultSchema>;
export declare const DecideBatchResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodEffects<z.ZodObject<{
        id: z.ZodString;
        /**
         * NULL when that card has no market value yet — the same principle as quick-scan's null
         * decision: a decision computed from a value we do not have is a guess wearing a number. One
         * unpriceable card does not fail the batch.
         */
        decision: z.ZodNullable<z.ZodEffects<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
            alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
                route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
                reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
                /**
                 * What this alternative nets, when that is knowable.
                 *
                 * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
                 * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
                 * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
                 * was a regression in decision quality rather than in polish.
                 *
                 * NULL where the net genuinely cannot be computed for that route rather than where it was merely
                 * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
                 * quoting this card's net beside "Bundle" would be a number that answers a different question.
                 */
                expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }, {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }>, "many">>;
            confidence: z.ZodEnum<["high", "medium", "low"]>;
            liquidity: z.ZodEnum<["high", "medium", "low"]>;
            economics: z.ZodEffects<z.ZodObject<{
                marketValueGbp: z.ZodNumber;
                /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
                 *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
                 *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
                feeGbp: z.ZodNullable<z.ZodNumber>;
                /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
                feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
                postageGbp: z.ZodNumber;
                packagingGbp: z.ZodNumber;
                /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
                 *  free acquisition inflates every net figure on the screen people scan with. */
                costBasisGbp: z.ZodNullable<z.ZodNumber>;
                /** Null with `feeGbp` (tax on a profit that cannot be computed). */
                taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
                /** Null with `feeGbp` (the profit includes the fee). */
                expectedNetGbp: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            }, {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            }>, {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            }, {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            }>;
            /**
             * ACQUISITION: the most the seller should PAY for this card.
             *
             * v0.2.0 (BREAKING): WHOLE POUNDS, rounded DOWN by the server (Ben, 2026-10-09: "most to pay"
             * is shown to the pound everywhere, and it is the same figure as the breakdown's `max_buy` line).
             * A pence figure here is refused by the server-side guard below. NULL when no honest figure
             * exists, with `maxBuyUnavailableReason` saying why. Null is "we are not telling you a number", NEVER "£0" — £0 is a real answer ("pay
             * nothing") and rendering null as £0 is the original bug, from the other side. A client renders
             * the reason ("Set your buying margin", "Not set"), never a figure.
             */
            maxBuyGbp: z.ZodNullable<z.ZodNumber>;
            /** WHY `maxBuyGbp` is null. Null exactly when `maxBuyGbp` is a number. Required key (never
             *  absent from the server's output) so a null most-to-pay cannot reach a client unexplained. */
            maxBuyUnavailableReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
             *  floor, the auction start price (a start price is a free reserve), and the
             *  "this shouldn't be an auction" test against the top realised comp.
             *
             *  v0.2.0 (BREAKING): null exactly when `economics.feeGbp` is null. The floor is the price at
             *  which net-of-fees clears the seller's minimum profit, so it contains the fee; computed with an
             *  assumed £0 private-seller fee it would be LOWER than the true floor for a business seller,
             *  and an auto-decline floor that is too low accepts offers that lose money. A consumer must
             *  not arm Best Offer's auto-decline, nor propose an auction start price, from a null here. */
            minAcceptGbp: z.ZodNullable<z.ZodNumber>;
            /** `maxBuyGbp` as a % of market value, to one decimal place. v0.2.0: null exactly when
             *  `maxBuyGbp` is null (a percentage of nothing). */
            offerPctAtMax: z.ZodNullable<z.ZodNumber>;
            /**
             * True when the decision was made without complete information — an offline client with no
             * comps and no fee context. The route is still the best available call; degraded means "trust
             * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
             * can never present as more certain than a complete one.
             */
            degraded: z.ZodBoolean;
            degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
            /**
             * What the engine assumed. Distinct from `degradedReasons`: a decision can be entirely
             * un-degraded and still rest on assumptions the seller never stated.
             */
            assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
                code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
                /**
                 * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
                 * sentence — the label comes from @curio/copy, same as every other code in this module, so the
                 * server does not become the owner of English for three platforms.
                 */
                value: z.ZodNullable<z.ZodString>;
                /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
                valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }, {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }>, "many">>;
        }, "strip", z.ZodTypeAny, {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            alternatives: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[];
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            assumptions: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[];
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
        }, {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            alternatives?: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[] | undefined;
            assumptions?: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[] | undefined;
            degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
        }>, {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            alternatives: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[];
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            assumptions: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[];
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
        }, {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            alternatives?: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[] | undefined;
            assumptions?: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[] | undefined;
            degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
        }>>;
        decisionUnavailable: z.ZodOptional<z.ZodNullable<z.ZodEnum<["identity_unresolved", "no_market_value", "pricing_unavailable"]>>>;
        price: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
            source: z.ZodNullable<z.ZodString>;
            /** How much the price itself is trusted — distinct from the DECISION's confidence. */
            confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
            /** Set when the figure was converted from another currency, so a UK seller is told. */
            currencyNote: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        }, {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        }>>>;
        /** v0.2.0. The lines behind this card's decision; null exactly when `decision` is null (a card
         *  with no market value has nothing to itemise — not a breakdown of zeros). */
        breakdown: z.ZodNullable<z.ZodEffects<z.ZodObject<{
            mode: z.ZodEnum<["selling", "buying"]>;
            lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
                key: z.ZodString;
                label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                amountGbp: z.ZodNullable<z.ZodNumber>;
                unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
                source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
                assumed: z.ZodBoolean;
                estimate: z.ZodBoolean;
                editable: z.ZodBoolean;
                editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
                included: z.ZodBoolean;
                minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
                postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
                perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
                feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                note: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, "many">;
            beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
                key: z.ZodString;
                label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                amountGbp: z.ZodNullable<z.ZodNumber>;
                unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
                source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
                assumed: z.ZodBoolean;
                estimate: z.ZodBoolean;
                editable: z.ZodBoolean;
                editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
                included: z.ZodBoolean;
                minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
                postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
                perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
                feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                note: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }, {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }>, "many">;
            totals: z.ZodObject<{
                youReceiveGbp: z.ZodNullable<z.ZodNumber>;
                maxBuyGbp: z.ZodNullable<z.ZodNumber>;
            }, "strip", z.ZodTypeAny, {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            }, {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            }>;
            compare: z.ZodNullable<z.ZodObject<{
                theirPriceGbp: z.ZodNumber;
                overUnderGbp: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                theirPriceGbp: number;
                overUnderGbp: number;
            }, {
                theirPriceGbp: number;
                overUnderGbp: number;
            }>>;
            feePosition: z.ZodObject<{
                sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
                vatRegistered: z.ZodNullable<z.ZodBoolean>;
                channel: z.ZodEnum<["ebay", "direct"]>;
                feeBasis: z.ZodEnum<["derived", "seller_override", "not_set"]>;
            }, "strip", z.ZodTypeAny, {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            }, {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            }>;
            notSet: z.ZodArray<z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>, "many">;
            price: z.ZodObject<{
                gbp: z.ZodNullable<z.ZodNumber>;
                source: z.ZodNullable<z.ZodString>;
                kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
                asOf: z.ZodNullable<z.ZodString>;
                cached: z.ZodBoolean;
            }, "strip", z.ZodTypeAny, {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            }, {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            }>;
            computedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        }, {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        }>, {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        }, {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            alternatives: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[];
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            assumptions: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[];
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }, {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            alternatives?: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[] | undefined;
            assumptions?: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[] | undefined;
            degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }>, {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            alternatives: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[];
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            assumptions: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[];
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }, {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            alternatives?: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[] | undefined;
            assumptions?: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[] | undefined;
            degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    results: {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            alternatives: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[];
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            assumptions: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[];
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }[];
}, {
    results: {
        id: string;
        decision: {
            confidence: "high" | "medium" | "low";
            liquidity: "high" | "medium" | "low";
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            economics: {
                marketValueGbp: number;
                feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
                expectedNetGbp: number | null;
                feeGbp: number | null;
                postageGbp: number;
                packagingGbp: number;
                costBasisGbp: number | null;
                taxProvisionGbp: number | null;
            };
            reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
            maxBuyGbp: number | null;
            maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            minAcceptGbp: number | null;
            offerPctAtMax: number | null;
            degraded: boolean;
            alternatives?: {
                route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
                reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
                expectedNetGbp?: number | null | undefined;
            }[] | undefined;
            assumptions?: {
                value: string | null;
                code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
                valueGbp?: number | null | undefined;
            }[] | undefined;
            degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
        } | null;
        breakdown: {
            mode: "selling" | "buying";
            lines: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            beside: {
                estimate: boolean;
                source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
                key: string;
                amountGbp: number | null;
                unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
                assumed: boolean;
                editable: boolean;
                editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
                included: boolean;
                note: string | null;
                label?: string | null | undefined;
                minutes?: number | null | undefined;
                service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
                postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
                perOrderBand?: "high" | "low" | null | undefined;
                feeBasisVerified?: boolean | null | undefined;
            }[];
            totals: {
                youReceiveGbp: number | null;
                maxBuyGbp: number | null;
            };
            compare: {
                theirPriceGbp: number;
                overUnderGbp: number;
            } | null;
            feePosition: {
                channel: "ebay" | "direct";
                sellerType: "private" | "business" | null;
                vatRegistered: boolean | null;
                feeBasis: "derived" | "seller_override" | "not_set";
            };
            notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
            price: {
                source: string | null;
                cached: boolean;
                gbp: number | null;
                kind: "realised" | "asking" | null;
                asOf: string | null;
            };
            computedAt: string;
        } | null;
        price?: {
            source: string | null;
            confidence: "high" | "medium" | "low" | null;
            currencyNote: string | null;
        } | null | undefined;
        decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    }[];
}>;
export type DecideBatchResponse = z.infer<typeof DecideBatchResponseSchema>;
export declare const QuickScanRequestSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * The set code read off the card, e.g. "BS", "SFD". Mirrors `CatalogueLookupRequestSchema`.
     *
     * ⚠️ NOT optional in effect, even though it is optional in type. It is W15 Tier 0's STRONGEST
     * set signal, tried ahead of the name-first resolver. Without it here, a client collapsing its
     * card-search call into this one would throw the OCR'd set code away and resolve on a bare
     * number — the cross-game-collision case that produced the "Windsinger" match. That trades
     * identification accuracy for a rate-limit saving, and for a first-time anonymous user a WRONG
     * CARD is worse than a second request.
     */
    setCode: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** A narrowing HINT, never a precondition — number+set is decisive for ~99.3% of the catalogue
     *  across all games combined. */
    game: z.ZodOptional<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>;
    condition: z.ZodOptional<z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>>;
    finish: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** As on DecideRequest — a seller preference, not a cost assertion. More useful here, if
     *  anything: an anonymous scanner has no saved profile to default from. */
    targetMarginPct: z.ZodOptional<z.ZodEffects<z.ZodNumber, number, number>>;
    /** v0.2.0 — as on DecideRequest: what they are asking, who bears postage, a keyed packing
     *  choice. Seller intent only. */
    theirPriceGbp: z.ZodOptional<z.ZodNumber>;
    postageMode: z.ZodOptional<z.ZodEnum<["seller_pays", "buyer_pays"]>>;
    packingKey: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    setCode?: string | null | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    finish?: string | null | undefined;
    targetMarginPct?: number | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    theirPriceGbp?: number | undefined;
}, {
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | undefined;
    name?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    setCode?: string | null | undefined;
    condition?: "NM" | "LP" | "MP" | "HP" | "DMG" | "Graded" | undefined;
    finish?: string | null | undefined;
    targetMarginPct?: number | undefined;
    postageMode?: "seller_pays" | "buyer_pays" | undefined;
    packingKey?: string | undefined;
    theirPriceGbp?: number | undefined;
}>;
export type QuickScanRequest = z.infer<typeof QuickScanRequestSchema>;
export declare const QuickScanCandidateSchema: z.ZodObject<{
    game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
    nativeId: z.ZodString;
    name: z.ZodString;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Rarity, for the attribute chip the collapse otherwise dropped. */
    rarity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /**
     * How confident the CATALOGUE RESOLVER is in this match — not how confident we are in its price.
     *
     * `identified` is a boolean, and a boolean cannot express "resolved, but hold it at arm's
     * length". iOS had an `.uncertain` state for exactly that and deleted it rather than leave an
     * unreachable branch, which was the right call and a real capability loss: a medium-confidence
     * name-trigram match and an exact number+set hit are not the same claim, and the UI should be
     * able to say so.
     *
     * ⚠️ MUST NOT be re-derived client-side. It comes from the resolver tier that produced the
     * match — a client inferring it from name similarity or field completeness would be inventing a
     * second, disagreeing confidence model, which is the shape of every drift incident in this
     * project's history.
     */
    confidence: z.ZodOptional<z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>>;
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
    confidence?: "high" | "medium" | "low" | null | undefined;
    rarity?: string | null | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    image?: string | null | undefined;
}, {
    name: string;
    nativeId: string;
    game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
    confidence?: "high" | "medium" | "low" | null | undefined;
    rarity?: string | null | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    image?: string | null | undefined;
}>;
export declare const QuickScanResponseSchema: z.ZodEffects<z.ZodObject<{
    /** Whether the scanned identity resolved to a real catalogue card. */
    identified: z.ZodBoolean;
    /** Cross-game candidates when the identity is ambiguous. Empty otherwise. */
    candidates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        game: z.ZodOptional<z.ZodNullable<z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>>>;
        nativeId: z.ZodString;
        name: z.ZodString;
        setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /** Rarity, for the attribute chip the collapse otherwise dropped. */
        rarity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * How confident the CATALOGUE RESOLVER is in this match — not how confident we are in its price.
         *
         * `identified` is a boolean, and a boolean cannot express "resolved, but hold it at arm's
         * length". iOS had an `.uncertain` state for exactly that and deleted it rather than leave an
         * unreachable branch, which was the right call and a real capability loss: a medium-confidence
         * name-trigram match and an exact number+set hit are not the same claim, and the UI should be
         * able to say so.
         *
         * ⚠️ MUST NOT be re-derived client-side. It comes from the resolver tier that produced the
         * match — a client inferring it from name similarity or field completeness would be inventing a
         * second, disagreeing confidence model, which is the shape of every drift incident in this
         * project's history.
         */
        confidence: z.ZodOptional<z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>>;
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
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
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
        /** Rarity, for the attribute chip the collapse otherwise dropped. */
        rarity: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        /**
         * How confident the CATALOGUE RESOLVER is in this match — not how confident we are in its price.
         *
         * `identified` is a boolean, and a boolean cannot express "resolved, but hold it at arm's
         * length". iOS had an `.uncertain` state for exactly that and deleted it rather than leave an
         * unreachable branch, which was the right call and a real capability loss: a medium-confidence
         * name-trigram match and an exact number+set hit are not the same claim, and the UI should be
         * able to say so.
         *
         * ⚠️ MUST NOT be re-derived client-side. It comes from the resolver tier that produced the
         * match — a client inferring it from name similarity or field completeness would be inventing a
         * second, disagreeing confidence model, which is the shape of every drift incident in this
         * project's history.
         */
        confidence: z.ZodOptional<z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>>;
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
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }, {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
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
    decision: z.ZodNullable<z.ZodEffects<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        reason: z.ZodEnum<["below_bulk_floor", "net_below_minimum", "grade_worth_reviewing", "thin_market", "bundle_lot_available", "sound_single_listing"]>;
        alternatives: z.ZodDefault<z.ZodArray<z.ZodObject<{
            route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
            reason: z.ZodEnum<["net_negative_after_costs", "bundle_shares_postage", "list_ungraded_instead", "list_now_accept_slower", "list_alone_instead"]>;
            /**
             * What this alternative nets, when that is knowable.
             *
             * NOT cosmetic. An alternative without its number is a label, not a choice — "Bundle" against
             * "List individually" tells a seller nothing, while "Bundle" against "List individually (nets
             * ~£8.10)" is a comparison they can actually make. The figure IS the comparison, and dropping it
             * was a regression in decision quality rather than in polish.
             *
             * NULL where the net genuinely cannot be computed for that route rather than where it was merely
             * not calculated: a bundle's or bulk lot's proceeds depend on the whole lot, not on this card, so
             * quoting this card's net beside "Bundle" would be a number that answers a different question.
             */
            expectedNetGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }, {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }>, "many">>;
        confidence: z.ZodEnum<["high", "medium", "low"]>;
        liquidity: z.ZodEnum<["high", "medium", "low"]>;
        economics: z.ZodEffects<z.ZodObject<{
            marketValueGbp: z.ZodNumber;
            /** What the seller actually pays eBay, with their VAT position applied (ADR 0025).
             *  NULL when the fee position is not set — see `feeNotSetReason`. NOT zero: £0 is a private
             *  seller's real fee, and a client rendering null as £0 re-creates the bug this field fixes. */
            feeGbp: z.ZodNullable<z.ZodNumber>;
            /** WHY `feeGbp` is null. Null exactly when `feeGbp` is a number. */
            feeNotSetReason: z.ZodNullable<z.ZodEnum<["seller_type_not_set", "vat_not_set"]>>;
            postageGbp: z.ZodNumber;
            packagingGbp: z.ZodNumber;
            /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
             *  free acquisition inflates every net figure on the screen people scan with. */
            costBasisGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (tax on a profit that cannot be computed). */
            taxProvisionGbp: z.ZodNullable<z.ZodNumber>;
            /** Null with `feeGbp` (the profit includes the fee). */
            expectedNetGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }, {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        }>;
        /**
         * ACQUISITION: the most the seller should PAY for this card.
         *
         * v0.2.0 (BREAKING): WHOLE POUNDS, rounded DOWN by the server (Ben, 2026-10-09: "most to pay"
         * is shown to the pound everywhere, and it is the same figure as the breakdown's `max_buy` line).
         * A pence figure here is refused by the server-side guard below. NULL when no honest figure
         * exists, with `maxBuyUnavailableReason` saying why. Null is "we are not telling you a number", NEVER "£0" — £0 is a real answer ("pay
         * nothing") and rendering null as £0 is the original bug, from the other side. A client renders
         * the reason ("Set your buying margin", "Not set"), never a figure.
         */
        maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        /** WHY `maxBuyGbp` is null. Null exactly when `maxBuyGbp` is a number. Required key (never
         *  absent from the server's output) so a null most-to-pay cannot reach a client unexplained. */
        maxBuyUnavailableReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
        /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
         *  floor, the auction start price (a start price is a free reserve), and the
         *  "this shouldn't be an auction" test against the top realised comp.
         *
         *  v0.2.0 (BREAKING): null exactly when `economics.feeGbp` is null. The floor is the price at
         *  which net-of-fees clears the seller's minimum profit, so it contains the fee; computed with an
         *  assumed £0 private-seller fee it would be LOWER than the true floor for a business seller,
         *  and an auto-decline floor that is too low accepts offers that lose money. A consumer must
         *  not arm Best Offer's auto-decline, nor propose an auction start price, from a null here. */
        minAcceptGbp: z.ZodNullable<z.ZodNumber>;
        /** `maxBuyGbp` as a % of market value, to one decimal place. v0.2.0: null exactly when
         *  `maxBuyGbp` is null (a percentage of nothing). */
        offerPctAtMax: z.ZodNullable<z.ZodNumber>;
        /**
         * True when the decision was made without complete information — an offline client with no
         * comps and no fee context. The route is still the best available call; degraded means "trust
         * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
         * can never present as more certain than a complete one.
         */
        degraded: z.ZodBoolean;
        degradedReasons: z.ZodDefault<z.ZodArray<z.ZodEnum<["no_sale_count", "fees_unknown", "compatible_count_unknown"]>, "many">>;
        /**
         * What the engine assumed. Distinct from `degradedReasons`: a decision can be entirely
         * un-degraded and still rest on assumptions the seller never stated.
         */
        assumptions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            code: z.ZodEnum<["channel", "seller_type", "vat_registered", "condition", "postage", "packaging", "tax_rate", "cost_basis"]>;
            /**
             * The assumed value as a RAW TOKEN where one exists ("ebay", "private", "NM"), never a rendered
             * sentence — the label comes from @curio/copy, same as every other code in this module, so the
             * server does not become the owner of English for three platforms.
             */
            value: z.ZodNullable<z.ZodString>;
            /** Monetary assumptions carry their figure, so each client formats it in its own locale. */
            valueGbp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        }, "strip", z.ZodTypeAny, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }, {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    }, {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    }>>;
    /**
     * WHY there is no decision. Present exactly when `decision` is null.
     *
     * Added because `decision: null` alone conflated states that need different handling, which is
     * the defect `decisions/0024` records — and which was reintroduced one commit after documenting
     * it. "We couldn't identify this card", "we know the card but have no price for it" and "the
     * pricing path is unavailable" are a normal result, a normal result, and an OUTAGE. A single
     * null cannot tell a client which to show, and cannot tell us which is happening in production.
     *
     * That last part is not hypothetical: an anonymous scan returned `decision: null` in production
     * for every card tried, and the response could not distinguish "these cards have no price" from
     * "the price path is down". Diagnosing it required guessing.
     */
    /** Where the market value came from. Null when there was no price to have provenance about. */
    price: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
        source: z.ZodNullable<z.ZodString>;
        /** How much the price itself is trusted — distinct from the DECISION's confidence. */
        confidence: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
        /** Set when the figure was converted from another currency, so a UK seller is told. */
        currencyNote: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }, {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    }>>>;
    gradeEV: z.ZodOptional<z.ZodObject<{
        gradeEVGbp: z.ZodNullable<z.ZodNumber>;
        psa10PriceGbp: z.ZodNullable<z.ZodNumber>;
        p10: z.ZodNullable<z.ZodNumber>;
        p9: z.ZodNullable<z.ZodNumber>;
        gradingCostGbp: z.ZodNullable<z.ZodNumber>;
        rawNetGbp: z.ZodNullable<z.ZodNumber>;
        confidence: z.ZodNullable<z.ZodEnum<["medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    }, {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    }>>;
    decisionUnavailable: z.ZodOptional<z.ZodNullable<z.ZodEnum<["identity_unresolved", "no_market_value", "pricing_unavailable"]>>>;
    /** Whether a condition assessment fed the decision, or the default was assumed. */
    conditionAssessed: z.ZodDefault<z.ZodBoolean>;
    /**
     * What the price behind this scan cannot distinguish — forwarded from /api/card-value.
     *
     * Present here because Quick Scan is where a seller sees a number FIRST, and often the only
     * place they see one. It was computed in /api/card-value and dropped by quick-scan's own local
     * interface before this response was built, so iOS could render the warning and Android
     * structurally could not — a T1 parity gap on a safety disclosure.
     */
    editionAmbiguity: z.ZodDefault<z.ZodNullable<z.ZodEnum<["first_edition_shadowless_unlimited", "first_edition_unlimited"]>>>;
    /** v0.2.0. The lines behind `decision`; null exactly when `decision` is null. */
    breakdown: z.ZodNullable<z.ZodEffects<z.ZodObject<{
        mode: z.ZodEnum<["selling", "buying"]>;
        lines: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        beside: z.ZodArray<z.ZodEffects<z.ZodObject<{
            key: z.ZodString;
            label: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            amountGbp: z.ZodNullable<z.ZodNumber>;
            unknownReason: z.ZodNullable<z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>>;
            source: z.ZodEnum<["seller_profile", "ebay_policy", "fee_model", "price_provider", "card_override", "request", "default"]>;
            assumed: z.ZodBoolean;
            estimate: z.ZodBoolean;
            editable: z.ZodBoolean;
            editKey: z.ZodNullable<z.ZodEnum<["targetMarginPct", "postageMode", "packingKey"]>>;
            included: z.ZodBoolean;
            minutes: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            service: z.ZodOptional<z.ZodNullable<z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>>>;
            postageBasis: z.ZodOptional<z.ZodNullable<z.ZodEnum<["ebay_policy", "dispatch_rules"]>>>;
            perOrderBand: z.ZodOptional<z.ZodNullable<z.ZodEnum<["low", "high"]>>>;
            feeBasisVerified: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
            note: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }, {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }>, "many">;
        totals: z.ZodObject<{
            youReceiveGbp: z.ZodNullable<z.ZodNumber>;
            maxBuyGbp: z.ZodNullable<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }, {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        }>;
        compare: z.ZodNullable<z.ZodObject<{
            theirPriceGbp: z.ZodNumber;
            overUnderGbp: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }, {
            theirPriceGbp: number;
            overUnderGbp: number;
        }>>;
        feePosition: z.ZodObject<{
            sellerType: z.ZodNullable<z.ZodEnum<["private", "business"]>>;
            vatRegistered: z.ZodNullable<z.ZodBoolean>;
            channel: z.ZodEnum<["ebay", "direct"]>;
            feeBasis: z.ZodEnum<["derived", "seller_override", "not_set"]>;
        }, "strip", z.ZodTypeAny, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }, {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        }>;
        notSet: z.ZodArray<z.ZodEnum<["sellerType", "vatPosition", "targetMargin"]>, "many">;
        price: z.ZodObject<{
            gbp: z.ZodNullable<z.ZodNumber>;
            source: z.ZodNullable<z.ZodString>;
            kind: z.ZodNullable<z.ZodEnum<["realised", "asking"]>>;
            asOf: z.ZodNullable<z.ZodString>;
            cached: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }, {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        }>;
        computedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }, {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    }>>;
}, "strip", z.ZodTypeAny, {
    candidates: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[];
    editionAmbiguity: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    identified: boolean;
    conditionAssessed: boolean;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}, {
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    identified: boolean;
    candidates?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[] | undefined;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
    editionAmbiguity?: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null | undefined;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    conditionAssessed?: boolean | undefined;
}>, {
    candidates: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[];
    editionAmbiguity: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null;
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        alternatives: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[];
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        assumptions: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[];
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        degradedReasons: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[];
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    identified: boolean;
    conditionAssessed: boolean;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
}, {
    decision: {
        confidence: "high" | "medium" | "low";
        liquidity: "high" | "medium" | "low";
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        economics: {
            marketValueGbp: number;
            feeNotSetReason: "seller_type_not_set" | "vat_not_set" | null;
            expectedNetGbp: number | null;
            feeGbp: number | null;
            postageGbp: number;
            packagingGbp: number;
            costBasisGbp: number | null;
            taxProvisionGbp: number | null;
        };
        reason: "below_bulk_floor" | "net_below_minimum" | "grade_worth_reviewing" | "thin_market" | "bundle_lot_available" | "sound_single_listing";
        maxBuyGbp: number | null;
        maxBuyUnavailableReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
        minAcceptGbp: number | null;
        offerPctAtMax: number | null;
        degraded: boolean;
        alternatives?: {
            route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
            reason: "net_negative_after_costs" | "bundle_shares_postage" | "list_ungraded_instead" | "list_now_accept_slower" | "list_alone_instead";
            expectedNetGbp?: number | null | undefined;
        }[] | undefined;
        assumptions?: {
            value: string | null;
            code: "condition" | "channel" | "postage" | "packaging" | "seller_type" | "vat_registered" | "tax_rate" | "cost_basis";
            valueGbp?: number | null | undefined;
        }[] | undefined;
        degradedReasons?: ("no_sale_count" | "fees_unknown" | "compatible_count_unknown")[] | undefined;
    } | null;
    breakdown: {
        mode: "selling" | "buying";
        lines: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        beside: {
            estimate: boolean;
            source: "ebay_policy" | "seller_profile" | "fee_model" | "price_provider" | "card_override" | "request" | "default";
            key: string;
            amountGbp: number | null;
            unknownReason: "seller_type_not_set" | "vat_not_set" | "margin_not_set" | "asking_price_only" | "no_price" | "not_viable" | null;
            assumed: boolean;
            editable: boolean;
            editKey: "targetMarginPct" | "postageMode" | "packingKey" | null;
            included: boolean;
            note: string | null;
            label?: string | null | undefined;
            minutes?: number | null | undefined;
            service?: "rm48_ll" | "rm24_ll" | "tracked48_sp" | "special_delivery" | null | undefined;
            postageBasis?: "ebay_policy" | "dispatch_rules" | null | undefined;
            perOrderBand?: "high" | "low" | null | undefined;
            feeBasisVerified?: boolean | null | undefined;
        }[];
        totals: {
            youReceiveGbp: number | null;
            maxBuyGbp: number | null;
        };
        compare: {
            theirPriceGbp: number;
            overUnderGbp: number;
        } | null;
        feePosition: {
            channel: "ebay" | "direct";
            sellerType: "private" | "business" | null;
            vatRegistered: boolean | null;
            feeBasis: "derived" | "seller_override" | "not_set";
        };
        notSet: ("sellerType" | "vatPosition" | "targetMargin")[];
        price: {
            source: string | null;
            cached: boolean;
            gbp: number | null;
            kind: "realised" | "asking" | null;
            asOf: string | null;
        };
        computedAt: string;
    } | null;
    identified: boolean;
    candidates?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    }[] | undefined;
    match?: {
        name: string;
        nativeId: string;
        game?: "pokemon" | "pokemon-jp" | "mtg" | "yugioh" | "lorcana" | "one-piece" | "digimon" | "dbs-fusion" | null | undefined;
        confidence?: "high" | "medium" | "low" | null | undefined;
        rarity?: string | null | undefined;
        setName?: string | null | undefined;
        cardNumber?: string | null | undefined;
        image?: string | null | undefined;
    } | null | undefined;
    gradeEV?: {
        confidence: "medium" | "low" | null;
        psa10PriceGbp: number | null;
        p10: number | null;
        p9: number | null;
        gradingCostGbp: number | null;
        rawNetGbp: number | null;
        gradeEVGbp: number | null;
    } | undefined;
    editionAmbiguity?: "first_edition_shadowless_unlimited" | "first_edition_unlimited" | null | undefined;
    price?: {
        source: string | null;
        confidence: "high" | "medium" | "low" | null;
        currencyNote: string | null;
    } | null | undefined;
    decisionUnavailable?: "identity_unresolved" | "no_market_value" | "pricing_unavailable" | null | undefined;
    conditionAssessed?: boolean | undefined;
}>;
export type QuickScanResponse = z.infer<typeof QuickScanResponseSchema>;
