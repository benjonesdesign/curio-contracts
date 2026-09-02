// A small, purpose-built Zod v3 -> Swift Codable walker. Not a general-purpose codegen library —
// it covers exactly the Zod node types used in src/api/*.ts (object/string/number/boolean/array/
// enum/nullable/optional/union/record/unknown/literal/passthrough). Walks the REAL zod schema
// objects (not a JSON Schema intermediate), so the SAME schema object referenced from two places
// (e.g. ConfidenceSchema used for both `confidence` and `game_confidence`) emits exactly one
// Swift type, reused — tracked by object identity (`schemaToName`), independent of whether the
// caller also gave it an explicit name via `registerName()`.
import { z } from "zod";

interface StructField {
  name: string;
  swiftType: string;
  /** Swift literal for a Zod .default(), or null when the field has none. */
  zodDefault?: string | null;
}

interface EmittedType {
  kind: "struct" | "enum";
  name: string;
  code: string;
}

const nameRegistry = new WeakMap<z.ZodTypeAny, string>();
// Populated the first time ANY schema object is emitted (named or not) — makes reuse automatic
// even when a schema is passed to resolve() twice without an explicit registerName() call.
const schemaToName = new WeakMap<z.ZodTypeAny, string>();
const emitted = new Map<string, EmittedType>();

export function registerName(schema: z.ZodTypeAny, name: string): void {
  nameRegistry.set(schema, name);
}

function pascalCase(s: string): string {
  return s
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("");
}

// Swift property/argument name: camelCase, first character always lowercase (including when the
// source starts with an underscore, e.g. "_api_usage" -> "apiUsage", not "ApiUsage").
function swiftFieldName(name: string): string {
  const pascal = pascalCase(name);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : pascal;
}

// Swift keywords that cannot appear bare as a declaration name. A schema value like "private"
// (profile.ts's SellerTypeSchema) would otherwise emit `case private = "private"`, which does not
// compile — caught by inspecting the generated output, 2026-08-27. Backticks make any of these
// legal, and are harmless on a name that didn't need them, so escaping is applied by lookup
// rather than by trying to detect a compile failure. Not exhaustive over every Swift contextual
// keyword (most of those ARE legal bare); this is the set that genuinely can't be used raw.
const SWIFT_RESERVED = new Set([
  "associatedtype", "borrowing", "case", "catch", "class", "consuming", "continue", "default",
  "defer", "deinit", "do", "else", "enum", "extension", "fallthrough", "false", "fileprivate",
  "for", "func", "guard", "if", "import", "in", "init", "inout", "internal", "is", "let",
  "nil", "operator", "precedencegroup", "private", "protocol", "public", "repeat", "rethrows",
  "return", "self", "Self", "static", "struct", "subscript", "super", "switch", "throw",
  "throws", "true", "try", "typealias", "var", "where", "while",
]);

/** Backtick-escape an identifier that collides with a Swift keyword. */
function escapeSwiftIdentifier(name: string): string {
  return SWIFT_RESERVED.has(name) ? `\`${name}\`` : name;
}

// Swift enum case identifier from a raw string value that may contain characters Swift
// identifiers can't (e.g. "gpt-4o-mini", "1st Edition"). Falls back to a `v`-prefixed form if the
// sanitised result would start with a digit or be empty.
function swiftEnumCaseName(value: string): string {
  const camel = swiftFieldName(value);
  if (!camel) return "unknown";
  return escapeSwiftIdentifier(/^[0-9]/.test(camel) ? `v${camel}` : camel);
}

