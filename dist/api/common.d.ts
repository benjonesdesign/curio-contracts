import { z } from "zod";
/** Shared by every route's failure path — `NextResponse.json({ error }, { status })`. Not
 * validated against a route's success schema; callers check for this shape first. */
export declare const ApiErrorSchema: z.ZodObject<{
    error: z.ZodString;
}, "strip", z.ZodTypeAny, {
    error: string;
}, {
    error: string;
}>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export declare const GameIdSchema: z.ZodEnum<["pokemon", "pokemon-jp", "mtg", "yugioh", "lorcana", "one-piece", "digimon", "dbs-fusion"]>;
export type GameId = z.infer<typeof GameIdSchema>;
export declare const ConditionSchema: z.ZodEnum<["NM", "LP", "MP", "HP", "DMG", "Graded"]>;
export type Condition = z.infer<typeof ConditionSchema>;
export declare const ConfidenceSchema: z.ZodEnum<["high", "medium", "low"]>;
/** How readily a card sells, from comparable-sale volume. Shared by /api/recommend's economics and
 *  /api/decide — one concept, so one type. Declared inline in both before 2026-08-28, which
 *  generated a `Liquidity` and a `Liquidity2` on every client for the same three values. */
export declare const LiquiditySchema: z.ZodEnum<["high", "medium", "low"]>;
export type Liquidity = z.infer<typeof LiquiditySchema>;
/**
 * Why a decision could not be produced. THREE distinct meanings, never one null.
 *
 * "We couldn't identify this card", "we know the card but have no price for it" and "the pricing
 * path is unavailable" are a normal result, a normal result, and an OUTAGE. A client must render
 * the third differently, and we must be able to tell which is happening in production — an
 * anonymous scan once returned `decision: null` for every card tried and diagnosing it required
 * guessing.
 *
 * ⚠️ DECLARED ONCE, HERE, AND REFERENCED EVERYWHERE. It was previously written inline in both
 * QuickScanResponseSchema and DecideBatchResultSchema, and the emitters cannot know two structurally
 * identical inline enums are the same type — so Kotlin got `DecisionUnavailable` AND
 * `DecisionUnavailable2`, `QuickScanResponse.getDecisionUnavailable()` returned the `2` variant, and
 * Android's code written against the plain name stopped compiling.
 *
 * That is the SECOND time: v0.1.29 fixed `Liquidity`/`Liquidity2` by hoisting it to this file, and
 * because only the instance was fixed and not the rule, the next inline declaration recreated it.
 * The rule is now in decisions/0024 and enforced by a test that fails on any generated type name
 * ending in a digit.
 */
export declare const DecisionUnavailableSchema: z.ZodEnum<["identity_unresolved", "no_market_value", "pricing_unavailable"]>;
export type DecisionUnavailable = z.infer<typeof DecisionUnavailableSchema>;
export type Confidence = z.infer<typeof ConfidenceSchema>;
/**
 * WHY the seller's fee position is unknown — the reason that travels with a null fee (v0.2.0).
 *
 * The fee a seller pays eBay depends on two facts only the seller can state: whether they sell as a
 * private individual or a business, and — for a business — whether they are VAT-registered (ADR
 * 0025's three-state table). Until v0.2.0 the contract could not say "we do not know": the profile
 * columns are `not null default 'private'` / `default false`, so "never answered" and "answered
 * private, not registered" were the SAME row, and every figure downstream quietly assumed a private
 * seller. A null `feeGbp` alone would be the conflated-null shape again (decisions/0024), so a null
 * fee always carries one of these and a known fee never does.
 *
 * Exactly two values, and each is an ANSWER THE SELLER CAN GIVE:
 *  - `seller_type_not_set` — never asked or never answered "private or business?". (An eBay-detected
 *    type is a SUGGESTION, not an answer: PLAN-SELLER-TYPE-FIRST-ASK §2, ruling 5.)
 *  - `vat_not_set` — answered "business" but not "VAT-registered?". A business seller with the VAT
 *    question open reads "Not set" (ruling 5): the registered and not-registered fees differ by
 *    ×1.2, so neither is a safe guess.
 *
 * NOT reasons, deliberately: a seller-set fee override counts as a stated cost and yields a
 * non-null fee even with the type unset (PLAN-SELLER-TYPE-FIRST-ASK decision 5); and "the price
 * lookup failed" is `DecisionUnavailable`, a different question.
 *
 * Declared ONCE here and referenced everywhere: an inline copy per schema is how `Liquidity2` and
 * `DecisionUnavailable2` were minted.
 */
