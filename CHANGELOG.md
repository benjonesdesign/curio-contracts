# Changelog

## v0.1.20
- New `PricingRule` and `ListingTemplate` shapes — WORK-BACKLOG.md Packet 6 (bulk actions +
  templates/pricing-rule authoring). T3 web (`pokemon-tool`) owns authoring (CRUD); iOS's slice is
  applying a saved rule/template to a card + per-card override, per `decisions/0011` — the shared
  shape is the coordination boundary for that, even though iOS hasn't picked up its slice yet.
  Both use the same "empty scope array = matches everything" convention `pokemon-tool`'s Inventory
  facet-filter system (v0.1.19-era web work, not itself a contract change) already established for
  scoping. Genuinely new — no prior "rule"/"template" contract shape existed to extend.

## v0.1.19
- `catalogue-lookup`/`capture-commit` gain an optional `image` field — a reference image URL for
  the matched catalogue card, mirroring `card-search`'s existing `image` precedent. Confirm's
  approved layout A (curio-shared canon/design/design-reference/confirm-step.html) needs this to
  render the captured⇄matched side-by-side pair; it was missing from the identify-skip fast-path
  (`catalogue-lookup` + `resolvedMatch`-driven `capture-commit`) even though `card-search` already
  carried it. Display-only by design (see curio-shared/decisions/ ADR added alongside this
  release): callers hotlink the URL, never download/cache/re-host/store the artwork. Additive and
  non-breaking — omitting the field keeps today's behaviour exactly as before.

