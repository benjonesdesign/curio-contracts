// Emits src/main/kotlin/com/curio/contracts/APITypes.kt from the Zod schemas in src/api/*.ts —
// the same schemas gen-swift-api.ts covers, and the same ones the web app imports to validate
// req/res at the route boundary. One definition, three consumers: TS gets it natively (z.infer),
// Swift and Kotlin get it via their respective walkers below. Kept in exact lockstep with
// gen-swift-api.ts — same imports, same registerName() calls, same emit order — so the two files
// can be diffed against each other to catch a forgotten platform when a new contract is added.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { registerName, emitKotlin, flush } from "./zod-to-kotlin.js";

import { ApiErrorSchema } from "../src/api/common.js";
import {
  IdentifyRequestSchema, IdentifyResponseSchema, IdentifyAmbiguousResponseSchema,
  IdentifyCandidateSchema, IdentifyAmbiguousTierSchema,
} from "../src/api/identify.js";
import { CaptureCommitRequestSchema, CaptureCommitResponseSchema, ShotQualityDescriptorSchema } from "../src/api/capture-commit.js";
import {
  RecommendRequestSchema, RecommendResponseSchema, RecommendedRouteSchema,
  RecommendBatchRequestSchema, RecommendBatchResponseSchema, RecommendBatchCardInputSchema, RecommendBatchResultSchema,
  PricingSettingsSchema,
} from "../src/api/recommend.js";
import { CardSearchRequestSchema, CardSearchResponseSchema, CardSearchResultSchema } from "../src/api/card-search.js";
import { PriceRequestSchema, PriceResponseSchema } from "../src/api/price.js";
import { CertLookupRequestSchema, CertLookupResponseSchema } from "../src/api/cert-lookup.js";
import { ChannelListingRequestSchema, ChannelListingResponseSchema } from "../src/api/channel-listing.js";
import {
  CatalogueLookupRequestSchema, CatalogueLookupResponseSchema, CatalogueLookupMatchSchema,
} from "../src/api/catalogue-lookup.js";
import {
  DecideRequestSchema, DecideResponseSchema, DecisionSchema, DecisionEconomicsSchema,
  DecisionAlternativeSchema, QuickScanRequestSchema, QuickScanResponseSchema,
  QuickScanCandidateSchema, RouteReasonSchema, AlternativeReasonSchema, DegradedReasonSchema,
  PriceProvenanceSchema, DecisionGradeEVSchema, DecisionAssumptionSchema, DecisionAssumptionCodeSchema, DecideBatchRequestSchema,
  DecideBatchResponseSchema, DecideBatchResultSchema, DecideBatchCardSchema,
} from "../src/api/decide.js";
import { LiquiditySchema, DecisionUnavailableSchema } from "../src/api/common.js";
import {
  EditionAmbiguitySchema, CardValueRequestSchema, CardValueResponseSchema,
  PriceBandSchema, CardValueEconomicsSchema,
} from "../src/api/card-value.js";
import {
  RepriceApplyRequestSchema, RepriceApplyResponseSchema, RepriceApplyResultSchema,
  RepriceChannelOutcomeSchema, RepricingFlagSchema, RepricingFlagsResponseSchema,
  RepricingDirectionSchema,
} from "../src/api/reprice.js";
import {
  EbayPublishRequestSchema, EbayPublishSuccessSchema, EbayPublishErrorResponseSchema,
  EbayPublishErrorSchema, EbayListingFormatSchema,
} from "../src/api/ebay-publish.js";
import { EntitlementSchema } from "../src/api/entitlement.js";
import { VerificationEventRequestSchema, VerificationEventResponseSchema } from "../src/api/verification-event.js";
import { InspectionDepthHintRequestSchema, InspectionDepthHintResponseSchema } from "../src/api/inspection-depth.js";
import { SignedPhotoUrlRequestSchema, SignedPhotoUrlResponseSchema, SignedPhotoUrlResultSchema } from "../src/api/signed-photo-url.js";
import { PricingRuleSchema, PricingRuleInputSchema, PricingRuleListResponseSchema } from "../src/api/pricing-rule.js";
import {
  ListingTemplateSchema, ListingTemplateInputSchema, ListingTemplateListResponseSchema,
  ListingTemplateTokenSchema,
} from "../src/api/listing-template.js";
import { PricingBreakdownRequestSchema, PricingBreakdownResponseSchema } from "../src/api/pricing-breakdown.js";
import {
  ProfileResponseSchema, ProfilePatchSchema, DispatchAddressSchema, StoredPricingSettingsSchema,
  DispatchAddressPatchSchema, StoredPricingSettingsPatchSchema,
} from "../src/api/profile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Name the shared/reused nested types explicitly so every route that references them (e.g.
// RecommendedRoute inside both RecommendResponse.route and .alternatives[].route) emits one
// Kotlin type, reused — not a duplicate per call site.
registerName(RecommendedRouteSchema, "RecommendedRoute");
registerName(CardSearchResultSchema, "CardSearchResult");
registerName(RecommendBatchCardInputSchema, "RecommendBatchCardInput");
registerName(RecommendBatchResultSchema, "RecommendBatchResult");
// Shared by RecommendRequest and RecommendBatchRequest — one PricingSettings class, not two.
registerName(PricingSettingsSchema, "PricingSettings");
// Registered before any emitKotlin call so it comes out as one shared `CatalogueLookupMatch`
// class wherever it's referenced — both CatalogueLookupResponse.match and
// CaptureCommitRequest.resolvedMatch point at this same schema object.
registerName(CatalogueLookupMatchSchema, "CatalogueLookupMatch");

