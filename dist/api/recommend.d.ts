import { z } from "zod";
export declare const RecommendRequestSchema: z.ZodObject<{
    physicalCardId: z.ZodString;
    /** Explicit override; otherwise derived server-side from the card's set name. */
    isVintage: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    physicalCardId: string;
    isVintage?: boolean | undefined;
}, {
    physicalCardId: string;
    isVintage?: boolean | undefined;
}>;
export type RecommendRequest = z.infer<typeof RecommendRequestSchema>;
export declare const RecommendedRouteSchema: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
export type RecommendedRoute = z.infer<typeof RecommendedRouteSchema>;
export declare const RecommendResponseSchema: z.ZodObject<{
    route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
    alternatives: z.ZodArray<z.ZodObject<{
        route: z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        why: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }, {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }>, "many">;
    economics: z.ZodObject<{
        expected_sale_gbp: z.ZodNullable<z.ZodNumber>;
        fees_gbp: z.ZodNullable<z.ZodNumber>;
        postage_gbp: z.ZodNullable<z.ZodNumber>;
        cost_basis_gbp: z.ZodNullable<z.ZodNumber>;
        expected_net_gbp: z.ZodNullable<z.ZodNumber>;
        liquidity: z.ZodNullable<z.ZodEnum<["high", "medium", "low"]>>;
    }, "strip", z.ZodTypeAny, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }, {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    }>;
    assumptions: z.ZodArray<z.ZodString, "many">;
    explanation: z.ZodString;
    confidence: z.ZodEnum<["high", "medium", "low"]>;
    calculation_version: z.ZodString;
    physicalCardId: z.ZodString;
    currentRoute: z.ZodNullable<z.ZodEnum<["list_single", "bundle", "bulk", "hold", "grade_review", "restoration_review", "do_not_list"]>>;
}, "strip", z.ZodTypeAny, {
    confidence: "high" | "medium" | "low";
    physicalCardId: string;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    };
    assumptions: string[];
    explanation: string;
    calculation_version: string;
    currentRoute: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
}, {
    confidence: "high" | "medium" | "low";
    physicalCardId: string;
    route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
    alternatives: {
        expected_net_gbp: number | null;
        route: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list";
        why: string;
    }[];
    economics: {
        expected_sale_gbp: number | null;
        fees_gbp: number | null;
        postage_gbp: number | null;
        cost_basis_gbp: number | null;
        expected_net_gbp: number | null;
        liquidity: "high" | "medium" | "low" | null;
    };
    assumptions: string[];
    explanation: string;
    calculation_version: string;
    currentRoute: "list_single" | "bundle" | "bulk" | "hold" | "grade_review" | "restoration_review" | "do_not_list" | null;
}>;
export type RecommendResponse = z.infer<typeof RecommendResponseSchema>;
