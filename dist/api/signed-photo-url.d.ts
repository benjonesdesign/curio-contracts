import { z } from "zod";
export declare const SignedPhotoUrlRequestSchema: z.ZodObject<{
    /** Public card-photos URLs, exactly as stored in photo_urls/photo_thumb_urls. The server
     *  resolves each back to its Storage object path and verifies the caller's account owns the
     *  physical_card/card row that references it before signing — never trust a client-supplied
     *  path directly. */
    urls: z.ZodArray<z.ZodString, "many">;
    /** Seconds the signed URL stays valid. Omit for the display default (short — regenerated on
     *  every render, never persisted). A longer TTL is for a server-to-server consumer that needs
     *  the URL to outlive a single request (e.g. eBay/CardTrader fetching a listing image after
     *  publish) — capped at Supabase Storage's own signed-URL maximum. */
    ttlSeconds: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    urls: string[];
    ttlSeconds?: number | undefined;
}, {
    urls: string[];
    ttlSeconds?: number | undefined;
}>;
export type SignedPhotoUrlRequest = z.infer<typeof SignedPhotoUrlRequestSchema>;
export declare const SignedPhotoUrlResultSchema: z.ZodObject<{
    /** Echoes the requested public URL, so the caller can map results back to the photo it asked
     *  about without relying on array order. */
    url: z.ZodString;
    /** Null only when `error` is set — a stale, deleted, or not-owned-by-caller photo never
     *  silently resolves to someone else's image. */
    signedUrl: z.ZodNullable<z.ZodString>;
    error: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    error: string | null;
    url: string;
    signedUrl: string | null;
}, {
    error: string | null;
    url: string;
    signedUrl: string | null;
}>;
export type SignedPhotoUrlResult = z.infer<typeof SignedPhotoUrlResultSchema>;
export declare const SignedPhotoUrlResponseSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        /** Echoes the requested public URL, so the caller can map results back to the photo it asked
         *  about without relying on array order. */
        url: z.ZodString;
        /** Null only when `error` is set — a stale, deleted, or not-owned-by-caller photo never
         *  silently resolves to someone else's image. */
        signedUrl: z.ZodNullable<z.ZodString>;
        error: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        error: string | null;
        url: string;
        signedUrl: string | null;
    }, {
        error: string | null;
        url: string;
        signedUrl: string | null;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    results: {
        error: string | null;
        url: string;
        signedUrl: string | null;
    }[];
}, {
    results: {
        error: string | null;
        url: string;
        signedUrl: string | null;
    }[];
}>;
export type SignedPhotoUrlResponse = z.infer<typeof SignedPhotoUrlResponseSchema>;
