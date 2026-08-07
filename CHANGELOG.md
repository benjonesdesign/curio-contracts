# Changelog

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
