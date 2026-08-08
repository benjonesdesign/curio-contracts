// Contract for POST /api/capture-commit (pokemon-tool) — the iOS "commit a captured card into
// inventory" call. Runs identify → price → condition server-side, then writes the full inventory
// graph. See pokemon-tool's app/api/capture-commit/route.ts and IOS-CAPTURE-COMMIT-HANDOFF.md.
import { z } from "zod";
import { CatalogueLookupMatchSchema } from "./catalogue-lookup.js";
import { GameIdSchema } from "./common.js";

const DetailImageSchema = z.object({
  side: z.enum(["front", "back"]).optional(),
  corner: z.string().optional(),
  /** Legacy region tag — older clients only. Prefer `corner`. */
  region: z.string().optional(),
  url: z.string(),
});

const InlineDetailImageSchema = z.object({
  side: z.enum(["front", "back"]).optional(),
  corner: z.string().optional(),
  dataUrl: z.string(),
});

// NOTE: at least one of imageUrls/inlineImages must be present — enforced by the route handler
// (app/api/capture-commit/route.ts), not a schema-level .refine(). Keep this schema shape-only —
// see identify.ts's IdentifyRequestSchema comment for why (Swift codegen has no ZodEffects case).
export const CaptureCommitRequestSchema = z.object({
  /** Public URLs (Supabase Storage) — the original path. */
  imageUrls: z.object({
    front: z.string(),
    back: z.string(),
    details: z.array(DetailImageSchema).optional(),
  }).optional(),
  /** Inline base64 data URLs (`data:image/jpeg;base64,...`) — an alternative to `imageUrls` that
   * skips the storage-upload + fetch round trip, forwarded straight through to /api/identify's own
   * `inlineImages`. WORK-BACKLOG.md Packet 9 (fast identify). Mirrors `imageUrls`' front/back/
   * details shape so the server can preserve role ordering when it builds the flat array `/api/
   * identify` expects; a caller should send either this or `imageUrls`, not both. */
  inlineImages: z.object({
    front: z.string(),
    back: z.string(),
    details: z.array(InlineDetailImageSchema).optional(),
  }).optional(),
  /** An already-resolved identity — e.g. iOS's on-device OCR read the printed name + collector
   * number and got an unambiguous hit from the catalogue-lookup endpoint. When present, the server
   * skips its own /api/identify (vision) call entirely and commits directly against this match —
   * the real unit-economics win this packet is chasing (fewer paid vision calls, not just lower
   * latency on the ones that still happen). Reuses CatalogueLookupMatchSchema rather than a
   * parallel identity shape, since it's exactly a resolved catalogue match. */
  resolvedMatch: CatalogueLookupMatchSchema.optional(),
  /** Required alongside `resolvedMatch` — the match itself carries no game (it's already scoped to
   * one game by the catalogue-lookup call that produced it), but the server needs it to route
   * pricing (registry cataloguer vs. Pokémon's TCG-lookup chain) once vision is skipped. Optional
   * here (shape-only; enforced in the route handler) since a normal identify-driven commit doesn't
   * need it — the vision call detects the game itself. */
  game: GameIdSchema.optional(),
  ocr: z.object({ name: z.string().optional(), number: z.string().optional() }).optional(),
  purchaseCost: z.number().optional(),
  collectionType: z.enum(["personal", "resale"]).optional(),
});
export type CaptureCommitRequest = z.infer<typeof CaptureCommitRequestSchema>;

const EbaySchema = z.object({
  low: z.number().nullable(),
  avg: z.number().nullable(),
  top: z.number().nullable(),
});

export const CaptureCommitResponseSchema = z.object({
  physicalCardId: z.string(),
  legacyCardId: z.string().nullable(),
  game: z.string(),
  gameDisplayName: z.string(),
  name: z.string(),
  setName: z.string().nullable(),
  cardNumber: z.string().nullable(),
  condition: z.string().nullable(),
  rarity: z.string().nullable(),
  suggestedPrice: z.number().nullable(),
  ebay: EbaySchema.nullable(),
  subGrades: z.record(z.string(), z.unknown()).nullable(),
});
export type CaptureCommitResponse = z.infer<typeof CaptureCommitResponseSchema>;
