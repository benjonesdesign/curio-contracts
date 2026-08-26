import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { emitKotlin, flush, resetForTest } from "./zod-to-kotlin.js";

beforeEach(() => {
  resetForTest();
});

describe("zod-to-kotlin", () => {
  it("reuses one Kotlin enum when the same schema object is referenced twice", () => {
    const Confidence = z.enum(["high", "medium", "low"]);
    const A = z.object({ confidence: Confidence });
    const B = z.object({ confidence: Confidence, other: z.string() });
    emitKotlin(A, "A");
    emitKotlin(B, "B");
    const out = flush();
    const enumMatches = out.match(/public enum class \w+ \{\n {4}@SerialName\("high"\) HIGH/g) ?? [];
    expect(enumMatches).toHaveLength(1);
  });

  it("sanitises enum constants that aren't valid Kotlin identifiers (hyphens) into SCREAMING_SNAKE_CASE", () => {
    const Model = z.enum(["gpt-4o", "gpt-4o-mini"]);
    emitKotlin(z.object({ model: Model }), "Req");
    const out = flush();
    expect(out).toContain('@SerialName("gpt-4o") GPT_4O,');
    expect(out).toContain('@SerialName("gpt-4o-mini") GPT_4O_MINI');
  });

  it("lowercases the first character of a property derived from a leading underscore and adds @SerialName", () => {
    emitKotlin(z.object({ _api_usage: z.string().optional() }), "Req");
    const out = flush();
    expect(out).toContain('@SerialName("_api_usage") val apiUsage: String? = null');
  });

  it("maps an empty passthrough object to a JSON map, not a hollow data class", () => {
    emitKotlin(z.object({ comps: z.array(z.object({}).passthrough()) }), "Req");
    const out = flush();
    expect(out).toContain("val comps: List<Map<String, JsonElement>>");
    expect(out).not.toContain("data class Comp");
  });

  it("maps z.number().int() to Int and a plain z.number() to Double", () => {
    emitKotlin(z.object({ count: z.number().int(), price: z.number() }), "Req");
    const out = flush();
    expect(out).toContain("val count: Int");
    expect(out).toContain("val price: Double");
  });

  it("gives every nullable field a null default, since kotlinx.serialization otherwise requires the key present", () => {
    emitKotlin(z.object({ rarity: z.string().nullable() }), "Req");
    const out = flush();
    expect(out).toContain("val rarity: String? = null");
  });

  it("does not default a non-nullable field", () => {
    emitKotlin(z.object({ name: z.string() }), "Req");
    const out = flush();
    expect(out).toMatch(/val name: String,?\n/);
    expect(out).not.toContain("val name: String = null");
  });
});
