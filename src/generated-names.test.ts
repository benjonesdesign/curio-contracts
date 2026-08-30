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
// ── Two different defects wear this same symptom, and they need different fixes ──────────────
//
//   1. TRUE DUPLICATES — one concept declared inline in several schemas. `CollectionType2..5` are
//      all ["personal","resale"]. Fix: hoist to ONE named schema in common.ts and reference it.
//
//   2. NAME COLLISIONS — genuinely different concepts that share a FIELD name. `Source` is
//      vision/seller, `Source2` is stripe/apple, `Source3` is ios_capture/web_add_flow/other.
//      Merging those would be actively wrong. Fix: give each a distinct meaningful name
//      (IdentitySource, PaymentSource, CaptureSource).
//
// Both produce a name no client can rely on, so both are caught here — but do not "fix" a
// collision by merging it.

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
const KNOWN_COLLISIONS = new Set([
  // True duplicates — hoist to common.ts.
  "CollectionType2", "CollectionType3", "CollectionType4", "CollectionType5",
  "Side2", "Side3", "Side4", "Side5",   // note: Side is front/back/unknown; these are front/back
  "Grader2", "Detail2", "Detail3",
  // Name collisions — RENAME, never merge. Each is a different concept.
  "Channel2",  // Channel is {cardtrader}; Channel2 is {ebay, cardtrader}
  "Source2", "Source3",  // vision/seller vs stripe/apple vs ios_capture/web_add_flow/other
  "Status2",   // listing status vs subscription status
  "Tier2",     // identify tier vs plan tier
]);

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
