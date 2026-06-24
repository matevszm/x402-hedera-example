export interface CatalogProduct {
  id: string;
  description: string;
  asset: string;
  priceAtomic: string;
  paramsSchema: Record<string, { type: "string"; required: boolean }>;
}

export interface Catalog {
  providerId: string;
  products: CatalogProduct[];
}

export const catalog: Catalog = {
  providerId: "mock",
  products: [
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
  ],
};

export const response402 = {
  x402Version: 2,
  error: "Payment required",
  resource: {
    url: "http://localhost:4021/data/spot-price?symbol=AAPL",
    description: "Financial market data, price and params vary by product",
    mimeType: "",
  },
  accepts: [
    {
      scheme: "exact",
      network: "hedera:testnet",
      amount: "1000000",
      asset: "0.0.0",
      payTo: "0.0.4515756",
      maxTimeoutSeconds: 180,
      extra: { feePayer: "0.0.7162784" },
    },
  ],
} as const;

export const response200Sample = {
  product: "spot-price",
  params: { symbol: "AAPL" },
  data: { price: 312.87 },
  asOf: "2026-06-24T11:16:00.000Z",
  providerId: "mock",
} as const;
