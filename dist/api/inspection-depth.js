// Contract for POST /api/inspection-depth-hint (pokemon-tool) — STRATEGIC-ROADMAP.md W2 §5.12
// (economic inspection depth) / curio-shared iOS ticket "iOS-W2-D". After fastIdentify resolves a
// card's identity, iOS asks for a cheap value/stakes signal so it can scale how much evidence it
// asks the seller to capture (front/back only for a common card; corners/edges/surface for a
// valuable one) — see ROADMAP-COORDINATION.md's cross-lane note: no such lightweight, in-capture
// signal exists today (/api/card-value is a full synchronous valuation, not designed to be called
// mid-capture). Server authority: value + depth POLICY are server-side; iOS only renders the
// recommended tier, no thresholds on device.
//
// As of 2026-08 pokemon-tool's implementation is a STUB — it always returns the same default
// tier with an explicit rationale. The real value-based policy is deliberately NOT built yet: it
// needs a product decision on depth tiers (ROADMAP-COORDINATION.md) and ideally reads from the
// same unified market-observation model Ticket 1/2 establish, rather than a third pricing path
// invented here. This contract exists so iOS can integrate + test the plumbing now; the response
// shape is stable even though the policy behind it isn't real yet.
import { z } from "zod";
import { GameIdSchema } from "./common.js";
export const InspectionDepthHintRequestSchema = z.object({
    name: z.string(),
    setName: z.string().nullable().optional(),
    cardNumber: z.string().nullable().optional(),
    game: GameIdSchema.optional(),
    tcgId: z.string().nullable().optional(),
});
export const InspectionDepthTierSchema = z.enum(["minimal", "standard", "thorough"]);
export const InspectionDepthHintResponseSchema = z.object({
    depthTier: InspectionDepthTierSchema,
    /** Human-readable "why" a caller can show alongside the prompt — see iOS ticket D's "render
     * the depth prompt + rationale" requirement. */
    rationale: z.string(),
    /** How much to trust this hint — "low" today (see file doc comment: policy is a stub). */
    confidence: z.enum(["high", "medium", "low"]),
});
