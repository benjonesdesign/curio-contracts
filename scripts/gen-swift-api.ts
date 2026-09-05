// Emits Sources/CurioContracts/APITypes.swift from the Zod schemas in src/api/*.ts — the same
// schemas the web app imports to validate req/res at the route boundary. One definition, two
// consumers: TS gets it natively (z.infer), Swift gets it via the zod-to-swift walker below.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { registerName, emitSwift, flush } from "./zod-to-swift.js";

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
// Swift type, reused — not a duplicate per call site.
registerName(RecommendedRouteSchema, "RecommendedRoute");
registerName(CardSearchResultSchema, "CardSearchResult");
registerName(RecommendBatchCardInputSchema, "RecommendBatchCardInput");
registerName(RecommendBatchResultSchema, "RecommendBatchResult");
// Shared by RecommendRequest and RecommendBatchRequest — one PricingSettings struct, not two.
registerName(PricingSettingsSchema, "PricingSettings");
// Registered before any emitSwift call so it comes out as one shared `CatalogueLookupMatch`
// struct wherever it's referenced — both CatalogueLookupResponse.match and
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
// Same reasoning: one shared ShotQualityDescriptor struct, not a duplicate emitted only because
// it's nested inside CaptureCommitRequest.shotQuality.
registerName(ShotQualityDescriptorSchema, "ShotQualityDescriptor");
registerName(SignedPhotoUrlResultSchema, "SignedPhotoUrlResult");
// Shared between ProfileResponse and ProfilePatch — one struct each, not a duplicate per shape.
registerName(DispatchAddressSchema, "DispatchAddress");
registerName(StoredPricingSettingsSchema, "StoredPricingSettings");
registerName(DispatchAddressPatchSchema, "DispatchAddressPatch");
registerName(StoredPricingSettingsPatchSchema, "StoredPricingSettingsPatch");
registerName(IdentifyCandidateSchema, "IdentifyCandidate");
registerName(IdentifyAmbiguousTierSchema, "IdentifyAmbiguousTier");

emitSwift(ApiErrorSchema, "ApiError");
emitSwift(IdentifyRequestSchema, "IdentifyRequest");
emitSwift(IdentifyResponseSchema, "IdentifyResponse");
emitSwift(IdentifyAmbiguousResponseSchema, "IdentifyAmbiguousResponse");
emitSwift(CaptureCommitRequestSchema, "CaptureCommitRequest");
emitSwift(CaptureCommitResponseSchema, "CaptureCommitResponse");
emitSwift(RecommendRequestSchema, "RecommendRequest");
emitSwift(RecommendResponseSchema, "RecommendResponse");
emitSwift(RecommendBatchRequestSchema, "RecommendBatchRequest");
emitSwift(RecommendBatchResponseSchema, "RecommendBatchResponse");
emitSwift(CardSearchRequestSchema, "CardSearchRequest");
emitSwift(CardSearchResponseSchema, "CardSearchResponse");
emitSwift(PriceRequestSchema, "PriceRequest");
emitSwift(PriceResponseSchema, "PriceResponse");
emitSwift(CertLookupRequestSchema, "CertLookupRequest");
emitSwift(CertLookupResponseSchema, "CertLookupResponse");
emitSwift(ChannelListingRequestSchema, "ChannelListingRequest");
emitSwift(ChannelListingResponseSchema, "ChannelListingResponse");
emitSwift(CatalogueLookupRequestSchema, "CatalogueLookupRequest");
emitSwift(CatalogueLookupResponseSchema, "CatalogueLookupResponse");
emitSwift(EntitlementSchema, "Entitlement");
emitSwift(VerificationEventRequestSchema, "VerificationEventRequest");
emitSwift(VerificationEventResponseSchema, "VerificationEventResponse");
emitSwift(InspectionDepthHintRequestSchema, "InspectionDepthHintRequest");
emitSwift(InspectionDepthHintResponseSchema, "InspectionDepthHintResponse");
emitSwift(SignedPhotoUrlRequestSchema, "SignedPhotoUrlRequest");
emitSwift(SignedPhotoUrlResponseSchema, "SignedPhotoUrlResponse");
emitSwift(PricingRuleSchema, "PricingRule");
emitSwift(PricingRuleInputSchema, "PricingRuleInput");
emitSwift(PricingRuleListResponseSchema, "PricingRuleListResponse");
emitSwift(ListingTemplateSchema, "ListingTemplate");
emitSwift(ListingTemplateInputSchema, "ListingTemplateInput");
emitSwift(ListingTemplateListResponseSchema, "ListingTemplateListResponse");
emitSwift(PricingBreakdownRequestSchema, "PricingBreakdownRequest");
emitSwift(PricingBreakdownResponseSchema, "PricingBreakdownResponse");
emitSwift(ProfileResponseSchema, "ProfileResponse");
emitSwift(ProfilePatchSchema, "ProfilePatch");


emitSwift(DecideRequestSchema, "DecideRequest");
emitSwift(DecideResponseSchema, "DecideResponse");
emitSwift(DecideBatchRequestSchema, "DecideBatchRequest");
emitSwift(DecideBatchResponseSchema, "DecideBatchResponse");
// card-value: NEVER GENERATED until 2026-09-02. v0.1.44 added pricingDegraded to
// CardValueResponse to fix the Base Set Pikachu no_market_value conflation, was tagged, made
// canonical and bumped across three repos — and could not reach either mobile client.
emitSwift(CardValueRequestSchema, "CardValueRequest");
emitSwift(CardValueResponseSchema, "CardValueResponse");
// reprice-flags: the dashboard is T3 web (0011), but "act on a flagged price" is T2 and a
// mobile client following an alert deep-link needs the per-card comparison. Generating a type
// commits no platform to a feature; NOT generating one blocks a lane silently.
emitSwift(RepricingFlagsResponseSchema, "RepricingFlagsResponse");
emitSwift(RepricingFlagSchema, "RepricingFlag");
// A standalone enum with no referent inside the contract, so nothing pulled it in: the tokens
// a listing template may contain were declared and reached no client.
emitSwift(ListingTemplateTokenSchema, "ListingTemplateToken");
emitSwift(EbayPublishRequestSchema, "EbayPublishRequest");
emitSwift(EbayPublishSuccessSchema, "EbayPublishSuccess");
emitSwift(EbayPublishErrorResponseSchema, "EbayPublishErrorResponse");
emitSwift(RepriceApplyRequestSchema, "RepriceApplyRequest");
emitSwift(RepriceApplyResponseSchema, "RepriceApplyResponse");
emitSwift(QuickScanRequestSchema, "QuickScanRequest");
emitSwift(QuickScanResponseSchema, "QuickScanResponse");

import { assertCoverage } from "./assert-coverage.js";
import * as allContracts from "../src/index.js";
// Runs AFTER every emit, and THROWS — so an unreachable module fails `npm run build` rather
// than being noticed by a lane months later. See assert-coverage.ts for why it discovers the
// surface instead of listing it.
assertCoverage("swift", allContracts as unknown as Record<string, unknown>);

const header = `// AUTO-GENERATED by scripts/gen-swift-api.ts from src/api/*.ts (Zod schemas) — do not edit by
// hand. Regenerate via \`npm run build\`. See README.md "Releasing a new version".

import Foundation

`;

const out = header + flush() + "\n";
const outDir = process.env.CURIO_CONTRACTS_OUT_DIR ?? join(root, "Sources/CurioContracts");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "APITypes.swift"), out);
console.log(`Wrote ${join(outDir, "APITypes.swift")}`);