export declare const FeeNotSetReasonSchema: z.ZodEnum<["seller_type_not_set", "vat_not_set"]>;
export type FeeNotSetReason = z.infer<typeof FeeNotSetReasonSchema>;
/**
 * WHY a most-to-pay (or any priced figure that depends on the same inputs) is null (v0.2.0). A null
 * most-to-pay ALWAYS carries one of these; a number never does (enforced on `DecisionSchema`, and on
 * `PricedLine` — the same six reasons name why ANY line of a `PricedBreakdown` is null, so a client
 * has one vocabulary for "no figure", not one per screen). Moved here from decide.ts so
 * priced-breakdown.ts can use it without a circular import; the generated name is unchanged.
 *
 * "Most to pay" is the one number a seller acts on at a card-show table, and a wrong one costs them
 * money in the direction they cannot see. Before v0.2.0 the contract could only say "a number", so
 * every case below was answered with a figure — an asking price dressed as a valuation, a 25%
 * margin the seller never chose, a private-seller fee nobody had confirmed. Each value is a
 * distinct thing the SELLER (or the data) can fix, taken from the plans named beside it:
 *
 *  - `margin_not_set`       the seller has not chosen a buying margin. There is NO fallback to the
 *                           selling floor (`minProfitPct`) any more.            PLAN-MOST-TO-PAY #224 §2, §5
 *  - `seller_type_not_set`  fee position unknown: never answered "private or business?". Mirrors
 *                           `FeeNotSetReason`; most-to-pay is withheld because the formula subtracts
 *                           the fee.                                            PLAN-SELLER-TYPE-FIRST-ASK #230 §3
 *  - `vat_not_set`          business, VAT question unanswered. Mirrors `FeeNotSetReason`. #230 §2
 *  - `asking_price_only`    the only price is the listing's ASKING price (`basis === "ask_only"`).
 *                           A most-to-pay derived from someone else's ask is circular.   #224 §7
 *  - `no_price`             no usable market value at all. Reserved for a Decision that is returned
 *                           without one; today the routes answer this with `decisionUnavailable:
 *                           "no_market_value"` instead of a Decision, so this is a documented
 *                           reservation, NOT a state the server is known to emit.         #224 §7
 *  - `not_viable`           costs plus the margin cannot be covered at any price (margin >= 100% of
 *                           the sale, or the formula has no positive solution). Distinct from "£0":
 *                           £0 is a number the seller can pay, this is "do not buy at any price".  #224 §3, §7
 *
 * NOT in this list, on purpose: `game_not_available`. PLAN-POKEMON-ONLY-BETA-GATE answers a coming
 * game with `422 game_coming` / `game_not_available` — an HTTP refusal, not a Decision — so a
 * Decision never exists for it and the value would be dead.
 *
 * WHICH ONE when several apply is the server's call; the recommended precedence is the order the
 * seller would be asked: no_price, asking_price_only, seller_type_not_set, vat_not_set,
 * margin_not_set, not_viable. The full set lives in `PricedBreakdown.notSet`.
 *
 * Open to additions (ADR 0027): Swift decodes an unknown reason to `.unrecognised(raw)`, Kotlin to
 * `Unknown(raw)`. A client must treat an unrecognised reason as "no most-to-pay", never as a number.
 */
