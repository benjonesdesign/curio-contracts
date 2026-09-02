#!/usr/bin/env tsx
// Regenerate the shape manifest and refuse a BREAKING change that nobody wrote down.
// See scripts/shape-manifest.ts for why this exists and — importantly — for the four things it
// does not catch.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { flatten } from "./shape-manifest.js";
import * as contracts from "../src/index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST = join(root, "shape-manifest.json");

/** Every exported `*Schema` in the public surface. Discovered rather than listed: a hand-kept list
 *  is a list that goes stale, and an unwatched schema is the failure this file exists to stop. */
function currentShapes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(contracts)) {
    if (!name.endsWith("Schema")) continue;
    if (!(value instanceof z.ZodType)) continue;
    Object.assign(out, flatten(name.replace(/Schema$/, ""), value as z.ZodTypeAny));
  }
  return out;
}

type Manifest = {
  $comment: string[];
  /** Change signatures the author has explicitly accepted as breaking, e.g.
   *  "EbayPublishErrorResponse.error: string -> object". Each needs a reason. */
  breakingAcknowledged: Record<string, string>;
  shapes: Record<string, string>;
};

const shapes = currentShapes();
const write = process.argv.includes("--write");

if (!existsSync(MANIFEST)) {
  if (!write) {
    console.error(`${MANIFEST} does not exist — run \`npm run shapes:write\` and commit it.`);
    process.exit(1);
  }
}

const prev: Manifest = existsSync(MANIFEST)
  ? (JSON.parse(readFileSync(MANIFEST, "utf8")) as Manifest)
  : { $comment: [], breakingAcknowledged: {}, shapes: {} };

const removed = Object.keys(prev.shapes).filter((k) => !(k in shapes));
const retyped = Object.keys(shapes)
  .filter((k) => k in prev.shapes && prev.shapes[k] !== shapes[k])
  .map((k) => ({ path: k, from: prev.shapes[k], to: shapes[k] }));
const added = Object.keys(shapes).filter((k) => !(k in prev.shapes));

const sig = (p: string, from: string, to: string) => `${p}: ${from} -> ${to}`;
const unacknowledged = [
  ...removed.map((p) => sig(p, prev.shapes[p], "REMOVED")),
  ...retyped.map((r) => sig(r.path, r.from, r.to)),
].filter((s) => !(s in prev.breakingAcknowledged));

if (write) {
  const next: Manifest = {
    $comment: prev.$comment.length ? prev.$comment : [
      "Structural fingerprint of every exported *Schema. Regenerate with `npm run shapes:write`.",
      "A REMOVED or RETYPED path is a BREAKING change for every consumer that read it — known or",
      "not — and `npm run shapes:check` fails until the exact signature appears in",
      "breakingAcknowledged WITH A REASON. Added paths need no acknowledgement.",
      "",
      "This exists because a contract repo's tests validate THE CONTRACT, never its consumers.",
      "On 2026-09-02 a change promoting EbayPublishErrorResponse.error from string to an object",
      "passed 177 TypeScript tests, 12 Swift and 28 Kotlin, and would have rendered",
      "'[object Object]' in a toast on three web screens. It was caught by opening the call sites",
      "by hand. This is the mechanism that would have caught it without them.",
    ],
    breakingAcknowledged: prev.breakingAcknowledged,
    shapes,
  };
  writeFileSync(MANIFEST, JSON.stringify(next, null, 2) + "\n");
  console.log(`shape-manifest.json written — ${Object.keys(shapes).length} paths` +
    (added.length ? `, ${added.length} added` : "") +
    (unacknowledged.length ? `, ⚠️ ${unacknowledged.length} UNACKNOWLEDGED BREAKING` : ""));
  if (unacknowledged.length) {
    console.error("\nWriting the manifest does NOT acknowledge these — add each to " +
      "breakingAcknowledged with a reason:\n" + unacknowledged.map((s) => `    ${s}`).join("\n"));
    process.exit(1);
  }
  process.exit(0);
}

if (unacknowledged.length) {
  console.error("✗ BREAKING shape change(s) with no acknowledgement:\n");
  for (const s of unacknowledged) console.error(`    ${s}`);
  console.error(
    "\n  A removed or retyped field breaks every consumer that read it — known or not. This repo's" +
    "\n  own tests cannot see that: they validate the contract, not its consumers." +
    "\n" +
    "\n  If the break is intended, add each signature to `breakingAcknowledged` in" +
    "\n  shape-manifest.json with a reason, and treat it as a lockstep release (0012)." +
    "\n  If it is not, the usual fix is to make the change ADDITIVE — a new field beside the old" +
    "\n  one — which is what EbayPublishErrorResponse.failure is.\n"
  );
  process.exit(1);
}

const stale = added.length || retyped.length || removed.length;
if (stale) {
  console.error(`✗ shape-manifest.json is stale (${added.length} added, ${retyped.length} retyped, ` +
    `${removed.length} removed, all acknowledged) — run \`npm run shapes:write\` and commit it.`);
  process.exit(1);
}

console.log(`shapes: ${Object.keys(shapes).length} paths unchanged`);
