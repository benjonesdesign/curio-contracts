// MUTATION-CHECKED 2026-09-02: red against `prev.shapes[k] !== shapes[k]` weakened to
// `!(k in prev.shapes)` in check-shapes.ts (retypes stop being detected — the exact class the
// guard exists for), and red against `describe()` returning `"object"` for ZodDiscriminatedUnion
// (the union's arms stop being part of the fingerprint, so removing an arm reads as no change);
// green against current.
//
// The guard's own unit tests. The CHECK is exercised end-to-end in CI via `npm run shapes:check`;
// these pin the fingerprinting rules that make it meaningful, because a fingerprint that ignores
// a difference reports "unchanged" with total confidence.

import { describe as d, it, expect } from "vitest";
import { z } from "zod";
import { describe as fingerprint, flatten } from "../scripts/shape-manifest.js";

d("shape fingerprint", () => {
  it("distinguishes a string field from an object field — the 2026-09-02 break", () => {
    const before = flatten("R", z.object({ error: z.string() }));
    const after = flatten("R", z.object({ error: z.object({ code: z.string() }) }));
    expect(before["R.error"]).not.toBe(after["R.error"]);
  });

  it("treats a removed enum member as a change", () => {
    // Removing a case breaks a client that switches on it; adding one is the lockstep event
    // decisions/0027 exists for. Either way the fingerprint must move.
    expect(fingerprint(z.enum(["a", "b", "c"]))).not.toBe(fingerprint(z.enum(["a", "b"])));
  });

  it("is stable under field REORDERING, so an unrelated refactor does not churn the diff", () => {
    // A guard that fires on noise gets acknowledged reflexively, which is how an acknowledgement
    // mechanism stops meaning anything.
    expect(fingerprint(z.object({ a: z.string(), b: z.number() })))
      .toBe(fingerprint(z.object({ b: z.number(), a: z.string() })));
  });

  it("treats a removed union arm as a change", () => {
    const two = z.discriminatedUnion("k", [
      z.object({ k: z.literal("a"), x: z.string() }),
      z.object({ k: z.literal("b"), y: z.string() }),
    ]);
    const one = z.discriminatedUnion("k", [z.object({ k: z.literal("a"), x: z.string() })]);
    expect(fingerprint(two)).not.toBe(fingerprint(one));
  });

  it("distinguishes optional from required, and nullable from optional", () => {
    // Making a required field optional is additive for a SENDER and breaking for a READER; making
    // an optional one required is the reverse. The guard cannot judge which — it must at least see
    // that something moved.
    expect(fingerprint(z.string())).not.toBe(fingerprint(z.string().optional()));
    expect(fingerprint(z.string().optional())).not.toBe(fingerprint(z.string().nullable()));
  });

  it("treats a REMOVED default as a change", () => {
    // Removing a .default() turns an omissible field into a required one for every existing
    // caller — breaking, and invisible in the field's underlying type.
    expect(fingerprint(z.string().default("x"))).not.toBe(fingerprint(z.string()));
  });

  it("names the failing FIELD, not just the type", () => {
    const f = flatten("Resp", z.object({ a: z.object({ b: z.string() }) }));
    expect(Object.keys(f)).toContain("Resp.a.b");
  });

  it("has no unhandled node types in the live contract surface", async () => {
    // The blind spot that would make everything above vacuous: a schema node the fingerprinter
    // does not understand collapses to `unhandled(...)`, and every change inside it reads as no
    // change. Asserted over the REAL exported surface, not a sample.
    const contracts = await import("./index.js");
    const bad: string[] = [];
    for (const [name, value] of Object.entries(contracts)) {
      if (!name.endsWith("Schema") || !(value instanceof z.ZodType)) continue;
      for (const [path, token] of Object.entries(flatten(name, value as z.ZodTypeAny))) {
        if (token.includes("unhandled(")) bad.push(`${path} = ${token}`);
      }
    }
    expect(bad, `the fingerprinter cannot see these, so changes inside them are invisible:\n${bad.join("\n")}`).toEqual([]);
  });
});
