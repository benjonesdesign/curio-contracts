import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { emitSwift, flush, resetForTest } from "./zod-to-swift.js";

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
    const enumMatches = out.match(/public enum \w+: String, Codable, Sendable \{\n {4}case high/g) ?? [];
    expect(enumMatches).toHaveLength(1);
  });

  it("sanitises enum case values that aren't valid Swift identifiers (hyphens)", () => {
    const Model = z.enum(["gpt-4o", "gpt-4o-mini"]);
    emitSwift(z.object({ model: Model }), "Req");
    const out = flush();
    expect(out).toContain('case gpt4o = "gpt-4o"');
    expect(out).toContain('case gpt4oMini = "gpt-4o-mini"');
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
    expect(out).toContain('case `private` = "private"');
    expect(out).not.toMatch(/case private = /);
    // A non-keyword case in the same enum is left unescaped.
    expect(out).toContain('case business = "business"');
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
