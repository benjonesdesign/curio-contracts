import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { emitKotlin, flush, resetForTest, registerName } from "./zod-to-kotlin.js";

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
    const enumMatches = out.match(/public sealed interface \w+ \{/g) ?? [];
    expect(enumMatches).toHaveLength(1);
  });

  it("sanitises enum constants that aren't valid Kotlin identifiers (hyphens) into SCREAMING_SNAKE_CASE", () => {
    const Model = z.enum(["gpt-4o", "gpt-4o-mini"]);
    emitKotlin(z.object({ model: Model }), "Req");
    const out = flush();
    // The raw wire value now lives on `rawValue` rather than in a @SerialName annotation, because
    // the serializer is hand-rolled (decisions/0027) — but the sanitised identifier is unchanged.
    expect(out).toContain('public object GPT_4O : Model {');
    expect(out).toContain('override val rawValue: String get() = "gpt-4o"');
    expect(out).toContain('public object GPT_4O_MINI : Model {');
  });

  // ── decisions/0027 — forward-compatible enum shape ────────────────────────────────────────
  it("emits an Unknown case carrying the raw value, so an unrecognised value cannot throw", () => {
    emitKotlin(z.object({ game: z.enum(["pokemon", "mtg"]) }), "Req");
    const out = flush();
    expect(out).toContain("public data class Unknown(override val rawValue: String) : Game");
    expect(out).toContain("else -> Unknown(raw)");
  });

  it("routes the enum through a hand-rolled KSerializer, not kotlinx's enum handling", () => {
    // A plain @Serializable enum class is what throws on an unknown value. Asserting the
    // annotation names OUR serializer is what pins the fix in place: reverting to the old shape
    // fails here, not six months later when a ninth game ships.
    emitKotlin(z.object({ game: z.enum(["pokemon", "mtg"]) }), "Req");
    const out = flush();
    expect(out).toContain("@Serializable(with = GameSerializer::class)");
    expect(out).toContain("public object GameSerializer : KSerializer<Game> {");
    expect(out).toContain("PrimitiveSerialDescriptor(\"Game\", PrimitiveKind.STRING)");
    expect(out).not.toContain("public enum class");
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

  // ── decisions/0027 sibling clause — Zod defaults are a server-parse behaviour ─────────────
  it("emits a Zod .default([]) as a Kotlin default, so an ABSENT key still decodes", () => {
    emitKotlin(z.object({ candidates: z.array(z.string()).default([]) }), "Resp");
    const out = flush();
    expect(out).toContain("val candidates: List<String> = emptyList()");
  });

  it("does not invent a default for a plain required array", () => {
    // The distinction under test: .default([]) is a wire-absence guarantee, a bare array is not.
    emitKotlin(z.object({ candidates: z.array(z.string()) }), "Resp");
    expect(flush()).toContain("val candidates: List<String>,");
  });
});

// ── z.discriminatedUnion ────────────────────────────────────────────────────────────────────
//
// MUTATION-CHECKED 2026-09-02: red against `return "String"` in place of the ZodDiscriminatedUnion
// branch, red against `Unknown(tag ?: "", JsonObject(emptyMap()))` in place of
// `Unknown(tag ?: "", obj)`, and red against restoring the blanket `return "String"` for every
// ZodUnion; green against current.
describe("zod-to-kotlin: discriminated unions", () => {
  const Err = () =>
    z.discriminatedUnion("code", [
      z.object({ code: z.literal("rate_limited"), retryAfterSec: z.number().int() }),
      z.object({ code: z.literal("bad_title"), titleLength: z.number().int() }),
    ]);

  it("emits a sealed interface with each arm as a member and an Unknown fallback", () => {
    const e = Err();
    registerName(e, "PublishError");
    emitKotlin(z.object({ error: e }), "Resp");
    const out = flush();
    expect(out).toContain("public sealed interface PublishError");
    expect(out).toMatch(/data class PublishErrorRateLimited\([\s\S]*?\) : PublishError/);
    expect(out).toMatch(/data class PublishErrorBadTitle\([\s\S]*?\) : PublishError/);
    // Carries the payload, not just the tag — a fallback that kept only the name would decode
    // without throwing and still lose everything the server sent.
    expect(out).toContain("public data class Unknown(val code: String, val payload: JsonObject) : PublishError");
  });

  it("dispatches on the discriminator and degrades when it is absent", () => {
    const e = Err();
    registerName(e, "PublishError");
    emitKotlin(z.object({ error: e }), "Resp");
    const out = flush();
    expect(out).toContain('"rate_limited" -> input.json.decodeFromJsonElement(PublishErrorRateLimited.serializer(), obj)');
    // Swift's generated decoder does the same on a missing discriminator. The two platforms must
    // not disagree about a malformed body.
    expect(out).toContain('else -> PublishError.Unknown(tag ?: "", obj)');
  });

  it("refuses a union of object shapes that is not discriminated", () => {
    const bad = z.object({ thing: z.union([z.object({ a: z.string() }), z.object({ b: z.string() })]) });
    expect(() => emitKotlin(bad, "Bad")).toThrow(/use z\.discriminatedUnion/);
  });

  it("types a union of non-string literals by its literal type, not as String", () => {
    emitKotlin(z.object({ days: z.union([z.literal(3), z.literal(7)]).default(7) }), "Days");
    expect(flush()).toContain("val days: Int = 7");
  });

  it("keeps a heterogeneous scalar union as JSON rather than widening to String", () => {
    emitKotlin(z.object({ aspects: z.record(z.union([z.string(), z.array(z.string())])) }), "Aspects");
    expect(flush()).toContain("val aspects: Map<String, JsonElement>");
  });

  it("emits an enum-typed default as a case, not a bare string", () => {
    const Fmt = z.enum(["FIXED_PRICE", "AUCTION"]);
    emitKotlin(z.object({ format: Fmt.default("FIXED_PRICE") }), "Listing");
    expect(flush()).toContain('= Format.from("FIXED_PRICE")');
  });
});
