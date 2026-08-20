// Contract for POST /api/signed-photo-url (pokemon-tool) — curio-shared WORK-BACKLOG.md Packet 10
// (private card-photos storage, decisions/0018). The `card-photos` Storage bucket is currently
// public-read (no owner check) — this is the substrate for making it private without a breaking
// DB-shape change: `cards.photo_urls`/`physical_cards.photo_urls` keep storing the same public
// URL strings they always have (no path migration, no iOS decode change), and both platforms call
// this endpoint to exchange a stored public URL for a short-lived, owner-scoped signed URL to
// actually use for display or external distribution (e.g. an eBay listing image).
//
// Batched — a card grid or a multi-photo listing can need dozens of signed URLs in one render
// pass; one request avoids a round trip per photo. Partial failure is expected and handled
// per-URL (a stale/deleted photo shouldn't fail the whole batch) — see SignedPhotoUrlResult.
import { z } from "zod";
export const SignedPhotoUrlRequestSchema = z.object({
    /** Public card-photos URLs, exactly as stored in photo_urls/photo_thumb_urls. The server
     *  resolves each back to its Storage object path and verifies the caller's account owns the
     *  physical_card/card row that references it before signing — never trust a client-supplied
     *  path directly. */
    urls: z.array(z.string().min(1)).min(1).max(100),
    /** Seconds the signed URL stays valid. Omit for the display default (short — regenerated on
     *  every render, never persisted). A longer TTL is for a server-to-server consumer that needs
     *  the URL to outlive a single request (e.g. eBay/CardTrader fetching a listing image after
     *  publish) — capped at Supabase Storage's own signed-URL maximum. */
    ttlSeconds: z.number().int().positive().max(604800).optional(),
});
export const SignedPhotoUrlResultSchema = z.object({
    /** Echoes the requested public URL, so the caller can map results back to the photo it asked
     *  about without relying on array order. */
    url: z.string(),
    /** Null only when `error` is set — a stale, deleted, or not-owned-by-caller photo never
     *  silently resolves to someone else's image. */
    signedUrl: z.string().nullable(),
    error: z.string().nullable(),
});
export const SignedPhotoUrlResponseSchema = z.object({
    results: z.array(SignedPhotoUrlResultSchema),
});
