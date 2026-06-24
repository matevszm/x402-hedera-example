import "dotenv/config";
import { serve } from "@hono/node-server";
import { loadConfig } from "../core/config.js";
import { createProvider } from "../providers/index.js";
import { createApp } from "./app.js";

const config = loadConfig();
const provider = createProvider(config.dataProvider);
const app = createApp(provider, config);

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`x402 financial data server (provider=${provider.id}) listening on :${info.port}`);
});
