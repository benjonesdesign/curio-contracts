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
} from "../src/api/decide.js";
import { LiquiditySchema } from "../src/api/common.js";
import { EntitlementSchema } from "../src/api/entitlement.js";
import { VerificationEventRequestSchema, VerificationEventResponseSchema } from "../src/api/verification-event.js";
import { InspectionDepthHintRequestSchema, InspectionDepthHintResponseSchema } from "../src/api/inspection-depth.js";
import { SignedPhotoUrlRequestSchema, SignedPhotoUrlResponseSchema, SignedPhotoUrlResultSchema } from "../src/api/signed-photo-url.js";
import { PricingRuleSchema, PricingRuleInputSchema, PricingRuleListResponseSchema } from "../src/api/pricing-rule.js";
import { ListingTemplateSchema, ListingTemplateInputSchema, ListingTemplateListResponseSchema } from "../src/api/listing-template.js";
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
registerName(DecisionSchema, "Decision");
registerName(DecisionEconomicsSchema, "DecisionEconomics");
registerName(DecisionAlternativeSchema, "DecisionAlternative");
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
emitSwift(QuickScanRequestSchema, "QuickScanRequest");
emitSwift(QuickScanResponseSchema, "QuickScanResponse");

const header = `// AUTO-GENERATED by scripts/gen-swift-api.ts from src/api/*.ts (Zod schemas) — do not edit by
// hand. Regenerate via \`npm run build\`. See README.md "Releasing a new version".

import Foundation

`;

const out = header + flush() + "\n";
const outDir = process.env.CURIO_CONTRACTS_OUT_DIR ?? join(root, "Sources/CurioContracts");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "APITypes.swift"), out);
console.log(`Wrote ${join(outDir, "APITypes.swift")}`);
