// The meta-guard: the one that protects the others.
//
// Every mechanism in this repo — the drift check, the digit-suffix guard, the copy-coverage
// checks — is only as good as the suite actually running it. So this asserts the suite's own
// shape, not any schema.
//
// ── Scoped to what vitest CANNOT already catch, measured rather than assumed ─────────────────
//
//   file fails to load (a bad import, a syntax error) → vitest EXITS 1 already. Covered.
//   file DELETED or renamed out of the glob ..........  exit 0, green, tests silently gone.
//   suite or test `.skip`ped .........................  exit 0, green, reported as skipped.
//
// The last two are the real hole: nothing distinguishes "this check was removed" from "this check
// never existed", and both look like a passing build. A count that only ever goes UP by deliberate
// edit is the cheapest thing that closes it.

import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Scanned from the REPO ROOT, not from src/. The first version of this guard scanned only src/
// and would have missed scripts/zod-to-swift.test.ts and scripts/zod-to-kotlin.test.ts entirely —
// deleting either would not have tripped the floor. A guard with an incomplete view of what it
// guards is the exact failure it exists to prevent.
const ROOT = join(__dirname, "..");
const IGNORED = new Set(["node_modules", ".git", "dist", "build", ".gradle", "Sources"]);

/**
 * Raise this when you ADD a test file — deliberately, as part of that change. Never lower it to
 * make a build pass: a drop means a file stopped running, and the question is which check you just
 * lost, not how to get green again.
 */
const MIN_TEST_FILES = 22;   // TypeScript only; the Swift and Kotlin targets have their own suites

function testFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? (IGNORED.has(e.name) ? [] : testFiles(join(dir, e.name)))
      : e.name.endsWith(".test.ts") ? [join(dir, e.name)] : [],
  );
}

describe("the suite has not quietly lost a file", () => {
  const files = testFiles(ROOT);

  it(`still has at least ${MIN_TEST_FILES} test files`, () => {
    expect(
      files.length,
      `${files.length} test files, floor is ${MIN_TEST_FILES}. A file was deleted, renamed, or ` +
      `moved out of the glob — find out WHICH CHECK you lost before touching this number.`,
    ).toBeGreaterThanOrEqual(MIN_TEST_FILES);
  });

  it("has no skipped suite or test without a written reason", () => {
    // A `.skip` is green and invisible in the summary beyond a count nobody reads. It is the same
    // shape as the unreachable tcgdex fallback: present, correct, and not running.
    const offenders: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      src.split("\n").forEach((line, i) => {
        if (!/\b(describe|it|test)\.skip\b/.test(line)) return;
        const preceding = src.split("\n").slice(Math.max(0, i - 3), i).join("\n");
        // A reason has to be written down next to it, or it is not a decision, it is an omission.
        if (!/SKIP:/.test(preceding)) offenders.push(`${f.replace(ROOT, "")}:${i + 1}`);
      });
    }
    expect(offenders, `skipped without a "SKIP: <why>" comment above it: ${offenders.join(", ")}`).toEqual([]);
  });
});
