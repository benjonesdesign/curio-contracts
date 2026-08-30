# Changelog

## v0.1.40 — one DecisionUnavailable, and /api/card-value gets a contract

**Fixes a build break in v0.1.39.** The enum was hand-declared inline in both
`QuickScanResponseSchema` and `DecideBatchResultSchema`. The emitters cannot know two structurally
identical inline enums are the same type, so Kotlin got `DecisionUnavailable` **and**
`DecisionUnavailable2`, `QuickScanResponse.getDecisionUnavailable()` returned the `2` variant, and
Android's code written against the plain name stopped compiling. Now declared once in `common.ts`
and `registerName()`d, exactly as `Liquidity` was.

**The second time, so this release adds the rule and not just the fix.** v0.1.29 fixed
`Liquidity`/`Liquidity2` the same way and stopped there; because only the instance was fixed,
the next inline declaration recreated it. `src/generated-names.test.ts` now fails on ANY generated
type name ending in a digit — a digit means the emitter invented a name because two schemas
collided, and which one gets the bare name depends on emit order, so an unrelated field can swap
them silently.

That guard found **14 more**, carried as an explicit debt list. They are two different defects:
*true duplicates* (`CollectionType2..5` are all `["personal","resale"]` — hoist them) and *name
collisions* (`Source` is vision/seller, `Source2` is stripe/apple, `Source3` is
ios_capture/web_add_flow/other — **rename, never merge**).

**`/api/card-value` gets a contract module** — the fifth uncovered route, and the carrier of a
safety disclosure:

- `EditionAmbiguitySchema` + `CardValueResponse.editionAmbiguity` — what a price cannot
  distinguish. `catalogue_cards` has no edition column, no provider is ever asked, and the price
  cache key means a 1st Edition and an Unlimited **share a cache entry**.
- **`QuickScanResponse.editionAmbiguity`**, forwarded. It was computed in `/api/card-value` and
  dropped by quick-scan's own local interface, so iOS could render the warning and Android
  structurally could not — a T1 parity gap on the disclosure that tells a seller their Base
  Charizard may be worth thousands more than we are saying.

## v0.1.39 — a printing is one card in one SET at one number

Search grouped on `game::name`, dropping set and number, so every Charizard in every set collapsed
into one row and the app reported **"Charizard GX — 24 printings"** for 24 different cards at
different prices.

- `CardSearchRequest.setName` — the set filter. The set is the differentiator: the seller is
  holding the card and can read the set off it, so they already know the answer and only need to
  find the row.
- `CardSearchResponse.setsPresent` — the filter's options, so the control can be offered without a
  second round trip. A seller cannot pick from a list they cannot see.
- `printingCount` / `printings` documented against canon: **a printing is one card in one set at one
  number, and holo/reverse-holo are FINISHES on that row.** That differs from TCGplayer's product
  grouping, which splits each finish into its own product — the route's own comment had been citing
  TCGplayer to justify a collapse this project deliberately does not use.

`printingCount` is almost always 1 now, and that is correct rather than a regression: the axis that
would legitimately produce several printings is finish, and `catalogue_cards.finishes` is empty on
every Pokémon row.

## v0.1.38 — the `*Rate` / `*Pct` unit convention, enforced

`*Rate` is a fraction (0–1), `*Pct` is a percentage (0–100). The suffix is the unit. Both appear in
the same request bodies, and confusing them is a money bug in the dangerous direction: a client
sending `0.25` for `targetMarginPct` meaning 25% asked for **0.25%**, which collapses the target,
RAISES max-buy, and tells a seller to overpay.

- `targetMarginPct` is bounded 0–1000 and rejects anything in `(0, 1)` — that range is a rate sent
  by mistake. `0` stays legal; "accept any profit at all" is a real position for a liquidation.
