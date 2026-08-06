// Contract for POST /api/cert-lookup (pokemon-tool) — WORK-BACKLOG.md Packet 3 (graded-slab
// listing). Looks up a grading cert against the grader's own API and returns the card identity +
// grade, so the seller can confirm before the record is saved. Pure lookup — no side effects, no
// DB write. See curio-shared/canon/specs and pokemon-tool's app/api/cert-lookup/route.ts +
// lib/psa/client.ts.
//
// PSA only for now (the free, self-serve PSA Public API — cert verification only, no pop/price;
// see decisions/… and NEEDS-BEN.md). CGC is a fast-follow once its own API is confirmed — this
// contract's `grader` field is a literal union of one today so adding CGC later is a non-breaking
// enum extension, not a reshape.
import { z } from "zod";
export const CertLookupRequestSchema = z.object({
    grader: z.enum(["PSA"]),
    certNumber: z.string().min(1),
});
export const CertLookupResponseSchema = z.object({
    /** false when the grader's API has no record for this cert number (still a 200 — a real "not
     * found", not an error) — never invent a result the grader didn't actually return. */
    found: z.boolean(),
    grader: z.enum(["PSA"]),
    certNumber: z.string(),
    grade: z.string().nullable(),
    gradeDescription: z.string().nullable(),
    /** The card/player name PSA has on file for this cert — the identity the seller confirms. */
    subject: z.string().nullable(),
    year: z.string().nullable(),
    brand: z.string().nullable(),
    category: z.string().nullable(),
    cardNumber: z.string().nullable(),
    variety: z.string().nullable(),
    labelType: z.string().nullable(),
});
