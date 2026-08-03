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

export const IdentifyRequestSchema = z.object({
  imageUrls: z.array(z.string()).min(1),
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
