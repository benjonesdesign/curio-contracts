// Drift guard, mirroring curio-tokens' `npm run check`: regenerates Swift into a scratch
// directory and diffs it against what's actually committed at Sources/CurioContracts. (dist/ (TS)
// is just tsc output of src/ and can't hand-drift the way generated Swift can; the real risk is
// Sources/CurioContracts going stale relative to src/db/database.types.ts or src/api/*.ts after a
// schema/contract edit that forgot `npm run build`.) Run in this repo's own CI and via
// contracts:check in each consumer.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const scratch = mkdtempSync(join(tmpdir(), "curio-contracts-check-"));
const env = { ...process.env, CURIO_CONTRACTS_OUT_DIR: scratch };

execFileSync("npx", ["tsx", join(root, "scripts/gen-swift-db.ts")], { cwd: root, env, stdio: "pipe" });
execFileSync("npx", ["tsx", join(root, "scripts/gen-swift-api.ts")], { cwd: root, env, stdio: "pipe" });

let drifted = false;
for (const file of ["DBTypes.swift", "APITypes.swift"]) {
  const committed = join(root, "Sources/CurioContracts", file);
  const fresh = join(scratch, file);
  const committedText = existsSync(committed) ? readFileSync(committed, "utf8") : null;
  const freshText = readFileSync(fresh, "utf8");
  if (committedText !== freshText) {
    console.error(`DRIFT: Sources/CurioContracts/${file} is stale vs a fresh \`npm run build\`.`);
    drifted = true;
  }
}

rmSync(scratch, { recursive: true, force: true });

if (drifted) {
  console.error("\nRun `npm run build` and commit the result.");
  process.exit(1);
}
console.log("curio-contracts: generated Swift output is up to date.");
