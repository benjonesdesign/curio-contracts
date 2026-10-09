// A SKU is given when the copy is added and is NEVER EDITABLE (owner, 2026-10-08).
//
// "Never editable" is only true of a contract if no request type can carry one. This walks every
// exported request/patch/input schema, recursively, and fails if any has a `sku` key — so adding
// `sku` to a PATCH or a publish body is a red build, not a review comment. (A response may carry a
// sku; the server's own writes are not requests.) The walk DISCOVERS the schemas from the index
// rather than listing them, for the reason assert-coverage.ts gives: a hand list reports PASS over
// whatever it was never pointed at.
//
// MUTATION-CHECKED 2026-10-08: red against `sku: z.string().optional()` added to
// EbayPublishRequestSchema, to ProfilePatchSchema (nested), and to ListingPreviewItemRequestSchema.

import { describe, it, expect } from "vitest";
import { z } from "zod";
import * as contracts from "./index.js";

function keysOf(schema: z.ZodTypeAny, seen = new Set<z.ZodTypeAny>()): string[] {
  if (seen.has(schema)) return [];
  seen.add(schema);
  if (schema instanceof z.ZodEffects) return keysOf(schema.innerType(), seen);
  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) return keysOf(schema.unwrap(), seen);
  if (schema instanceof z.ZodDefault) return keysOf(schema._def.innerType, seen);
  if (schema instanceof z.ZodArray) return keysOf(schema.element, seen);
  if (schema instanceof z.ZodRecord) return keysOf(schema._def.valueType, seen);
  if (schema instanceof z.ZodUnion || schema instanceof z.ZodDiscriminatedUnion) {
    return (schema.options as z.ZodTypeAny[]).flatMap((o) => keysOf(o, seen));
  }
  if (schema instanceof z.ZodObject) {
    return Object.entries(schema.shape as Record<string, z.ZodTypeAny>).flatMap(([k, v]) => [k, ...keysOf(v, seen).map((n) => `${k}.${n}`)]);
  }
  return [];
}

const REQUESTS: [string, z.ZodTypeAny][] = Object.entries(contracts as Record<string, unknown>)
  .filter(([name, v]) => /(Request|Patch|Input)Schema$/.test(name) && v instanceof z.ZodType)
  .map(([name, v]) => [name, v as z.ZodTypeAny]);

describe("no request type carries a SKU (it is given on add and never editable)", () => {
  it("discovers the request surface (a sweep that found nothing would pass forever)", () => {
    expect(REQUESTS.length).toBeGreaterThan(15);
    expect(REQUESTS.map(([n]) => n)).toContain("ProfilePatchSchema");
    expect(REQUESTS.map(([n]) => n)).toContain("EbayPublishRequestSchema");
    expect(REQUESTS.map(([n]) => n)).toContain("ListingPreviewRequestSchema");
  });

  it.each(REQUESTS)("%s has no sku key, at any depth", (name, schema) => {
    const skuKeys = keysOf(schema).filter((k) => k.split(".").pop()!.toLowerCase() === "sku");
    expect(skuKeys, `${name} accepts a SKU (${skuKeys.join(", ")}): a SKU must never be sent by a client`).toEqual([]);
  });

  it("does see a sku when one is present (the walker is not blind)", () => {
    const probe = z.object({ nested: z.array(z.object({ sku: z.string().optional() })).optional() }).superRefine(() => {});
    expect(keysOf(probe).some((k) => k.endsWith("sku"))).toBe(true);
  });
});
