// Contract for POST /api/decide (authenticated) and POST /api/quick-scan (anonymous) — pokemon-tool.
//
// ONE decision shape, two entry points. They differ in AUTH and RATE-LIMIT BUCKET and in nothing
// else. Written as a single module deliberately: both answer "what should I do with this card, and
// what may I pay for it?", and building them separately mints two shapes for one concept — the debt
// this project spent a fortnight removing (three regrades, two fee models, two CardValueResult
// mirrors on iOS). The second shape never gets reconciled on schedule.
//
// DecisionSchema carries NO IDENTITY. If it did, /api/decide — which receives an already-identified
// card — would return `identified`/`candidates` permanently empty: required fields nobody
// populates, which is exactly decisions/0027's trap. Quick Scan COMPOSES instead: an identity
// block, and a decision that is NULL when identity is unresolved. Not an empty decision, absent —
// an ambiguous card has no decision to make, because there is no card to price yet.
import { z } from "zod";
import { ConditionSchema, ConfidenceSchema, GameIdSchema, LiquiditySchema } from "./common.js";
import { GradeEVConfidenceSchema, PricingSettingsSchema, RecommendedRouteSchema } from "./recommend.js";

/** Why a route was chosen. A CODE — the shared engine does not own English; each platform renders
 *  its own copy from @curio/copy. */
export const RouteReasonSchema = z.enum([
  "below_bulk_floor",
  "net_below_minimum",
  "grade_worth_reviewing",
  "thin_market",
  "bundle_lot_available",
  "sound_single_listing",
]);

export const AlternativeReasonSchema = z.enum([
  "net_negative_after_costs",
  "bundle_shares_postage",
  "list_ungraded_instead",
  "list_now_accept_slower",
  "list_alone_instead",
]);

/** What was missing when a decision had to be made without complete information. */
export const DegradedReasonSchema = z.enum([
  "no_sale_count",
  "fees_unknown",
  "compatible_count_unknown",
]);

// The route enum is REUSED from /api/recommend rather than minted again. It is the same concept,
// it is already shipped and decoded by clients, and it is a SUPERSET — it carries
// `restoration_review`, which Layer 0's decideRoute does not currently produce.
//
// Declaring a narrower 6-value twin would have guaranteed a future additive change to a shipped
// enum the moment the engine gained that route, and decisions/0027 makes adding an enum value a
// lockstep release until every client decodes forward-compatibly. Reusing the wider enum avoids
// that entirely, at the cost of a value that is currently unreachable — a trade this project has
// now been on the wrong side of twice.

/**
 * An alternative route, carrying a REASON CODE.
 *
 * Deliberately NOT /api/recommend's `RouteAlternativeSchema`, which carries `why: string` — a
 * rendered English sentence. That is the legacy shape: it makes the server the owner of copy for
 * three platforms. This one supersedes it. Two shapes exist during the transition because
 * /api/recommend is shipped and iOS calls it; when its callers move to /api/decide, the English
 * one goes.
 */
export const DecisionAlternativeSchema = z.object({
  route: RecommendedRouteSchema,
  reason: AlternativeReasonSchema,
});

export const DecisionEconomicsSchema = z.object({
  marketValueGbp: z.number(),
  /** What the seller actually pays eBay, with their VAT position applied (ADR 0025). */
  feeGbp: z.number(),
  postageGbp: z.number(),
  packagingGbp: z.number(),
  /** NULL when the seller does not own the card yet — NOT zero. Treating an unbought card as a
   *  free acquisition inflates every net figure on the screen people scan with. */
  costBasisGbp: z.number().nullable(),
  taxProvisionGbp: z.number(),
  expectedNetGbp: z.number(),
});

