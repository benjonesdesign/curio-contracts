// Contract for POST /api/verification-event (pokemon-tool) — STRATEGIC-ROADMAP.md W2 §5.8 /
// curio-shared iOS ticket "iOS-W2-C". iOS's in-flow Confirm step lets a seller correct an
// AI-suggested identity or condition/defect finding; each disagreement is a SIGNAL, not a grade —
// the device never recomputes a grade itself. This contract carries that signal to the server so
// it becomes labelled data for W4 (closed-loop outcomes) and W8 (correction-rate metric); as of
// 2026-08 pokemon-tool just persists the event (transport + storage only) — no calibration or
// aggregation logic reads it yet.
import { z } from "zod";

export const VerificationEventRequestSchema = z.object({
  physicalCardId: z.string(),
  /** What kind of AI output this correction is against. */
  kind: z.enum(["identity", "condition"]),
  /** The specific field being corrected, e.g. "name", "set_name", "card_number", "condition", or
   * a defect id/region for a condition finding. Free text — the taxonomy isn't fixed yet (see
   * ROADMAP-COORDINATION.md's §5.8 reconcile note on the 3-way verdict question). */
  field: z.string(),
  /** Free-text 3-way-ish verdict a client may send alongside the raw before/after values — kept
   * loose (not a closed enum) since the roadmap's Confirm/Not present/Unsure vocabulary and the
   * web app's existing artwork/dust/lighting/confirmed reasons haven't been reconciled yet. */
  verdict: z.enum(["confirmed", "not_present", "unsure", "corrected"]).optional(),
  previousValue: z.string().nullable().optional(),
  correctedValue: z.string().nullable().optional(),
  /** Which client emitted this — lets W4/W8 distinguish mobile capture-flow corrections from the
   * existing web add-flow's ConditionStep loop once both write here. */
  source: z.enum(["ios_capture", "web_add_flow", "other"]).optional(),
});
export type VerificationEventRequest = z.infer<typeof VerificationEventRequestSchema>;

export const VerificationEventResponseSchema = z.object({
  recorded: z.boolean(),
  id: z.string().nullable(),
});
export type VerificationEventResponse = z.infer<typeof VerificationEventResponseSchema>;
