import { describe, it, expect } from "vitest";
import type { DataProvider } from "../src/core/provider.js";
import { MockDataProvider } from "../src/providers/mock/mock-provider.js";

const runProviderContract = (name: string, makeProvider: () => DataProvider) => {
  describe(`DataProvider contract: ${name}`, () => {
    it("exposes a stable id", () => {
      expect(makeProvider().id).toBeTruthy();
    });

    it("returns a valid catalog", () => {
      const catalog = makeProvider().catalog();
      expect(catalog.length).toBeGreaterThan(0);
      for (const p of catalog) {
        expect(p.id).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.asset).toBe("0.0.0");
        expect(p.priceAtomic).toMatch(/^\d+$/);
        expect(typeof p.paramsSchema).toBe("object");
      }
    });

    it("fetches a DataResult for every catalog product with valid params", async () => {
      const provider = makeProvider();
      for (const product of provider.catalog()) {
        const params: Record<string, string> = {};
        for (const [k, schema] of Object.entries(product.paramsSchema)) {
          if (schema.required) params[k] = k === "date" ? "2026-06-24" : "AAPL";
        }
        const result = await provider.fetch(product.id, params);
        expect(result.data).toBeDefined();
        expect(Number.isNaN(Date.parse(result.asOf))).toBe(false);
        expect(result.providerId).toBe(provider.id);
      }
    });

    it("rejects an unknown product", async () => {
      await expect(makeProvider().fetch("does-not-exist", {})).rejects.toThrow();
    });
  });
};

runProviderContract("MockDataProvider", () => new MockDataProvider());
