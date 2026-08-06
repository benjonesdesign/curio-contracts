import { z } from "zod";
export declare const CertLookupRequestSchema: z.ZodObject<{
    grader: z.ZodEnum<["PSA"]>;
    certNumber: z.ZodString;
}, "strip", z.ZodTypeAny, {
    grader: "PSA";
    certNumber: string;
}, {
    grader: "PSA";
    certNumber: string;
}>;
export type CertLookupRequest = z.infer<typeof CertLookupRequestSchema>;
export declare const CertLookupResponseSchema: z.ZodObject<{
    /** false when the grader's API has no record for this cert number (still a 200 — a real "not
     * found", not an error) — never invent a result the grader didn't actually return. */
    found: z.ZodBoolean;
    grader: z.ZodEnum<["PSA"]>;
    certNumber: z.ZodString;
    grade: z.ZodNullable<z.ZodString>;
    gradeDescription: z.ZodNullable<z.ZodString>;
    /** The card/player name PSA has on file for this cert — the identity the seller confirms. */
    subject: z.ZodNullable<z.ZodString>;
    year: z.ZodNullable<z.ZodString>;
    brand: z.ZodNullable<z.ZodString>;
    category: z.ZodNullable<z.ZodString>;
    cardNumber: z.ZodNullable<z.ZodString>;
    variety: z.ZodNullable<z.ZodString>;
    labelType: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cardNumber: string | null;
    grader: "PSA";
    certNumber: string;
    found: boolean;
    grade: string | null;
    gradeDescription: string | null;
    subject: string | null;
    year: string | null;
    brand: string | null;
    category: string | null;
    variety: string | null;
    labelType: string | null;
}, {
    cardNumber: string | null;
    grader: "PSA";
    certNumber: string;
    found: boolean;
    grade: string | null;
    gradeDescription: string | null;
    subject: string | null;
    year: string | null;
    brand: string | null;
    category: string | null;
    variety: string | null;
    labelType: string | null;
}>;
export type CertLookupResponse = z.infer<typeof CertLookupResponseSchema>;