- **`minProfitPct` violates the convention** — it holds a RATE (0.25 = 25%), which is why the app
  multiplies it by 100 when deriving `targetMarginPct` from it. The two sit in the same money model
  with opposite units and the same suffix, which is the real hazard. It keeps its name because it
  is on the wire to three platforms and a rename is a breaking decode; it is BOUNDED to 0–1
  instead, so sending `25` is a loud 400 rather than a silent 2,500% target.

**Generator fix, needed to land the above:** both the Swift and Kotlin emitters threw on
`ZodEffects`, so the contract could not use `.refine()` **at all** — the first attempt at this
constraint failed the build. Refinements are server-side validation and don't change the decoded
type, so both now unwrap to the inner schema. A validation vocabulary the generator silently
forbids is one nobody reaches for, and what it forbade here was precisely the unit checks on money
fields.

## v0.1.37 — card search can finally say it failed

**Tagged immediately rather than accumulated, during a live P0.** pokemontcg.io has been 500ing for
hours; every provider call resolved to `[]` behind a 5s timeout; `/api/card-search` returned **200
with an empty list**; and a seller standing in a shop was told Pikachu is not a card.

`CardSearchResponseSchema.cataloguesUnavailable` — the game ids we could not reach. Empty means
every catalogue answered, so `results: []` alongside it is a genuine no-match. Non-empty means the
answer is incomplete and MUST NOT be phrased as "no cards found".

This is the **second** instance of one field meaning two things: `/api/quick-scan` returned
`value: { typical: null }` for both "no comps" and "the pricing service is down", which hid an
`INTERNAL_SERVICE_KEY` outage for a fortnight. Two is a pattern — a nullable or empty field that
can mean both "nothing" and "we could not look" is now a defect on sight.

Additive with a `.default([])`, so an older client decodes unchanged.

## v0.1.36
- **`/api/reprice-apply` gets a contract module.** `reprice.ts` covered only the *flags* shape;
  apply's request and response were local types in the route. Permitted by the CLAUDE.md rule, and
  the wrong call for a route that **writes prices to live marketplace listings** and is consumed by
  three platforms.

  ⚠️ The comment that matters, preserved in the module: **the route writes
  `physical_cards.suggested_price` itself, and only when a channel succeeds. No client may also
  write it.** A client that optimistically updated the DB would silently diverge our record from the
  listing the moment a channel call failed — an unlisted card, an expired token, a rejected price —
  which is *exactly* the divergence this feature exists to close. Per-channel outcomes are reported
  so a client can render what happened; they are not an invitation to reconcile the record.

- **`environment` on the apply request**, so the call can be proven in **sandbox** before it is
  trusted against a real listing.

  `lib/channels/ebay.ts` hardcoded `"ebay_production"` while `/api/ebay-draft` — a route that exists
  precisely so publishing can be tested without touching real listings — has always used the
  sandbox. So the **one untested money-writing call in the system was the one call that could not be
  exercised anywhere but production.** Exactly inverted.

  Sandbox is necessary and **not sufficient**: eBay's sandbox diverges from production on policies
  and fees, so a production check is still required. It should be the second test, not the first.

**Tagged rather than accumulated**, against the cadence rule added in the README this morning,
because the alternative is a published contract its own server does not validate against — which is
the precise defect just fixed on `/api/quick-scan`, the only route with a request contract that
didn't check itself against it. The rule's purpose is to stop tagging shapes nobody consumes; this
one has a consumer the moment it exists.


## v0.1.35
- **`expectedNetGbp` on `DecisionAlternative`.** An alternative without its number is a *label*, not
  a choice — "Bundle" against "List individually" tells a seller nothing, while "Bundle" against
  "List individually (nets ~£8.10)" is a comparison they can actually make. **The figure is the
  comparison**, so losing it was a regression in decision quality rather than in polish.

  Null where the net genuinely cannot be computed for that route rather than where it merely was
  not: a bundle's or bulk lot's proceeds depend on the whole lot, so quoting *this card's* net
  beside "Bundle" would be a number answering a different question.

