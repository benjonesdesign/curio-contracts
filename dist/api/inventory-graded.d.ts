import { z } from "zod";
/** The graders the add-graded form offers (mirrors pokemon-tool lib/graded.ts GRADERS). Distinct
 *  from the cert-lookup `Grader` (PSA only): this is who graded the slab, not who can verify it.
 *  Closed and forward-compatible. */
export declare const SlabGraderSchema: z.ZodEnum<["PSA", "BGS / Beckett", "CGC", "ACE", "TAG", "SGC", "Other"]>;
export type SlabGrader = z.infer<typeof SlabGraderSchema>;
/** The draft's own enum, named so the emitter cannot mint `CollectionType6` beside the five
 *  inline copies already in the generated debt list. */
export declare const SlabCollectionTypeSchema: z.ZodEnum<["resale", "personal"]>;
export type SlabCollectionType = z.infer<typeof SlabCollectionTypeSchema>;
export declare const GradedCreateRequestSchema: z.ZodObject<{
    /** One per Add attempt. A retry with the same id returns the same copy and SKU. */
    batchId: z.ZodString;
    /** Defaults to "pokemon" when absent. The Pokémon-only gate applies (`GameRefusal`). */
    game: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    setName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    cardNumber: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    language: z.ZodOptional<z.ZodString>;
    grader: z.ZodEnum<["PSA", "BGS / Beckett", "CGC", "ACE", "TAG", "SGC", "Other"]>;
    /** As printed on the label: "10", "9.5", "GEM MT 10". */
    grade: z.ZodString;
    certNumber: z.ZodString;
    /** What the seller paid. Absent or null = unknown (stored null, never 0). */
    purchaseCost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    /** The seller's own price. Absent or null = no price yet. */
    suggestedPrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    collectionType: z.ZodOptional<z.ZodEnum<["resale", "personal"]>>;
    /** Bare Storage paths in the card-photos bucket (already uploaded): masters, then optional thumbs. */
    photoPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    thumbPaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    grader: "PSA" | "BGS / Beckett" | "CGC" | "ACE" | "TAG" | "SGC" | "Other";
    certNumber: string;
    grade: string;
    batchId: string;
    game?: string | undefined;
    language?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    purchaseCost?: number | null | undefined;
    collectionType?: "personal" | "resale" | undefined;
    suggestedPrice?: number | null | undefined;
    photoPaths?: string[] | undefined;
    thumbPaths?: string[] | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    grader: "PSA" | "BGS / Beckett" | "CGC" | "ACE" | "TAG" | "SGC" | "Other";
    certNumber: string;
    grade: string;
    batchId: string;
    game?: string | undefined;
    language?: string | undefined;
    setName?: string | null | undefined;
    cardNumber?: string | null | undefined;
    purchaseCost?: number | null | undefined;
    collectionType?: "personal" | "resale" | undefined;
    suggestedPrice?: number | null | undefined;
    photoPaths?: string[] | undefined;
    thumbPaths?: string[] | undefined;
    notes?: string | null | undefined;
}>;
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
export declare const CertCheckSchema: z.ZodEnum<["verified", "not_found", "grade_mismatch", "unavailable", "unsupported_grader"]>;
export type CertCheck = z.infer<typeof CertCheckSchema>;
export declare const GradedCreateResponseSchema: z.ZodEffects<z.ZodObject<{
    physicalCardId: z.ZodString;
    legacyCardId: z.ZodNullable<z.ZodString>;
    /** Non-null, opaque, given now, never changes. */
    sku: z.ZodString;
    /** NEEDS_DECISION, or NEEDS_ID_REVIEW when the typed identity did not match the catalogue. */
    status: z.ZodEnum<["RECEIVED", "AWAITING_SCAN", "PROCESSING", "NEEDS_ID_REVIEW", "NEEDS_CONDITION", "NEEDS_DECISION", "READY_TO_LIST", "EBAY_DRAFT", "LISTED", "SOLD", "PICKED", "DISPATCHED", "COMPLETED", "EXCEPTION", "RETURNED", "ARCHIVED", "UNMATCHED", "HELD"]>;
    /** False on a retry that found the copy already there (HTTP 200); true on first create (201). */
    created: z.ZodBoolean;
    /** Server-decided. An unverified slab is never listed as graded. */
    certVerified: z.ZodBoolean;
    certCheck: z.ZodEnum<["verified", "not_found", "grade_mismatch", "unavailable", "unsupported_grader"]>;
    catalogueMatched: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    physicalCardId: string;
    legacyCardId: string | null;
    created: boolean;
    certVerified: boolean;
    certCheck: "not_found" | "verified" | "grade_mismatch" | "unavailable" | "unsupported_grader";
    catalogueMatched: boolean;
}, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    physicalCardId: string;
    legacyCardId: string | null;
    created: boolean;
    certVerified: boolean;
    certCheck: "not_found" | "verified" | "grade_mismatch" | "unavailable" | "unsupported_grader";
    catalogueMatched: boolean;
}>, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    physicalCardId: string;
    legacyCardId: string | null;
    created: boolean;
    certVerified: boolean;
    certCheck: "not_found" | "verified" | "grade_mismatch" | "unavailable" | "unsupported_grader";
    catalogueMatched: boolean;
}, {
    status: "RECEIVED" | "AWAITING_SCAN" | "PROCESSING" | "NEEDS_ID_REVIEW" | "NEEDS_CONDITION" | "NEEDS_DECISION" | "READY_TO_LIST" | "EBAY_DRAFT" | "LISTED" | "SOLD" | "PICKED" | "DISPATCHED" | "COMPLETED" | "EXCEPTION" | "RETURNED" | "ARCHIVED" | "UNMATCHED" | "HELD";
    sku: string;
    physicalCardId: string;
    legacyCardId: string | null;
    created: boolean;
    certVerified: boolean;
    certCheck: "not_found" | "verified" | "grade_mismatch" | "unavailable" | "unsupported_grader";
    catalogueMatched: boolean;
}>;
export type GradedCreateResponse = z.infer<typeof GradedCreateResponseSchema>;
