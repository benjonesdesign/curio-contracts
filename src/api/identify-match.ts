// Contract for POST /api/identify/match (pokemon-tool): W15 Tier 1, PICTURE MATCHING. DRAFT, PROVISIONAL, v0.2.3, additive.
//
// Where it sits in the cascade (LANE-REPORTS/W15-RESTART-BRIEF-2026-10-18.md): Tier 0 reads the bottom line on the device
// (set code and number) and asks /api/catalogue-lookup; Tier 1 (this) matches the PICTURE of the card against the catalogue
// when Tier 0 could not decide; the AI identify call is the last resort. A client may STUB this route today: it always answers
// the shape below, and until the index exists it answers `unavailableReason: "index_not_ready"` with no candidates.
//
// WHAT IS PROVISIONAL: the SHAPE is what a client can build against. The `confidence` rule and the score thresholds come from the
// W15 spike's measured top-1 / top-5 accuracy and are not fixed yet. A client must treat anything below "high" as "show the
// candidates, let the seller tap", exactly as it treats /api/catalogue-lookup's `candidates`.
//
// WHAT PICTURE MATCHING CANNOT DO: it identifies the ARTWORK. It cannot tell a holo from a reverse holo, nor two printings of one
// art in different sets. `variantUndecided` says so, and the printed number / set code (on-device OCR, or the seller) decides the
// variant. A client must never present a picture match as having chosen the variant.
//
// WHAT IS SENT: one JPEG of the WHOLE CARD, already cropped and upright by the app's whole-card crop (the same crop the Quick
// Scan guide needs; a raw photo with a table around it will not match). The server computes a fingerprint, ranks, and DISCARDS
// the image: nothing is stored. The catalogue's own images are never stored either, only fingerprints derived from them (the R4
// catalogue-source legal line is a Ben decision before any fingerprint table exists).
import { z } from "zod";
import { GameIdSchema, ConfidenceSchema } from "./common.js";
import { CatalogueLookupMatchSchema } from "./catalogue-lookup.js";

export const IdentifyMatchRequestSchema = z.object({
  /** A narrowing hint. Only Pokémon has an index to start; any other game answers `game_not_indexed`. Defaults to "pokemon". */
  game: GameIdSchema.optional(),
  /** Base64 of ONE JPEG, the whole card cropped and upright. Keep it small (about 400 px on the long side is enough): over
   *  ~400 KB decoded is refused as `image_too_large`. No data-URL prefix. */
  image: z.string().min(1),
  /** Optional text read on the device, used to NARROW the candidates before ranking when present. Never required. */
  setCode: z.string().optional(),
  collectorNumber: z.string().optional(),
});
export type IdentifyMatchRequest = z.infer<typeof IdentifyMatchRequestSchema>;

export const IdentifyMatchCandidateSchema = z.object({
  /** The catalogue card, in the shape /api/catalogue-lookup already returns (nativeId, name, set, number, rarity, language, image). */
  match: CatalogueLookupMatchSchema,
  /** 0 to 1, higher is more alike. Comparable ONLY within one response: it is not a probability and not stable across index versions. */
  score: z.number().min(0).max(1),
});
export type IdentifyMatchCandidate = z.infer<typeof IdentifyMatchCandidateSchema>;

/** Why there are no candidates. Closed, forward-compatible (a client treats an unknown value as "no picture match"). */
export const IdentifyMatchUnavailableReasonSchema = z.enum([
  "index_not_ready",    // the fingerprint index does not exist yet, or is being rebuilt: fall through to the next tier
  "game_not_indexed",   // this game has no index
  "image_unreadable",   // not a decodable JPEG
  "image_too_large",    // over the size limit
  "no_match",           // the index answered and nothing was close enough
]);
export type IdentifyMatchUnavailableReason = z.infer<typeof IdentifyMatchUnavailableReasonSchema>;

export const IdentifyMatchResponseSchema = z.object({
  /** Best first, at most 5. Empty exactly when `unavailableReason` is set. */
  candidates: z.array(IdentifyMatchCandidateSchema).max(5).default([]),
  /** null when there are no candidates. "high" = one candidate stands clear of the rest (and agrees with `setCode` /
   *  `collectorNumber` when those were sent): a client may skip the AI call. Anything lower: show the candidates. */
  confidence: ConfidenceSchema.nullable(),
  /** True when the top candidates share the same artwork, so the picture cannot settle which printing or finish it is. */
  variantUndecided: z.boolean(),
  unavailableReason: IdentifyMatchUnavailableReasonSchema.nullable(),
  /** Which index answered (for the scan trace and for comparing runs); null when none did. */
  indexVersion: z.string().nullable(),
}).superRefine((r, ctx) => {
  if (r.unavailableReason !== null && (r.candidates.length > 0 || r.confidence !== null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unavailableReason"], message: "an unavailable answer has no candidates and no confidence" });
  }
  if (r.unavailableReason === null && r.candidates.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["candidates"], message: "no candidates needs an unavailableReason (use no_match)" });
  }
  if (r.candidates.length > 0 && r.confidence === null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confidence"], message: "candidates need a confidence" });
  }
});
export type IdentifyMatchResponse = z.infer<typeof IdentifyMatchResponseSchema>;
