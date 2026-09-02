// A small, purpose-built Zod v3 -> Kotlin (kotlinx.serialization) walker. Deliberate structural
// mirror of zod-to-swift.ts — same node coverage (object/string/number/boolean/array/enum/
// nullable/optional/union/record/unknown/literal/passthrough), same identity-tracked reuse
// (schemaToName), same registerName() override — so the two generators can be kept in lockstep by
// inspection rather than by a shared abstraction neither language actually needs. Not a
// general-purpose codegen library; it covers exactly the Zod node types used in src/api/*.ts.
//
// kotlinx.serialization.json's JsonElement is used directly for "arbitrary JSON" (Swift has no
// equivalent built-in, hence DBTypes.swift/APITypes.swift's hand-rolled JSONValue enum — Kotlin
// doesn't need one).
import { z } from "zod";

interface DataClassField {
  name: string;
  kotlinType: string;
  /** Kotlin literal for a Zod .default(), or null when the field has none. */
  zodDefault?: string | null;
}

interface EmittedType {
  kind: "data class" | "enum class" | "sealed enum";
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

// Kotlin property/argument name: camelCase, first character always lowercase (including when the
// source starts with an underscore, e.g. "_api_usage" -> "apiUsage", not "ApiUsage").
function kotlinFieldName(name: string): string {
  const pascal = pascalCase(name);
  return pascal ? pascal[0].toLowerCase() + pascal.slice(1) : pascal;
}

// Kotlin enum constant identifier from a raw string value that may contain characters Kotlin
// identifiers can't (e.g. "gpt-4o-mini", "1st Edition"). Kotlin enum constants are conventionally
// SCREAMING_SNAKE_CASE. Falls back to a `V`-prefixed form if the sanitised result would start
// with a digit or be empty.
function kotlinEnumConstName(value: string): string {
  const snake = value
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  if (!snake) return "UNKNOWN";
  return /^[0-9]/.test(snake) ? `V${snake}` : snake;
}

// ── Forward-compatible enums (decisions/0027) ─────────────────────────────────────────────
//
// A plain `enum class` THROWS on an unrecognised raw value, and kotlinx propagates that throw to
// the ENCLOSING object — so one unknown value anywhere in a response fails the whole decode. A
// ninth game would break every pinned client's catalogue lookup.
//
// Two things make this worse than it first looks, both corrections from the Android lane:
//   - Decoding CONSTRUCTS the enum. The exposure is every decode of a containing response, not
//     every call site, so "no code switches on it" is not evidence of safety.
//   - Nullability is not protection. `game: GameId?` handles ABSENT, never UNRECOGNISED.
//
// Kotlin has no enum-with-payload, so the equivalent of Swift's `case unknown(String)` is a sealed
// interface plus a hand-rolled KSerializer. Different emitted shape, same guarantee: an unknown
// value arrives as DATA the caller can reason about, and the decision about what to do with it
// belongs to the caller — not to the decoder, which cannot make it visibly.
function forwardCompatibleEnum(name: string, values: string[]): string {
  const objects = values
    .map((v) => `    public object ${kotlinEnumConstName(v)} : ${name} {\n` +
                `        override val rawValue: String get() = "${v}"\n    }`)
    .join("\n");
  const branches = values
    .map((v) => `            "${v}" -> ${kotlinEnumConstName(v)}`)
    .join("\n");
  return [
    `@Serializable(with = ${name}Serializer::class)`,
    `public sealed interface ${name} {`,
    `    /** The wire value. Present on every case INCLUDING Unknown, so a value this client does`,
    `     *  not recognise can still be round-tripped back unchanged rather than silently dropped. */`,
    `    public val rawValue: String`,
    ``,
    objects,
    ``,
    `    /** A value this build does not know. Never originate one — see decisions/0027 item 2a. */`,
    `    public data class Unknown(override val rawValue: String) : ${name}`,
    ``,
    `    public companion object {`,
    `        public fun from(raw: String): ${name} = when (raw) {`,
    branches,
    `            else -> Unknown(raw)`,
    `        }`,
    `    }`,
    `}`,
    ``,
    `public object ${name}Serializer : KSerializer<${name}> {`,
    `    override val descriptor: SerialDescriptor =`,
    `        PrimitiveSerialDescriptor("${name}", PrimitiveKind.STRING)`,
    `    override fun deserialize(decoder: Decoder): ${name} = ${name}.from(decoder.decodeString())`,
    `    override fun serialize(encoder: Encoder, value: ${name}) {`,
    `        encoder.encodeString(value.rawValue)`,
    `    }`,
    `}`,
  ].join("\n");
}

// ── Zod defaults are a SERVER-PARSE behaviour, never a wire guarantee (decisions/0027) ─────
//
// `z.array(X).default([])` means "if the server's own parse sees no key, substitute []". It says
// nothing about what the server EMITS, so the key can legitimately be absent on the wire. Emitting
// it as a required field makes an absent key a decode failure that takes the whole response down —
// the same shape as the unknown-enum bug above, one level lower.
//
// Two couplings that creates, neither written down anywhere before 2026-08-27:
//   FORWARD  — a client build consuming the field REQUIRES the server deployment that emits it.
//   ROLLBACK — roll the server back to a build that omits it and EVERY deployed client breaks.
//              App Store latency means clients cannot be rolled back in step with a server.
//
// So a defaulted field emits with a Kotlin default, which kotlinx uses when the key is absent.
// Absent and empty both decode, the property stays non-null, and no call site changes.
const KOTLIN_PRIMITIVES = new Set(["String", "Int", "Double", "Boolean", "JsonElement"]);

function kotlinDefaultLiteral(value: unknown, kotlinType: string): string | null {
  if (Array.isArray(value)) return value.length === 0 ? "emptyList()" : null;
  if (value === null) return "null";
  // A generated sealed-interface enum: the default is a CASE. `from(raw)` is total — it falls
  // back to Unknown — so this is always well-formed.
  const bare = kotlinType.endsWith("?") ? kotlinType.slice(0, -1) : kotlinType;
  if (typeof value === "string" && !KOTLIN_PRIMITIVES.has(bare) && /^[A-Z]/.test(bare)) {
    return `${bare}.from(${JSON.stringify(value)})`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  return null; // an object/non-empty-array default would need a real constructor call — refuse
}

function uniqueTypeName(base: string): string {
  if (!emitted.has(base)) return base;
  let i = 2;
  while (emitted.has(`${base}${i}`)) i++;
  return `${base}${i}`;
}

function isIntSchema(schema: z.ZodNumber): boolean {
  const checks = (schema._def.checks ?? []) as Array<{ kind: string }>;
  return checks.some((c) => c.kind === "int");
}

// Resolve a Zod schema to a Kotlin type reference, emitting a named data/enum class as a side
// effect the first time it's encountered (by object identity, not just by registered name).
function resolve(schema: z.ZodTypeAny, hintName: string): string {
  const existingName = schemaToName.get(schema);
  if (existingName) return existingName;

  const registered = nameRegistry.get(schema);
  const className = registered ? pascalCase(registered) : null;

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
  if (schema instanceof z.ZodBoolean) return "Boolean";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "JsonElement";
  if (schema instanceof z.ZodNull) return "JsonElement?";

  if (schema instanceof z.ZodEnum) {
    const enumName = uniqueTypeName(className ?? pascalCase(hintName));
    schemaToName.set(schema, enumName);
    const values = schema._def.values as string[];
    emitted.set(enumName, {
      kind: "sealed enum",
      name: enumName,
      code: forwardCompatibleEnum(enumName, values),
    });
    return enumName;
  }

  if (schema instanceof z.ZodUnion) {
    const opts = schema._def.options as z.ZodTypeAny[];
    const literals = opts.filter((o): o is z.ZodLiteral<unknown> => o instanceof z.ZodLiteral);

    // A closed set of non-string literals, e.g. `z.union([z.literal(3), z.literal(7)])`. Widening
    // that to String emitted `val auctionDays: String = 7`. Mirror of the same fix in
    // zod-to-swift.ts — the "unions widen to String" shortcut had never met a non-string union.
    if (literals.length === opts.length && opts.length > 0) {
      const kinds = new Set(literals.map((l) => typeof l._def.value));
      if (kinds.size === 1) {
        const kind = [...kinds][0];
        if (kind === "string") return "String";
        if (kind === "boolean") return "Boolean";
        if (kind === "number") {
          return literals.every((l) => Number.isInteger(l._def.value as number)) ? "Int" : "Double";
        }
      }
      throw new Error(
        `zod-to-kotlin: union of mixed literal types for "${hintName}" — split the field or use a ` +
          `discriminated union`
      );
    }

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
        `zod-to-kotlin: union of object shapes for "${hintName}" (${opts.map((o) => o.constructor.name).join(" | ")}) — ` +
          `use z.discriminatedUnion so the decoder knows which arm to take`
      );
    }

    // A genuinely heterogeneous scalar/array union — eBay's aspect values are `string | string[]`,
    // which is the wire's shape and not a modelling mistake. Decoded as arbitrary JSON, which
    // holds either LOSSLESSLY. The old blanket widen-to-String would have decoded the array arm
    // as a String and thrown at runtime; this is the same shortcut, corrected.
    return "JsonElement";
  }

