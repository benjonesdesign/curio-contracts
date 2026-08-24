import { describe, it, expect } from "vitest";
import { ListingTemplateSchema, ListingTemplateInputSchema } from "./listing-template.js";

const realistic = {
  id: "tpl-1",
  name: "Standard Pokemon",
  active: true,
  scopeGame: ["pokemon"],
  scopeSet: [],
  titlePattern: "{name} {setName} #{cardNumber} {condition}",
  descriptionPattern: null,
  createdAt: "2026-08-24T00:00:00.000Z",
  updatedAt: "2026-08-24T00:00:00.000Z",
};

describe("ListingTemplateSchema", () => {
  it("parses a realistic template", () => {
    expect(ListingTemplateSchema.parse(realistic)).toEqual(realistic);
  });

  it("accepts empty scope arrays (unscoped = matches everything)", () => {
    const unscoped = { ...realistic, scopeGame: [], scopeSet: [] };
    expect(ListingTemplateSchema.parse(unscoped).scopeGame).toEqual([]);
  });

  it("rejects a missing titlePattern", () => {
    const { titlePattern, ...rest } = realistic;
    expect(() => ListingTemplateSchema.parse(rest)).toThrow();
  });
});

describe("ListingTemplateInputSchema", () => {
  it("allows omitting server-assigned fields and active", () => {
    const { id, createdAt, updatedAt, active, ...rest } = realistic;
    const parsed = ListingTemplateInputSchema.parse(rest);
    expect(parsed.name).toBe("Standard Pokemon");
    expect(parsed.active).toBeUndefined();
  });
});
