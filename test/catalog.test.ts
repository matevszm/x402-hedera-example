import { describe, it, expect } from "vitest";
import type { DataProduct } from "../src/core/provider.js";
import { validateRequest, productIdFromPath, priceForProduct } from "../src/core/catalog.js";

const CATALOG: DataProduct[] = [
  { id: "spot-price", description: "d", asset: "0.0.0", priceAtomic: "1000000",
    paramsSchema: { symbol: { type: "string", required: true } } },
  { id: "ohlc", description: "d", asset: "0.0.0", priceAtomic: "5000000",
    paramsSchema: { symbol: { type: "string", required: true }, date: { type: "string", required: true } } },
];

describe("catalog helpers", () => {
  it("returns 404 for unknown product", () => {
    expect(validateRequest(CATALOG, "nope", {})).toEqual({ status: 404, message: expect.any(String) });
  });

  it("returns 400 when a required param is missing", () => {
    expect(validateRequest(CATALOG, "ohlc", { symbol: "AAPL" })).toEqual({ status: 400, message: expect.any(String) });
  });

  it("returns null for a valid request", () => {
    expect(validateRequest(CATALOG, "spot-price", { symbol: "AAPL" })).toBeNull();
  });

  it("extracts product id from a resource path", () => {
    expect(productIdFromPath("/data/spot-price")).toBe("spot-price");
  });

  it("maps a product to its HBAR price object", () => {
    expect(priceForProduct(CATALOG, "spot-price")).toEqual({ amount: "1000000", asset: "0.0.0" });
  });

  it("throws on unknown product id", () => {
    expect(() => priceForProduct(CATALOG, "does-not-exist")).toThrow();
  });
});