- **`assumptions` — the successor to `/api/recommend`'s English `assumptions: string[]`.**

  iOS deleted its assumptions surface during the hero migration and deliberately did **not** backfill
  it from `degradedReasons`. That was right: *"what was missing"* and *"what was assumed"* are
  different claims, and a decision can be entirely un-degraded and still rest on assumptions the
  seller never stated.

  **The shape is decided now, ahead of the channel work, so it isn't a second bump.** W21 decision
  7.1 requires the assumed default channel to be **labelled as an assumption and never presented as
  a choice the seller made** — which needs exactly this surface. `channel` is already in the code
  list; the engine populates it when channel reaches `SellerCostModel` (W21 step 1). Everything else
  is populatable today.

  Codes carry a **raw token** (`"ebay"`, `"private"`, `"NM"`) and never a rendered sentence — the
  label comes from `@curio/copy`, so the server doesn't become the owner of English for three
  platforms. Monetary assumptions carry `valueGbp` so each client formats in its own locale.

  **Only genuinely assumed things appear.** A value the seller chose, or that came from their profile
  or their eBay policy, is not an assumption and must not be listed as one — that distinction is the
  entire point.


## v0.1.34
- **`/api/decide` gains a BATCH mode** — the named retirement condition for `/api/recommend`.

  v0.1.33 marked `RouteEconomics` superseded and said `/api/recommend` retires *once its callers can
  move*. The one thing stopping them was that `app/add/multiple/ReviewListStep.tsx` prices a whole
  capture at once, and `/api/decide` was single-card. So the legacy shape kept two live web callers
  and could not be deleted. That blocker is now gone.

  One request, one settings object, N cards — the same reasoning as `RecommendBatchRequest`: the
  seller's cost model is an **account-wide** preference and does not vary card-to-card within one
  review session. Per-card values are per-card; the fee position is not.

  A card with no market value returns a **null decision with a reason**, exactly as Quick Scan does.
  One unpriceable card does not fail the batch, and the caller is told which of "no value" and
  "pricing unavailable" it was.


## v0.1.33
- **`rarity` and `confidence` on `QuickScanCandidate`** — the two fields the card-search collapse
  traded away.

  `identified` is a boolean, and a boolean cannot express *"resolved, but hold it at arm's length"*.
  iOS had an `.uncertain` state for exactly that and deleted it rather than leave an unreachable
  branch — the right call, and a real capability loss. A medium-confidence name-trigram match and an
  exact number+set hit are not the same claim, and the UI should be able to say so.

  ⚠️ **It must not be re-derived client-side.** It comes from the resolver tier that produced the
  match; a client inferring it from name similarity or field completeness would be inventing a
  second, disagreeing confidence model — the shape of every drift incident in this project's
  history.

- **`RouteEconomics` is marked SUPERSEDED, with the field mapping written into the contract.**

  It and `DecisionEconomics` describe the same money with different names and a different case
  convention (`fees_gbp` vs `feeGbp`, `expected_sale_gbp` vs `marketValueGbp`). A client mapping
  between two near-identical money shapes is exactly where a transposition bug hides, so the mapping
  now lives in one place instead of being re-derived per client.

  **Decided rather than deferred**, because two shapes for one concept must not persist by default:
  `/api/recommend` retires. Not renamed in place — it is shipped with two web callers and five on
  iOS, and renaming a retiring shape breaks seven call sites to reach the same end state.

  **The retirement condition is named** so this is a decision and not a hope: `/api/decide` needs a
  **batch mode** (`ReviewListStep` prices a whole capture at once). Build that, migrate the callers,
  delete it. `explanation` goes with it.


## v0.1.32
Two additions, both from the iOS lane blocking on a migration rather than working around it.

