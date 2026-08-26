# @curio/contracts

The single source for Curio's shared **API and DB contracts** — generated TS types (web), a
generated SwiftPM library (iOS), and a generated Kotlin library (Android), compiled from one
Zod/schema source. One version, three platforms, nothing hand-copied. This is the `@curio/tokens`
pattern (see that repo), generalised to Layer 2 of
`curio-shared/decisions/0001-shared-source-of-truth.md`: contracts, not just design tokens.

Independent semver from `curio-shared` — this repo bumps on every schema/API change, `curio-shared`
only on canon/decision changes.

## What this produces

| Output | Consumer | Source |
|---|---|---|
| `dist/*.js` + `dist/*.d.ts` | pokemon-tool (web) | `src/**/*.ts` compiled directly by `tsc` |
| `Sources/CurioContracts/DBTypes.swift` | curio-capture-ios | generated FROM `src/db/database.types.ts` |
| `Sources/CurioContracts/APITypes.swift` | curio-capture-ios | generated FROM the Zod schemas in `src/api/*.ts` |
| `src/main/kotlin/com/curio/contracts/DBTypes.kt` | Android | generated FROM `src/db/database.types.ts` |
| `src/main/kotlin/com/curio/contracts/APITypes.kt` | Android | generated FROM the Zod schemas in `src/api/*.ts` |

All generated files are **derived from the TS**, not independently authored — there is one schema
snapshot and one set of Zod definitions; Swift and Kotlin are both build outputs of it, so none of
the three can diverge by construction. All outputs are committed to this repo at each tagged
release, same as `curio-tokens` commits `dist/curio-brand.css` and
`Sources/CurioTokens/CurioTokens.swift`.

The Swift and Kotlin generators (`scripts/zod-to-swift.ts` / `scripts/zod-to-kotlin.ts`,
`scripts/gen-swift-{db,api}.ts` / `scripts/gen-kotlin-{db,api}.ts`) are deliberate structural
mirrors of each other — same node coverage, same emit order, same `registerName()` calls — kept in
lockstep by inspection (diff the two `gen-*-api.ts` files) rather than a shared abstraction neither
language actually needs.

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

**Android (Gradle, via JitPack):** JitPack builds straight from a GitHub tag with no separate
publish step — the same "pin the tag, nothing hand-copied" posture as web's `github:` dependency
and iOS's SwiftPM pin, just via a different distribution mechanism (Maven Central publishing would
need credentials and a `NEEDS-BEN.md` item; JitPack needs neither).

```kotlin
// settings.gradle.kts
dependencyResolutionManagement {
    repositories {
        maven { url = uri("https://jitpack.io") }
    }
}
```
```kotlin
// app/build.gradle.kts
dependencies {
    implementation("com.github.benjonesdesign:curio-contracts:v0.1.24")
}
```
```kotlin
import com.curio.contracts.IdentifyRequest
import com.curio.contracts.IdentifyResponse
import kotlinx.serialization.json.Json

val json = Json { ignoreUnknownKeys = true }
val request = IdentifyRequest(imageUrls = urls, taxonomyAspects = null, imageHash = null, game = null, games = null)
// Decode a response the same way any kotlinx.serialization type decodes today:
val result = json.decodeFromString<IdentifyResponse>(responseBody)
```
First build of a new tag on JitPack takes a minute or two (it's compiling, not just downloading) —
check https://jitpack.io/#benjonesdesign/curio-contracts/vX.Y.Z for build status if a Gradle sync
hangs on a freshly-cut tag.

## Releasing a new version

1. **DB types changed?** Run `npm run gen:db` (wraps `supabase gen types typescript --project-id
   gldoykgslhhpuhjudyxl`, then curates it to the shared-table subset above). Per
   `ENGINEERING-STANDARDS.md §1` (pokemon-tool): a schema migration isn't "done" until this step
   has run and the version below is bumped.
2. **API contract changed?** Edit the Zod schema(s) in `src/api/*.ts`.
3. `npm run build` — compiles `src/` to `dist/` (TS) and regenerates
   `Sources/CurioContracts/{DBTypes,APITypes}.swift` AND
   `src/main/kotlin/com/curio/contracts/{DBTypes,APITypes}.kt` from the same source. Committed
   output, not build-time-only — consumers get real Swift Codable structs / Kotlin
   kotlinx.serialization data classes, not a `.d.ts`-to-X bridge.
4. `npm run check` — the drift guard: fails if either committed generated tree
   (`Sources/CurioContracts/*.swift` or `src/main/kotlin/com/curio/contracts/*.kt`) is stale vs a
   fresh build (mirrors `curio-tokens`' own `check`).
5. `npm test` — schema round-trip tests (`src/**/*.test.ts`, `scripts/*.test.ts`). Optionally also
   `./gradlew test` — `src/test/kotlin/.../RoundTripTest.kt` exercises the generated Kotlin's
   actual decode/encode behaviour, not just the generator's string output.
6. Bump `version` in `package.json`, update `CHANGELOG.md`, commit, tag (`git tag vX.Y.Z`), push
   with tags.
7. Bump the pinned tag in each consumer: pokemon-tool's `package.json`, curio-capture-ios's
   `project.yml` / Xcode package version, the Android app's `build.gradle.kts` dependency version.
   JitPack builds the Android artifact lazily on first request for a tag (see "Android" above) —
   no push-side publish step to remember.

## Adding a new API contract

Add `src/api/<route>.ts` exporting `<Route>RequestSchema` / `<Route>ResponseSchema` (Zod), each
nested object type as its own named export (so the Swift/Kotlin generators can name and reuse it —
see `scripts/zod-to-swift.ts`/`scripts/zod-to-kotlin.ts`'s doc comments). Re-export from
`src/index.ts`. Register the new schemas in **both** `scripts/gen-swift-api.ts` (`registerName` for
any reused nested type, then `emitSwift(...)` for each top-level request/response) **and**
`scripts/gen-kotlin-api.ts` (the identical calls, `emitKotlin` instead of `emitSwift`) — the two
files are kept in exact lockstep on purpose, so `diff`-ing them is the fastest way to confirm
nothing was forgotten for one platform. Run `npm run build` and commit the result.

## Governance

One owner for `src/db/database.types.ts` and `src/api/*.ts`. Changes land via PR here first, then
a version bump propagates to the three consumers — never edit the generated `dist/`/
`Sources/CurioContracts/*.swift`/`src/main/kotlin/com/curio/contracts/*.kt` files by hand, and
never re-implement a DB row shape or an API request/response shape locally in a consumer repo. If
a shape is wrong or missing, fix it here and bump the version — that's what `contracts:check` (in
each consumer's CI) exists to catch if skipped.
