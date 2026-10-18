// Contract for POST /api/scan-trace (pokemon-tool) — W15 Phase 1: ONE event per scan, written by the client
// when the scan ends, so Tier 0 (read the number and set code, look the card up) can be measured before any
// more identification work is built.
//
// WHY THE CLIENT WRITES IT. The OCR text and what the seller did with the answer exist only on the device.
// Android never calls /api/identify (its lookup is /api/catalogue-lookup) and iOS only runs Tier 0 with
// FAST_IDENTIFY on, so no single server route sees every scan.
//
// WHAT THE SERVER ADDS (and never trusts from the client): `shadow`, the result the real Tier 0 resolver gives
// for the `ocr` fields, and `keptShadow`. They are NOT in this contract: nothing is returned but `{ ok: true }`,
// so a client can never show a seller anything derived from the shadow run.
//
// PRIVACY. Card text only: no photos, no free text from the seller. `lines` is at most 20 lines of 80
// characters (the server truncates, it does not reject); the whole request is at most 8 KB (413) and an
// account may send 120 per 5 minutes (429).
//
// VOCABULARY. `answer.by`, `outcome.sellerAction`, `resolverTier` and `changedFields` are OPEN strings with
// the values below, so a newer client does not get a 400 for a value an older server has not met (ADR 0027:
// an unknown value is a decode outcome, not a crash). The report buckets unknown values as "other".
//   answer.by            tier0 | ai | lookup | ambiguous | none | manual
//   outcome.sellerAction kept | changed | picked_candidate | rescanned | abandoned | added_manually
//   changedFields        name | set | number | game
import { z } from "zod";

/** A card identity as a client saw it. */
export const ScanTraceMatchSchema = z.object({
  game: z.string().max(32).optional(),
  nativeId: z.string().max(120).nullable().optional(),
  name: z.string().max(200),
  setName: z.string().max(160).nullable().optional(),
  cardNumber: z.string().max(32).nullable().optional(),
});
export type ScanTraceMatch = z.infer<typeof ScanTraceMatchSchema>;

export const ScanTraceOcrSchema = z.object({
  /** The collector number as read ("58" or "58/102"); the server joins `total` onto a bare number. */
  number: z.string().max(32).nullable().optional(),
  total: z.string().max(16).nullable().optional(),
  setCode: z.string().max(24).nullable().optional(),
  setName: z.string().max(160).nullable().optional(),
  name: z.string().max(200).nullable().optional(),
  /** The OCR engine's own confidence, 0 to 1. */
  confidence: z.number().min(0).max(1).nullable().optional(),
  /** What the OCR read, line by line: card text only. At most 20 lines of 80 characters. */
  lines: z.array(z.string()).optional(),
  /** Milliseconds the on-device read took. */
  ms: z.number().int().min(0).optional(),
});
export type ScanTraceOcr = z.infer<typeof ScanTraceOcrSchema>;

export const ScanTraceAnswerSchema = z.object({
  /** Which step produced the answer the seller was shown. */
  by: z.string().max(32),
  /** The narrowing tier that answered, when the client knows it (the server's shadow gives its own). */
  resolverTier: z.string().max(40).nullable().optional(),
  candidateCount: z.number().int().min(0).nullable().optional(),
  match: ScanTraceMatchSchema.nullable().optional(),
  ms: z.number().int().min(0).optional(),
});
export type ScanTraceAnswer = z.infer<typeof ScanTraceAnswerSchema>;

export const ScanTraceOutcomeSchema = z.object({
  /** What the seller did with the answer. */
  sellerAction: z.string().max(32),
  /** Which fields the seller changed, when `sellerAction` is "changed". */
  changedFields: z.array(z.string().max(16)).optional(),
  /** The identity the seller ended on, when there was one. */
  finalMatch: ScanTraceMatchSchema.nullable().optional(),
});
export type ScanTraceOutcome = z.infer<typeof ScanTraceOutcomeSchema>;

export const ScanTracePlatformSchema = z.enum(["ios", "android", "web"]);
export type ScanTracePlatform = z.infer<typeof ScanTracePlatformSchema>;

export const ScanTraceRequestSchema = z.object({
  /** Always 1. */
  v: z.literal(1),
  /** A uuid v4 the client makes once per scan. The same id on every ping of that scan. */
  scanId: z.string().uuid(),
  platform: ScanTracePlatformSchema,
  appVersion: z.string().max(40).optional(),
  /** The game the client thought it was looking at, if it had a guess. A hint only. */
  gameHint: z.string().max(32).optional(),
  ocr: ScanTraceOcrSchema.optional(),
  answer: ScanTraceAnswerSchema,
  outcome: ScanTraceOutcomeSchema,
});
export type ScanTraceRequest = z.infer<typeof ScanTraceRequestSchema>;

export const ScanTraceResponseSchema = z.object({
  ok: z.literal(true),
});
export type ScanTraceResponse = z.infer<typeof ScanTraceResponseSchema>;
