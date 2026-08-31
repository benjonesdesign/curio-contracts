// No generated type may be named with a trailing digit.
//
// A digit suffix is the emitter saying "two different schemas wanted this name and I invented one".
// It is never a name a client should depend on, because WHICH schema gets the bare name and which
// gets the `2` depends on emit order — so adding an unrelated field can silently swap them.
//
// That is not hypothetical, and it has now happened twice:
//   • v0.1.29 — `Liquidity` / `Liquidity2`.
//   • v0.1.39 — `DecisionUnavailable` / `DecisionUnavailable2`, where
//     `QuickScanResponse.getDecisionUnavailable()` began returning the `2` variant and Android's
//     code, written against the plain name, stopped compiling.
//
// The first fix hoisted the one enum and stopped there. Because only the INSTANCE was fixed and
// never the RULE, the next inline declaration recreated it. This test is the rule.
//
// ── TWO DIFFERENT DEFECTS WEAR THIS SYMPTOM, AND THE REMEDIES ARE OPPOSITE ──────────────────
//
// The digit is always the same signal — the emitter invented a name — but what caused the
// collision differs, and so does the fix. Splitting the list on this axis matters because one half
// is a mechanical hoist and the other is a domain-naming decision touching three platforms.
//
//   A. CONTRACT DEBT — one concept declared inline in several schemas.
//      The generator is right to complain and the fix is mechanical: hoist to a named schema in
//      common.ts, registerName() it, reference it everywhere.
//
//   B. VOCABULARY COLLISION — genuinely different concepts sharing a FIELD name.
//      The generator is faithfully reporting a real ambiguity in our domain language. `source`
//      means three unrelated things; `status` means two. Hoisting is impossible (they are not the
//      same type) and renaming the TYPE is cosmetic — it leaves two fields called `source` meaning
//      different things and only hides the symptom.
//
//      THE REMEDY IS RENAMING THE FIELD: identifiedBy, paymentProvider, capturedVia. A field that
//      says what it means cannot collide, so the digit stops being generated because there is
//      nothing left to disambiguate. That is a wire-breaking change across three platforms and a
//      decision about domain language, not a cleanup.
//
//      `side` is the sharpest case: `Side` is front/back/UNKNOWN and `Side2..5` are front/back.
//      The difference is real — does "unknown" exist for a photo detail? — and a shared field name
//      flattened a genuine modelling question into a naming artefact. Renaming makes the question
//      visible again, which is the point.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..");
const TARGETS = [
  ["Swift", "Sources/CurioContracts/APITypes.swift", /^public (?:enum|struct) ([A-Za-z]+\d+)\b/gm],
  ["Kotlin", "src/main/kotlin/com/curio/contracts/APITypes.kt", /^(?:public )?(?:data class|enum class|class|object) ([A-Za-z]+\d+)\b/gm],
] as const;

/**
 * Pre-existing collisions, 2026-08-29. A DEBT LIST, not an exemption policy: every entry is a
 * client-breaking name waiting to happen, and the list only exists so this guard could land in the
 * same release that unblocks Android rather than waiting on 14 unrelated renames.
 *
 * ⚠️ Adding to this list is not a fix. Nothing may be appended without hoisting or renaming the
 * schema behind it — the point of the list is that it shrinks.
 */

/** A — CONTRACT DEBT. One concept, declared inline more than once. Mechanical: hoist and reference.
 *  No wire change, no client coordination, no decision to take. */
const DUPLICATE_DECLARATIONS = new Set([
  // ["personal","resale"] four times over — RecommendBatchCardInput and friends.
  "CollectionType2", "CollectionType3", "CollectionType4", "CollectionType5",
  // Identical to Grader.
  "Grader2",
  // Detail / Detail2 / Detail3 are near-identical photo-detail shapes.
  "Detail2", "Detail3",
]);

/** B — VOCABULARY COLLISION. Different concepts sharing a FIELD name, which is a real ambiguity in
 *  our domain language that the generator is faithfully reporting. Renaming the type would hide it;
 *  the field is what needs the name. Wire-breaking across three platforms — a decision, not a
 *  cleanup, and each entry records the question it is really asking. */
