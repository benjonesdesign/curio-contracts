// Contract for POST /api/card-value (pokemon-tool) — full finish-aware value for a CATALOGUE card
// the seller doesn't own. The price surface behind "look up a card".
//
// The FIFTH uncovered route, and the last one that could be left uncovered: as of 2026-08-29 it
// carries `editionAmbiguity`, a SAFETY DISCLOSURE. iOS had hand-written its own `CardValueResult`
// and flagged that honestly rather than passing it off as generated; Android had no path to the
// field at all, because /api/quick-scan's own local interface dropped it before building its
// response. A disclosure that reaches one platform is not a disclosure.
import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
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
export const EditionAmbiguitySchema = z.enum([
    /** Base Set: 1st Edition, Shadowless and Unlimited all exist at this name + set + number. */
    "first_edition_shadowless_unlimited",
    /** The other WOTC sets with a 1st Edition print run: 1st Edition vs Unlimited. */
    "first_edition_unlimited",
]);
export const CardValueRequestSchema = z.object({
    name: z.string(),
    set_name: z.string().optional(),
    card_number: z.string().optional(),
    condition: z.string().optional(),
    /** Omitted → auto/best finish; set → price that exact variant. */
    finish: z.string().optional(),
    /** Omitted → pokemon, for back-compat. */
    game: z.string().optional(),
});
const PriceBandSchema = z.object({
    low: z.number().nullable(),
    avg: z.number().nullable(),
    top: z.number().nullable(),
});
export const CardValueResponseSchema = z.object({
    game: z.string().nullable(),
    gameDisplayName: z.string().nullable(),
    suggestedPrice: z.number().nullable(),
    /** ⚠️ Named "ebay" for back-compat, and populated ONLY when the source really is eBay — the
     *  provider chain resolves to CardTrader/PokeTrace/pokemontcg.io by default. Null otherwise. */
    ebay: PriceBandSchema.nullable(),
    confidence: ConfidenceSchema.nullable(),
    priceWarning: z.string().nullable(),
    priceSource: z.string().nullable(),
    currencyNote: z.string().nullable(),
    possibleFinishes: z.array(z.string()).nullable(),
    finishUsed: z.string().nullable(),
    tcgId: z.string().nullable(),
    /** See EditionAmbiguitySchema. Null when there is nothing to disclose. */
    editionAmbiguity: EditionAmbiguitySchema.nullable().default(null),
    /**
     * The pricing chain FAILED, as opposed to querying and finding nothing.
     *
     * True when any provider threw, or when none could run a query at all. An absent price then
     * means "we could not look", NOT "this card has no market" — and a caller must render it as
     * `pricing_unavailable`, never `no_market_value`.
     *
     * ⚠️ These were one value until 2026-09-01. /api/price's provider walk swallowed every error
     * into a log line and returned a bare null for both outcomes, so Base Set Pikachu — no
     * CardTrader blueprint, and pokemontcg.io returning 500s — was reported as having NO MARKET
     * VALUE. The card is not worthless; we had nothing to look in. That is wrong in the direction
     * that costs a seller the card rather than the margin.
     *
     * SEVENTH instance of the conflated-null shape, and this one was inside the field built to fix
     * it: `decisionUnavailable` exists precisely to separate a normal miss from an outage, and it
     * was being decided from a signal that could not tell them apart.
     */
    pricingDegraded: z.boolean().default(false),
    /**
     * ⚠️ LEGACY coefficients, for installed builds that predate /api/decide. Nothing new should
     * consume this — a client computing its own economics from raw coefficients is exactly what
     * ADR 0026 exists to stop. Declared here because it IS on the wire and an undeclared field is a
     * silently-stripped one; declaring it is not an endorsement.
     */
    economics: z.object({
        feeRate: z.number(),
        feeFixed: z.number(),
        postage: z.number(),
        packaging: z.number(),
        taxRate: z.number(),
        sellerType: z.string(),
        vatRegistered: z.boolean(),
        /** "seller_override" | "derived_from_seller_type" — WHY the numbers are what they are, so the
         *  response stops being a set of unattributed constants. */
        feeBasis: z.string(),
    }).nullable().optional(),
    /** Do you already hold one? Powers "You already own N" + jump-to-it. An anonymous caller owns
     *  nothing by definition, so this is `{count: 0, physicalCardId: null}` rather than absent. */
    owned: z.object({
        count: z.number().int(),
        physicalCardId: z.string().nullable(),
    }).nullable().optional(),
});