  // A discriminator field. The literal's VALUE is not encoded in the Kotlin type — the subclass
  // you matched already tells you which variant this is — so the field keeps its underlying type
  // and the wire value round-trips through the data class unchanged.
  if (schema instanceof z.ZodLiteral) {
    const v = schema._def.value;
    if (typeof v === "string") return "String";
    if (typeof v === "boolean") return "Boolean";
    if (typeof v === "number") return Number.isInteger(v) ? "Int" : "Double";
    throw new Error(`zod-to-kotlin: unsupported literal type for "${hintName}" (${typeof v})`);
  }

  if (schema instanceof z.ZodDiscriminatedUnion) {
    const unionName = uniqueTypeName(className ?? pascalCase(hintName));
    schemaToName.set(schema, unionName);
    emitted.set(unionName, { kind: "sealed enum", name: unionName, code: "" });
    const discriminator = schema._def.discriminator as string;
    const variants = (schema._def.options as z.ZodObject<z.ZodRawShape>[]).map((opt) => {
      const shape = opt._def.shape() as Record<string, z.ZodTypeAny>;
      const lit = shape[discriminator];
      if (!(lit instanceof z.ZodLiteral) || typeof lit._def.value !== "string") {
        throw new Error(
          `zod-to-kotlin: discriminator "${discriminator}" on "${unionName}" must be a string literal on every option`
        );
      }
      const raw = lit._def.value as string;
      const payload = resolve(opt, `${unionName}${pascalCase(raw)}`);
      return { raw, payload };
    });

    // The generated variant data classes are emitted as standalone top-level types (same as any
    // other object), so they are made members of the union by an `: UnionName` supertype added
    // after the fact rather than by nesting — nesting would change every existing emission path.
    for (const v of variants) {
      const e = emitted.get(v.payload);
      if (!e) throw new Error(`zod-to-kotlin: variant "${v.payload}" was not emitted`);
      emitted.set(v.payload, { ...e, code: e.code.replace(/^(@Serializable\npublic data class \w+\()/m, `$1`).replace(/\n\)$/, `\n) : ${unionName}`) });
    }

    const kDisc = kotlinFieldName(discriminator);
    const code = [
      `@Serializable(with = ${unionName}Serializer::class)`,
      `public sealed interface ${unionName} {`,
      `    /** A variant this build does not know. Carries the discriminator and the whole payload`,
      `     *  so an unrecognised case round-trips unchanged instead of failing the decode and`,
      `     *  taking the entire response with it. Never originate one — see decisions/0027 item 2a. */`,
      `    public data class Unknown(val ${kDisc}: String, val payload: JsonObject) : ${unionName}`,
      `}`,
      ``,
      `public object ${unionName}Serializer : KSerializer<${unionName}> {`,
      `    override val descriptor: SerialDescriptor =`,
      `        buildClassSerialDescriptor("${unionName}")`,
      ``,
      `    override fun deserialize(decoder: Decoder): ${unionName} {`,
      `        val input = decoder as? JsonDecoder`,
      `            ?: throw SerializationException("${unionName} can only be decoded from JSON")`,
      `        val obj = input.decodeJsonElement().jsonObject`,
      `        return when (val tag = obj["${discriminator}"]?.jsonPrimitive?.contentOrNull) {`,
      ...variants.map(
        (v) => `            "${v.raw}" -> input.json.decodeFromJsonElement(${v.payload}.serializer(), obj)`
      ),
      `            else -> ${unionName}.Unknown(tag ?: "", obj)`,
      `        }`,
      `    }`,
      ``,
      `    override fun serialize(encoder: Encoder, value: ${unionName}) {`,
      `        val output = encoder as? JsonEncoder`,
      `            ?: throw SerializationException("${unionName} can only be encoded to JSON")`,
      `        val element: JsonElement = when (value) {`,
      ...variants.map(
        (v) => `            is ${v.payload} -> output.json.encodeToJsonElement(${v.payload}.serializer(), value)`
      ),
      `            is ${unionName}.Unknown -> value.payload`,
      `        }`,
      `        output.encodeJsonElement(element)`,
      `    }`,
      `}`,
    ].join("\n");
    emitted.set(unionName, { kind: "sealed enum", name: unionName, code });
    return unionName;
  }

