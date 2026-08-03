// Contract for POST /api/capture-commit (pokemon-tool) — the iOS "commit a captured card into
// inventory" call. Runs identify → price → condition server-side, then writes the full inventory
// graph. See pokemon-tool's app/api/capture-commit/route.ts and IOS-CAPTURE-COMMIT-HANDOFF.md.
import { z } from "zod";

const DetailImageSchema = z.object({
  side: z.enum(["front", "back"]).optional(),
  corner: z.string().optional(),
  /** Legacy region tag — older clients only. Prefer `corner`. */
  region: z.string().optional(),
  url: z.string(),
});

export const CaptureCommitRequestSchema = z.object({
  imageUrls: z.object({
    front: z.string(),
    back: z.string(),
    details: z.array(DetailImageSchema).optional(),
  }),
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
