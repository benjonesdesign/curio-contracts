import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { emitSwift, flush, resetForTest, registerName } from "./zod-to-swift.js";

beforeEach(() => {
  resetForTest();
});

describe("zod-to-swift", () => {
  it("reuses one Swift enum when the same schema object is referenced twice", () => {
    const Confidence = z.enum(["high", "medium", "low"]);
    const A = z.object({ confidence: Confidence });
    const B = z.object({ confidence: Confidence, other: z.string() });
    emitSwift(A, "A");
    emitSwift(B, "B");
    const out = flush();
    const enumMatches = out.match(/public enum \w+: Codable, Sendable, Equatable, Hashable \{\n {4}case high/g) ?? [];
    expect(enumMatches).toHaveLength(1);
  });

  it("sanitises enum case values that aren't valid Swift identifiers (hyphens)", () => {
    const Model = z.enum(["gpt-4o", "gpt-4o-mini"]);
    emitSwift(z.object({ model: Model }), "Req");
    const out = flush();
    // The case NAME is sanitised and the raw wire value is preserved — asserted as those two
    // properties rather than as one literal line, so the next change to the emitted shape (0027's
    // forward-compatible enums moved the raw value out of the case declaration) updates the
    // generator without silently hollowing out this test.
    expect(out).toContain("case gpt4o\n");
    expect(out).toContain("case gpt4oMini\n");
    expect(out).toContain('case "gpt-4o": self = .gpt4o');
    expect(out).toContain('case .gpt4o: return "gpt-4o"');
    expect(out).not.toMatch(/case gpt-4o/);
  });

  it("lowercases the first character of a property derived from a leading underscore", () => {
    emitSwift(z.object({ _api_usage: z.string().optional() }), "Req");
    const out = flush();
    expect(out).toContain("public let apiUsage: String?");
    expect(out).not.toContain("ApiUsage:");
  });

  it("maps an empty passthrough object to a JSON dictionary, not a hollow struct", () => {
    emitSwift(z.object({ comps: z.array(z.object({}).passthrough()) }), "Req");
    const out = flush();
    expect(out).toContain("public let comps: [[String: JSONValue]]");
    expect(out).not.toContain("struct Comp");
  });

  // Caught by inspecting generated output while adding profile.ts's SellerTypeSchema
  // (["private","business"]) — `case private = "private"` is not valid Swift and would have
  // broken the iOS build at the next contracts bump.
  it("backtick-escapes an enum case that collides with a Swift keyword", () => {
    emitSwift(z.object({ sellerType: z.enum(["private", "business"]) }), "Req");
    const out = flush();
    expect(out).toContain("case `private`\n");
    expect(out).toContain('case "private": self = .`private`');
    expect(out).not.toMatch(/case private\b(?!`)/);
    // A non-keyword case in the same enum is left unescaped.
    expect(out).toContain("case business\n");
  });

  it("backtick-escapes a property name that collides with a Swift keyword, and its CodingKey", () => {
    emitSwift(z.object({ default: z.string(), repeat: z.number().int().optional() }), "Req");
    const out = flush();
    expect(out).toContain("public let `default`: String");
    expect(out).toContain("public let `repeat`: Int?");
    // Names match their JSON keys, so CodingKeys needs no explicit string mapping — but the
    // case identifiers still have to be escaped.
    expect(out).not.toMatch(/case default\b(?!`)/);
  });

  it("maps z.number().int() to Int and a plain z.number() to Double", () => {
    emitSwift(z.object({ count: z.number().int(), price: z.number() }), "Req");
    const out = flush();
    expect(out).toContain("public let count: Int");
    expect(out).toContain("public let price: Double");
  });

  // ── decisions/0027 sibling clause — Zod defaults are a server-parse behaviour ─────────────
  it("gives a struct with a Zod default a REAL init(from:), since synthesised Codable ignores defaults", () => {
    emitSwift(z.object({ candidates: z.array(z.string()).default([]) }), "Resp");
    const out = flush();
    expect(out).toContain("public init(from decoder: Decoder) throws {");
    expect(out).toContain("try c.decodeIfPresent([String].self, forKey: .candidates) ?? []");
    // CodingKeys must exist for the decoder even though no field was renamed.
    expect(out).toContain("enum CodingKeys: String, CodingKey {");
  });

  it("leaves a struct with no defaults on synthesised Codable, unchanged", () => {
    emitSwift(z.object({ a: z.string(), b: z.string().optional() }), "Plain");
    expect(flush()).not.toContain("public init(from decoder: Decoder)");
  });
});

// ── z.discriminatedUnion ────────────────────────────────────────────────────────────────────
//
// MUTATION-CHECKED 2026-09-02: red against `return "String"` in place of the ZodDiscriminatedUnion
// branch (the pre-2026-09-02 behaviour was a throw, and a silent widen is the plausible wrong
// fix), red against dropping the `SWIFT_SHADOWED_TYPE_NAMES` guard, and red against restoring
// `if (allStringish) return "String"` ahead of the non-string-literal check; green against current.
describe("zod-to-swift: discriminated unions", () => {
  const Err = () =>
    z.discriminatedUnion("code", [
      z.object({ code: z.literal("rate_limited"), retryAfterSec: z.number().int() }),
      z.object({ code: z.literal("bad_title"), titleLength: z.number().int() }),
    ]);

  it("emits an enum with one case per arm plus a forward-compatible fallback", () => {
    const e = Err();
    registerName(e, "PublishError");   // as real call sites do — see the shadowing test below
    emitSwift(z.object({ error: e }), "Resp");
    const out = flush();
    expect(out).toContain("case rateLimited(");
    expect(out).toContain("case badTitle(");
    // The fallback carries the discriminator AND the payload. A fallback that kept only the tag
    // would decode without throwing and still lose everything the server sent — which reads as
    // working right up until someone needs the retryAfterSec from an unknown arm.
    expect(out).toContain("case unrecognised(code: String, payload: [String: JSONValue])");
  });

  it("decodes by the discriminator and tolerates its absence", () => {
    const e = Err();
    registerName(e, "PublishError");
    emitSwift(z.object({ error: e }), "Resp");
    const out = flush();
    expect(out).toContain('case "rate_limited": self = .rateLimited(');
    // decodeIfPresent, not decode — Kotlin's generated deserializer degrades on a missing
    // discriminator, and the two platforms must not disagree about a malformed body.
    expect(out).toContain("decodeIfPresent(String.self, forKey: .code) ?? \"\"");
  });

  it("refuses a type name that shadows the Swift standard library", () => {
    // `z.object({ error: <union> })` takes its name from the field and emits `public enum Error`.
    // That COMPILES, and from then on every unqualified `Error` in the module means the generated
    // enum rather than Swift.Error. Refused, because a silent rename of a public type is worse
    // than a build failure and the generator cannot guess a good name.
    expect(() => emitSwift(z.object({ error: Err() }), "X")).toThrow(/shadows the Swift standard library/);
  });

  it("refuses a union of object shapes that is not discriminated", () => {
    const bad = z.object({ thing: z.union([z.object({ a: z.string() }), z.object({ b: z.string() })]) });
    expect(() => emitSwift(bad, "Bad")).toThrow(/use z\.discriminatedUnion/);
  });

  it("types a union of non-string literals by its literal type, not as String", () => {
    // `z.union([z.literal(3), z.literal(7)])` used to widen to String, which emitted
    // `decodeIfPresent(String.self, forKey: .days) ?? 7` — Swift that does not compile. The
    // "unions widen to String" shortcut had simply never met a union that wasn't strings.
    emitSwift(z.object({ days: z.union([z.literal(3), z.literal(7)]).default(7) }), "Days");
    expect(flush()).toContain("public let days: Int");
  });

  it("keeps a heterogeneous scalar union as JSON rather than widening to String", () => {
    // eBay aspect values are `string | string[]` on the wire. Widening to String decoded the array
    // arm as a String and threw at runtime; JSONValue holds either, losslessly.
    emitSwift(z.object({ aspects: z.record(z.union([z.string(), z.array(z.string())])) }), "Aspects");
    expect(flush()).toContain("public let aspects: [String: JSONValue]");
  });

  it("emits an enum-typed default as a case, not a bare string", () => {
    const Fmt = z.enum(["FIXED_PRICE", "AUCTION"]);
    emitSwift(z.object({ format: Fmt.default("FIXED_PRICE") }), "Listing");
    // `?? "FIXED_PRICE"` where a Format is expected does not compile. Found by `swift build`,
    // not by reading the generated output.
    expect(flush()).toContain('?? Format(rawValue: "FIXED_PRICE")');
  });
});
