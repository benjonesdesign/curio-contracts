// Contract for POST /api/channel-listing (pokemon-tool) — WORK-BACKLOG.md Packet 4 (one second
// sales channel). A channel-agnostic listing request/response so adding a second or third channel
// later reuses this shape instead of reshaping it. CardTrader only for now (Ben's decision,
// 2026-08-04 — NEEDS-BEN.md) — `channel` is a literal union of one today so adding another channel
// (e.g. Whatnot) is a non-breaking enum extension. T3 web-only (decisions/0011) — no iOS UI, but
// the contract still lives here since it's the coordination boundary decisions/0012 requires for
// any shared shape, even a web-only one.
import { z } from "zod";
import { ListingRefusalCodeSchema, ListingRefusalReasonSchema } from "./listing-refusal.js";
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
    /** v0.2.0. The stable code of a refusal made BEFORE CardTrader was contacted, beside the
     *  existing envelope (the pokemon-tool route attaches it after parsing; this release makes it
     *  part of the contract). Null/absent on success and on a CardTrader-side failure. */
    code: ListingRefusalCodeSchema.nullable().optional(),
    /** v0.2.0. Why, when `code` is `card_not_listable`. The same closed list as every other listing
     *  surface (listing-refusal.ts). */
    reason: ListingRefusalReasonSchema.nullable().optional(),
}).superRefine((r, ctx) => {
    const notListable = r.code === "card_not_listable";
    if (notListable !== (r.reason != null)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["reason"],
            message: notListable
                ? "code is card_not_listable, so reason is required: a refusal must say why"
                : "reason is set but code is not card_not_listable: only that code carries a reason" });
    }
    if (r.code != null && r.status !== "failed") {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["code"],
            message: "a refusal code belongs to a failed listing, not a listed one" });
    }
});
