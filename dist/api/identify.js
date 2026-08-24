// Contract for POST /api/identify (pokemon-tool). One vision call classifies the game and reads
// every printed field + flaws off a card photo. See curio-shared/canon/specs/capture-flow.md for
// the UX this feeds, and pokemon-tool's app/api/identify/route.ts for the implementation.
import { z } from "zod";
import { GameIdSchema, ConditionSchema, ConfidenceSchema } from "./common.js";
const TaxonomyAspectSchema = z.object({
    localizedAspectName: z.string(),
    aspectConstraint: z.object({ aspectMode: z.string().optional() }).optional(),
    aspectValues: z.array(z.object({ localizedValue: z.string() })).optional(),
});
// NOTE: at least one of imagePaths/imageUrls/inlineImages must be non-empty — enforced by the
// route handler (app/api/identify/route.ts), not a schema-level .refine(). The Swift codegen
// (scripts/zod-to-swift.ts) has no ZodEffects handling, so a top-level .refine() here would break
// the Swift build; keep this schema shape-only, like every other contract in this package.
export const IdentifyRequestSchema = z.object({
    /** Supabase Storage object paths (bucket-relative, e.g. "a1b2c3_master.webp") — the preferred
     * shape (decisions/0018 revision, ROADMAP-COORDINATION.md "iOS-W2-H"/COORD 2026-08-19: capture
     * analysis moves to object paths, not client-minted URLs, so the server decides how each image
     * is read — no client-side signature to go stale). The server reads these directly with the
     * service role (never a signed URL, since OpenAI itself never sees the path — the server
     * downloads the bytes and sends them inline) and treats them exactly like `inlineImages` from
     * that point on. Prefer this over `imageUrls` for any new caller. */
    imagePaths: z.array(z.string()).optional(),
    /** Legacy: public URLs (Supabase Storage). OpenAI fetches each URL itself before inference, an
     * extra network hop — and depends on the bucket staying public. Superseded by `imagePaths`;
     * kept only for callers that haven't migrated yet (decisions/0018 revision). */
    imageUrls: z.array(z.string()).optional(),
    /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — skips both the fetch hop and the
     * service-role read. WORK-BACKLOG.md Packet 9 (fast identify). Exactly one of `imagePaths`/
     * `imageUrls`/`inlineImages` should be present per request (validated in the route handler). */
    inlineImages: z.array(z.string()).optional(),
    taxonomyAspects: z.array(TaxonomyAspectSchema).optional(),
    imageHash: z.string().optional(),
    /** Seller-confirmed game (chooser flow) — fixes classification instead of auto-detecting. */
    game: z.string().optional(),
    /** Narrows auto-detection to the seller's enabled games. */
    games: z.array(z.string()).optional(),
    // W15 Tier 0 (curio-shared/canon/discovery/W15-identification-engine-discovery.md): OCR'd text
    // read off the card BEFORE any vision call, enabling a deterministic catalogue lookup
    // (pokemon-tool's lib/catalogue/resolve-by-number.ts) ahead of the AI tier. All optional — a
    // caller with no OCR capability (or an unread card) simply omits these and the route falls
    // through to vision exactly as today. None of these are trusted as ground truth: they are
    // catalogue-lookup keys only, matched against real rows or discarded, never persisted as-is.
    /** OCR'd collector number, e.g. "025/165" or "RA04-EN053". Required for Tier 0 to run at all. */
    ocrCardNumber: z.string().optional(),
    /** OCR'd set code printed on the card (e.g. "OTJ", "OBF") — the strongest set signal OCR can
     * read; matched against catalogue_sets.printed_code first, then set_code. */
    ocrSetCode: z.string().optional(),
    /** OCR'd set name, when legible. */
    ocrSetName: z.string().optional(),
    /** OCR'd card name, when legible — used only to break ties within Tier 0, never required. */
    ocrName: z.string().optional(),
});
const FlawSchema = z.object({
    description: z.string(),
    region: z.string(),
    side: z.enum(["front", "back", "unknown"]),
    x: z.number(),
    y: z.number(),
    w: z.number(),
    h: z.number(),
    severity: z.enum(["minor", "moderate", "major"]),
});
const ImageRolesSchema = z.object({
    front: z.number().int(),
    back: z.number().int().nullable(),
    details: z.array(z.number().int()),
});
const FieldSourceSchema = z.object({
    source: z.enum(["vision", "seller"]),
    confidence: z.string().nullable(),
});
const ApiUsageSchema = z.object({
    model: z.enum(["gpt-4o", "gpt-4o-mini"]),
    escalated: z.boolean(),
    input_tokens: z.number().int(),
    output_tokens: z.number().int(),
    estimated_cost_usd: z.number(),
    cached: z.boolean(),
});
export const IdentifyResponseSchema = z.object({
    game: GameIdSchema.or(z.string()),
    game_confidence: ConfidenceSchema,
    game_low_confidence: z.boolean(),
    name: z.string(),
    set_name: z.string().nullable(),
    card_number: z.string().nullable(),
    card_type: z.string().nullable(),
    estimated_grade: ConditionSchema.or(z.string()),
    confidence: ConfidenceSchema,
    attributes: z.array(z.string()),
    is_promo: z.boolean(),
    language: z.string(),
    rarity: z.string().nullable(),
    image_roles: ImageRolesSchema,
    flaws: z.array(FlawSchema),
    field_sources: z.record(z.string(), FieldSourceSchema).optional(),
    _api_usage: ApiUsageSchema.optional(),
    /** Present + true only on a process-cache hit (same image URLs + game seen before). */
    cached: z.boolean().optional(),
    /** How this result was produced. "tier0" = deterministic catalogue lookup
     * (lib/catalogue/resolve-by-number.ts), no model call, no possibility of a fabricated identity.
     * "vision" = the existing AI path. Absent on responses from before this field existed. */
    tier: z.enum(["tier0", "vision"]).optional(),
    /** True when this result was produced without calling the AI vision model — the business
     * metric W15 exists to move. Always true when tier === "tier0"; present so a caller doesn't
     * need to know the tier enum to report the number that matters. */
    ai_call_avoided: z.boolean().optional(),
});
// W15 Tier 0 — a bounded, ambiguous catalogue match. Deliberately NOT a variant of
// IdentifyResponseSchema: an ambiguous result has no definitive name/game/set to report, and
// forcing one into IdentifyResponseSchema's required fields would mean inventing a guess to
// satisfy the schema — the exact failure mode Tier 0 exists to prevent. The route returns this
// shape instead and the caller renders a one-tap picker; it must never trigger a model call to
// break the tie (cheaper, faster and more honest than AI disambiguation).
export const IdentifyCandidateSchema = z.object({
    game: GameIdSchema.or(z.string()),
    name: z.string(),
    setName: z.string().nullable(),
    cardNumber: z.string().nullable(),
    /** Catalogue row id — pass back verbatim when the seller taps a candidate, to resolve without
     * re-querying. */
    nativeId: z.string(),
});
export const IdentifyAmbiguousTierSchema = z.enum(["ambiguous"]);
export const IdentifyAmbiguousResponseSchema = z.object({
    tier: IdentifyAmbiguousTierSchema,
    candidates: z.array(IdentifyCandidateSchema),
});