- **`price` (provenance) and optional `gradeEV`, BESIDE `decision`** on `DecideResponse` and
  `QuickScanResponse`.

  `Decision` is **not** a superset of `RecommendResponse`: `priceSource`, `priceConfidence`,
  `currencyNote`, `gradeEV` and `explanation` all live on the latter and none on the former. A
  client moving its hero from `/api/recommend` to `/api/decide` as instructed would have retired the
  English `why` — the intent — and **silently dropped price provenance and the grade-EV line with
  it.** The provenance pill is what marks a figure as true-for-a-UK-seller rather than a raw US
  price; losing it as a side effect of a copy migration is the worst way to lose it, because nobody
  would have been deciding to.

  It sits **beside** `decision`, not inside, for the same reason identity does in
  `QuickScanResponse`: **provenance is a fact about the INPUT, not an output of the engine.** Where
  a price came from is true whether or not a decision was reachable — and there is a test asserting
  provenance survives a null decision.

  `explanation` is the one that SHOULD retire, and does: it is English, the contract deliberately
  does not own it, and `RouteReason` + `AlternativeReason` + `@curio/copy` replace it.

- **`setCode` on `QuickScanRequestSchema`**, mirroring `CatalogueLookupRequestSchema`.

  Optional in type, not in effect: it is W15 Tier 0's **strongest set signal**, tried ahead of the
  name-first resolver. Without it, a client collapsing its card-search call into this one would
  throw the OCR'd set code away and resolve on a bare number — **the cross-game-collision case that
  produced the "Windsinger" match.** That trades identification accuracy for a rate-limit saving,
  and for a first-time anonymous user a wrong card is worse than a second request. With it, the
  collapse is safe *and* the bucket saving lands.


## v0.1.31
- **`decisionUnavailable` on `QuickScanResponse`** — why there is no decision, present exactly when
  `decision` is null.

  `decision: null` alone conflated three states that need different handling: identity didn't
  resolve, the card is known but has no price, or **the pricing path is down**. The first two are
  normal results; the third is an outage. A single null can't tell a client which to render, and
  can't tell us which is happening in production.

  That is not hypothetical, and the timing is the point: this is the exact defect
  `decisions/0024` records — *"a field that conflates 'no data for this input' with 'this subsystem
  is unavailable' will hide an outage indefinitely"* — reintroduced **one commit after** writing
  it down. An anonymous scan returned `decision: null` for every card tried in production, and
  diagnosing it required guessing rather than reading.


## v0.1.30
Two additive fields, both requested by the iOS lane, both unblocking a screen.

- **`targetMarginPct` (optional scalar) on `DecideRequest` and `QuickScanRequest`.** iOS dropped
  its 20/30/40% target-return picker because the only way to carry a margin was `pricingSettings`,
  which requires all eight fields — so the client would have been asserting a fee position it does
  not own. **That refusal was correct**, and it is the bug this whole sequence started with.

  The line this draws, worth stating once: **a client may send what the seller WANTS, never what
  the world COSTS.** Fees, tax and postage are facts the server owns. Target margin is a seller
  preference, and a legitimately per-moment one — 20% on a fast-moving card, 40% on a slow one,
  decided standing in a shop. Absent, it falls back to the saved profile value.

  Also on `QuickScanRequest`, where it is arguably more useful: an anonymous scanner has no saved
  profile to default from.

- **`image` on `QuickScanCandidate`.** `CatalogueLookupMatch` has carried one since v0.1.19; this
  was simply omitted, because quick-scan predates the rule-13 amendment that makes the thumbnail
  the picker's differentiator.

  Its absence forced a **second card-search round trip** purely to fetch images the server already
  holds — and anonymous scanning is already two calls through one shared 60/5min bucket, so a third
  cuts a brand-new user from ~30 scans per five minutes to ~20. That is the wedge's rate limit
  getting worse for exactly the audience it exists to convert.

  ⚠️ **Until a server populates it, collapsing those two calls into one silently loses the images.**
  Display-only, hotlinked at render time per `decisions/0022`.


