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
// WHO MAY CALL IT (product owner ruling, 26 Oct 2026, reversible, Ben can overrule): an ANONYMOUS Quick Scan may call this route. It has
// no AI cost, and Ben's rule that anonymous never calls the AI is about AI spend (FOR-BEN 119). Conditions: a per-IP / per-device rate
// limit on the route (provisional: 30 requests per 5 minutes anonymous, 120 per 5 minutes signed in); the image is discarded after
// fingerprinting; neither the image nor its fingerprint is logged or stored against a user; the response reveals no more than the
// existing CatalogueLookupMatch fields.
//
// WHAT IS SENT: one JPEG of the WHOLE CARD, already cropped and upright by the app's whole-card crop (the same crop the Quick
// Scan guide needs; a raw photo with a table around it will not match). The tolerance (within about 2 degrees and 2% of the frame, and
// what the app does when it cannot meet it) is in docs/IDENTIFY-MATCH-CROP-SPEC.md. The server computes a fingerprint, ranks, and DISCARDS
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
export const IdentifyMatchCandidateSchema = z.object({
    /** The catalogue card, in the shape /api/catalogue-lookup already returns (nativeId, name, set, number, rarity, language, image). */
    match: CatalogueLookupMatchSchema,
    /** 0 to 1, higher is more alike. Comparable ONLY within one response: it is not a probability and not stable across index versions. */
    score: z.number().min(0).max(1),
});
/** Why there are no candidates. Closed, forward-compatible (a client treats an unknown value as "no picture match"). */
export const IdentifyMatchUnavailableReasonSchema = z.enum([
    "index_not_ready", // the fingerprint index does not exist yet, or is being rebuilt: fall through to the next tier
    "game_not_indexed", // this game has no index
    "image_unreadable", // not a decodable JPEG
    "image_too_large", // over the size limit
    "no_match", // the index answered and nothing was close enough
    "crop_loose", // the server's own check says the crop was outside the tolerance, so it will not answer (see `crop`)
]);
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
    /** The SERVER's own read of the crop it was sent, so the app can learn which of its detected quads are good (docs/IDENTIFY-MATCH-CROP-SPEC.md):
     *  "ok" = it looks within the tolerance; "loose" = it looks outside it (a re-framed copy of the image matched noticeably better), so any
     *  candidates are less reliable and `unavailableReason` may be "crop_loose"; "unknown" = not assessed. The first server version always says
     *  "unknown"; the check and its threshold come from real photos. Omitted means "unknown". */
    crop: z.enum(["ok", "loose", "unknown"]).default("unknown"),
}).superRefine((r, ctx) => {
    if (r.unavailableReason !== null && (r.candidates.length > 0 || r.confidence !== null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["unavailableReason"], message: "an unavailable answer has no candidates and no confidence" });
    }
    if (r.unavailableReason === null && r.candidates.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["candidates"], message: "no candidates needs an unavailableReason (use no_match)" });
    }
    if (r.unavailableReason === "crop_loose" && r.crop !== "loose") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["crop"], message: "crop_loose is the answer for a loose crop: crop must be loose" });
    }
    if (r.candidates.length > 0 && r.confidence === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["confidence"], message: "candidates need a confidence" });
    }
});
