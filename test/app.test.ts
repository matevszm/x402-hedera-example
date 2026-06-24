import { describe, it, expect } from "vitest";
import { createApp } from "../src/server/app.js";
import { MockDataProvider } from "../src/providers/mock/mock-provider.js";
import type { ServerConfig } from "../src/core/config.js";

const config: ServerConfig = {
  hederaNetwork: "hedera:testnet",
  facilitatorUrl: "https://api.testnet.blocky402.com",
  payToAccount: "0.0.1234",
  dataProvider: "mock",
  port: 4021,
};

const app = createApp(new MockDataProvider(), config);

describe("resource server pre-validation (offline)", () => {
  it("404 for an unknown product", async () => {
    const res = await app.request("/data/does-not-exist?symbol=AAPL");
    expect(res.status).toBe(404);
  });

  it("400 when a required param is missing", async () => {
    const res = await app.request("/data/ohlc?symbol=AAPL");
    expect(res.status).toBe(400);
  });

  it("serves the catalog without payment", async () => {
    const res = await app.request("/catalog");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { products: unknown[] };
    expect(body.products.length).toBe(3);
  });
});
