import { z } from "zod";
export declare const EntitlementTierSchema: z.ZodEnum<["free", "collector", "pro", "dealer"]>;
export type EntitlementTier = z.infer<typeof EntitlementTierSchema>;
export declare const EntitlementStatusSchema: z.ZodEnum<["active", "trialing", "past_due", "grace", "canceled", "expired"]>;
export type EntitlementStatus = z.infer<typeof EntitlementStatusSchema>;
export declare const EntitlementSourceSchema: z.ZodEnum<["stripe", "apple"]>;
export type EntitlementSource = z.infer<typeof EntitlementSourceSchema>;
export declare const EntitlementSchema: z.ZodObject<{
    userId: z.ZodString;
    tier: z.ZodEnum<["free", "collector", "pro", "dealer"]>;
    status: z.ZodEnum<["active", "trialing", "past_due", "grace", "canceled", "expired"]>;
    /** Who's billing this user — never mix gating logic with this field; gate on tier+status only. */
    source: z.ZodEnum<["stripe", "apple"]>;
    currentPeriodEnd: z.ZodString;
    cancelAtPeriodEnd: z.ZodBoolean;
    /** Free trial (decisions/0015 "Resolved product decisions" #2). Null outside a trial. */
    trialEnd: z.ZodNullable<z.ZodString>;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "expired" | "active" | "trialing" | "past_due" | "grace" | "canceled";
    source: "stripe" | "apple";
    tier: "free" | "collector" | "pro" | "dealer";
    userId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
    updatedAt: string;
}, {
    status: "expired" | "active" | "trialing" | "past_due" | "grace" | "canceled";
    source: "stripe" | "apple";
    tier: "free" | "collector" | "pro" | "dealer";
    userId: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd: string | null;
    updatedAt: string;
}>;
export type Entitlement = z.infer<typeof EntitlementSchema>;
export declare const EntitlementResponseSchema: z.ZodObject<{
    user_id: z.ZodString;
    tier: z.ZodEnum<["free", "collector", "pro", "dealer"]>;
    status: z.ZodEnum<["active", "trialing", "past_due", "grace", "canceled", "expired"]>;
    source: z.ZodEnum<["stripe", "apple"]>;
    current_period_end: z.ZodString;
    cancel_at_period_end: z.ZodBoolean;
    trial_end: z.ZodNullable<z.ZodString>;
    updated_at: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "expired" | "active" | "trialing" | "past_due" | "grace" | "canceled";
    source: "stripe" | "apple";
    tier: "free" | "collector" | "pro" | "dealer";
    user_id: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    trial_end: string | null;
    updated_at: string;
}, {
    status: "expired" | "active" | "trialing" | "past_due" | "grace" | "canceled";
    source: "stripe" | "apple";
    tier: "free" | "collector" | "pro" | "dealer";
    user_id: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    trial_end: string | null;
    updated_at: string;
}>;
export type EntitlementResponse = z.infer<typeof EntitlementResponseSchema>;
