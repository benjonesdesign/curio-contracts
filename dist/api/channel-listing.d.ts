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
export declare const ChannelListingResponseSchema: z.ZodObject<{
    channel: z.ZodEnum<["cardtrader"]>;
    /** The channel's own listing/product id. Null only when status is "failed". */
    channelListingId: z.ZodNullable<z.ZodString>;
    /** A public URL to the listing, when the channel's API exposes one. CardTrader's API does not
     * return a seller-facing listing URL — this is null for CardTrader today, not a bug. */
    url: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<["listed", "failed"]>;
    error: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
}, {
    status: "listed" | "failed";
    url: string | null;
    channel: "cardtrader";
    channelListingId: string | null;
    error?: string | null | undefined;
}>;
export type ChannelListingResponse = z.infer<typeof ChannelListingResponseSchema>;
