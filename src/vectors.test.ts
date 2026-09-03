// The TypeScript runner for decisions/0026's golden vectors.
//
// Three languages read THIS FILE'S fixtures — not three copies of them. A vector that behaves one
// way in TypeScript and another in Swift is then a parity bug the moment it is written, rather
// than on the morning a ninth game ships.
//
// ── TS ASSERTS THE OPPOSITE OF SWIFT AND KOTLIN, AND THAT IS THE DESIGN ─────────────────────
//
// The first draft of this file asserted the payloads PARSE. They do not, and they should not:
//
//   server (TypeScript)  validates what it EMITS   → must REJECT a value it does not know
//   clients (Swift/Kotlin) decode what they RECEIVE → must TOLERATE a value they do not know
//
// A strict server and lenient clients is not an inconsistency, it is the correct asymmetry: we
// never want to emit an unrecognised enum, and we must never fall over on receiving one from a
// newer server. So the same fixture proves the server refuses it and the clients survive it.
//
// This side also happens to be the STALE-FIXTURE GUARD, which is why it is worth having at all.
// If one of these values is ever added to a real enum, TypeScript starts accepting it, this file
// goes red, and someone picks a new unknown value — instead of three suites quietly passing while
// testing nothing. That is decisions/0024's stale-fixture pathology, aimed at the suite written
// to prevent it.

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CatalogueLookupResponseSchema } from "./api/catalogue-lookup.js";
import { EbayPublishErrorResponseSchema } from "./api/ebay-publish.js";

type Vector = {
  name: string;
  type: string;
  why: string;
  payload: unknown;
  /** True for a payload the SERVER legitimately accepts and clients must also survive — an
   *  additive field on a known variant. Zod strips unknown keys rather than rejecting them, so
   *  asserting rejection on one of these would assert the opposite of the design. Absent means
   *  the original class: a value the server must refuse to emit. */
  serverAccepts?: boolean;
};

const { vectors } = JSON.parse(
  readFileSync(join(__dirname, "..", "vectors", "enum-forward-compat.json"), "utf8"),
) as { vectors: Vector[] };

/** Vector `type` → schema. Hand-written, and asserted complete below: a vector naming a type that
 *  is not here would be skipped silently, which is the failure this whole suite exists to stop. */
const SCHEMAS: Record<string, { safeParse: (v: unknown) => { success: boolean } }> = {
  CatalogueLookupResponse: CatalogueLookupResponseSchema,
  EbayPublishErrorResponse: EbayPublishErrorResponseSchema,
};

describe("golden vectors (decisions/0026)", () => {
  it("finds vectors to run — guards against an empty or unreadable fixture file", () => {
    expect(vectors.length).toBeGreaterThan(0);
  });

  it("every vector names a type this runner knows", () => {
    const unknown = vectors.map((v) => v.type).filter((t) => !(t in SCHEMAS));
    expect(unknown, `add these to SCHEMAS, do not let them skip: ${unknown.join(", ")}`).toEqual([]);
  });

  it("every vector explains what it is for", () => {
    // A vector without a `why` becomes un-deletable — nobody can tell whether it still guards
    // anything, so it survives forever as noise.
    for (const v of vectors) expect(v.why?.length ?? 0, v.name).toBeGreaterThan(40);
  });

  it.each(vectors.filter((v) => !v.serverAccepts).map((v) => [v.name, v] as const))(
    "%s is REJECTED by the reference implementation, so the value is genuinely unknown",
    (_n, v) => {
      const r = SCHEMAS[v.type].safeParse(v.payload);
      expect(
        r.success,
        "this payload now parses in TypeScript, so its 'unknown' value has been added to a real " +
        "enum. The vector is no longer testing anything — pick a new unrecognised value.",
      ).toBe(false);
    },
  );

  it.each(vectors.filter((v) => v.serverAccepts).map((v) => [v.name, v] as const))(
    "%s is ACCEPTED by the reference implementation, as an additive change should be",
    (_n, v) => {
      const r = SCHEMAS[v.type].safeParse(v.payload);
      expect(
        r.success,
        "this payload no longer parses, so the server has become strict about an additive field. " +
        "That is a breaking change for every older client, not a fixture problem.",
      ).toBe(true);
    },
  );

  it("both vector classes are populated — an empty class asserts nothing", () => {
    // Without this, deleting every serverAccepts vector would leave a green suite whose
    // additive-change guard had silently stopped existing.
    expect(vectors.filter((v) => v.serverAccepts).length).toBeGreaterThan(0);
    expect(vectors.filter((v) => !v.serverAccepts).length).toBeGreaterThan(0);
  });

  it("a fully-known ERROR payload DOES parse", () => {
    // The control for the union vectors. Without it, an EbayPublishErrorResponseSchema that
    // rejected everything would make all three union vectors pass while proving nothing.
    const r = EbayPublishErrorResponseSchema.safeParse({
      error: "Title is 84 characters",
      code: "title_too_long",
      failure: { code: "title_too_long", message: "Title is 84 characters", titleLength: 84, maxLength: 80 },
    });
    expect(r.success, "the control error payload must parse, or the rejections above prove nothing").toBe(true);
  });

  it("a fully-known payload of the same shape DOES parse", () => {
    // Without this, every vector above would pass if the schema simply rejected everything —
    // a suite that cannot tell "correctly refused" from "broken" is the vacuous case.
    const r = CatalogueLookupResponseSchema.safeParse({
      match: {
        game: "pokemon", nativeId: "p-4", name: "Charizard", setName: "Base",
        cardNumber: "4", rarity: null, language: "en", image: null,
      },
      confidence: "high",
      candidates: [],
    });
    expect(r.success, "the control payload must parse, or the rejections above prove nothing").toBe(true);
  });
});
