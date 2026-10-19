// POST /api/inventory/graded — add a graded slab to inventory (v0.2.0, ADDITIVE).
//
// Source: pokemon-tool PR #263, `lib/contracts-draft/inventory-graded.ts` on branch
// code-tab/graded-slab-record-1009 ("for the contracts agent to adopt: the shape the web add-graded
// page and, later, iOS D4 send and read"). Mirrored here; the draft is then a copy to delete.
//
// ── A SLAB IS UNVERIFIED UNTIL THE SERVER SAYS OTHERWISE ────────────────────────────────────
// The request carries NO verification flag, on purpose. `certVerified` exists only in the RESPONSE
// and only the server sets it: it is true only when a PSA cert lookup made by this route found the
// cert AND its grade agrees with the claimed grade. Every other grader saves unverified, because
// there is no other cert API. Ben's ruling: an unverified slab is NEVER listed as graded. Listing one
// is refused as `card_not_listable` with reason `slab_unverified` (listing-refusal.ts); it is
// refused today on main as the flat `graded_not_verified` (400), converted at the same server switch
// as the nulls (docs/V0.2.0-ADOPTION.md "Refusal codes").
//
// ── IDEMPOTENT ──────────────────────────────────────────────────────────────────────────────
// `batchId` is a client-made uuid, one per Add attempt. A retry with the same id returns the same
// copy and the same SKU (HTTP 200 with `created: false`; the first call is 201).
//
// The SKU is given now, opaque, and never changes: it is in the response and in NO request.
//
// ── v0.2.2 (ADDITIVE): grade a copy that already exists ───────────────────────────────────
// A seller who has already captured a card (capture-commit made the copy, with its SKU) and now finds it is a slab
// does not ADD a card; they say what it is graded. Send `physicalCardId` instead of `batchId`: the server finds that
// copy (the caller's own), runs the cert check itself, writes grader / grade / cert (and condition "Graded") onto it and
// its legacy row, and answers with the SAME response, `created: false` (HTTP 200). No second copy, no second SKU, no
// scan batch. The identity (name, set, number) is the capture's and is NEVER rewritten; on this path only `grader`,
// `grade` and `certNumber` are read, every other request field is ignored. Fail-closed like the add: the server alone
// sets `certVerified`; PSA unreachable = saved UNVERIFIED (`certCheck: "unavailable"`); a changed cert on a verified slab
// is reset and re-checked, an unchanged verified one is never re-asked or downgraded. A copy that is live or finished
// is not edited: 409 `not_editable` (LISTED, EBAY_DRAFT, SOLD, PICKED, DISPATCHED, COMPLETED), because a cert is never
// changed under a live listing. Exactly one of `batchId` / `physicalCardId`: both is a 400, neither is a 400.
//
// Error body `{ error, code }`: 400 invalid_request, 401 unauthenticated, 404 not_found (grading a copy that is not
// the caller's), 409 not_editable (grading a copy in a live or finished state), 422 game_not_available
// (`GameRefusal`), 503 sku_unavailable (`ListingRefusal`), 500 internal_error.
import { z } from "zod";
import { PhysicalCardStatusSchema } from "./physical-card.js";

/** The graders the add-graded form offers (mirrors pokemon-tool lib/graded.ts GRADERS). Distinct
 *  from the cert-lookup `Grader` (PSA only): this is who graded the slab, not who can verify it.
 *  Closed and forward-compatible. */
export const SlabGraderSchema = z.enum(["PSA", "BGS / Beckett", "CGC", "ACE", "TAG", "SGC", "Other"]);
export type SlabGrader = z.infer<typeof SlabGraderSchema>;

/** The draft's own enum, named so the emitter cannot mint `CollectionType6` beside the five
 *  inline copies already in the generated debt list. */
export const SlabCollectionTypeSchema = z.enum(["resale", "personal"]);
export type SlabCollectionType = z.infer<typeof SlabCollectionTypeSchema>;

