// Contract for POST /api/catalogue-lookup (pokemon-tool) — WORK-BACKLOG.md Packet 9 (fast
// identify). A pure-DB catalogue match on OCR'd name + collector number, meant to answer in
// milliseconds so a caller (iOS's on-device-OCR fast-path, or web's typed name+number confirm)
// can skip the vision LLM call entirely on an unambiguous hit. Backed by pokemon-tool's existing
// `resolveCatalogueMatch()` (lib/catalogue/resolve.ts) — never a second matching implementation.
//
// No `candidates` list: the underlying resolver always picks a single best row per confidence
// tier (exact tie-break, then arbitrary-but-deterministic) rather than returning several — so this
// only ever has one match or none. Add a `candidates` field later if a real ambiguous-tie-break
// need shows up; don't speculate one in now.
import { z } from "zod";
import { GameIdSchema, ConfidenceSchema } from "./common.js";

export const CatalogueLookupRequestSchema = z.object({
  game: GameIdSchema,
  name: z.string().min(1),
  /** As printed, e.g. "4/102" — optional because a name-only lookup is still meaningful (lower
   * confidence tier), just never the highest-confidence exact tier. */
  collectorNumber: z.string().optional(),
});
export type CatalogueLookupRequest = z.infer<typeof CatalogueLookupRequestSchema>;

export const CatalogueLookupMatchSchema = z.object({
  nativeId: z.string(),
  name: z.string(),
  setName: z.string().nullable(),
  cardNumber: z.string().nullable(),
  rarity: z.string().nullable(),
  language: z.string(),
});
export type CatalogueLookupMatch = z.infer<typeof CatalogueLookupMatchSchema>;

export const CatalogueLookupResponseSchema = z.object({
  match: CatalogueLookupMatchSchema.nullable(),
  /** Null when there's no match at all. Mirrors the resolver's own tier confidence (high = number
   * + name both agree; medium = number+set or name-alone; low = fuzzy). A caller deciding whether
   * to skip the vision call should treat anything below "high" as NOT unambiguous. */
  confidence: ConfidenceSchema.nullable(),
});
export type CatalogueLookupResponse = z.infer<typeof CatalogueLookupResponseSchema>;