## v0.1.18
- `recommend`/`recommend` (batch) gain an optional `pricingSettings` field (STRATEGIC-ROADMAP.md
  W3 §6.4 "seller preference profile") — the recommendation engine's fee/cost/tax/margin
  assumptions were a dead field on `lib/recommendation.ts`'s own `Inputs` type that no caller had
  ever wired up; the engine's `DEFAULT_SETTINGS` applied unconditionally regardless of what a
  seller had actually configured in Settings → Pricing. New shared `PricingSettingsSchema`
  (mirrors pokemon-tool's `lib/pricing.ts` `PricingSettings` verbatim), registered once and
  reused by both `RecommendRequestSchema` (single-card) and `RecommendBatchRequestSchema` (one
  settings object per batch, not per-card — it's an account-wide preference). Additive and
  non-breaking — omitting the field keeps today's default-settings behavior exactly as before.

## v0.1.17
- `identify`/`capture-commit` gain `imagePaths` (decisions/0018 revision, ROADMAP-COORDINATION.md
  "iOS-W2-H"/COORD 2026-08-19): Supabase Storage object paths, not client-minted URLs. The client
  never mints or signs anything; the server decides how each path is read per consumer — a
  service-role direct read for internal AI processing (identify/condition/slab-OCR), a short-TTL
  signed URL for display, and a longer-TTL/eBay-hosted-copy path for eBay publish. Additive and
  non-breaking — `imageUrls`/`inlineImages` are unchanged and still accepted (now documented as
  legacy, superseded by `imagePaths`); a caller migrates whenever it's ready.

## v0.1.16
- New `signed-photo-url` contract (`POST /api/signed-photo-url`) — curio-shared WORK-BACKLOG.md
  Packet 10 / decisions/0018 (private card-photos storage). Batched request/response: given
  stored `photo_urls` public-URL strings, returns owner-scoped signed URLs (with per-URL error
  handling, not all-or-nothing). Contract-first substrate for making the `card-photos` bucket
  private without a breaking DB-shape change — `photo_urls` keeps storing the same public-URL
  strings it always has; only the *display/distribution* layer switches to request a signed URL
  before use. Web backend + UI land behind `NEXT_PUBLIC_FEATURE_SIGNED_PHOTO_URLS` (off by
  default); iOS lands its consumption in parallel per the packet. The bucket itself is NOT flipped
  private by this contract alone — that's gated on both platforms actually consuming signed URLs
  (see the ADR).

## v0.1.15
- `verification-event`: removed `"corrected"` from `VerificationEventRequestSchema.verdict` — per
  COORD (2026-08-18), a text correction is a separate dimension from the verdict, not a 4th case.
  `verdict` now stays a closed 3-way `confirmed | not_present | unsure` (STRATEGIC-ROADMAP.md §5.8);
  `previousValue`/`correctedValue` already carry the correction independently. No consumer (web or
  iOS) ever sent `"corrected"` as a verdict, so this narrows dead schema surface rather than
  breaking a real caller.

## v0.1.14
- STRATEGIC-ROADMAP.md W2 server-route groundwork (contract-first per decisions/0012) — the three
  CODE-owned routes iOS's tickets A/C/D depend on:
  - `capture-commit` gains an optional `shotQuality: ShotQualityDescriptorSchema[]` field — a
    per-shot device-side signal (sharpness/glare/crop/skew/orientation/exposure + border-centring
    offsets where measurable). Additive; older clients simply omit it.
  - New `verification-event` contract (`VerificationEventRequestSchema`/`ResponseSchema`) for the
    in-flow identity/condition correction signal iOS's ticket C emits (feeds W4/W8).
  - New `inspection-depth` contract (`InspectionDepthHintRequestSchema`/`ResponseSchema`,
    `InspectionDepthTierSchema`) for the fast value/stakes → capture-depth hint iOS's ticket D
    needs. pokemon-tool's implementation is a stub (fixed default tier) — the real value-based
    policy needs a product decision + Ticket 1's unified observation model, deliberately not built
    yet; the contract exists so iOS can integrate the plumbing now.
  All three route implementations are flag-gated scaffolding (accept + persist/stub only, no
  grading/calibration/pricing-policy logic) — see pokemon-tool's `lib/features.ts`.

## v0.1.12
- `capture-commit` gains `game: GameIdSchema` (optional; required alongside `resolvedMatch` —
  enforced in the route handler). `CatalogueLookupMatchSchema` deliberately carries no `game` (it's
  already scoped to one game by the lookup call that produced it), but the server needs to know the
  game to route pricing once its own `/api/identify` vision call is skipped — a real gap found
  implementing the resolvedMatch server behavior, not caught by the shape review alone.

## v0.1.11
- Fix: `gen-swift-api.ts` never listed `catalogue-lookup.ts`'s schemas, so `CatalogueLookupRequest`
  /`CatalogueLookupResponse`/`CatalogueLookupMatch` were missing from `APITypes.swift` entirely —
  present in the TS output and in `v0.1.10`'s tag, but unusable from Swift. `CatalogueLookupMatch`
  is registered before any `emitSwift` call so it comes out as one shared struct, reused by both
  `CatalogueLookupResponse.match` and `CaptureCommitRequest.resolvedMatch` (same schema object).
  No shape changes — TS types are identical to `v0.1.10`.

## v0.1.10
- **Tagged** (was held pending iOS review — iOS approved these two shapes as-is; see v0.1.11 for
  what iOS flagged as still missing). WORK-BACKLOG.md Packet 9, fast identify. `identify` gains
  `inlineImages` (base64 data URLs) as an alternative to `imageUrls`,
  skipping the URL-fetch hop OpenAI otherwise does before inference; `imageUrls` becomes optional
  (either field must be present — enforced by the route handler, not a schema-level refine; a
  top-level `.refine()` breaks the Swift codegen, see `identify.ts`'s inline comment). New
  `catalogue-lookup` contract (`CatalogueLookupRequestSchema`/`CatalogueLookupResponseSchema`) for
  a pure-DB name+collector-number match — meant to answer in milliseconds so an OCR fast-path (iOS
  on-device Vision, or web's typed name+number confirm) can skip the vision LLM call entirely on an
  unambiguous hit. Backed by `pokemon-tool`'s existing `resolveCatalogueMatch()` — no second
  matching implementation. No `candidates` list (the resolver always picks one best row per
  confidence tier, never several) — add one later if a real tie-break need shows up.
- `capture-commit` gains the same `inlineImages` alternative to `imageUrls` (now optional, same
  shape-only/route-validated rule), forwarded straight through to `/api/identify`'s own
  `inlineImages`. Also gains `resolvedMatch: CatalogueLookupMatchSchema` — when the caller already
  resolved the card's identity (iOS's on-device OCR fast-path hitting catalogue-lookup), the server
  skips its own `/api/identify` vision call entirely and commits directly against the match. Added
  after iOS review of the identify/catalogue-lookup shapes above (approved as-is) flagged this as
  the missing piece to actually finish Packet 9 on mobile.

## v0.1.9
- New `reprice` contract: `RepricingFlagSchema`/`RepricingFlagsResponseSchema` for
  `GET /api/reprice-flags` — WORK-BACKLOG.md Packet 5 (Inventory sync + repricing), the T3 web
  dashboard's on-demand read. Per-card shape (`cardId`, `name`, `setName`, `cardNumber`,
  `condition`, `currentPriceGbp`, `marketValueGbp`, `deltaPct`, `direction`) — distinct from the
  daily cron's per-account summary row in the shared `notifications` table (`kind`/`deep_link`,
  unchanged), which stays the push/inbox delivery path. Same underlying comparison
  (`pokemon-tool`'s `lib/reprice.ts`), two consumers.

## v0.1.8
- `recommend` gains whether-to-grade EV fields: `gradeEV`, `psa10PriceGbp`, `p10`, `p9`,
  `gradingCostGbp`, `rawNetGbp`, `gradeEVConfidence` — WORK-BACKLOG.md Packet 7,
  `decisions/0013-graded-price-data.md`. Populated only when `route === "grade_review"`. PSA-10/9
  value comes from the existing graded-asking resolver (Packet 3's `getGradedAskingPrice()`, eBay
  Browse active listings), falling back to the era-multiple/gem-rate estimate
  (`GRADING-RULESET.md`) for thin/no comps — no paid feed. `gradeEVConfidence`
  (`GradeEVConfidenceSchema`: `medium|low`, never `high`) is confidence in the *EV call* — distinct
  from the route `confidence` and the raw-price `priceConfidence` — deliberately capped at
  `medium` (gem rates are era bands, not per-card data) and dropped to `low` whenever either PSA
  leg used the era-multiple fallback instead of a real graded-asking comp.

## v0.1.7
- New `channel-listing` contract: `ChannelListingRequestSchema`/`ChannelListingResponseSchema` for
  `POST /api/channel-listing` — WORK-BACKLOG.md Packet 4 (one second sales channel). A
  channel-agnostic listing request (`channel`, `cardRef`, `priceGbp`, `condition`) → response
  (`channelListingId`, `url`, `status`), so a future second channel reuses this shape instead of
  reshaping it. `channel` is a one-value enum (`"cardtrader"`, Ben's decision 2026-08-04) — adding
  another channel later is a non-breaking extension. T3 web-only (`decisions/0011`); no iOS
  consumer yet, but the contract lives here since it's the coordination boundary for any shared
  shape per `decisions/0012`.

## v0.1.6
- New `cert-lookup` contract: `CertLookupRequestSchema`/`CertLookupResponseSchema` for
  `POST /api/cert-lookup` — WORK-BACKLOG.md Packet 3 (graded-slab listing). A pure lookup against
  the grader's own API (PSA Public API first; `grader` is a one-value enum so CGC can be added
  later as a non-breaking extension), returning the card identity + grade for the seller to
  confirm before saving. No side effects.
- `physical_cards` DB type gains `cert_verified: boolean` — distinct from the existing
  `grading_company`/`grade`/`cert_number` columns (what the seller typed) — this records whether
  it's been confirmed against the grader's API. The production eBay publish path only unblocks
  graded listing for a verified cert.

## v0.1.5
- `recommend`: `RecommendResponseSchema`/`RecommendBatchResultSchema` gain `priceSource`,
  `priceConfidence`, `currencyNote` — the market value's own provenance, distinct from the
  existing `confidence` field (which is the engine's confidence in the *route* decision, not the
  underlying price). Lets the decision-hero UI show a "UK sold" vs. "US/EU reference — confirm"
  label + confidence chip without a second round-trip to `/api/price`. WORK-BACKLOG.md Packet 1
  (UK-realised pricing).

## v0.1.4
- `recommend`: added a batch mode (`RecommendBatchRequestSchema`/`RecommendBatchResponseSchema`,
  keyed by caller-assigned `id` rather than a `physicalCardId`) so pre-save cards — the
  `pokemon-tool` add/multiple review step, before a listing has been written to `physical_cards` —
  can get a real, server-computed recommendation (correct `sellerType`/`compatibleCount`/
  `isVintage`) instead of the client recomputing `computeRecommendation` locally with those fields
  omitted, which silently defaulted every caller to `sellerType: "private"` (£0 eBay fees) even for
  business-seller accounts. `RouteEconomicsSchema`/`RouteAlternativeSchema` promoted from
  module-private to exported so the batch result schema can reuse them without duplicating shape.
  Per `decisions/0012-cross-platform-delivery-model.md` — one source of the number.

## v0.1.3
- `PriceRequestSchema.tcgBaseline`'s two fields (`tcp_market_usd`, `cm_trend_eur`) made optional
  as well as nullable — a caller legitimately sends only one of the two (e.g. `{ tcp_market_usd:
  10 }` with no `cm_trend_eur` key at all). Caught by pokemon-tool's existing
  `lib/__tests__/api-price.test.ts`.

## v0.1.2
- `PriceResponseSchema`: made `comps` optional (a cached row's select can legitimately omit it)
  and added `fetched_at` (present on the stale-cache-fallback path). Caught by pokemon-tool's
  existing `lib/__tests__/api-price.test.ts` fixtures failing against v0.1.1.

## v0.1.1
- `PriceRequestSchema`/`PriceResponseSchema` fix: added the request's `noCache` field and the
  response's `cached`/`stale`/`error` fields, and made `confidence`/`price_warning` optional —
  caught while wiring pokemon-tool's `/api/price` at the route boundary (its cache-hit and
  stale-cache-fallback paths return a narrower shape than the fully-computed path; v0.1.0 didn't
  model that and would have silently stripped the `cached`/`stale` flags on `.parse()`).

## v0.1.0
- Initial release. DB types (`src/db/database.types.ts`, curated to the shared subset —
  `physical_cards`, `catalogue_cards`, `catalogue_sets`, `valuation_snapshots`, `profiles`,
  `scan_items`, `condition_assessments`, `audit_events`) generated from the live Supabase schema
  (project `gldoykgslhhpuhjudyxl`).
- API contracts (`src/api/*.ts`, Zod) for the highest-traffic shared routes: `identify`,
  `capture-commit`, `recommend`, `card-search`, `price`.
- Generated Swift (`Sources/CurioContracts/{DBTypes,APITypes}.swift`) derived from the same TS/Zod
  source in one build step (`npm run build`) — cannot diverge from the TS by construction.
- Drift guard (`npm run check`) verified to actually catch a stale commit, not just pass trivially.
- 21 passing tests (schema round-trips + the Swift-generation walker's dedup/sanitisation rules).
