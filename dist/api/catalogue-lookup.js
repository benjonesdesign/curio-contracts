// Contract for POST /api/catalogue-lookup (pokemon-tool) — WORK-BACKLOG.md Packet 9 (fast
// identify). A pure-DB catalogue match on OCR'd name + collector number, meant to answer in
// milliseconds so a caller (iOS's on-device-OCR fast-path, or web's typed name+number confirm)
// can skip the vision LLM call entirely on an unambiguous hit. Backed by pokemon-tool's existing
// `resolveCatalogueMatch()` (lib/catalogue/resolve.ts) for the name-first tiering, and — when
// `collectorNumber` is present — tried FIRST against W15 Tier 0's number-first resolver
// (lib/catalogue/resolve-by-number.ts), which is decisive from number+setCode alone even when no
// name was legible at all (curio-shared/canon/discovery/W15-identification-engine-discovery.md).
//
// `game` is a narrowing HINT, not a filter (ROADMAP-COORDINATION.md "Tier 0 returns a confident
// WRONG match", 2026-08-26): printed number+set is 99.31% unique across ALL games combined
// (166,041-row measurement), so requiring the caller to know the game before scanning throws away
// almost no precision while blocking every caller that can't supply one — iOS now sends none at
// all. `candidates` exists for the residual ambiguous case (the resolver already computes them;
// this contract used to drop them on the floor) — surfaced with `game` on each one as the visible
// differentiator, since the caller can't silently pick between, say, an MTG and a Lorcana card
// that happen to share a bare number.
import { z } from "zod";
import { GameIdSchema, ConfidenceSchema } from "./common.js";
// NOTE: at least one of name/collectorNumber must be present — enforced by the route handler, not
// a schema-level .refine() (breaks the Swift codegen, see identify.ts's identical note).
export const CatalogueLookupRequestSchema = z.object({
    /** Optional — a narrowing HINT when the caller happens to know it (e.g. deep in a
     * game-specific flow), never a precondition to looking a card up. Omit it and the resolver
     * searches every game; a supplied game only breaks a genuine cross-game tie, it can never
     * exclude the right answer in a different game. */
    game: GameIdSchema.optional(),
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
export const CatalogueLookupMatchSchema = z.object({
    /** Which game this match actually belongs to — the route always populates it once matched
     * (a game-optional lookup can resolve to any of them, and the follow-up `/api/quick-scan` call
     * should use THIS value, not whatever the client originally guessed). Optional/nullable —
     * additive, same shape as `image`, so older callers and matches built before this field existed
     * keep validating. */
    game: GameIdSchema.nullable().optional(),
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
export const CatalogueLookupResponseSchema = z.object({
    match: CatalogueLookupMatchSchema.nullable(),
    /** Null when there's no match at all. Mirrors the resolver's own tier confidence (high = number
     * + name both agree; medium = number+set or name-alone; low = fuzzy). A caller deciding whether
     * to skip the vision call should treat anything below "high" as NOT unambiguous. */
    confidence: ConfidenceSchema.nullable(),
    /** Populated only on a genuine cross-candidate tie (`match` is null when this is non-empty) —
     * a bounded picker, never a model call to break the tie. Each candidate's `game` is the visible
     * differentiator the seller taps between (e.g. "Windsinger (MTG)" vs "…(Lorcana)"). Defaults to
     * empty so a caller can treat "no candidates" and "field omitted" identically without a null
     * check, and so a response built before this field existed still validates. */
    candidates: z.array(CatalogueLookupMatchSchema).default([]),
});
