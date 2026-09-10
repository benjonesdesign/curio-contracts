// Every schema this package EXPORTS must be emitted for every target — or be exempted, by name,
// with a reason.
//
// ── WHY ─────────────────────────────────────────────────────────────────────────────────────
//
// The generators' coverage was a HAND-MAINTAINED IMPORT LIST, and no test asserted a module was
// covered. `gen-swift-api.ts` imported exactly one symbol from `card-value.ts` —
// `EditionAmbiguitySchema` — so `CardValueRequest` and `CardValueResponse` had NEVER been
// generated for Swift or Kotlin. Neither name appears once in either generated file.
//
// The cost was not hypothetical. v0.1.44 was cut to fix the Base Set Pikachu `no_market_value`
// conflation: `pricingDegraded` was added to `CardValueResponse`, tagged, made canonical, and
// bumped across three repos. IT COULD NOT REACH EITHER MOBILE CLIENT. THE RELEASE DID NOTHING FOR
// THE PLATFORMS IT WAS FOR — and every check in this repo passed, because every check was about
// something else.
//
// Found independently by iOS and Android from opposite ends. It is the FOURTH instance of the
// enumeration rule (ADR 0024): curio-tokens' AA gate was a hand-written pair list, curio-copy's
// label sets a hand-written map, a shape guard would have been a hand-listed field set, and this
// was a hand-written import list. Same failure every time — the guard reports PASS over what it
// was never pointed at.
//
// So this check DISCOVERS the surface (every export ending in `Schema`) rather than listing it. A
// module added tomorrow is covered the day it lands, with nobody remembering anything.
//
// ── WHAT THIS CHECK DOES NOT CATCH (ADR 0024) ───────────────────────────────────────────────
//
//   1. IT PROVES A TYPE WAS EMITTED, NOT THAT IT IS CORRECT OR USED. A generated struct nobody
//      decodes is still a claim; this only stops it being an ABSENT one.
//   2. IT ONLY SEES `export const *Schema`. A shape declared as a bare TypeScript type, or
//      exported under another name, is invisible here.
//   3. VISIT-BASED, SO A SCHEMA REACHED ONLY AS A NESTED FIELD COUNTS AS COVERED — correctly, but
//      it means "covered" can mean "emitted inline under a name the export does not mention".
//   4. THE EXEMPTIONS ARE UNVERIFIED CLAIMS. A wrong reason passes. The register exists to make
//      the decision visible in review, not to adjudicate it.

import { z } from "zod";
import { wasVisited as swiftVisited } from "./zod-to-swift.js";
import { wasVisited as kotlinVisited } from "./zod-to-kotlin.js";

/** Exported schemas deliberately NOT generated for the native targets. Each needs a real reason;
 *  "not needed yet" is not one, because that is the state every unreachable module was in. */
const EXEMPT: Record<string, string> = {};

export function assertCoverage(target: "swift" | "kotlin", contracts: Record<string, unknown>): void {
  const visited = target === "swift" ? swiftVisited : kotlinVisited;
  const all = Object.entries(contracts).filter(
    (e): e is [string, z.ZodTypeAny] => e[0].endsWith("Schema") && e[1] instanceof z.ZodType,
  );

  // The discovery assertion itself. A sweep that silently found nothing would pass forever — an
  // enumeration of length zero wearing better clothes.
  if (all.length < 50) {
    throw new Error(
      `assert-coverage: found only ${all.length} exported schemas, which cannot be right. ` +
        `The discovery is broken, and a broken discovery reports full coverage.`,
    );
  }

  const missing = all.map(([n]) => n).filter((n) => !visited(contracts[n] as z.ZodTypeAny) && !(n in EXEMPT));
  const staleExempt = Object.keys(EXEMPT).filter(
    (n) => !(n in contracts) || visited(contracts[n] as z.ZodTypeAny),
  );

  if (missing.length || staleExempt.length) {
    const lines = [`\n✗ ${target} generator coverage`];
    if (missing.length) {
      lines.push(
        ``,
        `  ${missing.length} exported schema(s) are never emitted for ${target}:`,
        ...missing.map((n) => `      ${n}`),
        ``,
        `  A contract module that no target emits is a CLAIM RATHER THAN AN ARTIFACT. Import the`,
        `  schema in scripts/gen-${target}-api.ts and emit it, or add it to EXEMPT in`,
        `  scripts/assert-coverage.ts with a reason. "Not needed yet" is not a reason — that is`,
        `  the state CardValueResponse was in while v0.1.44 shipped to fix it.`,
      );
    }
    if (staleExempt.length) {
      lines.push(
        ``,
        `  ${staleExempt.length} exemption(s) are stale — remove them:`,
        ...staleExempt.map((n) => `      ${n}`),
      );
    }
    throw new Error(lines.join("\n"));
  }

  console.log(
    `${target} coverage: ${all.length - Object.keys(EXEMPT).length}/${all.length} exported schemas emitted` +
      (Object.keys(EXEMPT).length ? `, ${Object.keys(EXEMPT).length} exempted` : ""),
  );
}
