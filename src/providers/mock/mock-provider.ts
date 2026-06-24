import type { DataProvider, DataProduct, DataResult } from "../../core/provider.js";
import { generateData, MOCK_WINDOW_SEC } from "./generator.js";

const CATALOG: DataProduct[] = [
  {
    id: "spot-price",
    description: "Last traded price for a symbol",
    asset: "0.0.0",
    priceAtomic: "1000000",
    paramsSchema: { symbol: { type: "string", required: true } },
  },
  {
    id: "quote",
    description: "Best bid/ask with sizes for a symbol",
    asset: "0.0.0",
    priceAtomic: "2000000",
    paramsSchema: { symbol: { type: "string", required: true } },
  },
  {
    id: "ohlc",
    description: "Daily OHLC candle for a symbol and date",
    asset: "0.0.0",
    priceAtomic: "5000000",
    paramsSchema: {
      symbol: { type: "string", required: true },
      date: { type: "string", required: true },
    },
  },
];

export class MockDataProvider implements DataProvider {
  readonly id = "mock";

  catalog(): DataProduct[] {
    return CATALOG;
  }

  async fetch(productId: string, params: Record<string, string>): Promise<DataResult> {
    const product = CATALOG.find((p) => p.id === productId);
    if (!product) throw new Error(`Unknown product: ${productId}`);

    const symbol = params.symbol ?? "";
    const windowSeed = Math.floor(Date.now() / 1000 / MOCK_WINDOW_SEC);
    const data = generateData({ productId, symbol, date: params.date, windowSeed });

    return { data, asOf: new Date().toISOString(), providerId: this.id };
  }
}
