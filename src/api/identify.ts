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

// NOTE: at least one of imageUrls/inlineImages must be non-empty — enforced by the route handler
// (app/api/identify/route.ts), not a schema-level .refine(). The Swift codegen (scripts/
// zod-to-swift.ts) has no ZodEffects handling, so a top-level .refine() here would break the
// Swift build; keep this schema shape-only, like every other contract in this package.
export const IdentifyRequestSchema = z.object({
  /** Public URLs (Supabase Storage) — the original path. OpenAI fetches each URL itself before
   * inference, an extra network hop. */
  imageUrls: z.array(z.string()).optional(),
  /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — an alternative to `imageUrls` that
   * skips that fetch hop entirely. WORK-BACKLOG.md Packet 9 (fast identify). Either `imageUrls` or
   * `inlineImages` must be present (validated in the route handler); a caller should not mix both
   * in one request. */
  inlineImages: z.array(z.string()).optional(),
  taxonomyAspects: z.array(TaxonomyAspectSchema).optional(),
  imageHash: z.string().optional(),
  /** Seller-confirmed game (chooser flow) — fixes classification instead of auto-detecting. */
  game: z.string().optional(),
  /** Narrows auto-detection to the seller's enabled games. */
  games: z.array(z.string()).optional(),
});
export type IdentifyRequest = z.infer<typeof IdentifyRequestSchema>;

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
});
export type IdentifyResponse = z.infer<typeof IdentifyResponseSchema>;