## v0.1.29
- **New: `decide` — one decision shape, two entry points.** `POST /api/decide` (authenticated) and
  `POST /api/quick-scan` (anonymous) differ in auth and rate-limit bucket and in **nothing else**.
  Written as a single module deliberately: both answer "what should I do with this card, and what
  may I pay for it?", and building them separately mints two shapes for one concept.

  **`Decision` carries NO identity.** If it did, `/api/decide` — which receives an
  already-identified card — would return `identified`/`candidates` permanently empty: required
  fields nobody populates, which is exactly v0.1.28's own lesson. Quick Scan **composes** instead:
  an identity block, and a `decision` that is **null** when identity is unresolved. Not an empty
  Decision — absent. An ambiguous card has no decision to make, because there is no card to price.

  **The two money figures are named by their verb**: `maxBuyGbp` (the most to PAY) and
  `minAcceptGbp` (the least to ACCEPT). They point in opposite directions and are both "the
  number"; a client confusing them has a money bug in the worst direction that reads as entirely
  plausible. Nothing is called `maxBuy` and `walkAway` side by side and left to a comment.

- **Reuses rather than mints.** `RecommendedRoute` is reused from `/api/recommend` — same concept,
  already shipped and decoded, and a *superset* (it carries `restoration_review`, which the engine
  does not yet produce). A narrower twin would have guaranteed a future additive change to a
  shipped enum, which v0.1.28 makes a lockstep release. `ConfidenceSchema` is reused from
  `common`.

- **One `Liquidity`.** It was declared inline in `/api/recommend` and again in `decide`, which
  generated `Liquidity` **and** `Liquidity2` on every client for the same three values. Now a
  single `LiquiditySchema` in `common`, used by both.

- `DecisionAlternative` carries a reason **code**, not `/api/recommend`'s `why: string`. The
  English one makes the server the owner of copy for three platforms; this supersedes it. Both
  exist during the transition because `/api/recommend` is shipped and iOS calls it.


## v0.1.28
- **Generated enums decode forward-compatibly (`curio-shared/decisions/0027`).** A plain Swift
  `Codable` enum and a plain Kotlin `enum class` both THROW on an unrecognised raw value, and the
  throw propagates to the **enclosing object** — so one unknown value anywhere in a response fails
  the entire decode. A ninth `GameId` would have broken every pinned client's catalogue lookup, and
  ADR 0004 already queues new games.

  Kotlin enums are now a `sealed interface` + hand-rolled `KSerializer`: known values decode to
  their own object, an unrecognised one decodes to `Unknown(rawValue)`, and `rawValue` is present
  on every case so a value this build doesn't recognise **round-trips back unchanged** rather than
  being silently dropped (0027 item 2a). Emitted mechanically from `(name, values)`.

  ⚠️ **Shape change for Kotlin consumers.** `Game.POKEMON` etc. are now objects on a sealed
  interface rather than enum constants. `.rawValue` reads and equality comparisons are unaffected;
  an exhaustive `when` gains an `Unknown` branch. Swift generation is unchanged in this release and
  remains to do.

  The surface is larger than `GameId`: **52 enum-typed fields across 14 API modules**, all
  decode-breaking, none protected by nullability. `game: Game?` handles ABSENT and does nothing for
  UNRECOGNISED — they are different failures and only the first was handled.

