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

// Swift enum case identifier from a raw string value that may contain characters Swift
// identifiers can't (e.g. "gpt-4o-mini", "1st Edition"). Falls back to a `v`-prefixed form if the
// sanitised result would start with a digit or be empty.
function swiftEnumCaseName(value: string): string {
  const camel = swiftFieldName(value);
  if (!camel) return "unknown";
  return /^[0-9]/.test(camel) ? `v${camel}` : camel;
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
  if (schema instanceof z.ZodString) return "String";
  if (schema instanceof z.ZodNumber) return isIntSchema(schema) ? "Int" : "Double";
  if (schema instanceof z.ZodBoolean) return "Bool";
  if (schema instanceof z.ZodUnknown || schema instanceof z.ZodAny) return "JSONValue";
  if (schema instanceof z.ZodNull) return "JSONValue?";

  if (schema instanceof z.ZodEnum) {
    const enumName = uniqueTypeName(structName ?? pascalCase(hintName));
    schemaToName.set(schema, enumName);
    const values = schema._def.values as string[];
    const cases = values.map((v) => `    case ${swiftEnumCaseName(v)} = "${v}"`).join("\n");
    emitted.set(enumName, {
      kind: "enum",
      name: enumName,
      code: `public enum ${enumName}: String, Codable, Sendable {\n${cases}\n}`,
    });
    return enumName;
  }

  if (schema instanceof z.ZodUnion) {
    // Used in this repo only for "closed enum OR free string" (server may return a value outside
    // the known set) — widen to String rather than modelling a Swift enum-with-unknown-case.
    return "String";
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
    const fields: StructField[] = Object.entries(shape).map(([key, val]) => ({
      name: key,
      swiftType: resolve(val, key),
    }));
    const propLines = fields.map((f) => `    public let ${swiftFieldName(f.name)}: ${f.swiftType}`).join("\n");
    const renamed = fields.filter((f) => swiftFieldName(f.name) !== f.name);
    const codingKeys = renamed.length
      ? `\n\n    enum CodingKeys: String, CodingKey {\n${fields
          .map((f) =>
            swiftFieldName(f.name) === f.name
              ? `        case ${f.name}`
              : `        case ${swiftFieldName(f.name)} = "${f.name}"`
          )
          .join("\n")}\n    }`
      : "";
    const initArgs = fields.map((f) => `${swiftFieldName(f.name)}: ${f.swiftType}`).join(", ");
    const initBody = fields.map((f) => `        self.${swiftFieldName(f.name)} = ${swiftFieldName(f.name)}`).join("\n");
    const code = `public struct ${name}: Codable, Sendable {\n${propLines}${codingKeys}\n\n    public init(${initArgs}) {\n${initBody}\n    }\n}`;
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
