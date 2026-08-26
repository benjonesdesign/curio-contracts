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
}

interface EmittedType {
  kind: "data class" | "enum class";
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
  if (schema instanceof z.ZodString) return "String";
  if (schema instanceof z.ZodNumber) return isIntSchema(schema) ? "Int" : "Double";
  if (schema instanceof z.ZodBoolean) return "Boolean";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "JsonElement";
  if (schema instanceof z.ZodNull) return "JsonElement?";

  if (schema instanceof z.ZodEnum) {
    const enumName = uniqueTypeName(className ?? pascalCase(hintName));
    schemaToName.set(schema, enumName);
    const values = schema._def.values as string[];
    const cases = values
      .map((v) => `    @SerialName("${v}") ${kotlinEnumConstName(v)}`)
      .join(",\n");
    emitted.set(enumName, {
      kind: "enum class",
      name: enumName,
      code: `@Serializable\npublic enum class ${enumName} {\n${cases};\n}`,
    });
    return enumName;
  }

  if (schema instanceof z.ZodUnion) {
    // Used in this repo only for "closed enum OR free string" (server may return a value outside
    // the known set) — widen to String rather than modelling a sealed-class-with-unknown-case.
    return "String";
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
    const fields: DataClassField[] = Object.entries(shape).map(([key, val]) => ({
      name: key,
      kotlinType: resolve(val, key),
    }));
    const propLines = fields
      .map((f) => {
        const kName = kotlinFieldName(f.name);
        const serialName = kName !== f.name ? `@SerialName("${f.name}") ` : "";
        // Every nullable field gets a `= null` default — kotlinx.serialization otherwise requires
        // the key to be present (even as `null`) on every decode, which a real API response won't
        // always guarantee (e.g. an omitted optional field, not an explicit `null` value).
        const default_ = f.kotlinType.endsWith("?") ? " = null" : "";
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
