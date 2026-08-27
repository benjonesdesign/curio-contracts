// Drift guard, mirroring curio-tokens' `npm run check`: regenerates EVERY published artifact into
// a scratch directory and diffs it against what's actually committed — dist/ (TypeScript),
// Sources/CurioContracts (Swift) and src/main/kotlin/com/curio/contracts (Kotlin).
//
// dist/ was deliberately excluded until 2026-08-27, on the reasoning that it "is just tsc output
// of src/ and can't hand-drift the way generated Swift/Kotlin can". That reasoning was wrong in
// the one way that matters: nothing forces `npm run build` to have been RUN. Edit a schema in
// src/, commit without building, and dist/ is stale — while Swift and Kotlin drift would have been
// caught. Since package.json's `main` is `./dist/index.js`, that ships the OLD schema to every
// TypeScript consumer under a version number claiming the new one, and every existing check passes:
// contracts-check verifies the installed commit matches the pin, versions-check verifies the pin
// matches versions.json, and neither verifies the tag CONTAINS what it claims.
//
// That hole was found while investigating a report that v0.1.25 didn't contain its own
// catalogue-lookup changes. It didn't reproduce — the tag is correct and complete, and the report
// came from reading a working tree pinned to v0.1.23 — but the mechanism behind the concern was
// genuinely open, and matters far more once Layer 0 (the shared economics engine) ships here.
//
// Run in this repo's own CI and via contracts:check in each consumer.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let drifted = false;

function checkPlatform(
  label: string,
  committedDir: string,
  genScripts: string[],
  envVar: string,
  files: string[],
) {
  const scratch = mkdtempSync(join(tmpdir(), `curio-contracts-check-${label}-`));
  const env = { ...process.env, [envVar]: scratch };
  for (const script of genScripts) {
    execFileSync("npx", ["tsx", join(root, script)], { cwd: root, env, stdio: "pipe" });
  }
  for (const file of files) {
    const committed = join(root, committedDir, file);
    const fresh = join(scratch, file);
    const committedText = existsSync(committed) ? readFileSync(committed, "utf8") : null;
    const freshText = readFileSync(fresh, "utf8");
    if (committedText !== freshText) {
      console.error(`DRIFT: ${committedDir}/${file} is stale vs a fresh \`npm run build\`.`);
      drifted = true;
    }
  }
  rmSync(scratch, { recursive: true, force: true });
}

checkPlatform(
  "swift", "Sources/CurioContracts",
  ["scripts/gen-swift-db.ts", "scripts/gen-swift-api.ts"],
  "CURIO_CONTRACTS_OUT_DIR",
  ["DBTypes.swift", "APITypes.swift"],
);
checkPlatform(
  "kotlin", "src/main/kotlin/com/curio/contracts",
  ["scripts/gen-kotlin-db.ts", "scripts/gen-kotlin-api.ts"],
  "CURIO_CONTRACTS_KOTLIN_OUT_DIR",
  ["DBTypes.kt", "APITypes.kt"],
);

// ── dist/ (TypeScript) — what every npm consumer actually imports ───────────
// Compiled fresh into a scratch dir and compared file-by-file against the committed dist/.
function walk(dir: string, base = ""): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    return statSync(full).isDirectory() ? walk(full, rel) : [rel];
  });
}

const distScratch = mkdtempSync(join(tmpdir(), "curio-contracts-check-dist-"));
execFileSync("npx", ["tsc", "-p", "tsconfig.build.json", "--outDir", distScratch], {
  cwd: root, stdio: "pipe",
});

const committedDist = join(root, "dist");
const freshFiles = walk(distScratch);
const committedFiles = walk(committedDist);

for (const rel of freshFiles) {
  const committed = join(committedDist, rel);
  if (!existsSync(committed)) {
    console.error(`DRIFT: dist/${rel} is missing — a fresh build emits it.`);
    drifted = true;
    continue;
  }
  if (readFileSync(committed, "utf8") !== readFileSync(join(distScratch, rel), "utf8")) {
    console.error(`DRIFT: dist/${rel} does not match a fresh build of src/.`);
    drifted = true;
  }
}
for (const rel of committedFiles) {
  if (!freshFiles.includes(rel)) {
    console.error(`DRIFT: dist/${rel} is committed but a fresh build does not emit it (stale file).`);
    drifted = true;
  }
}
rmSync(distScratch, { recursive: true, force: true });

// ── Release integrity — does this commit's version claim match its position? ─
// Cheap assertions that would have caught the v0.1.10-v0.1.12 orphan-tag incident
// (versions.json's own note records it) rather than finding it months later by accident.
const pkgVersion = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version as string;
let headTag: string | null = null;
try {
  headTag = execFileSync("git", ["tag", "--points-at", "HEAD"], { cwd: root, encoding: "utf8" })
    .split("\n").map((t) => t.trim()).filter(Boolean)[0] ?? null;
} catch { /* not a git checkout — skip */ }

if (headTag) {
  if (headTag !== `v${pkgVersion}`) {
    console.error(`DRIFT: HEAD is tagged ${headTag} but package.json says ${pkgVersion}.`);
    drifted = true;
  }
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", headTag, "origin/main"], { cwd: root, stdio: "pipe" });
  } catch {
    console.error(`DRIFT: tag ${headTag} is not an ancestor of origin/main — an orphan tag. A consumer pinning it would get content that never landed on main.`);
    drifted = true;
  }
}

if (drifted) {
  console.error("\nRun `npm run build` and commit the result.");
  process.exit(1);
}
console.log(`curio-contracts: dist, Swift and Kotlin output all match a fresh build${headTag ? ` (${headTag})` : ""}.`);
