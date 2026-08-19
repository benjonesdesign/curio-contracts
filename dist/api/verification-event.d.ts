import { z } from "zod";
export declare const VerificationEventRequestSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** What kind of AI output this correction is against. */
    kind: z.ZodEnum<["identity", "condition"]>;
    /** The specific field being corrected, e.g. "name", "set_name", "card_number", "condition", or
     * a defect id/region for a condition finding. Free text — the taxonomy isn't fixed yet (see
     * ROADMAP-COORDINATION.md's §5.8 reconcile note on the 3-way verdict question). */
    field: z.ZodString;
    /** The roadmap's 3-way verdict vocabulary (§5.8: Confirm / Not present / Unsure) — a closed
     * dimension separate from `previousValue`/`correctedValue` below. A text correction is NOT a
     * 4th verdict case: `verdict` answers "was the AI's finding right?", while `previousValue`/
     * `correctedValue` carry what changed, if anything, independent of the verdict itself (COORD
     * 2026-08-18: "corrected is a separate dimension, not a 4th verdict"). */
    verdict: z.ZodOptional<z.ZodEnum<["confirmed", "not_present", "unsure"]>>;
    previousValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    correctedValue: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    /** Which client emitted this — lets W4/W8 distinguish mobile capture-flow corrections from the
     * existing web add-flow's ConditionStep loop once both write here. */
    source: z.ZodOptional<z.ZodEnum<["ios_capture", "web_add_flow", "other"]>>;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    kind: "condition" | "identity";
    field: string;
    source?: "ios_capture" | "web_add_flow" | "other" | undefined;
    verdict?: "confirmed" | "not_present" | "unsure" | undefined;
    previousValue?: string | null | undefined;
    correctedValue?: string | null | undefined;
}, {
    physicalCardId: string;
    kind: "condition" | "identity";
    field: string;
    source?: "ios_capture" | "web_add_flow" | "other" | undefined;
    verdict?: "confirmed" | "not_present" | "unsure" | undefined;
    previousValue?: string | null | undefined;
    correctedValue?: string | null | undefined;
}>;
export type VerificationEventRequest = z.infer<typeof VerificationEventRequestSchema>;
export declare const VerificationEventResponseSchema: z.ZodObject<{
    recorded: z.ZodBoolean;
    id: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string | null;
    recorded: boolean;
}, {
    id: string | null;
    recorded: boolean;
}>;
export type VerificationEventResponse = z.infer<typeof VerificationEventResponseSchema>;
