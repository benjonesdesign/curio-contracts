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

const header = `// AUTO-GENERATED by scripts/gen-kotlin-api.ts from src/api/*.ts (Zod schemas) — do not edit by
// hand. Regenerate via \`npm run build\`. See README.md "Releasing a new version".

package com.curio.contracts

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName
import kotlinx.serialization.json.JsonElement

`;

const out = header + flush() + "\n";
const outDir = process.env.CURIO_CONTRACTS_KOTLIN_OUT_DIR ?? join(root, "src/main/kotlin/com/curio/contracts");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "APITypes.kt"), out);
console.log(`Wrote ${join(outDir, "APITypes.kt")}`);
