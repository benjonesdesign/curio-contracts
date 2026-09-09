// A structural fingerprint of every published schema, so a BREAKING change to one cannot land
// silently.
//
// ── WHY THIS EXISTS ─────────────────────────────────────────────────────────────────────────
//
// On 2026-09-02 a contract change promoted `EbayPublishErrorResponse.error` from `string` to an
// object. Three web screens render `data.error` straight into a toast, so it would have shown a
// seller "[object Object]" mid-publish. THIS REPO'S ENTIRE SUITE WAS GREEN ON THAT SHAPE — 177
// TypeScript tests, 12 Swift, 28 Kotlin — because a contract repo's tests validate THE CONTRACT,
// never its consumers. Nothing here reads a payload the way a screen does.
//
// It was caught by opening the three call sites by hand. That is not a mechanism, and the question
// worth answering was whether one existed. It does, and it is not "test the consumers" — which
// cannot work from here, since the consumers are in other repos and pinned to older versions
// anyway. It is: NOTICE THAT AN EXISTING FIELD CHANGED TYPE, and make the author say so.
//
// A breaking change does not need a consumer to be identified as breaking. `string` -> `object` on
// a shipped field is breaking for everyone who read it, known or not.
//
// ── WHAT THIS CHECK DOES NOT CATCH (ADR 0024) ───────────────────────────────────────────────
//
//   1. SEMANTIC CHANGES. A field that stays `string` and changes MEANING — "GBP" to "pence", an
//      id to a slug — is invisible here. This is a shape guard, not a meaning guard, and the
//      shape is the smaller half of compatibility.
//   2. IT CANNOT TELL A JUSTIFIED BREAK FROM AN ACCIDENT. It forces the author to WRITE DOWN that
//      the change is breaking; it has no opinion on whether they should. A wrong acknowledgement
//      passes.
//   3. ADDITIVE-TO-A-REQUEST IS TREATED AS ADDITIVE, and for a REQUIRED request field that is
//      wrong — a new required field breaks every existing caller. Flagged as `added-required`
//      rather than silently allowed, but not failed, because the response case (harmless) and the
//      request case (breaking) are indistinguishable from the schema alone.
//   4. IT ONLY SEES SCHEMAS REGISTERED IN THIS FILE. A schema exported from src/api and never
//      listed below is unwatched. The completeness assertion in the check guards that.

import { z } from "zod";

/** A compact, stable, human-readable type token. Stability matters more than precision: the diff
 *  is only useful if an unrelated refactor doesn't churn every line. */
export function describe(schema: z.ZodTypeAny, depth = 0): string {
  if (depth > 12) return "…";
  if (schema instanceof z.ZodOptional) return `${describe(schema._def.innerType, depth + 1)}?`;
  if (schema instanceof z.ZodNullable) return `${describe(schema._def.innerType, depth + 1)}|null`;
  // A default makes a field OMISSIBLE for the sender but never changes the decoded type, so it is
  // recorded rather than folded away: adding one is additive, REMOVING one is breaking.
  if (schema instanceof z.ZodDefault) return `${describe(schema._def.innerType, depth + 1)}=default`;
  if (schema instanceof z.ZodEffects) return describe(schema._def.schema, depth + 1);
  if (schema instanceof z.ZodString) return "string";
  if (schema instanceof z.ZodNumber) {
    return (schema._def.checks ?? []).some((c: { kind: string }) => c.kind === "int") ? "int" : "number";
  }
  if (schema instanceof z.ZodBoolean) return "boolean";
  if (schema instanceof z.ZodNull) return "null";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "unknown";
  if (schema instanceof z.ZodLiteral) return `literal(${JSON.stringify(schema._def.value)})`;
  if (schema instanceof z.ZodEnum) {
    // Enum MEMBERS are part of the shape: removing one breaks a client that switches on it, and
    // adding one is the lockstep event decisions/0027 exists for.
    return `enum(${[...(schema._def.values as string[])].sort().join("|")})`;
  }
  if (schema instanceof z.ZodArray) return `${describe(schema._def.type, depth + 1)}[]`;
  if (schema instanceof z.ZodRecord) return `record<${describe(schema._def.valueType, depth + 1)}>`;
  if (schema instanceof z.ZodUnion) {
    return `union(${(schema._def.options as z.ZodTypeAny[]).map((o) => describe(o, depth + 1)).sort().join("|")})`;
  }
  if (schema instanceof z.ZodDiscriminatedUnion) {
    const d = schema._def.discriminator as string;
    const arms = (schema._def.options as z.ZodObject<z.ZodRawShape>[])
      .map((o) => {
        const lit = (o._def.shape() as Record<string, z.ZodTypeAny>)[d];
        return lit instanceof z.ZodLiteral ? String(lit._def.value) : "?";
      })
      .sort();
    return `discriminated(${d}:${arms.join("|")})`;
  }
  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape() as Record<string, z.ZodTypeAny>;
    const fields = Object.keys(shape).sort().map((k) => `${k}:${describe(shape[k], depth + 1)}`);
    return `{${fields.join(",")}}`;
  }
  return `unhandled(${schema.constructor.name})`;
}

/** Flatten a top-level schema into `Type.path -> token` entries, so a diff points at the FIELD
 *  that changed rather than at a 600-character object token. */
export function flatten(name: string, schema: z.ZodTypeAny): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (path: string, s: z.ZodTypeAny, depth: number): void => {
    if (depth > 12) return;
    let inner = s;
    let suffix = "";
    while (
      inner instanceof z.ZodOptional ||
      inner instanceof z.ZodNullable ||
      inner instanceof z.ZodDefault ||
      inner instanceof z.ZodEffects
    ) {
      if (inner instanceof z.ZodOptional) suffix += "?";
      else if (inner instanceof z.ZodNullable) suffix += "|null";
      else if (inner instanceof z.ZodDefault) suffix += "=default";
      inner = inner instanceof z.ZodEffects ? inner._def.schema : inner._def.innerType;
    }
    if (inner instanceof z.ZodObject) {
      const shape = inner._def.shape() as Record<string, z.ZodTypeAny>;
      // The object itself is recorded too — otherwise removing its LAST field would show as a
      // removal with no trace that the container still exists.
      out[path] = `object${suffix}`;
      for (const k of Object.keys(shape).sort()) walk(`${path}.${k}`, shape[k], depth + 1);
      return;
    }
    if (inner instanceof z.ZodArray) {
      out[path] = `array${suffix}`;
      walk(`${path}[]`, inner._def.type, depth + 1);
      return;
    }
    out[path] = describe(s, depth);
  };
  walk(name, schema, 0);
  return out;
}
