export const MOCK_WINDOW_SEC = 60;

export interface GenerateInput {
  productId: string;
  symbol: string;
  date?: string;
  windowSeed: number;
}

const hashSeed = (input: string): number => {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number): (() => number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const round2 = (n: number): number => Math.round(n * 100) / 100;

export const generateData = ({ productId, symbol, date, windowSeed }: GenerateInput): unknown => {
  const rand = mulberry32(hashSeed(`${productId}:${symbol}:${date ?? ""}:${windowSeed}`));
  const base = 50 + rand() * 450;
  switch (productId) {
    case "spot-price":
      return { price: round2(base) };
    case "quote": {
      const spread = base * 0.001 * (1 + rand());
      return {
        bid: round2(base - spread),
        ask: round2(base + spread),
        bidSize: 100 + Math.floor(rand() * 900),
        askSize: 100 + Math.floor(rand() * 900),
      };
    }
    case "ohlc": {
      const open = round2(base);
      const high = round2(base * (1 + rand() * 0.03));
      const low = round2(base * (1 - rand() * 0.03));
      const close = round2(low + rand() * (high - low));
      const volume = 1_000_000 + Math.floor(rand() * 9_000_000);
      return { date, open, high, low, close, volume };
    }
    default:
      throw new Error(`Unknown product: ${productId}`);
  }
};
