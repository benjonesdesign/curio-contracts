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
const DetailImagePathSchema = z.object({
    side: z.enum(["front", "back"]).optional(),
    corner: z.string().optional(),
    region: z.string().optional(),
    /** Supabase Storage object path (bucket-relative), not a URL — see imagePaths below. */
    path: z.string(),
});
const InlineDetailImageSchema = z.object({
    side: z.enum(["front", "back"]).optional(),
    corner: z.string().optional(),
    dataUrl: z.string(),
});
// STRATEGIC-ROADMAP.md W2 §5.1 / curio-shared iOS ticket "iOS-W2-A" — a per-shot device-side
// signal (sharpness/glare/crop/skew/orientation/exposure + border-centring offsets where the quad
// was measurable), carried alongside the shot it describes. Shape-only, additive, and NOT keyed
// into imageUrls/inlineImages' existing front/back string fields (that would be a breaking
// reshape) — instead a flat array identifying its shot the same way DetailImageSchema does
// (side for front/back, corner/region for detail shots). Server authority: the server decides any
// grade/confidence weighting from this data — iOS only emits the descriptor, no grade computed on
// device. Today (2026-08) pokemon-tool stores this transport-only; no interpretation logic exists
// yet — see NEEDS-BEN.md / WORK-BACKLOG.md for status.
export const ShotQualityDescriptorSchema = z.object({
    side: z.enum(["front", "back"]).optional(),
    corner: z.string().optional(),
    region: z.string().optional(),
    /** 0–1 overall sharpness read (e.g. a device-side variance-of-Laplacian style signal) — higher
     * is sharper. */
    sharpness: z.number().min(0).max(1).optional(),
    glare: z.boolean().optional(),
    cropped: z.boolean().optional(),
    skewDegrees: z.number().optional(),
    orientation: z.enum(["correct", "rotated_90", "rotated_180", "rotated_270", "unknown"]).optional(),
    exposure: z.enum(["under", "over", "ok", "unknown"]).optional(),
    /** Border/centring offsets measured from the detected card quad, roughly -1..1 (negative = off
     * toward one edge) — device-side geometry, not a grade. Present only when the quad was
     * measurable. */
    centeringLR: z.number().optional(),
    centeringTB: z.number().optional(),
});
// NOTE: at least one of imageUrls/inlineImages must be present — enforced by the route handler
// (app/api/capture-commit/route.ts), not a schema-level .refine(). Keep this schema shape-only —
// see identify.ts's IdentifyRequestSchema comment for why (Swift codegen has no ZodEffects case).
export const CaptureCommitRequestSchema = z.object({
    /** Supabase Storage object paths (bucket-relative) — the preferred shape (decisions/0018
     * revision, ROADMAP-COORDINATION.md "iOS-W2-H"/COORD 2026-08-19: capture-commit moves to
     * object paths, not client-minted URLs — the client never mints or signs anything; the server
     * decides how each path is read/served per consumer: a service-role direct read for internal
     * AI processing, a short-TTL signed URL for display, and either a longer-TTL signed URL or an
     * eBay-hosted copy for eBay publish — see lib/storage/signedPhotoUrl.ts and
     * lib/ebay-media.ts). The server converts these to the same public-URL-shaped strings already
     * stored in cards.photo_urls/physical_cards.photo_urls (no DB-shape change) — see
     * lib/storage/photoPath.ts's publicUrlFromPath(). Prefer this over `imageUrls` for any new
     * caller. */
    imagePaths: z.object({
        front: z.string(),
        back: z.string(),
        details: z.array(DetailImagePathSchema).optional(),
    }).optional(),
    /** Legacy: public URLs (Supabase Storage) — the original path. Superseded by `imagePaths`;
     * kept only for callers that haven't migrated yet (decisions/0018 revision). */
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
    /** Per-shot capture-quality signals — see ShotQualityDescriptorSchema's doc comment. Optional;
     * older clients simply omit it. */
    shotQuality: z.array(ShotQualityDescriptorSchema).optional(),
});
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
