// Contract for POST /api/ebay-publish (pokemon-tool) — the route that puts a real listing on a
// real marketplace with a real price. It had NO contract until 2026-09-02, which is how it came
// to accept a `format` field it never persisted, and it is the first consumer of the generator's
// `z.discriminatedUnion` support.
//
// ── WHY A DISCRIMINATED UNION, AND NOT `{ code, error }` ────────────────────────────────────
//
// The failures this route returns are not one shape with a varying label. They carry DIFFERENT
// DATA and demand DIFFERENT UI:
//
//   titleTooLong        needs the actual length and the limit, to say "84 characters, 80 allowed"
//   unmappableCondition needs the condition string it could not map
//   gradedNotVerified   needs the grading company, which may be null
//   scopeError          needs no data but a deep link to Settings → Channels
//   ebayError           needs the upstream code, which is an OPEN set we do not control
//
// Modelled as `{ code: string, error: string, ...maybe }`, every client re-derives which optional
// fields are meaningful for which code — and gets it wrong, silently, in the direction of showing
// a generic message. This repo has recorded that conflation twice already (ADR 0024's table), both
// times because the idiomatic construct was refused by the generator rather than rejected on
// merit. It is available now; this is the first schema to use it.
//
// ⚠️ `unrecognised` / `Unknown` EXISTS BECAUSE `ebayError` IS OPEN. eBay's own error codes arrive
// from upstream and change without notice. A client that hard-failed on an unknown code would
// turn "eBay said something new" into "the app broke". Per ADR 0027 item 2a, native clients must
// NEVER ORIGINATE an unknown case — it is a decode outcome, not a value to construct.

import { z } from "zod";

// ── Request ─────────────────────────────────────────────────────────────────────────────────

export const EbayListingFormatSchema = z.enum(["FIXED_PRICE", "AUCTION"]);
export type EbayListingFormat = z.infer<typeof EbayListingFormatSchema>;

export const EbayPublishRequestSchema = z.object({
  sku: z.string().min(1),
  title: z.string().min(1).max(80),
  description: z.string(),
  condition: z.string(),
  priceGbp: z.number().positive(),
  photoUrls: z.array(z.string()),
  aspectValues: z.record(z.union([z.string(), z.array(z.string())])),
  physicalCardId: z.string().nullable().optional(),
  cardId: z.string().nullable().optional(),
  game: z.string().default("pokemon"),
  format: EbayListingFormatSchema.default("FIXED_PRICE"),
  auctionStartPrice: z.number().positive().nullable().optional(),
  auctionDays: z.union([z.literal(3), z.literal(5), z.literal(7), z.literal(10)]).default(7),
});
export type EbayPublishRequest = z.infer<typeof EbayPublishRequestSchema>;

// ── Success ─────────────────────────────────────────────────────────────────────────────────

export const EbayPublishSuccessSchema = z.object({
  status: z.literal("published"),
  offerId: z.string(),
  listingId: z.string().nullable(),
  listingUrl: z.string().nullable(),
  production: z.boolean(),
});
export type EbayPublishSuccess = z.infer<typeof EbayPublishSuccessSchema>;

// ── Failure ─────────────────────────────────────────────────────────────────────────────────
//
// `message` is on every variant and is the string to SHOW. `code` is the string to BRANCH on —
// but clients should branch on the decoded case, not on `code`; the field is present because it
// round-trips and because a log line wants it.

export const EbayPublishErrorSchema = z.discriminatedUnion("code", [
  z.object({
    code: z.literal("unauthenticated"),
    message: z.string(),
  }),
  z.object({
    code: z.literal("invalid_request"),
    message: z.string(),
  }),
  z.object({
    code: z.literal("title_too_long"),
    message: z.string(),
    titleLength: z.number().int(),
    maxLength: z.number().int(),
  }),
  z.object({
    code: z.literal("graded_not_verified"),
    message: z.string(),
    // Null when the card claims a grade with no company recorded — the reason the check fires at
    // all. Do not render "null" at the user; the message already says what to do.
    gradingCompany: z.string().nullable(),
  }),
  z.object({
    code: z.literal("scope_error"),
    message: z.string(),
    // Deep link target for "Reconnect your eBay account". Kept as a plain string rather than an
    // enum: the destination is a client route, and the three clients spell it differently.
    reconnectHint: z.string(),
  }),
  z.object({
    code: z.literal("no_policies"),
    message: z.string(),
  }),
  z.object({
    code: z.literal("unmappable_condition"),
    message: z.string(),
    condition: z.string(),
  }),
  z.object({
    code: z.literal("ebay_error"),
    message: z.string(),
    // eBay's own code, passed through verbatim. An OPEN set — this is the variant that made the
    // forward-compatible fallback necessary rather than decorative.
    ebayCode: z.string(),
    httpStatus: z.number().int(),
  }),
  z.object({
    code: z.literal("internal_error"),
    message: z.string(),
  }),
]);
export type EbayPublishError = z.infer<typeof EbayPublishErrorSchema>;

export const EbayPublishErrorResponseSchema = z.object({
  error: EbayPublishErrorSchema,
});
export type EbayPublishErrorResponse = z.infer<typeof EbayPublishErrorResponseSchema>;
