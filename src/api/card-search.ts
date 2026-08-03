// Contract for POST /api/card-search (pokemon-tool) — cross-game typeahead search, the mobile
// "look up a card" sourcing tool. This is the route iOS's hand-mirrored `CardSearchResult` decoder
// (SupabaseService.swift) duplicated — retired in favour of this contract. See
// pokemon-tool's app/api/card-search/route.ts.
import { z } from "zod";

export const CardSearchRequestSchema = z.object({
  q: z.string(),
  game: z.string().optional(),
});
export type CardSearchRequest = z.infer<typeof CardSearchRequestSchema>;

const PrintingSchema = z.object({
  tcgId: z.string(),
  setName: z.string().nullable(),
  number: z.string().nullable(),
  rarity: z.string().nullable(),
  image: z.string().nullable(),
  marketGbp: z.number().nullable(),
});

export const CardSearchResultSchema = z.object({
  tcgId: z.string(),
  name: z.string(),
  setName: z.string().nullable(),
  number: z.string().nullable(),
  rarity: z.string().nullable(),
  image: z.string().nullable(),
  marketGbp: z.number().nullable(),
  /** Multi-TCG: which game this hit belongs to + its display name (cross-game search). */
  game: z.string().nullable(),
  gameDisplayName: z.string().nullable(),
  /** Printing-collapse: this row is one card; the server nests each printing here so the list
   * isn't a dozen near-duplicate rows. */
  printingCount: z.number().int().nullable(),
  printings: z.array(PrintingSchema).nullable(),
});
export type CardSearchResult = z.infer<typeof CardSearchResultSchema>;

export const CardSearchResponseSchema = z.object({
  results: z.array(CardSearchResultSchema),
});
export type CardSearchResponse = z.infer<typeof CardSearchResponseSchema>;
