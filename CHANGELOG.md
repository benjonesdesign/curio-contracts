# Changelog

## v0.2.0 — BREAKING: most to pay and the fee position are nullable, and a null always says why

**Untagged.** The version is bumped in `package.json` / `package-lock.json`; Ben tags. Rulings:
`LANE-REPORTS/owner.DESIGN-REVIEW-2026-10.md` "Rulings, round 2", item 1 — *"the breaking change
now, once: contracts v0.2.0 with a nullable most to pay and nullable fee position, adopted in
lockstep by web, iOS and Android before the server sends a null"* — and the same document's dropping
of #224's Option A (so there is **no** `acceptsMaxBuyVerdict` request flag and no `Decision.maxBuy`
object; the field stays flat and becomes nullable). Plans drawn on: PLAN-MOST-TO-PAY-SHARE-OF-SALE
(#224), PLAN-SELLER-TYPE-FIRST-ASK (#230), PLAN-GAP-032-036 (#218), PLAN-GAP-012-025 (#220),
PLAN-POSTAGE-FUNCTION (#229, read for the `postage` line only).

### Why

Until now the contract could not say "we do not know". `profiles.seller_type` is `not null default
'private'`, the buying margin falls back to the SELLING floor, and an asking price is accepted as a
valuation — so "never asked" and "answered private" were the same row, and the most-to-pay a seller
acts on at a table was a number in every case. A nullable alone would be the conflated-null shape
(decisions/0024) again, so **a null always carries a reason, and a number never does.**

### The wire change (what the server will send, once switched)

| Field | Before | After |
|---|---|---|
| `Decision.maxBuyGbp` | `number` | `number \| null` |
| `Decision.maxBuyUnavailableReason` | — | `"margin_not_set" \| "seller_type_not_set" \| "vat_not_set" \| "asking_price_only" \| "no_price" \| "not_viable" \| null` (required key) |
| `Decision.minAcceptGbp` | `number` | `number \| null` (null exactly when `economics.feeGbp` is null) |
| `Decision.offerPctAtMax` | `number` | `number \| null` (null exactly when `maxBuyGbp` is null) |
| `Decision.economics.feeGbp` | `number` | `number \| null` |
| `Decision.economics.feeNotSetReason` | — | `"seller_type_not_set" \| "vat_not_set" \| null` (required key) |
| `Decision.economics.taxProvisionGbp`, `.expectedNetGbp` | `number` | `number \| null` (null with `feeGbp`) |
| `CardValueEconomics.feeRate`, `.feeFixed` | `number` | `number \| null` (together) |
| `CardValueEconomics.feeNotSetReason` | — | `FeeNotSetReason \| null` (required key) |
| `CardValueEconomics.sellerType`, `.vatRegistered` | `string`, `boolean` | `string \| null`, `boolean \| null` |
| `PricingBreakdownResponse.ebayFee`, `.grossProfit`, `.taxProvision`, `.netProfit`, `.netMarginPct`, `.minViablePrice` | `number` | `number \| null` (all together) |
| `PricingBreakdownResponse.isMarketBelowMin` | `boolean` | `boolean \| null` |
| `PricingBreakdownResponse.feeNotSetReason` | — | `FeeNotSetReason \| null` (required key) |
| `Profile.sellerType` | `SellerType` | `SellerType \| null` |
| `Profile.effectivePricingSettings` | `PricingSettings` | `EffectivePricingSettings` (`ebayFeeRate`/`ebayFeeFixed` nullable) |

Added to `Profile` (all required keys, nullable): `sellerTypeConfirmedAt`, `suggestedSellerType`,
`vatRegistered`, `vatConfirmedAt`, `feeNotSetReason`, `buyingTargetMarginPct`,
`buyingTargetMarginSetAt`, `buyingTaxRate`, `buyingTaxRateSetAt`. Added to `ProfilePatch` (optional):
`vatRegistered`, `buyingTargetMarginPct`, `buyingTaxRate`.

**New schemas, additive:** `FeeNotSetReason`, `MaxBuyUnavailableReason`, `EffectivePricingSettings`,
and the shared `PricedBreakdown` family (`src/api/priced-breakdown.ts`: `PricedBreakdown`,
`PricedLine`, `PricedLineSource`, `PricedLineEditKey`, `PricedBreakdownMode`, `PricedTotals`,
`PricedCompare`, `PricedChannel`, `FeeBasis`, `PricedFeePosition`, `PricedNotSet`, `PricedPrice`).
`PricedBreakdown` was declared in the first cut of this release without being attached to a
response; **round 2 below attaches it** (and adds `unknownReason`, `estimate` and `included` to
`PricedLine`).

**Not changed:** `RouteEconomics` (`/api/recommend`, retiring) was already nullable and gets no
reason; `PricingSettings` stays a request body with a non-null fee; `DecideRequest.targetMarginPct`
keeps its name and its "% of what they pay" doc comment (#224 Decision 2, whether the field changes
meaning, is NOT in Ben's round-2 ruling); `postage_rules` (#229) is not here (the SKU shape is: round 2); `Decision.economics.postageGbp`/`packagingGbp` stay numbers (neither depends on seller type).

### The invariants (a SERVER-side guard — read this before relying on the generated types)

Two sibling fields plus a Zod `superRefine`, **not** a discriminated union, although the generators
have emitted `z.discriminatedUnion` since v0.1.45. A union at `Decision` level would turn `Decision`
into a Swift `enum` / Kotlin sealed type, so every `decision.route` read would become a `switch`; the
ruling is a `Double` becoming a `Double?`, a one-token fix per site. The cost: **the rule lives only
in TypeScript.** Swift's and Kotlin's `Decision` can be constructed with a null `maxBuyGbp` and a
null reason. The producer (web's `buildDecision`, which parses its own response with
`DecideResponseSchema`) is the only party that enforces them, which is why they are tested here:

1. `maxBuyGbp` null ⇔ `maxBuyUnavailableReason` set. 2. `offerPctAtMax` null ⇔ `maxBuyGbp` null.
3. `feeGbp` null ⇔ `feeNotSetReason` set; `taxProvisionGbp` and `expectedNetGbp` are null with it.
4. `minAcceptGbp` null ⇔ `feeGbp` null. 5. `feeGbp` null ⇒ `maxBuyGbp` null. 6. A fee-position
`maxBuyUnavailableReason` equals `economics.feeNotSetReason`. The same pattern holds on
`CardValueEconomics`, `PricingBreakdownResponse` and `Profile` (a value and its confirmation time are
one fact; the effective fee is null exactly when `feeNotSetReason` is set).

Two things in that list are judgement calls beyond the letter of the ruling, made because the ruling
is "once": **`minAcceptGbp`** is the Best Offer auto-decline floor and the auction start price, and it
contains the fee — computed with an assumed £0 private-seller fee it is *lower* than a business
seller's true floor, so it would accept offers that lose money; and **`taxProvisionGbp` /
`expectedNetGbp`** contain the fee by construction. Leaving them numbers would keep the private-seller
assumption alive in the figures beside the null.

### Source-breaking, per platform — what each must change

**TypeScript (web).** `Decision['maxBuyGbp' | 'minAcceptGbp' | 'offerPctAtMax']` and
`DecisionEconomics['feeGbp' | 'taxProvisionGbp' | 'expectedNetGbp']` become `number | null`;
`maxBuyUnavailableReason` and `feeNotSetReason` are new REQUIRED keys, so `buildDecision`'s object
literal fails `tsc` until it supplies them (`null` while the switch is off). `DecisionSchema`,
`DecisionEconomicsSchema`, `CardValueEconomicsSchema`, `PricingBreakdownResponseSchema`,
`ProfileSchema` and `EffectivePricingSettingsSchema` are now `ZodEffects`, so `.shape`, `.extend`,
`.pick`, `.omit` and `.partial` no longer exist on them (the web repo uses none; checked by grep).

**Swift (iOS).** `Double` → `Double?` on `Decision.maxBuyGbp`, `.minAcceptGbp`, `.offerPctAtMax`,
`DecisionEconomics.feeGbp`, `.taxProvisionGbp`, `.expectedNetGbp`, `CardValueEconomics.feeRate`,
`.feeFixed`, and the six `PricingBreakdownResponse` figures; `String`/`Bool` → optional on
`CardValueEconomics.sellerType`/`.vatRegistered` and `PricingBreakdownResponse.isMarketBelowMin`;
`ProfileResponse.sellerType` → `SellerType?`, and `effectivePricingSettings` changes TYPE
(`PricingSettings` → `EffectivePricingSettings`). Every memberwise `init` gains the new parameters, so
test fixtures that construct these types break. `MaxBuyUnavailableReason` and `FeeNotSetReason` are
forward-compatible enums: an exhaustive `switch` needs the `.unrecognised(String)` case, and a client
must read an unrecognised reason as "no figure", never as a number. Synthesised `Codable` decodes a
null or an absent key to `nil`.

**Kotlin (Android).** The same fields `Double` → `Double?` (`= null`); `MaxBuyUnavailableReason` and
`FeeNotSetReason` are sealed interfaces, so a `when` needs the `Unknown` branch. `MoneyRow(…,
decision.maxBuyGbp)` style call sites take a nullable.

**An old client breaks on the first null.** A pinned v0.1.45 Swift/Kotlin `Decision` decodes
`maxBuyGbp` as a non-optional `Double`; a JSON `null` there is a `DecodingError.valueNotFound` /
`SerializationException` for the **whole** `Decision`, not the field (demonstrated in this release's
mutation check: with `maxBuyGbp` reverted to non-null, the new Swift and Kotlin tests fail on exactly
that). iOS's `decide`/`decideFull` return `nil` on a decode failure (`SupabaseService.swift:1312-1319`), so
the card lookup falls to "No recommendation available" (`CurioCaptureApp.swift:1179`). This is the entire reason for the sequence below.

### The lockstep sequence (Ben, round 2)

1. **Contracts:** merge this; Ben tags `v0.2.0`.
2. **Web:** bump the pin and compile. The server keeps sending **numbers** — every nullable field
   non-null, `maxBuyUnavailableReason: null`, `feeNotSetReason: null`. This is safe for every
   installed client: the two new keys are ignored (Swift `JSONDecoder` and the Android `Json` configs
   use `ignoreUnknownKeys`).
3. **iOS and Android:** bump the pin, adopt (render the reason, never a figure), ship.
4. **Only when all three have adopted** does the server send a null — a **server-side switch**, not
   a contract change. Per-request gating is not available (Option A's flag is dropped), so the
   switch is global; see `docs/V0.2.0-ADOPTION.md` "The switch" for what "adopted" has to mean given
   that an installed older build breaks on the first null.

Per-platform checklists with file and line citations: **`docs/V0.2.0-ADOPTION.md`**. A client still
on v0.1.45 also inherits the source-breaking v0.1.46–v0.1.49 changes in one jump (renames, the
eighteen-arm error union, the tier rename); those are in the entries below.

### Round 2 (same release, 2026-10-08): the single contract iOS, Android and web adopt

Round 1 (above) is the nullable most-to-pay and fee position. Round 2 extends the SAME untagged
v0.2.0 so that one tag carries every shape the three lanes were about to adopt separately. Still
untagged, still one BREAKING release. Authority: the native build spec ("Money, prices and the
seller's figures", "Where to start"), `domain-model.md` (UNMATCHED, HELD, SKU "when the copy is
created", BulkRecord), the JTBD-GAP handoffs, and pokemon-tool plans/PRs #218 #222 #224 #227 #228
#229 #230 #233 #235 #243 #246. Owner corrections applied (coordinator, same day): SKU is `SKU-` +
8 hex, given on add, never editable; HELD is a status with `held_at`; tax applies only when the
seller sets a rate, buying and selling; the time lines are `packing_time` and `listing_time`;
lot share uses the LOW END of the asking range. **Every breaking change, per platform, is in
`docs/V0.2.0-ADOPTION.md` "Round 2: what else breaks".**

**1a. Postage service code (added after round 2, product-owner ruling).** `PricedLine.service`
(optional, nullable) on the `postage` line: the closed `PostageService` enum, declared once in
`common.ts`: `rm48_ll`, `rm24_ll`, `tracked48_sp`, `special_delivery` (exactly the four services
Dispatch H6 draws, as the keys #229 stores). Free postage is a threshold and buyer-pays is a mode,
so neither is a service: when the buyer pays the line has `note: buyer_pays` and `service` null;
above the free threshold the seller pays the service Dispatch would use and `service` names it.
Forward-compatible (decisions/0027): Swift `.unrecognised(raw)`, Kotlin `Unknown(raw)`. NO labels in
the contract: they come from @curio/copy (design/copy to supply); until then clients show generic
"Postage". Guards: service only on `postage`, never with `buyer_pays`, never on an unknown figure.
Isolated tests, one golden vector, Swift and Kotlin tests; 7 more mutations, all red.

**1. `PricedBreakdown` attached to real responses.**
- `PricingBreakdownResponse.breakdown` (required, `mode: "selling"`); request gains optional
  `physicalCardId`, `format`, `postageMode`, `packingKey` (seller intent only, ADR 0028).
- `DecideResponse.breakdown` (required); `QuickScanResponse.breakdown` and `DecideBatchResult.breakdown`
  (required key, `null` exactly when `decision` is null). Requests gain `theirPriceGbp`,
  `postageMode`, `packingKey`.
- NEW `ListingPreviewRequest` / `ListingPreviewResponse` (`src/api/listing-preview.ts`): per copy,
  `card` (with SKU), `listable`, `refusalReason`, a selling `breakdown`, `belowFloor`; plus group
  and batch totals the server sums, so no screen sums a column. Route path undecided (below).
- `PricedLine` gains `unknownReason` (required; the six-value `MaxBuyUnavailableReason`
  vocabulary), `estimate` and `included` (both required). **An unknown figure is null WITH a
  reason; a known one never has one; "Unknown is never £0"** (guarded). `max_buy` is a whole pound,
  rounded down by the server. Sign: value lines positive, deductions negative.
  `packing_time` is in `lines`, negative, taken off, with `minutes`; **`listing_time` is NOT in
  `lines`: it is in the new required `PricedBreakdown.beside` array** (positive magnitude,
  `minutes`, `included: false`, never in the arithmetic; empty without an hourly rate), mirroring
  pokemon-tool #244; `your_time` is retired. The `ebay_fee` line carries `perOrderBand`
  (`low | high | null`) and `feeBasisVerified` (false until eBay's page confirms the £10 band is
  tested on item + buyer postage), as #244's `feeBreakdown`. A mode's total line (`you_receive` /
  `max_buy`) is always present.
- Cross-checks (server-side guards): the breakdown beside a decision agrees with it (floor of
  `decision.maxBuyGbp` = the breakdown's total; reasons and fee agree), the flat figures in
  `PricingBreakdownResponse` agree with its breakdown, and a preview's totals are exactly the sum of
  its rows in whole pence.

**2. One closed refusal vocabulary** (`src/api/listing-refusal.ts`). `ListingRefusalReason`
(`mine`, `set_aside`, `unmatched`, `condition_not_confirmed`, `no_price`, `no_sku`,
`game_not_available`, `already_live`) and `ListingRefusalCode` (`card_not_listable` 409,
`game_not_available` 422, `sku_required` 422, `sku_unavailable` 503, `card_read_failed` 503,
`card_not_found` 404; table `LISTING_REFUSAL_HTTP_STATUS`). Carried by `ListingRefusal`
(`{error, code, reason}`), six new `EbayPublishError` arms (`failure` union), `ChannelListingResponse`
(`code`, `reason`, beside its envelope) and `ListingPreviewItem.refusalReason`. **This models the
plan/spec's `card_not_listable` (409) + reason, NOT pokemon-tool #243's flat `card_mine` /
`card_set_aside` / 422 `condition_not_confirmed`: a Ben decision, mapping in the adoption doc.**
`held` is deliberately not a reason (a held copy may be listed on purpose).

**3. Game availability** (`src/api/game-availability.ts`): `GamesResponse` (`{games: [{game,
displayName, availability}]}`, `availability` = `available | coming`; this follows #228/#246, not
the brief's `id/name/enabled` shorthand), `GameRefusal` (the 422 `game_coming` / `game_not_available`
body) and `IdentifyAmbiguousResponse.unavailableGame`.

**4. SKU at creation, never editable.** New `PhysicalCard` (`src/api/physical-card.ts`) with a
non-null, non-empty, OPAQUE `sku`. `CaptureCommitResponse` gains required `sku` and `status`;
`EbayPublishSuccess` gains required `sku`; **`EbayPublishRequest.sku` is REMOVED** and
`sku-immutable.test.ts` fails the build if any request/patch/input schema ever carries a `sku`. A
BulkRecord has no SKU (only its lot listing does, on that listing's response); no BulkRecord/lot
wire type exists yet, and when one does its cost share uses the LOW END of the asking range.

**5. Status enum.** New closed `PhysicalCardStatus` (the sixteen the web repo writes, plus
`UNMATCHED` and `HELD`); `PhysicalCard.heldAt` (`held_at`, non-null when HELD). Seller-visible
labels ("Not identified", "Held by you") are docs only.

**6. Tax only when set.** `StoredPricingSettings.taxRate` and `EffectivePricingSettings.taxRate` are
`number | null` (null = not set, no tax set aside, buying or selling; PATCH `null` clears). The DB
default 0.20 stays until a separate migration (needs Ben's go); contracts only model null.

**Generator/internal.** `MaxBuyUnavailableReason` and `PriceKind` moved to `common.ts` (no
generated-name change; breaks a TS deep import of `decide.js`/`pricing-breakdown.js` for them).
`PricedBreakdown` is registered by name before any emit (it came out as `Breakdown` once nested).
`src/test-support/` holds shared fixtures and is excluded from the build.

**Verification (round 2).** `npm run build` (141/141 schemas emitted, Swift and Kotlin),
`npm run check` (no drift), `tsc --noEmit`, `npx vitest run` (31 files, 454 tests), `swift build`
and `swift test` (36), `./gradlew test --offline` (43; new `BreakdownAndRefusalTest`, updated
`DecideRoundTripTest`/`GoldenVectorTest`). Four new golden vectors (unknown refusal reason, unknown
status inside a preview, unknown availability, unknown line reason).

**Mutation check, round 2 (2026-10-08).** 80 mutations applied by hand, each disabling one rule or
loosening one field; each ran against the owning test file and **every one went red**; all green
against current (list: every `superRefine` rule in priced-breakdown, pricing-breakdown, decide,
listing-preview, listing-refusal, game-availability, physical-card, channel-listing; `sku` back in
`EbayPublishRequest`, optional on the success/commit responses, shape-validated, nullable; the
refusal enums gaining `held`/`card_mine`; 409 to 422; taxRate non-null; and so on). Method note: the
first pass left 13 survivors, and the #244 alignment (`beside`, minutes, fee basis) left 4 more of
the same kind. Eleven exposed tests passing for the wrong reason (another rule
rejected the same fixture), so each got an isolated test (an unknown-key line in the wrong container,
a buying breakdown that otherwise agrees,
a decision of 84.77 shown 84 to separate floor from round-to-nearest, 0.29 and 1.13 to separate
rounding from truncation, ...). Three were dead code (a fractional-total rule already implied by the
line rule and equality, a null/known fee mismatch already caught by the fee-basis and reason rules,
and a listing_time-in-lines key rule already implied by "lines are all included") and were deleted. On Swift and Kotlin, four schema mutations (line reason, refusal reason,
`heldAt` and stored `taxRate` made non-null) each failed both platforms' new tests.

### Generator change (internal, but it is why `DecisionEconomics` is not called `Economics2`)

`zod-to-swift.ts` / `zod-to-kotlin.ts` handled `ZodEffects` (a `.refine`/`.superRefine`) by unwrapping
it, which was enough while the only refinements sat on number fields. A cross-field rule on an
exported OBJECT schema exposed two defects: the name registered on the wrapper was ignored (the
inner object was named from the *field* — `Economics`, taken, so `Economics2`), and the wrapper was
never recorded as visited, so `assert-coverage` reported the exported schema as never emitted. Both
fixed; tests in `scripts/zod-to-{swift,kotlin}.test.ts`.

### Verification

`npm run build`, `npm run check` (no drift), `npx vitest run` (257), `swift build` and `swift test`
(18, including the new `NullableMostToPayTests`), `./gradlew test --offline` (31, including three new
`DecideRoundTripTest` cases). No digit-suffixed generated type name was introduced
(`generated-names.test.ts` unchanged and green).

**Mutation check (2026-10-08).** 33 mutations, each disabling one guard or reverting one field to
its pre-v0.2.0 shape, run against the owning test file; every one went red in the named test(s) and
all are green against current. The one that first survived (making `maxBuyUnavailableReason`
`.optional()`) exposed a test that was passing for the wrong reason (the refinement happened to
reject `undefined` on the number path); it now also omits the key on the null path. Separately, with
`maxBuyGbp` reverted to non-null and the outputs regenerated, the Swift test
`testNullMostToPayAndFeeDecodeWithTheirReasons` fails with `valueNotFound ... Path: maxBuyGbp`, and
three Kotlin tests fail.

## v0.1.49 — tier rename: free/starter/growth/pro → free/collector/pro/dealer

Pricing model v1 (`website/PRICING-STRATEGY.md`). `EntitlementTierSchema` is now
`free | collector | pro | dealer`. **Source-breaking on every platform** (Swift `.starter/.growth` →
`.collector/.dealer`; Kotlin `STARTER/GROWTH` likewise; wire values change) — lockstep release, and
the web migration that rewrites the `entitlements` check constraint must land with it (the table has
0 rows, so there is nothing to backfill). Version bump approved by Ben 2026-09-26; Ben runs the tag. package.json was left at 0.1.46 by the v0.1.47/v0.1.48 tags (check-drift flagged it), now corrected.
Also emits `EntitlementResponseSchema` for Swift/Kotlin: it was added in fb0a5b7 without an emit, which
made `npm run build` fail the coverage assertion on `main`. It generates `Tier2/Status2/Source2`
duplicates of the Entitlement enums (already listed in generated-names debt).

## v0.1.46 — the release that fixes "contracts reaching no client", which v0.1.45 did not contain

**v0.1.45 was cut partly to stop contracts reaching no client, and did not contain the fix for
contracts reaching no client.** The coverage work was on the branch when the tag was cut; the tag
and `main` both point at #30, and `CardValueResponse` appears zero times in that tag's generated
Swift. Verified from a fresh clone, not from a working tree.

This release is deliberately NOT the coverage fix alone. Shipping a union that covers eight of
eighteen error codes is the same shape as shipping a contract that reaches no client, and two
partial fixes in two releases would be the third instance of that shape this week. So:

### 1. `CardValueRequest` / `CardValueResponse` had NEVER been generated

`gen-swift-api.ts` imported exactly one symbol from `card-value.ts` — `EditionAmbiguitySchema`.
Android imported neither type. **v0.1.44** added `pricingDegraded` to fix the Base Set Pikachu
`no_market_value` conflation, was tagged, made canonical and bumped across three repos, and could
not reach either mobile client. iOS's diagnosis is the finding: *the generator's coverage is a
hand-maintained import list and no test asserts a module is covered.*

**It was six schemas, not one** — a hand-list rarely fails once:

| Schema | What was unreachable |
|---|---|
| `CardValueRequest`, `CardValueResponse` | the whole `/api/card-value` contract, incl. v0.1.44's fix |
| `RepricingFlag`, `RepricingFlagsResponse`, `RepricingDirection` | the whole `GET /api/reprice-flags` contract |
| `ListingTemplateToken` | the tokens a template may contain — an enum nothing referenced |

`scripts/assert-coverage.ts` **discovers** the exported surface and throws during `npm run build`.
Fourth instance of the enumeration rule (ADR 0024); same remedy as the shape guard.

### 2. Two name collisions, fixed by naming

Emitting `CardValueResponse` made the emitter invent `Ebay2` and `Economics2` from its field names.
The digit-suffix guard fired and is right that the fix is a name: **`PriceBand`** and
**`CardValueEconomics`**.

⚠️ `PriceBand` is byte-identical to capture-commit's local `EbaySchema`, which emits as `Ebay`.
**Not consolidated** — `Ebay` is shipped, and pointing capture-commit at a shared declaration
renames a public generated type on two platforms. That is a deliberate lockstep event of its own,
not something to bolt onto this release. Carried as named debt.

### 3. The error union now covers all eighteen codes, not eight

v0.1.45 declared eight arms. `/api/ebay-publish` can return **eighteen** codes. The ten missing
ones decoded to the forward-compatible fallback — **safe**, and wrong: a client could only render
"unknown error" for ten real, actionable failures.

- **`missing_required_aspects`** is the sharpest. The route computes `fields.missingRequired` and
  flattens it into an English sentence, so a client could only re-parse prose to learn which fields
  to ask for. That is precisely the case a discriminated union exists for, sitting inside the first
  schema built on one. Now carries the array.
- **`rate_limited`** carries `partialSuccess`. A bulk publish that hits the limit **has already
  listed cards**; a client that retries the whole batch double-lists them.
- **`location_create_failed`** carries eBay's verbatim rejection, and is distinct from
  `no_dispatch_address`: the seller HAS an address and eBay would not accept it.
- **Four token arms, not one `token_error`.** All four are 503 and all four have a different
  remedy — reconnect, wait, contact us, and (`not_configured`) nothing the seller can do, because
  it is OUR credentials that are absent. A client must not tell a seller to reconnect their account
  for that one. Collapsing them is the conflation this contract exists to prevent, at the exact
  point where a seller is being told to go and fix something.

⚠️ **`ebay_error` is RESERVED and the route does not emit it.** Every eBay failure is mapped to a
named arm before it leaves the route, so that arm describes a pass-through that does not happen.
Kept rather than removed — it shipped in v0.1.45 and dropping an arm breaks an exhaustive switch on
three platforms — but recorded in the schema as a claim rather than an artifact, so nobody reads
its presence as evidence the route passes codes through.

## v0.1.45 — the generator can express a union again, and two bugs it was hiding

**`z.discriminatedUnion` emits.** It threw in both emitters, so the idiomatic way to make two
meanings unrepresentable as one shape was unavailable — and ADR 0024 records the conflated-null
defect twice, both times because someone reached for a nullable field after the tooling refused
the union. It is available now.

Swift gets an enum with associated values; Kotlin a sealed interface with a custom `KSerializer`.
Both carry a forward-compatible fallback that keeps **the discriminator and the whole payload**,
not just the tag — an unknown arm that dropped its data would decode without throwing and still
leave a log line saying only "unknown error".

**First consumer: `POST /api/ebay-publish`**, which had no contract at all, on the route that puts
a real listing at a real price on a real marketplace. Its nine error arms carry different data and
demand different UI — `title_too_long` needs the actual length, `unmappable_condition` needs the
condition it could not map, `ebay_error` needs the upstream code, which is an **open set we do not
control**. That last one is why the fallback is load-bearing rather than decorative: a client that
hard-failed on a new eBay code would turn "eBay said something new" into "the app broke" at the
moment a seller is trying to sell.

### ⚠️ The union is additive — `error` stays a string

The first draft made `error` the union. **Three web screens render `data.error` straight into a
toast** (`app/inventory/bulk-publish/page.tsx:159`, `app/inventory/[id]/page.tsx:524`,
`app/add/multiple/page.tsx:333`), so that would have shown a seller `[object Object]` mid-publish.

Caught by reading the callers before changing the route — not by a test, because no test asserts
what a toast renders. The structured union arrives under a new `failure` key; `error` and `code`
are untouched, and `error` must equal `failure.message`.

### Two pre-existing generator bugs, found by `swift build` rather than by reading the output

Neither was visible until a schema exercised them. Both emitted code that does not compile:

1. **A `.default()` on an enum-typed field emitted a bare string** — `?? "FIXED_PRICE"` where an
   `EbayListingFormat` was expected. Defaults are now resolved after the type, and an enum default
   emits a case.
2. **`z.union` widened to `String` unconditionally** — so `z.union([z.literal(3), z.literal(7)])`
   emitted `decodeIfPresent(String.self) ?? 7`. The "unions widen to String" shortcut had simply
   never met a union that wasn't strings. Non-string literal unions now take their literal type; a
   heterogeneous scalar union (eBay's `string | string[]` aspect values) becomes `JSONValue` /
   `JsonElement`, which holds either **losslessly** — the old widen would have decoded the array
   arm as a String and thrown at runtime; and a union of OBJECT shapes is refused with a message
   naming `z.discriminatedUnion`.

### A generated type may no longer shadow the standard library

`z.object({ error: <union> })` took its name from the field and emitted `public enum Error`. That
**compiles**, and from then on every unqualified `Error` in the module means the generated enum
rather than `Swift.Error`. Refused outright, with the fix in the message (`registerName`), because
silently renaming a public type is worse than a build failure.

### Vectors, and a parity bug they caught

Three new golden vectors, and the fixture now has **two classes**: `serverAccepts: true` for a
payload the server legitimately accepts and clients must survive (an additive field on a known
arm), and the original class for a value the server must refuse to emit.

`ebay_error_missing_discriminator` is a **parity** vector. Swift's generated decoder used `decode`
and Kotlin's degraded to `Unknown("")`, so the two platforms disagreed about the same malformed
body — Swift losing the whole response, Kotlin surfacing an unknown error. Both degrade now.

⚠️ **A limit of forward compatibility, found by the round-trip assertion failing and worth stating
rather than working around.** An unknown enum VALUE round-trips; an unknown FIELD on a known arm
decodes and is then **dropped** on re-encode, because a typed struct has nowhere to keep it. The
practical consequence: **a client must never decode a payload and re-send it as its own** — it
would silently strip fields a newer server added.

## v0.1.44 — "no market value" was being said about a Base Set Pikachu

`CardValueResponse.pricingDegraded`. True when the pricing chain FAILED rather than queried and
found nothing.

`/api/price`'s provider walk swallowed every provider error into a log line and returned a bare
`null` for both outcomes, so `/api/quick-scan` could not tell a normal miss from an outage and
called both `no_market_value`. On 2026-09-01 that told a seller their **Base Set Pikachu** — no
CardTrader blueprint, and pokemontcg.io returning 500s — has no market value. The card is not
worthless; we had nothing to look in.

Wrong in the direction that costs a seller the card rather than the margin, and the **seventh**
instance of the conflated-null shape — this one *inside the field built to fix it*.

## v0.1.43 — Swift decodes forward-compatibly, three days after the ADR said it did

**decisions/0027 has been Accepted since 2026-08-27 and Kotlin shipped it. Swift never did.**

`Game` in Kotlin was a sealed interface with an `Unknown(rawValue)` case. `Game` in Swift was a
plain `String`-backed enum with eight cases and no fallback — and Swift's synthesised `Codable`
throws `DecodingError.dataCorrupted` on an unrecognised raw value, propagating to the ENCLOSING
object. **72 Swift fields were typed as strict generated enums.** A ninth game in one candidate of
a candidate list would have failed the entire response, on the platform whose lane reported the
problem in the first place.

Generated Swift enums now carry a `case unrecognised(String)` with `rawValue` on every case, so an
unknown value decodes, survives, and round-trips unchanged (item 2a). A schema value literally
called `"unknown"` — orientation, exposure and side all have one — keeps its own case and cannot be
confused with the fallback.

⚠️ **SOURCE-BREAKING FOR CLIENTS, deliberately.** An exhaustive `switch` over a generated enum no
longer compiles without handling the unknown case, which is the point: the calling code decides
what an unrecognised value means, visibly, instead of the decoder deciding by throwing (item 2).
Lockstep release per ADR 0012.

**Why it went unnoticed for three days is the more useful finding.** The Swift package was
generated and committed but **never compiled, let alone run** — CI had a Kotlin job and no Swift
job at all. This release adds `Tests/CurioContractsTests` and a `swift` CI job. A generated artifact
nobody builds is a claim, not an artifact.

## v0.1.42 — a dash that might be an outage

`CardSearchResponse.pricesUnavailable`. True when a `marketGbp: null` on the page may be an outage
rather than a card we genuinely have no price for.

iOS saw the symptom on device before the field existed: a card **priced at 09:22 and dashed at
09:24 on the same query**, with the response looking complete both times. Two causes, both silent:

- a catalogue provider flapped, so the row came from `catalogue_cards` — which carries identity and
  **has no price column at all**; and
- the FX lookup failed, which nulls every non-GBP price on the page at once.

This is the same conflation as `cataloguesUnavailable`, one layer down: a dash meant both "no
market for this card" and "we could not price it", and nothing told them apart. A client must not
render a bare dash when this is true.

Also ships `suite-integrity.test.ts`: a floor on the test-FILE count and a ban on undocumented
`.skip`. A file that fails to load already exits 1; a file DELETED or `.skip`ped does not, and
nothing distinguished "this check was removed" from "this check never existed".

## v0.1.41 — CardValueResponse's full shape

**Completes v0.1.40. Bump straight to this; v0.1.40 is safe but incomplete.**

v0.1.40 declared `CardValueResponse` from the fields that mattered for the disclosure and missed
two that are genuinely on the wire: the legacy `economics` coefficients block and `owned`. Zod
strips unknown keys, so the moment `/api/card-value` began *validating* against its own contract,
both vanished from the response.

Caught by wiring the route to the contract rather than by review — which is the argument for
covering a route rather than describing it. The same gap in the other direction is what put us
here: quick-scan's hand-kept six-field mirror of an eleven-field response silently dropped
`editionAmbiguity`.

`economics` is declared with a warning, not an endorsement: it is legacy, nothing new should
consume it, and a client computing its own economics from raw coefficients is what ADR 0026 exists
to stop. But it IS on the wire, and an undeclared field is a silently-stripped one.

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
