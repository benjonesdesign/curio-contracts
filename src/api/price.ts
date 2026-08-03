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
});
export type PriceRequest = z.infer<typeof PriceRequestSchema>;

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
  comps: z.array(CompSchema).nullable(),
  confidence: ConfidenceSchema,
  price_warning: z.string().nullable(),
});
export type PriceResponse = z.infer<typeof PriceResponseSchema>;
