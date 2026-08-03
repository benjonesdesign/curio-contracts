# @curio/contracts

The single source for Curio's shared **API and DB contracts** — generated TS types (web) and a
generated SwiftPM library (iOS), compiled from one Zod/schema source. One version, two
platforms, nothing hand-copied. This is the `@curio/tokens` pattern (see that repo), generalised
to Layer 2 of `curio-shared/decisions/0001-shared-source-of-truth.md`: contracts, not just design
tokens.

Independent semver from `curio-shared` — this repo bumps on every schema/API change, `curio-shared`
only on canon/decision changes.

## What this produces

| Output | Consumer | Source |
|---|---|---|
| `dist/*.js` + `dist/*.d.ts` | pokemon-tool (web) | `src/**/*.ts` compiled directly by `tsc` |
| `Sources/CurioContracts/DBTypes.swift` | curio-capture-ios | generated FROM `src/db/database.types.ts` |
| `Sources/CurioContracts/APITypes.swift` | curio-capture-ios | generated FROM the Zod schemas in `src/api/*.ts` |

Both Swift files are **derived from the TS**, not independently authored — there is one schema
snapshot and one set of Zod definitions; Swift is a build output of them, so TS and Swift cannot
diverge by construction. All three outputs are committed to this repo at each tagged release,
same as `curio-tokens` commits `dist/curio-brand.css` and `Sources/CurioTokens/CurioTokens.swift`.

## Scope

- **DB types** (`src/db/database.types.ts`): the shared subset of the Supabase schema both apps
  touch — `physical_cards`, `catalogue_cards`, `catalogue_sets`, `valuation_snapshots`,
  `profiles`, `scan_items`, `condition_assessments`, `audit_events`. Not a mirror of the full app
  schema — tables that stay pokemon-tool-local (acquisitions, sales, purchases, etc.) aren't here.
- **API contracts** (`src/api/*.ts`): request/response Zod schemas for the highest-traffic
  shared routes — `identify`, `capture-commit`, `recommend`, `card-search` (the route iOS's
  hand-mirrored `CardSearchResult` decoder duplicated), `price`. Expand this list as more routes
  need a shared contract — see "Adding a new API contract" below.

## Consuming this package

**Web (npm, git-URL dependency):**
```json
"dependencies": {
  "@curio/contracts": "github:benjonesdesign/curio-contracts#v0.1.0"
}
```
```ts
import { IdentifyRequestSchema, IdentifyResponseSchema, type PhysicalCardsRow } from "@curio/contracts";

// Validate at the route boundary — the running API can't silently drift from the published
// contract without a test/build failure surfacing it first.
const body = IdentifyRequestSchema.parse(await req.json());
// ...
return NextResponse.json(IdentifyResponseSchema.parse(result));
```

**iOS (SwiftPM):** add this repo as a package dependency pinned to an exact version (e.g. `0.1.0`)
in `project.yml` / Xcode, then:
```swift
import CurioContracts

let req = IdentifyRequest(imageUrls: urls, taxonomyAspects: nil, imageHash: nil, game: nil, games: nil)
// Decode a response the same way any Codable type decodes today:
let result = try JSONDecoder().decode(IdentifyResponse.self, from: data)
```
Delete the hand-mirrored decoder for any type this package now covers (e.g. `CardSearchResult` in
`SupabaseService.swift` → `CardSearchResult`/`CardSearchResponse` here).

## Releasing a new version

1. **DB types changed?** Run `npm run gen:db` (wraps `supabase gen types typescript --project-id
   gldoykgslhhpuhjudyxl`, then curates it to the shared-table subset above). Per
   `ENGINEERING-STANDARDS.md §1` (pokemon-tool): a schema migration isn't "done" until this step
   has run and the version below is bumped.
2. **API contract changed?** Edit the Zod schema(s) in `src/api/*.ts`.
3. `npm run build` — compiles `src/` to `dist/` (TS) and regenerates
   `Sources/CurioContracts/{DBTypes,APITypes}.swift` from the same source. Committed output, not
   build-time-only — consumers get real Swift Codable structs, not a `.d.ts`-to-Swift bridge.
4. `npm run check` — the drift guard: fails if the committed `Sources/CurioContracts/*.swift` is
   stale vs a fresh build (mirrors `curio-tokens`' own `check`).
5. `npm test` — schema round-trip tests (`src/**/*.test.ts`).
6. Bump `version` in `package.json`, update `CHANGELOG.md`, commit, tag (`git tag vX.Y.Z`), push
   with tags.
7. Bump the pinned tag in each consumer: pokemon-tool's `package.json`, curio-capture-ios's
   `project.yml` / Xcode package version.

## Adding a new API contract

Add `src/api/<route>.ts` exporting `<Route>RequestSchema` / `<Route>ResponseSchema` (Zod), each
nested object type as its own named export (so the Swift generator can name and reuse it —
see `scripts/zod-to-swift.ts`'s doc comment). Re-export from `src/index.ts`. Register the new
schemas in `scripts/gen-swift-api.ts` (`registerName` for any reused nested type, then
`emitSwift(...)` for each top-level request/response). Run `npm run build` and commit the result.

## Governance

One owner for `src/db/database.types.ts` and `src/api/*.ts`. Changes land via PR here first, then
a version bump propagates to the two consumers — never edit the generated `dist/`/
`Sources/CurioContracts/*.swift` files by hand, and never re-implement a DB row shape or an API
request/response shape locally in a consumer repo. If a shape is wrong or missing, fix it here and
bump the version — that's what `contracts:check` (in each consumer's CI) exists to catch if
skipped.