export const DecisionSchema = z.object({
  route: RecommendedRouteSchema,
  reason: RouteReasonSchema,
  alternatives: z.array(DecisionAlternativeSchema).default([]),
  // ConfidenceSchema is the shared high/medium/low from common.js — reused, not redeclared, so a
  // client gets ONE Confidence type rather than a `Confidence2` minted by the generator's
  // collision suffix. Liquidity is its own named enum for the same reason: an anonymous inline
  // enum generates as `Liquidity2`, which is a poor name to ship to three platforms.
  confidence: ConfidenceSchema,
  liquidity: LiquiditySchema,
  economics: DecisionEconomicsSchema,

  // ── The two money figures, named by their VERB ─────────────────────────────────────────────
  //
  // These point in OPPOSITE directions and are both "the number". A client that confuses them has
  // a money bug in the worst direction — paying the sell floor to acquire, or accepting the buy
  // ceiling to sell — and it reads as entirely plausible either way. The names carry the verb so
  // the direction is unmistakable at the call site rather than in a comment two files away.

  /** ACQUISITION: the most the seller should PAY for this card. */
  maxBuyGbp: z.number(),
  /** DISPOSAL: the least they should ACCEPT to sell it. Consumed by Best Offer's auto-decline
   *  floor, the auction start price (a start price is a free reserve), and the
   *  "this shouldn't be an auction" test against the top realised comp. */
  minAcceptGbp: z.number(),
  /** `maxBuyGbp` as a % of market value, to one decimal place. */
  offerPctAtMax: z.number(),

  /**
   * True when the decision was made without complete information — an offline client with no
   * comps and no fee context. The route is still the best available call; degraded means "trust
   * this less", never "ignore this". Always capped at "low" confidence, so a degraded decision
   * can never present as more certain than a complete one.
   */
  degraded: z.boolean(),
  degradedReasons: z.array(DegradedReasonSchema).default([]),
});
export type Decision = z.infer<typeof DecisionSchema>;

// ── Provenance: a fact about the INPUT, deliberately BESIDE the decision ────────────────────
//
// `Decision` is not a superset of `RecommendResponse`. `priceSource`, `priceConfidence`,
// `currencyNote`, `gradeEV` and `explanation` all live on the latter and none on the former, so a
// client migrating its hero from /api/recommend to /api/decide as instructed would have retired the
// English `why` — the intent — and SILENTLY DROPPED PRICE PROVENANCE AND THE GRADE-EV LINE with it.
//
// The provenance pill is what marks a figure as true-for-a-UK-seller rather than a raw US price.
// Losing it as a side effect of a copy migration is the worst way to lose it, because nobody would
// have been deciding to.
//
// It sits BESIDE `decision` rather than inside it, for the same reason identity does in
// QuickScanResponse: **provenance is a fact about the INPUT, not an output of the engine.** Where
// a price came from is true whether or not a decision was reachable — and folding it in would
// give /api/decide a field the engine does not produce, which is how required-but-unpopulated
// fields get born.
//
// `explanation` is the one that SHOULD retire, and does: it is English, the contract deliberately
// does not own it, and RouteReason + AlternativeReason + @curio/copy replace it.
export const PriceProvenanceSchema = z.object({
  /** The price's own source id, e.g. "ebay-uk-sold", "poketrace-ebay". */
  source: z.string().nullable(),
  /** How much the price itself is trusted — distinct from the DECISION's confidence. */
  confidence: ConfidenceSchema.nullable(),
  /** Set when the figure was converted from another currency, so a UK seller is told. */
  currencyNote: z.string().nullable(),
});
export type PriceProvenance = z.infer<typeof PriceProvenanceSchema>;

/** Whether-to-grade economics. Optional and flag-gated — ADR 0016 parks the real numbers on
 *  Marketplace Insights, so this is present only where a caller has them. */
export const DecisionGradeEVSchema = z.object({
  gradeEVGbp: z.number().nullable(),
  psa10PriceGbp: z.number().nullable(),
  p10: z.number().nullable(),
  p9: z.number().nullable(),
  gradingCostGbp: z.number().nullable(),
  rawNetGbp: z.number().nullable(),
  confidence: GradeEVConfidenceSchema.nullable(),
});
export type DecisionGradeEV = z.infer<typeof DecisionGradeEVSchema>;