export const GradedCreateRequestSchema = z.object({
  /** ADD a new slab. One per Add attempt; a retry with the same id returns the same copy and SKU. Required unless
   *  `physicalCardId` is sent (v0.2.2; it was always required before). */
  batchId: z.string().uuid().optional(),
  /** v0.2.2: GRADE an existing copy instead of adding one. The caller's own copy; only `grader`, `grade` and
   *  `certNumber` are read. Not together with `batchId`. */
  physicalCardId: z.string().uuid().optional(),
  /** Defaults to "pokemon" when absent. The Pokémon-only gate applies (`GameRefusal`). */
  game: z.string().optional(),
  /** Required to ADD a slab; not read when `physicalCardId` is sent (the copy already has its identity). */
  name: z.string().trim().min(1).optional(),
  setName: z.string().trim().nullable().optional(),
  cardNumber: z.string().trim().nullable().optional(),
  language: z.string().trim().optional(),
  grader: SlabGraderSchema,
  /** As printed on the label: "10", "9.5", "GEM MT 10". */
  grade: z.string().trim().min(1),
  certNumber: z.string().trim().min(1),
  /** What the seller paid. Absent or null = unknown (stored null, never 0). */
  purchaseCost: z.number().min(0).nullable().optional(),
  /** The seller's own price. Absent or null = no price yet. */
  suggestedPrice: z.number().min(0).nullable().optional(),
  collectionType: SlabCollectionTypeSchema.optional(),
  /** Bare Storage paths in the card-photos bucket (already uploaded): masters, then optional thumbs. */
  photoPaths: z.array(z.string().min(1)).max(12).optional(),
  thumbPaths: z.array(z.string().min(1)).max(12).optional(),
  notes: z.string().nullable().optional(),
}).superRefine((r, ctx) => {
  if (r.batchId !== undefined && r.physicalCardId !== undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["physicalCardId"],
      message: "send batchId (add a new slab) or physicalCardId (grade an existing copy), not both" });
  } else if (r.batchId === undefined && r.physicalCardId === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["batchId"],
      message: "batchId is required to add a slab (or send physicalCardId to grade an existing copy)" });
  } else if (r.physicalCardId === undefined && r.name === undefined) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["name"], message: "name is required to add a slab" });
  }
});
export type GradedCreateRequest = z.infer<typeof GradedCreateRequestSchema>;

/**
 * What the server's cert check found. Closed, forward-compatible (an unknown value is
 * "not verified").
 *   verified            PSA has the cert and its grade agrees with the claimed grade
 *   not_found           PSA has no such cert
 *   grade_mismatch      PSA has it, with a different grade
 *   unavailable         PSA could not be reached; saved unverified, verify later
 *   unsupported_grader  no cert API for this grader; saved unverified
 */
export const CertCheckSchema = z.enum(["verified", "not_found", "grade_mismatch", "unavailable", "unsupported_grader"]);
export type CertCheck = z.infer<typeof CertCheckSchema>;

export const GradedCreateResponseSchema = z.object({
  physicalCardId: z.string().uuid(),
  legacyCardId: z.string().uuid().nullable(),
  /** Non-null, opaque, given now, never changes. */
  sku: z.string().min(1),
  /** NEEDS_DECISION, or NEEDS_ID_REVIEW when the typed identity did not match the catalogue. */
  status: PhysicalCardStatusSchema,
  /** False on a retry that found the copy already there, and when an existing copy was graded (HTTP 200); true on first create (201). */
  created: z.boolean(),
  /** Server-decided. An unverified slab is never listed as graded. */
  certVerified: z.boolean(),
  certCheck: CertCheckSchema,
  catalogueMatched: z.boolean(),
}).superRefine((r, ctx) => {
  if (r.certVerified !== (r.certCheck === "verified")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["certVerified"],
      message: r.certVerified
        ? `certVerified is true but certCheck is ${r.certCheck}: only a "verified" cert check verifies a slab`
        : 'certCheck is "verified" but certVerified is false: one fact, reported once' });
  }
});
export type GradedCreateResponse = z.infer<typeof GradedCreateResponseSchema>;
