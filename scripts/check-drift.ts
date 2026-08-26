// Drift guard, mirroring curio-tokens' `npm run check`: regenerates Swift AND Kotlin into scratch
// directories and diffs each against what's actually committed at Sources/CurioContracts /
// src/main/kotlin/com/curio/contracts. (dist/ (TS) is just tsc output of src/ and can't hand-drift
// the way generated Swift/Kotlin can; the real risk is either generated tree going stale relative
// to src/db/database.types.ts or src/api/*.ts after a schema/contract edit that forgot `npm run
// build`.) Run in this repo's own CI and via contracts:check in each consumer.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
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

if (drifted) {
  console.error("\nRun `npm run build` and commit the result.");
  process.exit(1);
}
console.log("curio-contracts: generated Swift and Kotlin output is up to date.");
