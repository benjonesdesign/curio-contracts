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
    comps: z.ZodNullable<z.ZodArray<z.ZodObject<{}, "passthrough", z.ZodTypeAny, z.objectOutputType<{}, z.ZodTypeAny, "passthrough">, z.objectInputType<{}, z.ZodTypeAny, "passthrough">>, "many">>;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    price_warning: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    low: number | null;
    confidence: "high" | "medium" | "low";
    avg: number | null;
    top: number | null;
    price_source: string | null;
    fx_rate: number | null;
    fx_date: string | null;
    sale_count: number | null;
    approx_sale_count: boolean | null;
    comps: z.objectOutputType<{}, z.ZodTypeAny, "passthrough">[] | null;
    price_warning: string | null;
    provider?: string | null | undefined;
}, {
    low: number | null;
    confidence: "high" | "medium" | "low";
    avg: number | null;
    top: number | null;
    price_source: string | null;
    fx_rate: number | null;
    fx_date: string | null;
    sale_count: number | null;
    approx_sale_count: boolean | null;
    comps: z.objectInputType<{}, z.ZodTypeAny, "passthrough">[] | null;
    price_warning: string | null;
    provider?: string | null | undefined;
}>;
export type PriceResponse = z.infer<typeof PriceResponseSchema>;
