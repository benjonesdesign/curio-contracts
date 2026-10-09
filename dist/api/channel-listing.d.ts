import { z } from "zod";
export declare const ChannelSchema: z.ZodEnum<["cardtrader"]>;
export type Channel = z.infer<typeof ChannelSchema>;
export declare const ChannelListingRequestSchema: z.ZodObject<{
    channel: z.ZodEnum<["cardtrader"]>;
    /** physical_cards.id — the card being listed. */
    cardRef: z.ZodString;
    priceGbp: z.ZodNumber;
    condition: z.ZodString;
}, "strip", z.ZodTypeAny, {
    condition: string;
    channel: "cardtrader";
    cardRef: string;
    priceGbp: number;
}, {
    condition: string;
    channel: "cardtrader";
    cardRef: string;
    priceGbp: number;
}>;
export type ChannelListingRequest = z.infer<typeof ChannelListingRequestSchema>;
export declare const ChannelListingResponseSchema: z.ZodEffects<z.ZodObject<{
    channel: z.ZodEnum<["cardtrader"]>;
    /** The channel's own listing/product id. Null only when status is "failed". */
    channelListingId: z.ZodNullable<z.ZodString>;
    /** A public URL to the listing, when the channel's API exposes one. CardTrader's API does not
     * return a seller-facing listing URL — this is null for CardTrader today, not a bug. */
    url: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["listed", "failed"]>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** v0.2.0. The stable code of a refusal made BEFORE CardTrader was contacted, beside the
     *  existing envelope (the pokemon-tool route attaches it after parsing; this release makes it
     *  part of the contract). Null/absent on success and on a CardTrader-side failure. */
    code: z.ZodOptional<z.ZodNullable<z.ZodEnum<["card_not_listable", "game_not_available", "sku_required", "sku_unavailable", "card_read_failed", "card_not_found"]>>>;
    /** v0.2.0. Why, when `code` is `card_not_listable`. The same closed list as every other listing
     *  surface (listing-refusal.ts). */
    reason: z.ZodOptional<z.ZodNullable<z.ZodEnum<["mine", "set_aside", "unmatched", "condition_not_confirmed", "no_price", "no_sku", "game_not_available", "already_live"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
    code?: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found" | null | undefined;
    reason?: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null | undefined;
}, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
    code?: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found" | null | undefined;
    reason?: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null | undefined;
}>, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
    code?: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found" | null | undefined;
    reason?: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null | undefined;
}, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
    code?: "game_not_available" | "card_not_listable" | "sku_required" | "sku_unavailable" | "card_read_failed" | "card_not_found" | null | undefined;
    reason?: "no_price" | "game_not_available" | "mine" | "set_aside" | "unmatched" | "condition_not_confirmed" | "no_sku" | "already_live" | null | undefined;
}>;
export type ChannelListingResponse = z.infer<typeof ChannelListingResponseSchema>;