- **A Zod `.default()` now emits as a client default, not a required field.** `.default([])` is a
  SERVER-PARSE behaviour: it tells the server's own parser what to substitute when it sees no key,
  and never crosses the wire. Emitting it as required made an absent key a decode failure that took
  the whole response down.

  Two deployment couplings that created, neither previously written down: a client build consuming
  the field **required** the server deployment that emits it, and a server **rollback** past that
  deployment would break every deployed client — which App Store latency makes impossible to fix in
  step. A required field is a rollback-safety defect, not merely a robustness one.

  Audited rather than assumed: there is **exactly one** `.default()` in the whole contract surface
  (`catalogue-lookup`'s `candidates`). Fixed at the generator anyway, so the next one is safe by
  construction. `IdentifyAmbiguousResponse.candidates` has no default and stays **required** — a
  blanket default would paper over real server bugs, and a test asserts that didn't happen.

  Implementation asymmetry worth knowing: a property default suffices in Kotlin (`kotlinx` uses it
  on an absent key). It does **not** in Swift — the synthesised `init(from:)` ignores property
  defaults, calls `decode()`, and throws `keyNotFound` — so a struct with a defaulted field now
  gets a real `init(from:)` using `decodeIfPresent ?? default`.

- **This repo has CI for the first time.** `decisions/0026` asserted that `RoundTripTest.kt` "runs
  in that repo's CI today" and used it as evidence the Kotlin conformance suite was enforceable.
  The test file was real; there was no workflow at all. `.github/workflows/ci.yml` now runs the TS
  tests, the drift guard, and `./gradlew test` on a pinned JDK 21. It caught a real error in the new
  fixtures on its first run.

  The unknown-value fixtures decode through the **containing response type**, never the bare enum:
  the failure being guarded is a throw *propagating* to the enclosing object, and a bare-enum
  fixture would pass while the real path breaks.


## v0.1.27
- **The drift guard now covers `dist/` — the artifact npm consumers actually import.** It
  previously checked only the generated Swift and Kotlin, on the reasoning that `dist/` "is just
  tsc output of `src/` and can't hand-drift". That was wrong in the one way that matters: nothing
  forces `npm run build` to have been *run*. Edit a schema in `src/`, commit without building, and
  `dist/` is stale — while Swift and Kotlin drift *would* have been caught. Since `main` is
  `./dist/index.js`, that ships the OLD schema to every TypeScript consumer under a version number
  claiming the new one, and every existing check passes: `contracts-check` verifies the installed
  commit matches the pin, `versions-check` verifies the pin matches `versions.json`, and **neither
  verifies that a tag CONTAINS what it claims**.
  Verified by simulation, not assumption: a doc-comment-only edit to `src/` drifts `dist/.d.ts`
  and `.js` while leaving Swift and Kotlin byte-identical — precisely the case the old guard waved
  through.
- **Release-integrity assertions.** When HEAD is tagged, the guard now also fails if
  `package.json`'s version disagrees with the tag name, or if the tag is not an ancestor of
  `origin/main`. The second would have caught the v0.1.10–v0.1.12 orphan-tag incident that
  `versions.json`'s own note records finding months later by accident.
- **Retroactive audit of existing tags:** v0.1.24, v0.1.25 and v0.1.26 all pass cleanly — zero
  drift across `dist`, Swift and Kotlin. v0.1.22/v0.1.23 predate the Kotlin target so the current
  guard cannot run against them end-to-end; no drift was found in the artifacts they do contain.
- No runtime/schema change: the published contracts are identical to v0.1.26.

## v0.1.26
- **New `profile` contract (`GET`/`PATCH /api/profile`)** — W18's P1
  (`curio-shared/canon/discovery/W18-onboarding-and-profile-discovery.md` §5/§6). One
  server-authoritative profile both platforms read and write identically; iOS had been writing the
  `profiles` table directly as a documented stopgap. `ProfilePatchSchema` is fully partial so a
  just-in-time prompt writes ONE field without round-tripping the whole object (§5 point 2) —
  two prompts answered on different devices can't clobber each other.
  - `isAdmin` and `sellerTypeSource` are deliberately absent from the PATCH shape: the first is a
    privilege flag only the service role may flip (the DB enforces this independently — see
    `20260711000003_profiles_is_admin.sql`'s granular UPDATE policy), the second is derived
    server-side per ADR 0006 so a client never asserts it.
  - `pricingSettings` (stored) vs `effectivePricingSettings` (resolved) is a deliberate pair: the
    two eBay fee fields are **nullable in storage**, where null means "not configured — derive
    from my seller type" rather than "zero". That's what ADR 0006 needs, since eBay's fee rate is
    a fact about the seller's own registration (private £0 since Oct 2024; business 12.8% + fixed
    + ~0.35%), not a preference a user should have to look up. `effectivePricingSettings` is what
    the engine will actually use, so a business seller with a blank field sees the real number
    instead of a £0 estimate they'd have to know was wrong.
- **`database.types.ts`: profiles gains its 8 `pricing_*` columns.** Genuine drift — migration
  `20260820000005_profiles_pricing_settings.sql` (W3 §6.4) landed in pokemon-tool without
  `npm run gen:db` being re-run, so this package's DB snapshot has been missing them since. The
  two fee columns are typed nullable, matching the migration that lands alongside this release.
- **Swift codegen fix — reserved-word escaping.** `SellerTypeSchema`'s `"private"` case emitted
  `case private = "private"`, which is not valid Swift and would have broken the iOS build at the
  next bump. Caught by inspecting generated output, not by a test — so both a `SWIFT_RESERVED`
  escape set and regression tests were added, covering enum cases AND property names (plus their
  `CodingKeys`). The generated package is now compiled (`swift build`) as part of verifying a
  release, which is what actually proves this. Kotlin was already safe: its enum constants are
  SCREAMING_SNAKE_CASE and its keywords are lowercase.

## v0.1.25
`catalogue-lookup` (`/api/catalogue-lookup`) — closes the three iOS asks from
ROADMAP-COORDINATION.md's "Tier 0 returns a confident WRONG match" note (2026-08-26, the
SFD/138/221/"Windsinger" repro):
1. **`game` optional on `CatalogueLookupRequestSchema`** — was required, so iOS's own no-game
   scan requests (printed number+set is 99.31% unique across all games combined, so iOS stopped
   asking which game before scanning) were rejected before ever reaching a resolver that could
   have answered them. Now a narrowing hint, never a precondition.
