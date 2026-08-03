# Changelog

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