// ── /api/decide + /api/quick-scan (one decision shape, two entry points) ─────────────────────
// Registered BEFORE any emit so Decision comes out as ONE shared type wherever it's referenced —
// DecideResponse.decision and QuickScanResponse.decision must be the same class on the client, not
// two structurally-identical ones. Same reason CatalogueLookupMatch is registered above.
registerName(RouteReasonSchema, "RouteReason");
registerName(AlternativeReasonSchema, "AlternativeReason");
registerName(DegradedReasonSchema, "DegradedReason");
registerName(LiquiditySchema, "Liquidity");
registerName(DecisionUnavailableSchema, "DecisionUnavailable");
registerName(EditionAmbiguitySchema, "EditionAmbiguity");
registerName(DecideBatchResultSchema, "DecideBatchResult");
registerName(DecideBatchCardSchema, "DecideBatchCard");
registerName(PriceProvenanceSchema, "PriceProvenance");
registerName(DecisionGradeEVSchema, "DecisionGradeEV");
registerName(DecisionSchema, "Decision");
registerName(DecisionEconomicsSchema, "DecisionEconomics");
registerName(DecisionAlternativeSchema, "DecisionAlternative");
// Named explicitly: the generator would take "Code" from the field name, which is far too
// generic a type to ship to three platforms.
registerName(DecisionAssumptionCodeSchema, "DecisionAssumptionCode");
registerName(DecisionAssumptionSchema, "DecisionAssumption");
// Named explicitly for two reasons. The generator would take "Error" from the field name,
// which shadows Swift.Error and compiles while changing what every unqualified `Error` in
// the module means — the generator now refuses that outright. And an error union wants the
// route in its name: a client holding an `EbayPublishError` knows where it came from.
registerName(EbayPublishErrorSchema, "EbayPublishError");
// Named because the emitter would take "Ebay" and "Economics" from the FIELD names and, both
// being taken already, invent Ebay2 and Economics2 — two unrelated concepts looking like a
// versioned pair. The digit-suffix guard is right that the fix is a name, not a debt entry.
registerName(PriceBandSchema, "PriceBand");
registerName(CardValueEconomicsSchema, "CardValueEconomics");
registerName(RepricingDirectionSchema, "RepricingDirection");
registerName(ListingTemplateTokenSchema, "ListingTemplateToken");
registerName(EbayListingFormatSchema, "EbayListingFormat");
registerName(RepriceChannelOutcomeSchema, "RepriceChannelOutcome");
registerName(RepriceApplyResultSchema, "RepriceApplyResult");
registerName(QuickScanCandidateSchema, "QuickScanCandidate");
// Same reasoning: one shared ShotQualityDescriptor class, not a duplicate emitted only because
// it's nested inside CaptureCommitRequest.shotQuality.
registerName(ShotQualityDescriptorSchema, "ShotQualityDescriptor");
registerName(SignedPhotoUrlResultSchema, "SignedPhotoUrlResult");
// Shared between ProfileResponse and ProfilePatch — one class each, not a duplicate per shape.
registerName(DispatchAddressSchema, "DispatchAddress");
registerName(StoredPricingSettingsSchema, "StoredPricingSettings");
registerName(DispatchAddressPatchSchema, "DispatchAddressPatch");
registerName(StoredPricingSettingsPatchSchema, "StoredPricingSettingsPatch");
registerName(IdentifyCandidateSchema, "IdentifyCandidate");
registerName(IdentifyAmbiguousTierSchema, "IdentifyAmbiguousTier");