// ── POST /api/decide — authenticated ────────────────────────────────────────────────────────
export const DecideRequestSchema = z.object({
  /** The card to decide about, when the seller already owns it. */
  physicalCardId: z.string().optional(),
  /** Market value to decide against. Omitted for an owned card — the server reads its valuation. */
  marketValueGbp: z.number().optional(),
  condition: ConditionSchema.optional(),
  game: GameIdSchema.optional(),
  isVintage: z.boolean().nullable().optional(),
  collectionType: z.enum(["personal", "resale"]).optional(),
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
  targetMarginPct: z.number().optional(),
  /** Explicit settings override; omitted falls back to the account's saved profile. Prefer
   *  `targetMarginPct` above for the common case — see its note on what a client may assert. */
  pricingSettings: PricingSettingsSchema.optional(),
});
export type DecideRequest = z.infer<typeof DecideRequestSchema>;

export const DecideResponseSchema = z.object({
  decision: DecisionSchema,
  /** Where the market value came from. Beside the decision, never inside it — see above. */
  price: PriceProvenanceSchema,
  gradeEV: DecisionGradeEVSchema.optional(),
});
export type DecideResponse = z.infer<typeof DecideResponseSchema>;

// ── POST /api/quick-scan — anonymous ────────────────────────────────────────────────────────
export const QuickScanRequestSchema = z.object({
  name: z.string().optional(),
  setName: z.string().nullable().optional(),
  cardNumber: z.string().nullable().optional(),
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
  setCode: z.string().nullable().optional(),
  /** A narrowing HINT, never a precondition — number+set is decisive for ~99.3% of the catalogue
   *  across all games combined. */
  game: GameIdSchema.optional(),
  condition: ConditionSchema.optional(),
  finish: z.string().nullable().optional(),
  /** As on DecideRequest — a seller preference, not a cost assertion. More useful here, if
   *  anything: an anonymous scanner has no saved profile to default from. */
  targetMarginPct: z.number().optional(),
});
export type QuickScanRequest = z.infer<typeof QuickScanRequestSchema>;

export const QuickScanCandidateSchema = z.object({
  game: GameIdSchema.nullable().optional(),
  nativeId: z.string(),
  name: z.string(),
  setName: z.string().nullable().optional(),
  cardNumber: z.string().nullable().optional(),
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
  image: z.string().nullable().optional(),
});

export const QuickScanResponseSchema = z.object({
  /** Whether the scanned identity resolved to a real catalogue card. */
  identified: z.boolean(),
  /** Cross-game candidates when the identity is ambiguous. Empty otherwise. */
  candidates: z.array(QuickScanCandidateSchema).default([]),
  /** The resolved card, when `identified`. */
  match: QuickScanCandidateSchema.nullable().optional(),
  /**
   * NULL when identity is unresolved — an ambiguous or unrecognised card has no decision to make,
   * because there is no card to price yet. Deliberately absent rather than an empty Decision with
   * zeroed money in it, which a client would render as "£0 max buy" rather than "we don't know
   * what this is".
   */
  decision: DecisionSchema.nullable(),
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
  price: PriceProvenanceSchema.nullable().optional(),
  gradeEV: DecisionGradeEVSchema.optional(),
  decisionUnavailable: z.enum([
    /** Identity did not resolve — nothing to price yet. Expected, not a fault. */
    "identity_unresolved",
    /** Card identified, but no market value is known for it. A real answer about a real card. */
    "no_market_value",
    /** The pricing path itself failed. An OUTAGE — never show this as "no data for this card". */
    "pricing_unavailable",
  ]).nullable().optional(),
  /** Whether a condition assessment fed the decision, or the default was assumed. */
  conditionAssessed: z.boolean().default(false),
});
export type QuickScanResponse = z.infer<typeof QuickScanResponseSchema>;
