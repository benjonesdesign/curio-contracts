// Regenerates src/db/database.types.ts from the live Supabase schema, then curates it down to
// the shared subset this repo owns (see the scope note at the top of database.types.ts). Wraps
// the canonical `supabase gen types typescript` — install the Supabase CLI first
// (https://supabase.com/docs/guides/local-development/cli/getting-started) or run this via the
// Supabase MCP tool's `generate_typescript_types` in an agent session, then hand the raw output
// to `curate()` below the same way.
//
// After running this, run `npm run build` (regenerates the Swift structs FROM this file — see
// gen-swift-db.ts) before committing, so TS and Swift move together in one release step.
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const PROJECT_ID = "gldoykgslhhpuhjudyxl"; // pokemon-tool's Supabase project

const SHARED_TABLES = [
  "audit_events",
  "catalogue_cards",
  "catalogue_sets",
  "condition_assessments",
  "physical_cards",
  "profiles",
  "scan_items",
  "valuation_snapshots",
];

function curate(fullOutput: string): string {
  const header = `// AUTO-GENERATED — do not edit by hand.
//
// Source of truth: the Supabase schema for project \`${PROJECT_ID}\` (pokemon-tool's DB).
// Regenerate via \`npm run gen:db\` (wraps \`supabase gen types typescript --project-id
// ${PROJECT_ID}\`), then re-run \`npm run build\` — the Swift structs in
// \`Sources/CurioContracts/DBTypes.swift\` are derived FROM this file in the same build step, so
// TS and Swift cannot diverge. See README.md "Releasing a new version".
//
// Scope: this is the SHARED subset both web and iOS consume — physical_cards, catalogue_cards,
// catalogue_sets, valuation_snapshots, profiles, scan_items, condition_assessments, audit_events.
// It is not a mirror of the full app schema (acquisitions, sales, purchases, etc. stay
// pokemon-tool-local — regenerate this file's table list if a consumer needs another one).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
`;

  const blocks: string[] = [];
  for (const table of SHARED_TABLES) {
    const re = new RegExp(`\\n      ${table}: \\{[\\s\\S]*?\\n      \\}\\n(?=      \\w|    \\})`);
    const m = re.exec(fullOutput);
    if (!m) throw new Error(`Table "${table}" not found in supabase gen types output — schema may have changed shape.`);
    blocks.push(m[0].replace(/^\n/, ""));
  }

  return header + blocks.join("") + "    }\n  }\n}\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let raw: string;
  try {
    raw = execFileSync("supabase", ["gen", "types", "typescript", "--project-id", PROJECT_ID], {
      encoding: "utf8",
    });
  } catch (e) {
    console.error(
      "Could not run `supabase gen types typescript` — install the Supabase CLI " +
        "(https://supabase.com/docs/guides/local-development/cli/getting-started) and `supabase login` first.\n" +
        "Alternatively, in an agent session with the Supabase MCP tool connected, call " +
        "`generate_typescript_types` for project " +
        PROJECT_ID +
        " and pass its output to curate() by hand.",
    );
    throw e;
  }
  writeFileSync(join(root, "src/db/database.types.ts"), curate(raw));
  console.log("Wrote src/db/database.types.ts — now run `npm run build`.");
}
