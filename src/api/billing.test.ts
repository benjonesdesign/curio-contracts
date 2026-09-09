import { describe, it, expect } from "vitest";
import { BillingCheckoutResponseSchema, BillingPortalResponseSchema } from "./billing.js";

describe("BillingCheckoutResponseSchema", () => {
  it("accepts a Stripe Checkout Session URL", () => {
    const res = BillingCheckoutResponseSchema.parse({
      url: "https://checkout.stripe.com/c/pay/cs_test_abc123",
    });
    expect(res.url).toBe("https://checkout.stripe.com/c/pay/cs_test_abc123");
  });

  it("rejects an empty url", () => {
    expect(() => BillingCheckoutResponseSchema.parse({ url: "" })).toThrow();
  });

  it("rejects a missing url", () => {
    expect(() => BillingCheckoutResponseSchema.parse({})).toThrow();
  });
});

describe("BillingPortalResponseSchema", () => {
  it("accepts a Stripe Customer Portal URL", () => {
    const res = BillingPortalResponseSchema.parse({
      url: "https://billing.stripe.com/p/session/abc123",
    });
    expect(res.url).toBe("https://billing.stripe.com/p/session/abc123");
  });

  it("rejects an empty url", () => {
    expect(() => BillingPortalResponseSchema.parse({ url: "" })).toThrow();
  });

  it("rejects a missing url", () => {
    expect(() => BillingPortalResponseSchema.parse({})).toThrow();
  });
});