emitKotlin(ApiErrorSchema, "ApiError");
emitKotlin(IdentifyRequestSchema, "IdentifyRequest");
emitKotlin(IdentifyResponseSchema, "IdentifyResponse");
emitKotlin(IdentifyAmbiguousResponseSchema, "IdentifyAmbiguousResponse");
emitKotlin(CaptureCommitRequestSchema, "CaptureCommitRequest");
emitKotlin(CaptureCommitResponseSchema, "CaptureCommitResponse");
emitKotlin(RecommendRequestSchema, "RecommendRequest");
emitKotlin(RecommendResponseSchema, "RecommendResponse");
emitKotlin(RecommendBatchRequestSchema, "RecommendBatchRequest");
emitKotlin(RecommendBatchResponseSchema, "RecommendBatchResponse");
emitKotlin(CardSearchRequestSchema, "CardSearchRequest");
emitKotlin(CardSearchResponseSchema, "CardSearchResponse");
emitKotlin(PriceRequestSchema, "PriceRequest");
emitKotlin(PriceResponseSchema, "PriceResponse");
emitKotlin(CertLookupRequestSchema, "CertLookupRequest");
emitKotlin(CertLookupResponseSchema, "CertLookupResponse");
emitKotlin(ChannelListingRequestSchema, "ChannelListingRequest");
emitKotlin(ChannelListingResponseSchema, "ChannelListingResponse");
emitKotlin(CatalogueLookupRequestSchema, "CatalogueLookupRequest");
emitKotlin(CatalogueLookupResponseSchema, "CatalogueLookupResponse");
emitKotlin(EntitlementSchema, "Entitlement");
emitKotlin(VerificationEventRequestSchema, "VerificationEventRequest");
emitKotlin(VerificationEventResponseSchema, "VerificationEventResponse");
emitKotlin(InspectionDepthHintRequestSchema, "InspectionDepthHintRequest");
emitKotlin(InspectionDepthHintResponseSchema, "InspectionDepthHintResponse");
emitKotlin(SignedPhotoUrlRequestSchema, "SignedPhotoUrlRequest");
emitKotlin(SignedPhotoUrlResponseSchema, "SignedPhotoUrlResponse");
emitKotlin(PricingRuleSchema, "PricingRule");
emitKotlin(PricingRuleInputSchema, "PricingRuleInput");
emitKotlin(PricingRuleListResponseSchema, "PricingRuleListResponse");
emitKotlin(ListingTemplateSchema, "ListingTemplate");
emitKotlin(ListingTemplateInputSchema, "ListingTemplateInput");
emitKotlin(ListingTemplateListResponseSchema, "ListingTemplateListResponse");
emitKotlin(PricingBreakdownRequestSchema, "PricingBreakdownRequest");
emitKotlin(PricingBreakdownResponseSchema, "PricingBreakdownResponse");
emitKotlin(ProfileResponseSchema, "ProfileResponse");
emitKotlin(ProfilePatchSchema, "ProfilePatch");


emitKotlin(DecideRequestSchema, "DecideRequest");
emitKotlin(DecideResponseSchema, "DecideResponse");
emitKotlin(DecideBatchRequestSchema, "DecideBatchRequest");
emitKotlin(DecideBatchResponseSchema, "DecideBatchResponse");
// card-value: NEVER GENERATED until 2026-09-02. v0.1.44 added pricingDegraded to
// CardValueResponse to fix the Base Set Pikachu no_market_value conflation, was tagged, made
// canonical and bumped across three repos — and could not reach either mobile client.
emitKotlin(CardValueRequestSchema, "CardValueRequest");
emitKotlin(CardValueResponseSchema, "CardValueResponse");
// reprice-flags: the dashboard is T3 web (0011), but "act on a flagged price" is T2 and a
// mobile client following an alert deep-link needs the per-card comparison. Generating a type
// commits no platform to a feature; NOT generating one blocks a lane silently.
emitKotlin(RepricingFlagsResponseSchema, "RepricingFlagsResponse");
emitKotlin(RepricingFlagSchema, "RepricingFlag");
// A standalone enum with no referent inside the contract, so nothing pulled it in: the tokens
// a listing template may contain were declared and reached no client.
emitKotlin(ListingTemplateTokenSchema, "ListingTemplateToken");
emitKotlin(EbayPublishRequestSchema, "EbayPublishRequest");
emitKotlin(EbayPublishSuccessSchema, "EbayPublishSuccess");
emitKotlin(EbayPublishErrorResponseSchema, "EbayPublishErrorResponse");
emitKotlin(RepriceApplyRequestSchema, "RepriceApplyRequest");
emitKotlin(RepriceApplyResponseSchema, "RepriceApplyResponse");
emitKotlin(QuickScanRequestSchema, "QuickScanRequest");
emitKotlin(QuickScanResponseSchema, "QuickScanResponse");

import { assertCoverage } from "./assert-coverage.js";
import * as allContracts from "../src/index.js";
// Runs AFTER every emit, and THROWS — so an unreachable module fails `npm run build` rather
// than being noticed by a lane months later. See assert-coverage.ts for why it discovers the
// surface instead of listing it.
assertCoverage("kotlin", allContracts as unknown as Record<string, unknown>);

const header = `// AUTO-GENERATED by scripts/gen-kotlin-api.ts from src/api/*.ts (Zod schemas) — do not edit by
// hand. Regenerate via \`npm run build\`. See README.md "Releasing a new version".

package com.curio.contracts

import kotlinx.serialization.KSerializer
import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.SerializationException
import kotlinx.serialization.descriptors.buildClassSerialDescriptor
import kotlinx.serialization.json.JsonDecoder
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonEncoder
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive

`;

const out = header + flush() + "\n";
const outDir = process.env.CURIO_CONTRACTS_KOTLIN_OUT_DIR ?? join(root, "src/main/kotlin/com/curio/contracts");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "APITypes.kt"), out);
console.log(`Wrote ${join(outDir, "APITypes.kt")}`);
