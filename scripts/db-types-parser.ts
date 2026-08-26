// Shared parser for src/db/database.types.ts (the committed, canonical `supabase gen types
// typescript` output) — extracted so gen-swift-db.ts and gen-kotlin-db.ts read the exact same
// Row-block regex and field list, rather than two independently-drifting copies of the same
// parsing logic. Swift and Kotlin are still each responsible for their own type mapping
// (toSwiftType / toKotlinType) — only the "what fields does this table have" step is shared.

export const SHARED_TABLES = [
  "audit_events",
  "catalogue_cards",
  "catalogue_sets",
  "condition_assessments",
  "physical_cards",
  "profiles",
  "scan_items",
  "valuation_snapshots",
] as const;

// TS `number` doesn't distinguish int4 vs numeric — Postgres does. Overrides those specific
// columns to an integer type; everything else numeric becomes a floating-point type. This map is
// sourced from the same `list_tables(verbose: true)` snapshot as database.types.ts's own
// regeneration — update it if a column's Postgres type changes.
export const INT_COLUMNS: Record<string, Set<string>> = {
  catalogue_sets: new Set(["card_count"]),
  condition_assessments: new Set(["assessment_version"]),
  physical_cards: new Set(["batch_position"]),
  profiles: new Set(["aged_inventory_days"]),
  scan_items: new Set(["sort_order"]),
  valuation_snapshots: new Set(["ebay_sale_count", "snapshot_version"]),
};

export interface Field {
  name: string;
  tsType: string;
  nullable: boolean;
}

export function parseRowBlock(tableName: string, src: string): Field[] {
  const tableRe = new RegExp(`\\n      ${tableName}: \\{\\n        Row: \\{([\\s\\S]*?)\\n        \\}\\n        Insert:`);
  const m = tableRe.exec(src);
  if (!m) throw new Error(`Could not find Row block for table "${tableName}"`);
  const body = m[1];
  const fields: Field[] = [];
  for (const line of body.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const fm = /^(\w+): (.+)$/.exec(trimmed);
    if (!fm) continue;
    const [, name, rawType] = fm;
    const nullable = rawType.includes("| null");
    const tsType = rawType.replace(/\s*\|\s*null\s*$/, "").trim();
    fields.push({ name, tsType, nullable });
  }
  return fields;
}
