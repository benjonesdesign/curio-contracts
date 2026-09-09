import { describe, it, expect } from "vitest";
import {
  BillingCheckoutResponseSchema,
  BillingPortalResponseSchema,
  BillingWithdrawResponseSchema,
} from "./billing.js";

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

describe("BillingWithdrawResponseSchema", () => {
  it("accepts a refund with a Stripe refund reference", () => {
    const res = BillingWithdrawResponseSchema.parse({
      refunded: 7.49,
      deducted: 2.5,
      refundReference: "re_3Abc123DefGhi456",
    });
    expect(res.refunded).toBe(7.49);
    expect(res.deducted).toBe(2.5);
    expect(res.refundReference).toBe("re_3Abc123DefGhi456");
  });

  // A lawful zero-refund withdrawal: the subscription still ends, no refund is created at
  // Stripe, so there is no reference to quote. null here is success, not failure.
  it("accepts a nothing-refundable withdrawal with a null reference", () => {
    const res = BillingWithdrawResponseSchema.parse({
      refunded: 0,
      deducted: 9.99,
      refundReference: null,
    });
    expect(res.refunded).toBe(0);
    expect(res.refundReference).toBeNull();
  });

  it("rejects a negative refunded amount", () => {
    expect(() =>
      BillingWithdrawResponseSchema.parse({ refunded: -1, deducted: 0, refundReference: null }),
    ).toThrow();
  });

  it("rejects a negative deducted amount", () => {
    expect(() =>
      BillingWithdrawResponseSchema.parse({ refunded: 0, deducted: -1, refundReference: null }),
    ).toThrow();
  });

  it("rejects an empty-string refund reference (null is the absent case, not \"\")", () => {
    expect(() =>
      BillingWithdrawResponseSchema.parse({ refunded: 1, deducted: 0, refundReference: "" }),
    ).toThrow();
  });

  it("rejects a missing refundReference key — absence must be explicit null", () => {
    expect(() => BillingWithdrawResponseSchema.parse({ refunded: 1, deducted: 0 })).toThrow();
  });

  it("rejects a string amount", () => {
    expect(() =>
      BillingWithdrawResponseSchema.parse({ refunded: "7.49", deducted: 0, refundReference: null }),
    ).toThrow();
  });
});
