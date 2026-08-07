// Contract for POST /api/channel-listing (pokemon-tool) — WORK-BACKLOG.md Packet 4 (one second
// sales channel). A channel-agnostic listing request/response so adding a second or third channel
// later reuses this shape instead of reshaping it. CardTrader only for now (Ben's decision,
// 2026-08-04 — NEEDS-BEN.md) — `channel` is a literal union of one today so adding another channel
// (e.g. Whatnot) is a non-breaking enum extension. T3 web-only (decisions/0011) — no iOS UI, but
// the contract still lives here since it's the coordination boundary decisions/0012 requires for
// any shared shape, even a web-only one.
import { z } from "zod";
export const ChannelSchema = z.enum(["cardtrader"]);
export const ChannelListingRequestSchema = z.object({
    channel: ChannelSchema,
    /** physical_cards.id — the card being listed. */
    cardRef: z.string().min(1),
    priceGbp: z.number().positive(),
    condition: z.string().min(1),
});
export const ChannelListingResponseSchema = z.object({
    channel: ChannelSchema,
    /** The channel's own listing/product id. Null only when status is "failed". */
    channelListingId: z.string().nullable(),
    /** A public URL to the listing, when the channel's API exposes one. CardTrader's API does not
     * return a seller-facing listing URL — this is null for CardTrader today, not a bug. */
    url: z.string().nullable(),
    status: z.enum(["listed", "failed"]),
    error: z.string().nullable().optional(),
});