/**
 * A generated enum that DECODES FORWARD-COMPATIBLY (decisions/0027 item 1).
 *
 * Swift's `Codable` synthesis for a `String`-backed enum throws `DecodingError.dataCorrupted` on an
 * unrecognised raw value, and the throw propagates to the ENCLOSING OBJECT rather than the field —
 * so one unknown value anywhere in a response fails the entire decode. A ninth game appearing in a
 * single candidate of a candidate list takes the whole response down.
 *
 * ⚠️ 0027 has been Accepted since 2026-08-27 and Kotlin shipped this; SWIFT NEVER DID. 72 Swift
 * fields were typed as strict enums with no unknown case, on the platform whose lane REPORTED the
 * problem. Another accepted decision implemented on one platform and silently absent on the other.
 *
 * The shape mirrors Kotlin's sealed interface: every case carries `rawValue`, including the unknown
 * one, so a value this build does not recognise round-trips back unchanged instead of being
 * silently dropped (0027 item 2a). Originating one is still forbidden — that is a decision for the
 * calling code, not the decoder (item 2).
 *
 * ⚠️ THIS IS A SOURCE-BREAKING CHANGE FOR CLIENTS, deliberately. An exhaustive `switch` over a
 * generated enum will no longer compile without handling the unknown case — which is precisely the
 * point: the calling code is made to decide what an unrecognised value means, visibly, instead of
 * the decoder deciding by throwing. Ship it as a lockstep release (ADR 0012).
 */
function swiftForwardCompatibleEnum(name: string, values: string[]): string {
  const cases = values.map((v) => ({ id: swiftEnumCaseName(v), raw: v }));
  // A schema may itself contain a value called "unknown" (capture-commit's orientation/exposure/
  // side all do). Kotlin can separate them by casing — object UNKNOWN vs data class Unknown — but
  // Swift case names are lowerCamel and would collide outright, so the generated case takes a name
  // no domain value has. Asserted rather than assumed: a future schema value called "unrecognised"
  // would otherwise silently shadow the fallback.
  let fallback = "unrecognised";
  const taken = new Set(cases.map((c) => c.id));
  for (let i = 2; taken.has(fallback); i++) fallback = `unrecognised${i}`;

  const caseDecls = cases.map((c) => `    case ${c.id}`).join("\n");
  const rawArms = cases.map((c) => `        case .${c.id}: return ${JSON.stringify(c.raw)}`).join("\n");
  const initArms = cases.map((c) => `        case ${JSON.stringify(c.raw)}: self = .${c.id}`).join("\n");

  return [
    `public enum ${name}: Codable, Sendable, Equatable, Hashable {`,
    caseDecls,
    `    /// A value this build does not know. Carries the wire value so it round-trips unchanged.`,
    `    /// NEVER ORIGINATE ONE — see decisions/0027 item 2a.`,
    `    case ${fallback}(String)`,
    ``,
    `    public var rawValue: String {`,
    `        switch self {`,
    rawArms,
    `        case .${fallback}(let raw): return raw`,
    `        }`,
    `    }`,
    ``,
    `    public init(rawValue: String) {`,
    `        switch rawValue {`,
    initArms,
    `        default: self = .${fallback}(rawValue)`,
    `        }`,
    `    }`,
    ``,
    `    public init(from decoder: Decoder) throws {`,
    `        self.init(rawValue: try decoder.singleValueContainer().decode(String.self))`,
    `    }`,
    ``,
    `    public func encode(to encoder: Encoder) throws {`,
    `        var container = encoder.singleValueContainer()`,
    `        try container.encode(rawValue)`,
    `    }`,
    `}`,
  ].join("\n");
}

// ── Zod defaults are a SERVER-PARSE behaviour, never a wire guarantee (decisions/0027) ─────
// See the matching comment in zod-to-kotlin.ts for the full reasoning. Short version: a defaulted
// field's key can legitimately be absent on the wire, and Swift's SYNTHESISED init(from:) ignores
// a property's default value entirely — it calls decode() and throws keyNotFound, taking the whole
// response with it. A property default is not enough; the struct needs a real init(from:).
const SWIFT_PRIMITIVES = new Set(["String", "Int", "Double", "Bool", "JSONValue"]);

