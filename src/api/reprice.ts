// Contract for GET /api/reprice-flags (pokemon-tool) — WORK-BACKLOG.md Packet 5 (Inventory sync
// + repricing), the T3 web dashboard's on-demand read. The daily cron (app/api/cron/reprice)
// writes a per-account SUMMARY row into the shared `notifications` table (kind/deep_link, see
// curio-shared canon/specs/alerts.md) for push/inbox delivery — that stays as-is. This is a
// separate, richer PER-CARD shape (current price, market value, delta%, direction) the dashboard
// needs to list every currently-flagged listing and jump straight to editing it; both read the
// same underlying comparison (pokemon-tool's lib/reprice.ts), just shaped for a different consumer.

import { z } from "zod";

export const RepricingDirectionSchema = z.enum(["above", "below"]);
export type RepricingDirection = z.infer<typeof RepricingDirectionSchema>;

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
export type RepricingFlag = z.infer<typeof RepricingFlagSchema>;

export const RepricingFlagsResponseSchema = z.object({
  flags: z.array(RepricingFlagSchema),
});
export type RepricingFlagsResponse = z.infer<typeof RepricingFlagsResponseSchema>;
