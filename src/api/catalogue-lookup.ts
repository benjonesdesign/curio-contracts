// Contract for POST /api/catalogue-lookup (pokemon-tool) — WORK-BACKLOG.md Packet 9 (fast
// identify). A pure-DB catalogue match on OCR'd name + collector number, meant to answer in
// milliseconds so a caller (iOS's on-device-OCR fast-path, or web's typed name+number confirm)
// can skip the vision LLM call entirely on an unambiguous hit. Backed by pokemon-tool's existing
// `resolveCatalogueMatch()` (lib/catalogue/resolve.ts) for the name-first tiering, and — when
// `collectorNumber` is present — tried FIRST against W15 Tier 0's number-first resolver
// (lib/catalogue/resolve-by-number.ts), which is decisive from number+setCode alone even when no
// name was legible at all (curio-shared/canon/discovery/W15-identification-engine-discovery.md).
//
// No `candidates` list: the underlying resolvers always pick a single best row per confidence
// tier (exact tie-break, then arbitrary-but-deterministic) rather than returning several — so this
// only ever has one match or none. Add a `candidates` field later if a real ambiguous-tie-break
// need shows up; don't speculate one in now.
import { z } from "zod";
import { GameIdSchema, ConfidenceSchema } from "./common.js";

// NOTE: at least one of name/collectorNumber must be present — enforced by the route handler, not
// a schema-level .refine() (breaks the Swift codegen, see identify.ts's identical note).
export const CatalogueLookupRequestSchema = z.object({
  game: GameIdSchema,
  /** Optional as of W15 — a card whose collector number OCR'd cleanly but whose name did not
   * (stylised type, holo glare, foreign printing) can still resolve via Tier 0's number+setCode
   * path with no name at all. A caller with only a name keeps working exactly as before. */
  name: z.string().min(1).optional(),
  /** As printed, e.g. "4/102" — optional because a name-only lookup is still meaningful (lower
   * confidence tier), just never the highest-confidence exact tier. */
  collectorNumber: z.string().optional(),
  /** OCR'd set code printed on the card (e.g. "OTJ", "OBF") — W15 Tier 0's strongest set signal.
   * Tried ahead of the name-first resolver when `collectorNumber` is present. */
  setCode: z.string().optional(),
});
export type CatalogueLookupRequest = z.infer<typeof CatalogueLookupRequestSchema>;

export const CatalogueLookupMatchSchema = z.object({
  nativeId: z.string(),
  name: z.string(),
  setName: z.string().nullable(),
  cardNumber: z.string().nullable(),
  rarity: z.string().nullable(),
  language: z.string(),
  /** Reference image URL for the matched catalogue card (small/display size), sourced from the
   * catalogue provider (e.g. pokemontcg.io) that produced this match — see card-search.ts's
   * `image` field for the existing precedent. Display-only: callers must hotlink this URL, never
   * download/cache/re-host/store the artwork in our own storage (curio-shared/decisions/ ADR on
   * catalogue image display). Optional/nullable — additive, so older callers and matches without
   * a known image keep working. Confirm layout A (curio-shared canon/design/design-reference/
   * confirm-step.html) needs this to render the captured⇄matched side-by-side pair on both web
   * and iOS. */
  image: z.string().nullable().optional(),
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