2. **`candidates` on `CatalogueLookupResponseSchema`** — the resolver already computed
   `candidates`/`candidateCount` internally; the response dropped them on the floor. Defaults to
   `[]` so a response built before this field existed still validates, and a caller never needs a
   null check to distinguish "no candidates" from "field omitted."
3. **`game` on `CatalogueLookupMatchSchema`** — additive, nullable, same shape as `image` — so a
   follow-up call can price/route against the catalogue the resolver actually matched, not
   whatever the client happened to guess going in.

## v0.1.24
- **Kotlin codegen — the Android lane's contracts dependency.** Adds a third generated platform
  alongside TS and Swift: `scripts/zod-to-kotlin.ts` is a structural mirror of `zod-to-swift.ts`
  (same node coverage, same identity-tracked type reuse, same `registerName()` override), emitting
  `kotlinx.serialization` data/enum classes to `src/main/kotlin/com/curio/contracts/{DBTypes,
  APITypes}.kt`. `scripts/gen-kotlin-db.ts`/`gen-kotlin-api.ts` mirror `gen-swift-db.ts`/
  `gen-swift-api.ts` line-for-line (same imports, same `registerName`/`emit*` calls, same order) so
  the two can be diffed against each other to catch a forgotten platform when a new contract is
  added — see "Adding a new API contract" in README.md. Row-block parsing (which fields a shared
  DB table has) is factored out to `scripts/db-types-parser.ts`, now shared by both the Swift and
  Kotlin DB generators rather than living as two independently-drifting copies.
- New root-level Gradle project (`build.gradle.kts`, `settings.gradle.kts`, Gradle 8.10 wrapper) —
  a pure `kotlin("jvm")` library, not an Android Library module: there's nothing Android-specific
  in the generated types (plain data classes + kotlinx.serialization), so building this module
  needs only a JDK, no Android SDK/licenses. Targets JVM 11 bytecode for broad Android
  compatibility. Consumed via **JitPack** (`com.github.benjonesdesign:curio-contracts:vX.Y.Z`) —
  the direct Android-Gradle equivalent of web's `github:` npm dependency and iOS's SwiftPM git-tag
  pin: no publishing credentials, no `NEEDS-BEN.md` item, Android pins an exact tag the same way
  the other two platforms already do.