  if (schema instanceof z.ZodArray) {
    const elType = resolve(schema._def.type, hintName.replace(/s$/, ""));
    return `List<${elType}>`;
  }

  if (schema instanceof z.ZodRecord) {
    const valType = resolve(schema._def.valueType, hintName);
    return `Map<String, ${valType}>`;
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema._def.shape() as Record<string, z.ZodTypeAny>;
    const isEmptyPassthrough = Object.keys(shape).length === 0 && schema._def.unknownKeys === "passthrough";
    if (isEmptyPassthrough) {
      // e.g. z.object({}).passthrough() used as an "arbitrary JSON object" placeholder.
      return "Map<String, JsonElement>";
    }

    const name = uniqueTypeName(className ?? pascalCase(hintName));
    schemaToName.set(schema, name);
    // Reserve the slot before recursing so a self/mutually-referential shape can't recurse
    // infinitely — none of our schemas are recursive today, but this is cheap insurance.
    emitted.set(name, { kind: "data class", name, code: "" });
    const fields: DataClassField[] = Object.entries(shape).map(([key, val]) => {
      // Resolve the type FIRST — a default's Kotlin literal depends on it. See the same note in
      // zod-to-swift.ts: `.default("FIXED_PRICE")` on an enum-typed field emitted a bare string.
      const kotlinType = resolve(val, key);
      const zodDefault = val instanceof z.ZodDefault
        ? kotlinDefaultLiteral((val._def.defaultValue as () => unknown)(), kotlinType)
        : null;
      return { name: key, kotlinType, zodDefault };
    });
    const propLines = fields
      .map((f) => {
        const kName = kotlinFieldName(f.name);
        const serialName = kName !== f.name ? `@SerialName("${f.name}") ` : "";
        // Every nullable field gets a `= null` default — kotlinx.serialization otherwise requires
        // the key to be present (even as `null`) on every decode, which a real API response won't
        // always guarantee (e.g. an omitted optional field, not an explicit `null` value).
        // A Zod .default() emits as a Kotlin default so an ABSENT key decodes (see
        // kotlinDefaultLiteral). Nullable wins if both apply — `= null` already handles absence.
        const default_ = f.kotlinType.endsWith("?") ? " = null"
          : f.zodDefault ? ` = ${f.zodDefault}` : "";
        return `    ${serialName}val ${kName}: ${f.kotlinType}${default_},`;
      })
      .join("\n");
    const code = `@Serializable\npublic data class ${name}(\n${propLines}\n)`;
    emitted.set(name, { kind: "data class", name, code });
    return name;
  }

  throw new Error(`zod-to-kotlin: unhandled schema kind for "${hintName}" (${schema.constructor.name})`);
}

/** Walk a top-level named request/response schema, emitting it (and everything it references)
 * into the shared registry. Call `flush()` once at the end to get the final Kotlin source. */
export function emitKotlin(schema: z.ZodTypeAny, name: string): void {
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