function swiftDefaultLiteral(value: unknown, swiftType: string): string | null {
  if (Array.isArray(value)) return value.length === 0 ? "[]" : null;
  if (value === null) return "nil";
  // A generated enum type: the default is a CASE, not the raw string. `init(rawValue:)` is
  // non-failable (it falls back to the unrecognised case), so this is always well-formed.
  const bare = swiftType.endsWith("?") ? swiftType.slice(0, -1) : swiftType;
  if (typeof value === "string" && !SWIFT_PRIMITIVES.has(bare) && /^[A-Z]/.test(bare)) {
    return `${bare}(rawValue: ${JSON.stringify(value)})`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  return null;
}

// Type names that COMPILE but shadow something in the Swift standard library, so the generated
// code changes meaning at a distance rather than failing. A union on a field called `error` emits
// `public enum Error`, and from that point on every unqualified `Error` inside the module means
// the generated enum, not `Swift.Error` — `catch let e as Error` stops meaning what it reads as.
//
// Refused loudly rather than auto-suffixed. The fix is one line at the call site
// (`registerName(schema, "EbayPublishError")`), the generator cannot guess a good name, and
// silently renaming a public type is worse than a build failure. No existing schema hits this —
// checked against the current Sources/CurioContracts/*.swift before adding the guard, so it fails
// only on something new.
const SWIFT_SHADOWED_TYPE_NAMES = new Set([
  "Error", "Result", "Task", "Never", "Optional", "Array", "Dictionary", "Set", "String", "Int",
  "Double", "Float", "Bool", "Character", "Data", "Date", "URL", "UUID", "Encoder", "Decoder",
  "Encodable", "Decodable", "Codable", "Sendable", "Equatable", "Hashable", "Comparable", "Any",
  "AnyObject", "Type", "Protocol", "Range", "Sequence", "Collection", "Iterator", "JSONValue",
]);

function uniqueTypeName(base: string): string {
  if (SWIFT_SHADOWED_TYPE_NAMES.has(base)) {
    throw new Error(
      `zod-to-swift: refusing to emit a type named "${base}" — it shadows the Swift standard ` +
        `library, and the shadowing compiles. Give the schema an explicit name at the call site: ` +
        `registerName(schema, "SomethingSpecific").`
    );
  }
  return uniqueTypeNameInner(base);
}

function uniqueTypeNameInner(base: string): string {
  if (!emitted.has(base)) return base;
  let i = 2;
  while (emitted.has(`${base}${i}`)) i++;
  return `${base}${i}`;
}

function isIntSchema(schema: z.ZodNumber): boolean {
  const checks = (schema._def.checks ?? []) as Array<{ kind: string }>;
  return checks.some((c) => c.kind === "int");
}

// Resolve a Zod schema to a Swift type reference, emitting a named struct/enum as a side effect
// the first time it's encountered (by object identity, not just by registered name).
function resolve(schema: z.ZodTypeAny, hintName: string): string {
  const existingName = schemaToName.get(schema);
  if (existingName) return existingName;

  const registered = nameRegistry.get(schema);
  const structName = registered ? pascalCase(registered) : null;

  if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
    const inner = resolve(schema._def.innerType, hintName);
    return inner.endsWith("?") ? inner : `${inner}?`;
  }
  if (schema instanceof z.ZodDefault) {
    return resolve(schema._def.innerType, hintName);
  }
  // A `.refine()` / `.transform()` wrapper. Refinements are SERVER-SIDE VALIDATION and change
  // nothing about the decoded type, so the generated struct takes the inner type and the native
  // clients are unaffected — a 400 is how they learn the value was out of range.
  //
  // Unhandled until 2026-08-29, which meant the contract could not use `.refine()` AT ALL: the
  // first attempt (bounding `targetMarginPct` so a rate sent as a percentage is rejected) failed
  // the build. A validation vocabulary the generator silently forbids is one nobody reaches for,
  // and the constraints it forbids here are exactly the unit checks on money fields.
  if (schema instanceof z.ZodEffects) {
    return resolve(schema._def.schema, hintName);
  }
  if (schema instanceof z.ZodString) return "String";
  if (schema instanceof z.ZodNumber) return isIntSchema(schema) ? "Int" : "Double";
  if (schema instanceof z.ZodBoolean) return "Bool";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "JSONValue";
  if (schema instanceof z.ZodNull) return "JSONValue?";

  if (schema instanceof z.ZodEnum) {
    const enumName = uniqueTypeName(structName ?? pascalCase(hintName));
    schemaToName.set(schema, enumName);
    const values = schema._def.values as string[];
    emitted.set(enumName, { kind: "enum", name: enumName, code: swiftForwardCompatibleEnum(enumName, values) });
    return enumName;
  }

  if (schema instanceof z.ZodUnion) {
    const opts = schema._def.options as z.ZodTypeAny[];
    const literals = opts.filter((o): o is z.ZodLiteral<unknown> => o instanceof z.ZodLiteral);

    // A closed set of non-string literals, e.g. `z.union([z.literal(3), z.literal(7)])` for
    // auctionDays. Widening THAT to String emitted a Swift struct that would not compile —
    // `decodeIfPresent(String.self) ?? 7`. Caught by the first schema to use one (2026-09-02);
    // the "unions widen to String" shortcut had never met a union that wasn't strings.
    if (literals.length === opts.length && opts.length > 0) {
      const kinds = new Set(literals.map((l) => typeof l._def.value));
      if (kinds.size === 1) {
        const kind = [...kinds][0];
        if (kind === "string") return "String";
        if (kind === "boolean") return "Bool";
        if (kind === "number") {
          return literals.every((l) => Number.isInteger(l._def.value as number)) ? "Int" : "Double";
        }
      }
      throw new Error(
        `zod-to-swift: union of mixed literal types for "${hintName}" — Swift has no equivalent, ` +
          `split the field or use a discriminated union`
      );
    }

    // The original case: "closed enum OR free string" (the server may return a value outside the
    // known set). Widened to String rather than modelling an enum-with-unknown-case.
    const allStringish = opts.every(
      (o) =>
        o instanceof z.ZodString ||
        o instanceof z.ZodEnum ||
        (o instanceof z.ZodLiteral && typeof o._def.value === "string")
    );
    if (allStringish) return "String";

    // A union of OBJECT shapes has a right answer and this is not it — the decoder cannot know
    // which arm to take without a discriminator, so refuse and say so.
    if (opts.some((o) => o instanceof z.ZodObject)) {
      throw new Error(
        `zod-to-swift: union of object shapes for "${hintName}" (${opts.map((o) => o.constructor.name).join(" | ")}) — ` +
          `use z.discriminatedUnion so the decoder knows which arm to take`
      );
    }

    // A genuinely heterogeneous scalar/array union — eBay's aspect values are `string | string[]`,
    // which is the wire's shape and not a modelling mistake. Decoded as arbitrary JSON, which
    // holds either LOSSLESSLY. The old blanket widen-to-String would have decoded the array arm
    // as a String and thrown at runtime; this is the same shortcut, corrected.
    return "JSONValue";
  }

  // A discriminator field. The literal's VALUE is not encoded in the Swift type — the enum case
  // you matched already tells you which variant this is — so the field keeps its underlying type
  // and the wire value round-trips through the struct unchanged.
  if (schema instanceof z.ZodLiteral) {
    const v = schema._def.value;
    if (typeof v === "string") return "String";
    if (typeof v === "boolean") return "Bool";
    if (typeof v === "number") return Number.isInteger(v) ? "Int" : "Double";
    throw new Error(`zod-to-swift: unsupported literal type for "${hintName}" (${typeof v})`);
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    const unionName = uniqueTypeName(structName ?? pascalCase(hintName));
    schemaToName.set(schema, unionName);
    emitted.set(unionName, { kind: "enum", name: unionName, code: "" });
    const discriminator = schema._def.discriminator as string;
    const variants = (schema._def.options as z.ZodObject<z.ZodRawShape>[]).map((opt) => {
      const shape = opt._def.shape() as Record<string, z.ZodTypeAny>;
      const lit = shape[discriminator];
      if (!(lit instanceof z.ZodLiteral) || typeof lit._def.value !== "string") {
        // Zod itself permits non-string discriminators; this generator does not, because the
        // Swift case name is derived from the value. Refusing loudly beats emitting a union whose
        // cases are named case1/case2.
        throw new Error(
          `zod-to-swift: discriminator "${discriminator}" on "${unionName}" must be a string literal on every option`
        );
      }
      const raw = lit._def.value as string;
      const payload = resolve(opt, `${unionName}${pascalCase(raw)}`);
      return { raw, caseName: swiftEnumCaseName(raw), payload };
    });

    // Same collision rule as the forward-compatible enum: a variant genuinely called
    // "unrecognised" must not be shadowed by the fallback case.
    let fallback = "unrecognised";
    const taken = new Set(variants.map((v) => v.caseName));
    for (let i = 2; taken.has(fallback); i++) fallback = `unrecognised${i}`;

    const discProp = escapeSwiftIdentifier(swiftFieldName(discriminator));
    const code = [
      `public enum ${unionName}: Codable, Sendable {`,
      ...variants.map((v) => `    case ${v.caseName}(${v.payload})`),
      `    /// A variant this build does not know. Carries the discriminator and the whole payload`,
      `    /// so an unrecognised case round-trips unchanged instead of failing the decode and`,
      `    /// taking the entire response with it. NEVER ORIGINATE ONE — see decisions/0027 item 2a.`,
      `    case ${fallback}(${discriminator}: String, payload: [String: JSONValue])`,
      ``,
      `    /// The wire discriminator, available without switching.`,
      `    public var ${discProp}: String {`,
      `        switch self {`,
      ...variants.map((v) => `        case .${v.caseName}: return ${JSON.stringify(v.raw)}`),
      `        case .${fallback}(let ${discProp}, _): return ${discProp}`,
      `        }`,
      `    }`,
      ``,
      `    private enum DiscriminatorKey: String, CodingKey { case ${discProp} = ${JSON.stringify(discriminator)} }`,
      ``,
      `    public init(from decoder: Decoder) throws {`,
      `        // decodeIfPresent, not decode: a payload with NO discriminator is malformed, and`,
      `        // throwing on it would take the whole response down rather than surfacing an error`,
      `        // the user can act on. Kotlin's generated deserializer degrades to Unknown("") for`,
      `        // the same input; the two must not disagree about a malformed body.`,
      `        let tag = try decoder.container(keyedBy: DiscriminatorKey.self)`,
      `            .decodeIfPresent(String.self, forKey: .${discProp}) ?? ""`,
      `        switch tag {`,
      ...variants.map(
        (v) => `        case ${JSON.stringify(v.raw)}: self = .${v.caseName}(try ${v.payload}(from: decoder))`
      ),
      `        default:`,
      `            self = .${fallback}(${discriminator}: tag, payload: try [String: JSONValue](from: decoder))`,
      `        }`,
      `    }`,
      ``,
      `    public func encode(to encoder: Encoder) throws {`,
      `        switch self {`,
      ...variants.map((v) => `        case .${v.caseName}(let value): try value.encode(to: encoder)`),
      `        case .${fallback}(_, let payload): try payload.encode(to: encoder)`,
      `        }`,
      `    }`,
      `}`,
    ].join("\n");
    emitted.set(unionName, { kind: "enum", name: unionName, code });
    return unionName;
  }

  if (schema instanceof z.ZodArray) {
    const elType = resolve(schema._def.type, hintName.replace(/s$/, ""));
    return `[${elType}]`;
  }

  if (schema instanceof z.ZodRecord) {
    const valType = resolve(schema._def.valueType, hintName);
    return `[String: ${valType}]`;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape() as Record<string, z.ZodTypeAny>;
    const isEmptyPassthrough = Object.keys(shape).length === 0 && schema._def.unknownKeys === "passthrough";
    if (isEmptyPassthrough) {
      // e.g. z.object({}).passthrough() used as an "arbitrary JSON object" placeholder — a
      // Codable struct with zero fields would silently drop everything on decode; a JSON
      // dictionary keeps the data.
      return "[String: JSONValue]";
    }

    const name = uniqueTypeName(structName ?? pascalCase(hintName));
    schemaToName.set(schema, name);
    // Reserve the slot before recursing so a self/mutually-referential shape can't recurse
    // infinitely — none of our schemas are recursive today, but this is cheap insurance.
    emitted.set(name, { kind: "struct", name, code: "" });
    const fields: StructField[] = Object.entries(shape).map(([key, val]) => {
      // Resolve the type FIRST: a default's Swift literal depends on it. `.default("FIXED_PRICE")`
      // on an enum-typed field emitted the bare string `"FIXED_PRICE"` where an `EbayListingFormat`
      // was expected, which does not compile — found by `swift build`, not by reading the output.
      const swiftType = resolve(val, key);
      const zodDefault = val instanceof z.ZodDefault
        ? swiftDefaultLiteral((val._def.defaultValue as () => unknown)(), swiftType)
        : null;
      return { name: key, swiftType, zodDefault };
    });
    const hasDefaults = fields.some((f) => f.zodDefault != null && !f.swiftType.endsWith("?"));
    // `swiftFieldName` stays unescaped so the renamed-vs-not comparison below still compares
    // like with like; the backticks go on at each emission site (including the CodingKeys case,
    // which needs them too — an escaped case name still maps to its unescaped string value).
    const prop = (f: StructField) => escapeSwiftIdentifier(swiftFieldName(f.name));
    const propLines = fields.map((f) => `    public let ${prop(f)}: ${f.swiftType}`).join("\n");
    const renamed = fields.filter((f) => swiftFieldName(f.name) !== f.name);
    // A defaulted field needs a hand-written init(from:), which needs CodingKeys to exist even
    // when no field was renamed.
    const codingKeys = (renamed.length || hasDefaults)
      ? `\n\n    enum CodingKeys: String, CodingKey {\n${fields
          .map((f) =>
            swiftFieldName(f.name) === f.name
              ? `        case ${prop(f)}`
              : `        case ${prop(f)} = "${f.name}"`
          )
          .join("\n")}\n    }`
      : "";
    const initArgs = fields.map((f) => `${prop(f)}: ${f.swiftType}`).join(", ");
    const initBody = fields.map((f) => `        self.${prop(f)} = ${prop(f)}`).join("\n");
    // Swift's SYNTHESISED init(from:) ignores property defaults — it calls decode() and throws
    // keyNotFound on an absent key, taking the whole response down. So a struct carrying a Zod
    // default gets a real decoder that treats absent as the default. Emitted ONLY for such
    // structs, so every other type keeps synthesised Codable exactly as before.
    const decodeInit = hasDefaults
      ? `\n\n    public init(from decoder: Decoder) throws {\n        let c = try decoder.container(keyedBy: CodingKeys.self)\n` +
        fields.map((f) => {
          const bare = f.swiftType.endsWith("?") ? f.swiftType.slice(0, -1) : f.swiftType;
          if (f.swiftType.endsWith("?")) {
            return `        self.${prop(f)} = try c.decodeIfPresent(${bare}.self, forKey: .${prop(f)})`;
          }
          if (f.zodDefault != null) {
            return `        self.${prop(f)} = try c.decodeIfPresent(${bare}.self, forKey: .${prop(f)}) ?? ${f.zodDefault}`;
          }
          return `        self.${prop(f)} = try c.decode(${bare}.self, forKey: .${prop(f)})`;
        }).join("\n") +
        `\n    }`
      : "";
    const code = `public struct ${name}: Codable, Sendable {\n${propLines}${codingKeys}\n\n    public init(${initArgs}) {\n${initBody}\n    }${decodeInit}\n}`;
    emitted.set(name, { kind: "struct", name, code });
    return name;
  }

  throw new Error(`zod-to-swift: unhandled schema kind for "${hintName}" (${schema.constructor.name})`);
}

/** Walk a top-level named request/response schema, emitting it (and everything it references)
 * into the shared registry. Call `flush()` once at the end to get the final Swift source. */
export function emitSwift(schema: z.ZodTypeAny, name: string): void {
  registerName(schema, name);
  resolve(schema, name);
}

export function flush(): string {
  return [...emitted.values()].map((e) => e.code).join("\n\n");
}

/** Test-only: clears all module-level state so each test starts from a clean registry. */
export function resetForTest(): void {
  emitted.clear();
}