- `npm run check` (the drift guard) now regenerates and diffs BOTH Swift and Kotlin output, not
  just Swift — `scripts/check-drift.ts`'s single check became a small `checkPlatform()` helper
  called once per platform.
- `src/test/kotlin/com/curio/contracts/RoundTripTest.kt` — unlike `zod-to-kotlin.test.ts` (which
  locks the generator's string output), this exercises the generated code's actual runtime
  behaviour: decoding a real `IdentifyResponse`/`IdentifyAmbiguousResponse` payload and round-
  tripping a DB row through `kotlinx.serialization.json.Json`, catching a wrong `@SerialName` or
  nullability default that a string-diff test wouldn't.

## v0.1.23
- New `pricing-breakdown` contract (`POST /api/pricing/breakdown`) — Design Spec 06 §2 "live
  profit feedback as the seller edits a price field". `lib/pricing.ts`'s `computeBreakdownForPrice`
  has existed since W3, documented for exactly this use, but nothing exposed it as a route: web
  called it in-process, iOS couldn't reach it at all — routed to CODE by the iOS lane
  (`curio-shared/ROADMAP-COORDINATION.md`, 2026-08-25) as the one route blocking Spec 06's
  headline feature. `PricingBreakdownRequestSchema` reuses the existing `PricingSettingsSchema`
  (from `recommend.ts`) for an optional settings override, and gains `priceSource` so the response
  can derive machine-readable provenance without the caller string-matching source ids.
  `PricingBreakdownResponseSchema` mirrors `PriceBreakdown` (including the previously-unexposed
  `minViablePrice`, Spec 06 §4) and adds `priceKind: "realised" | "asking"` (Spec 06 §6) — "realised"
  only for a confirmed UK-sold source, "asking" for everything else (cross-region reference
  prices, asking listings, catalogue baselines), derived server-side from the same classification
  `lib/price-confidence.ts` already encodes as human-readable caveat text.

## v0.1.22
- `catalogue-lookup` (`/api/catalogue-lookup`, iOS's pre-upload fast-identify pre-check): `name`
  becomes optional and gains `setCode`. Before this, a lookup required a name — but W15 Tier 0
  exists precisely for the case where the collector number OCR'd cleanly and the name did not
  (stylised type, holo glare, foreign printing). The route now tries the number-first resolver
  (`resolveByNumber`, W15 Tier 0) ahead of the existing name-first `resolveCatalogueMatch` whenever
  `collectorNumber` is present, using `setCode` when available — the strongest single signal per
  curio-shared/canon/discovery/W15-identification-engine-discovery.md's addenda 2/3 (number+set
  code resolves 100.0% of the catalogue). A name-only caller is unaffected. Additive; no field
  removed.

## v0.1.21
- `identify` gains W15 Tier 0 support (curio-shared/canon/discovery/W15-identification-engine-discovery.md)
  — a deterministic catalogue lookup ahead of the AI vision call, at ~3ms/£0 with no possibility
  of a hallucinated identity. `IdentifyRequestSchema` gains four optional OCR-hint fields
  (`ocrCardNumber`, `ocrSetCode`, `ocrSetName`, `ocrName`) — all optional, so a caller with no OCR
  capability is unaffected. `IdentifyResponseSchema` gains optional `tier` ("tier0" | "vision")
  and `ai_call_avoided` so callers can report Tier 0 hit-rate without special-casing. New
  `IdentifyAmbiguousResponseSchema` — a bounded candidate list for a one-tap picker, kept
  deliberately separate from `IdentifyResponseSchema` rather than forcing an ambiguous result into
  that schema's required name/game/set fields, which would mean inventing a guess to satisfy the
  shape. Fully additive; no existing field changed or removed.

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
