# Changelog

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
