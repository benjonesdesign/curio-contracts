// Contract for POST /api/price (pokemon-tool) — Pokémon EN price lookup (eBay-UK-sold →
// PokeTrace → pokemontcg.io catalogue baseline chain). See pokemon-tool's app/api/price/route.ts.
// Non-Pokémon games price via the registry cataloguer chain (estimateGamePrice) rather than this
// route — see curio-shared/canon/specs/catalogue-ownership.md.
import { z } from "zod";
import { ConfidenceSchema } from "./common.js";
export const PriceRequestSchema = z.object({
    name: z.string(),
    set_name: z.string(),
    card_number: z.string(),
    condition: z.string().optional(),
    tcg_id: z.string().nullable().optional(),
    tcgBaseline: z
        .object({
        tcp_market_usd: z.number().nullable(),
        cm_trend_eur: z.number().nullable(),
    })
        .nullable()
        .optional(),
    /** Reprice: skip the finish-agnostic cache (read + write) so a finish correction gets a fresh,
     * variant-specific price and doesn't poison the shared cache for the other finish. */
    noCache: z.boolean().optional(),
});
const CompSchema = z.object({}).passthrough();
export const PriceResponseSchema = z.object({
    low: z.number().nullable(),
    avg: z.number().nullable(),
    top: z.number().nullable(),
    price_source: z.string().nullable(),
    provider: z.string().nullable().optional(),
    fx_rate: z.number().nullable(),
    fx_date: z.string().nullable(),
    sale_count: z.number().int().nullable(),
    approx_sale_count: z.boolean().nullable(),
    // Cached rows don't always carry every column that's technically part of the cache table's
    // select (e.g. an older cached row predating a column, or a stale row selected with a narrower
    // column list) — optional rather than a hard requirement.
    comps: z.array(CompSchema).nullable().optional(),
    // Only present on the fully-computed path — a cache hit or stale-cache fallback returns the
    // cached row as-is, which doesn't carry these (see pokemon-tool's app/api/price/route.ts).
    confidence: ConfidenceSchema.optional(),
    price_warning: z.string().nullable().optional(),
    /** Present + true only on a cache hit. */
    cached: z.boolean().optional(),
    /** Present + true only on the stale-cache fallback (all providers failed). */
    stale: z.boolean().optional(),
    /** Present only on the stale-cache fallback — when this cached price was last fetched. */
    fetched_at: z.string().optional(),
    /** Present only on a genuine no-data response (no provider hit, no cache to fall back to). */
    error: z.string().optional(),
});
