import { describe, it, expect } from "vitest";
import { generateData } from "../src/providers/mock/generator.js";
import { MockDataProvider } from "../src/providers/mock/mock-provider.js";

describe("MockDataProvider determinism", () => {
  it("generator yields identical output for identical input", () => {
    const input = { productId: "spot-price", symbol: "AAPL", windowSeed: 42 };
    expect(generateData(input)).toEqual(generateData(input));
  });

  it("generator differs across symbols", () => {
    const a = generateData({ productId: "spot-price", symbol: "AAPL", windowSeed: 42 });
    const b = generateData({ productId: "spot-price", symbol: "MSFT", windowSeed: 42 });
    expect(a).not.toEqual(b);
  });

  it("fetch returns the documented spot-price shape", async () => {
    const result = await new MockDataProvider().fetch("spot-price", { symbol: "AAPL" });
    expect(result.providerId).toBe("mock");
    expect(result.data).toHaveProperty("price");
  });

  it("fetch returns the documented quote shape", async () => {
    const result = await new MockDataProvider().fetch("quote", { symbol: "AAPL" });
    expect(result.data).toHaveProperty("bid");
    expect(result.data).toHaveProperty("ask");
    expect(result.data).toHaveProperty("bidSize");
    expect(result.data).toHaveProperty("askSize");
  });

  it("fetch returns the documented ohlc shape", async () => {
    const result = await new MockDataProvider().fetch("ohlc", { symbol: "AAPL", date: "2026-06-24" });
    expect(result.data).toHaveProperty("date");
    expect(result.data).toHaveProperty("open");
    expect(result.data).toHaveProperty("high");
    expect(result.data).toHaveProperty("low");
    expect(result.data).toHaveProperty("close");
    expect(result.data).toHaveProperty("volume");
  });

  it("fetch rejects for unknown product", async () => {
    await expect(new MockDataProvider().fetch("does-not-exist", {})).rejects.toThrow();
  });
});
