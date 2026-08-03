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

  it("maps z.number().int() to Int and a plain z.number() to Double", () => {
    emitSwift(z.object({ count: z.number().int(), price: z.number() }), "Req");
    const out = flush();
    expect(out).toContain("public let count: Int");
    expect(out).toContain("public let price: Double");
  });
});