export declare const MaxBuyUnavailableReasonSchema: z.ZodEnum<["margin_not_set", "seller_type_not_set", "vat_not_set", "asking_price_only", "no_price", "not_viable"]>;
export type MaxBuyUnavailableReason = z.infer<typeof MaxBuyUnavailableReasonSchema>;
/**
 * WHICH postage service a postage line is priced on (v0.2.0): the four services the seller's
 * Dispatch settings (H6, "SERVICES YOU OFFER") draw, and nothing else. Keys are the ones
 * PLAN-POSTAGE-FUNCTION (#229) stores in `postage_rules`; H6 shows each one's label.
 *
 *  - `rm48_ll`          Royal Mail 48 · large letter (the default service in the drawn settings)
 *  - `rm24_ll`          Royal Mail 24 · large letter
 *  - `tracked48_sp`     Tracked 48 · small parcel
 *  - `special_delivery` Special Delivery
 *
 * ⚠️ NO LABELS HERE. The contract carries the code; the words ("Royal Mail 48 · large letter")
 * come from @curio/copy, which design/copy must supply. Until it does a client shows the generic
 * "Postage" and never invents a service name from the code.
 *
 * FREE POSTAGE AND "BUYER PAYS" ARE NOT SERVICES. Free postage is a threshold ("Free postage above
 * £{x}"), not something a seller offers; above it the seller pays the service Dispatch would use
 * at that price, so the line carries that service. At or below it the buyer pays and the seller's
 * postage is £0 (#229), so there is NO service: `PricedLine.service` is null, with the note
 * `buyer_pays`. A seller with no Dispatch rules at all also has no service (null).
 *
 * Forward-compatible (decisions/0027): Swift `.unrecognised(raw)`, Kotlin `Unknown(raw)`. A client
 * that meets a service it does not know shows the generic "Postage" with the figure, never fails.
 * Declared ONCE here and referenced by schemas; do not redeclare inline.
 */
export declare const PostageServiceSchema: z.ZodEnum<["rm48_ll", "rm24_ll", "tracked48_sp", "special_delivery"]>;
export type PostageService = z.infer<typeof PostageServiceSchema>;
/**
 * WHICH rule a postage figure came from (v0.2.0; owner ruling 2026-10-09): the seller's eBay
 * postage POLICY for a PUBLISHED listing, the seller's Dispatch RULES for an ESTIMATE (a preview,
 * a card not yet live, a buying decision). Closed, forward-compatible (decisions/0027); a client
 * that meets an unknown basis shows the figure as an estimate. Declared once here.
 */
export declare const PostageBasisSchema: z.ZodEnum<["ebay_policy", "dispatch_rules"]>;
export type PostageBasis = z.infer<typeof PostageBasisSchema>;
/**
 * What a postage figure is being asked FOR (a REQUEST field, v0.2.0; pokemon-tool #255). `estimate`
 * (the default) prices on the seller's Dispatch rules; `published` prices on the eBay postage policy
 * the listing actually uses. It is the request-side twin of the response's `PostageBasis`
 * (`dispatch_rules` / `ebay_policy`): ask for `published`, get `ebay_policy` back (or the same answer
 * as an estimate when no usable policy exists). Closed and forward-compatible (decisions/0027).
 * Declared once here.
 */
export declare const PostageForSchema: z.ZodEnum<["estimate", "published"]>;
export type PostageFor = z.infer<typeof PostageForSchema>;
/** Cards in the parcel (>= 1, <= 500): drives the packing-time default of 4 minutes + 2 per extra
 *  card. Absent means 1. Seller INTENT, not a figure the world sets (ADR 0028). */
export declare const cardsInParcelField: z.ZodNumber;
/** Where a market price came from, in the only two classes that matter to a seller. Hoisted from
 *  the response's inline enum in v0.2.0 so `PricedBreakdown.price.kind` can reuse it: an inline
 *  copy would have emitted `PriceKind2`. The wire values and the generated name (`PriceKind`) are
 *  unchanged. Lives here (not pricing-breakdown.ts) so priced-breakdown.ts and pricing-breakdown.ts
 *  can import each other's neighbours without a cycle. */
export declare const PriceKindSchema: z.ZodEnum<["realised", "asking"]>;
export type PriceKind = z.infer<typeof PriceKindSchema>;
