import type { DataProvider } from "../core/provider.js";
import { MockDataProvider } from "./mock/mock-provider.js";

export const createProvider = (id: string): DataProvider => {
  switch (id) {
    case "mock":
      return new MockDataProvider();
    default:
      throw new Error(`Unknown DATA_PROVIDER: ${id}`);
  }
};
