import { describe, it, expect } from "vitest";
import { PriceRequestSchema, PriceResponseSchema } from "./price.js";

describe("PriceRequestSchema", () => {
  it("accepts a request with a tcgBaseline", () => {
    const r = PriceRequestSchema.parse({
      name: "Charizard",
      set_name: "Base Set",
      card_number: "4/102",
      condition: "NM",
      tcg_id: "base1-4",
      tcgBaseline: { tcp_market_usd: 150, cm_trend_eur: 130 },
    });
    expect(r.tcgBaseline?.tcp_market_usd).toBe(150);
  });
});

describe("PriceResponseSchema", () => {
  it("parses a realistic response with comps", () => {
    const res = PriceResponseSchema.parse({
      low: 90,
      avg: 120.5,
      top: 180,
      price_source: "ebay-uk-sold",
      provider: "ebay",
      fx_rate: null,
      fx_date: null,
      sale_count: 12,
      approx_sale_count: false,
      comps: [{ price: 100, soldAt: "2026-07-01" }],
      confidence: "high",
      price_warning: null,
    });
    expect(res.sale_count).toBe(12);
  });

  it("accepts a no-data response with a null comps array", () => {
    const res = PriceResponseSchema.parse({
      low: null, avg: null, top: null, price_source: null, provider: null,
      fx_rate: null, fx_date: null, sale_count: null, approx_sale_count: null,
      comps: null, confidence: "low", price_warning: null,
    });
    expect(res.comps).toBeNull();
  });
});