const FIELD_NAME_COLLISIONS = new Map<string, string>([
  ["Source2", "`source` on Entitlement is a PAYMENT provider (stripe/apple); on the identify path " +
              "it is how identity was established (vision/seller). → paymentProvider / identifiedBy"],
  ["Source3", "`source` on VerificationEventRequest is WHERE a capture came from " +
              "(ios_capture/web_add_flow/other). → capturedVia"],
  ["Status2", "`status` on ChannelListingResponse is a LISTING's state (listed/failed); on " +
              "Entitlement it is a SUBSCRIPTION's (active/trialing/past_due/…). " +
              "→ listingStatus / subscriptionStatus"],
  ["Tier2",   "`tier` on IdentifyResponse is which identify tier answered (tier0/vision); on " +
              "Entitlement it is the seller's PLAN (free/starter/growth/pro). " +
              "→ identifyTier / planTier"],
  ["Channel2", "`channel` on ChannelListingResponse is {cardtrader}; on RepriceChannelOutcome it " +
               "is {ebay, cardtrader}. Possibly one enum that drifted rather than two concepts — " +
               "settle THAT first, because the answer decides whether this is category A or B."],
  ["Side2", "`side` on Flaw is front/back/UNKNOWN; on Detail/Detail2/Detail3/ShotQualityDescriptor " +
            "it is front/back. The difference is REAL — does 'unknown' exist for a photo detail? — " +
            "and a shared field name flattened a modelling question into a naming artefact."],
  ["Side3", "`side` on Detail2 — front/back, no 'unknown'. Same question as Side2: is a photo " +
            "detail ever of an unknown side, or is that state only meaningful for a Flaw?"],
  ["Side4", "`side` on Detail3 — front/back. Same question as Side2. (Detail2 and Detail3 are " +
            "themselves duplicate declarations, so this one partly dissolves once those hoist.)"],
  ["Side5", "`side` on ShotQualityDescriptor — front/back. Same question as Side2, and the one " +
            "case where 'unknown' plausibly SHOULD exist: a shot too poor to tell which side it is."],
]);

/**
 * Pre-existing collisions, 2026-08-29. A DEBT LIST, not an exemption policy: every entry is a
 * client-breaking name waiting to happen, and the list only exists so this guard could land in the
 * same release that unblocked Android rather than waiting on unrelated renames.
 *
 * ⚠️ Adding to this list is not a fix. Nothing may be appended without hoisting the schema or
 * renaming the field behind it — the point of the list is that it shrinks.
 */
const KNOWN_COLLISIONS = new Set([...DUPLICATE_DECLARATIONS, ...FIELD_NAME_COLLISIONS.keys()]);

describe("no generated type name ends in a digit", () => {
  it.each(TARGETS.map(([n]) => n))("%s", (target) => {
    const [, rel, re] = TARGETS.find(([n]) => n === target)!;
    const src = readFileSync(join(ROOT, rel), "utf8");
    expect(src.length, `${target} output is empty`).toBeGreaterThan(1000);

    const found = [...src.matchAll(new RegExp(re.source, re.flags))].map((m) => m[1]);
    const fresh = found.filter((n) => !KNOWN_COLLISIONS.has(n));
    expect(
      fresh,
      `${target}: the emitter invented ${fresh.join(", ")} because two schemas wanted the same name. ` +
      `Declare the shared one ONCE in src/api/common.ts and registerName() it, or — if they are ` +
      `different concepts — give each a distinct name. Do not add to KNOWN_COLLISIONS.`,
    ).toEqual([]);
  });

  it("has no stale entry in the debt list", () => {
    // The list must shrink. An entry for a name that no longer exists reads as outstanding debt
    // that has actually been paid, and hides how much is left.
    const all = new Set(
      TARGETS.flatMap(([, rel, re]) => {
        const src = readFileSync(join(ROOT, rel), "utf8");
        return [...src.matchAll(new RegExp(re.source, re.flags))].map((m) => m[1]);
      }),
    );
    const stale = [...KNOWN_COLLISIONS].filter((n) => !all.has(n));
    expect(stale, `fixed — delete from KNOWN_COLLISIONS: ${stale.join(", ")}`).toEqual([]);
  });
});

describe("the debt list is split by remedy, not just enumerated", () => {
  it("no entry sits in both categories", () => {
    // They demand opposite fixes — hoist versus rename the field — so an entry in both would be a
    // fix waiting to be applied twice, wrongly at least once.
    const both = [...DUPLICATE_DECLARATIONS].filter((n) => FIELD_NAME_COLLISIONS.has(n));
    expect(both, `in both categories: ${both.join(", ")}`).toEqual([]);
  });

  it("every vocabulary collision names the FIELD behind it", () => {
    // Without this, the next person sees a type name ending in 2 and reaches for the hoist — wrong
    // for every entry in this category, and it would merge unrelated concepts.
    //
    // The check is "does the note name a field in backticks", not "does it contain one of these
    // words". An assertion that greps for magic phrases punishes a well-written note that happens
    // to phrase things differently, which teaches people to write for the test.
    for (const [name, note] of FIELD_NAME_COLLISIONS) {
      expect(note.length, `${name} has no real note`).toBeGreaterThan(60);
      expect(note, `${name}'s note must name the field it collides on, in backticks`)
        .toMatch(/`[a-z][A-Za-z]*`/);
    }
  });
});
