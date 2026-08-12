import { describe, it, expect } from "vitest";
import { EntitlementSchema } from "./entitlement.js";

const base = {
  userId: "user-123",
  tier: "starter",
  status: "active",
  source: "stripe",
  currentPeriodEnd: "2026-09-12T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  trialEnd: null,
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("EntitlementSchema", () => {
  it("accepts an active Stripe entitlement", () => {
    const e = EntitlementSchema.parse(base);
    expect(e.tier).toBe("starter");
    expect(e.source).toBe("stripe");
    expect(e.trialEnd).toBeNull();
  });

  it("accepts an Apple entitlement with a trial end", () => {
    const e = EntitlementSchema.parse({
      ...base, source: "apple", status: "trialing", trialEnd: "2026-08-26T00:00:00.000Z",
    });
    expect(e.source).toBe("apple");
    expect(e.status).toBe("trialing");
  });

  it("rejects an unknown tier", () => {
    expect(() => EntitlementSchema.parse({ ...base, tier: "enterprise" })).toThrow();
  });

  it("rejects an unknown status", () => {
    expect(() => EntitlementSchema.parse({ ...base, status: "suspended" })).toThrow();
  });

  it("rejects an unknown source", () => {
    expect(() => EntitlementSchema.parse({ ...base, source: "paypal" })).toThrow();
  });

  it("rejects a non-ISO currentPeriodEnd", () => {
    expect(() => EntitlementSchema.parse({ ...base, currentPeriodEnd: "not-a-date" })).toThrow();
  });
});
