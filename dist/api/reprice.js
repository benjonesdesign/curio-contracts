// Contract for GET /api/reprice-flags (pokemon-tool) — WORK-BACKLOG.md Packet 5 (Inventory sync
// + repricing), the T3 web dashboard's on-demand read. The daily cron (app/api/cron/reprice)
// writes a per-account SUMMARY row into the shared `notifications` table (kind/deep_link, see
// curio-shared canon/specs/alerts.md) for push/inbox delivery — that stays as-is. This is a
// separate, richer PER-CARD shape (current price, market value, delta%, direction) the dashboard
// needs to list every currently-flagged listing and jump straight to editing it; both read the
// same underlying comparison (pokemon-tool's lib/reprice.ts), just shaped for a different consumer.
import { z } from "zod";
export const RepricingDirectionSchema = z.enum(["above", "below"]);
export const RepricingFlagSchema = z.object({
    cardId: z.string(),
    name: z.string(),
    setName: z.string().nullable(),
    cardNumber: z.string().nullable(),
    condition: z.string().nullable(),
    currentPriceGbp: z.number(),
    marketValueGbp: z.number(),
    deltaPct: z.number(),
    direction: RepricingDirectionSchema,
});
export const RepricingFlagsResponseSchema = z.object({
    flags: z.array(RepricingFlagSchema),
});
// ── POST /api/reprice-apply ─────────────────────────────────────────────────────────────────
//
// The money-writing half of W9. `reprice.ts` covered only the FLAGS shape until 2026-08-29; apply's
// request and response were local types in the route, which the CLAUDE.md rule permits and which is
// the wrong call for a route that writes prices to live marketplace listings and is consumed by
// three platforms.
//
// ⚠️ THE ROUTE WRITES `physical_cards.suggested_price` ITSELF, AND ONLY WHEN A CHANNEL SUCCEEDS.
// NO CLIENT MAY ALSO WRITE IT. A client that optimistically updated the DB would silently diverge
// our record from the listing the moment a channel call failed — an unlisted card, an expired
// token, a rejected price — which is EXACTLY the divergence this feature exists to close. The
// per-channel outcomes below are reported so a client can render what happened; they are not an
// invitation to reconcile the record itself.
export const RepriceApplyItemSchema = z.object({
    physicalCardId: z.string(),
    /** Must be > 0. A zero or negative price is rejected rather than clamped — silently correcting a
     *  money value a caller asked for is how a wrong number becomes an accepted one. */
    newPriceGbp: z.number().positive(),
});
export const RepriceApplyRequestSchema = z.object({
    items: z.array(RepriceApplyItemSchema).min(1).max(100),
    /**
     * Which eBay environment to write to. Omitted means production.
     *
     * Exists so this call can be proven in SANDBOX before it is trusted against a real listing: the
     * adapter hardcoded production until 2026-08-29, which made the one untested money-writing call
     * the one call that could not be exercised anywhere else. Sandbox is necessary and not
     * sufficient — eBay's sandbox diverges on policies and fees — so it is the first test, not the
     * only one.
     */
    environment: z.enum(["ebay_production", "ebay_sandbox"]).optional(),
});
export const RepriceChannelOutcomeSchema = z.object({
    channel: z.enum(["ebay", "cardtrader"]),
    ok: z.boolean(),
    error: z.string().optional(),
});
export const RepriceApplyResultSchema = z.object({
    physicalCardId: z.string(),
    /** True when AT LEAST ONE channel accepted the new price — which is also the condition under
     *  which the route updates `suggested_price`. The two are the same fact, deliberately. */
    ok: z.boolean(),
    /** Per-channel outcomes, so a client can say WHICH listing moved rather than "some did". */
    channels: z.array(RepriceChannelOutcomeSchema),
    error: z.string().optional(),
});
export const RepriceApplyResponseSchema = z.object({
    results: z.array(RepriceApplyResultSchema),
});
