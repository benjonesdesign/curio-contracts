import { z } from "zod";
export declare const PriceRequestSchema: z.ZodObject<{
    name: z.ZodString;
    set_name: z.ZodString;
    card_number: z.ZodString;
    condition: z.ZodOptional<z.ZodString>;
    tcg_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    tcgBaseline: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        tcp_market_usd: z.ZodNullable<z.ZodNumber>;
        cm_trend_eur: z.ZodNullable<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        tcp_market_usd: number | null;
        cm_trend_eur: number | null;
    }, {
        tcp_market_usd: number | null;
        cm_trend_eur: number | null;
    }>>>;
    /** Reprice: skip the finish-agnostic cache (read + write) so a finish correction gets a fresh,
     * variant-specific price and doesn't poison the shared cache for the other finish. */
    noCache: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    set_name: string;
    card_number: string;
    condition?: string | undefined;
    tcg_id?: string | null | undefined;
    tcgBaseline?: {
        tcp_market_usd: number | null;
        cm_trend_eur: number | null;
    } | null | undefined;
    noCache?: boolean | undefined;
}, {
    name: string;
    set_name: string;
    card_number: string;
    condition?: string | undefined;
    tcg_id?: string | null | undefined;
    tcgBaseline?: {
        tcp_market_usd: number | null;
        cm_trend_eur: number | null;
    } | null | undefined;
    noCache?: boolean | undefined;
}>;
export type PriceRequest = z.infer<typeof PriceRequestSchema>;
export declare const PriceResponseSchema: z.ZodObject<{
    low: z.ZodNullable<z.ZodNumber>;
    avg: z.ZodNullable<z.ZodNumber>;
    top: z.ZodNullable<z.ZodNumber>;
    price_source: z.ZodNullable<z.ZodString>;
    provider: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fx_rate: z.ZodNullable<z.ZodNumber>;
    fx_date: z.ZodNullable<z.ZodString>;
    sale_count: z.ZodNullable<z.ZodNumber>;
    approx_sale_count: z.ZodNullable<z.ZodBoolean>;
    comps: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>, "many">>>;
    confidence: z.ZodOptional<z.ZodEnum<["high", "medium", "low"]>>;
    price_warning: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Present + true only on a cache hit. */
    cached: z.ZodOptional<z.ZodBoolean>;
    /** Present + true only on the stale-cache fallback (all providers failed). */
    stale: z.ZodOptional<z.ZodBoolean>;
    /** Present only on the stale-cache fallback — when this cached price was last fetched. */
    fetched_at: z.ZodOptional<z.ZodString>;
    /** Present only on a genuine no-data response (no provider hit, no cache to fall back to). */
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    low: number | null;
    avg: number | null;
    top: number | null;
    price_source: string | null;
    fx_rate: number | null;
    fx_date: string | null;
    sale_count: number | null;
    approx_sale_count: boolean | null;
    error?: string | undefined;
    confidence?: "high" | "medium" | "low" | undefined;
    cached?: boolean | undefined;
    provider?: string | null | undefined;
    comps?: z.objectOutputType<{}, z.ZodTypeAny, "passthrough">[] | null | undefined;
    price_warning?: string | null | undefined;
    stale?: boolean | undefined;
    fetched_at?: string | undefined;
}, {
    low: number | null;
    avg: number | null;
    top: number | null;
    price_source: string | null;
    fx_rate: number | null;
    fx_date: string | null;
    sale_count: number | null;
    approx_sale_count: boolean | null;
    error?: string | undefined;
    confidence?: "high" | "medium" | "low" | undefined;
    cached?: boolean | undefined;
    provider?: string | null | undefined;
    comps?: z.objectInputType<{}, z.ZodTypeAny, "passthrough">[] | null | undefined;
    price_warning?: string | null | undefined;
    stale?: boolean | undefined;
    fetched_at?: string | undefined;
}>;
export type PriceResponse = z.infer<typeof PriceResponseSchema>;
