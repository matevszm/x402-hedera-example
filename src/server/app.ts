import { Hono } from "hono";
import { paymentMiddleware } from "@x402/hono";
import { x402ResourceServer } from "@x402/core/server";
import type { RoutesConfig } from "@x402/core/server";
import type { Network } from "@x402/core/types";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import type { DataProvider } from "../core/provider.js";
import type { ServerConfig } from "../core/config.js";
import { buildFacilitator } from "../core/facilitator.js";
import { validateRequest, productIdFromPath, priceForProduct } from "../core/catalog.js";

export const createApp = (provider: DataProvider, config: ServerConfig): Hono => {
  const catalog = provider.catalog();
  const app = new Hono();

  const x402Server = new x402ResourceServer(buildFacilitator(config.facilitatorUrl)).register(
    "hedera:*",
    new ExactHederaScheme(),
  );

  const routes: RoutesConfig = {
    "GET /data/:product": {
      description: "Financial market data — price and params vary by product",
      accepts: {
        scheme: "exact",
        network: config.hederaNetwork as Network,
        payTo: config.payToAccount,
        price: (ctx) => priceForProduct(catalog, productIdFromPath(ctx.path)),
        maxTimeoutSeconds: 180,
      },
    },
  };

  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal server error" }, 500);
  });

  app.get("/catalog", (c) => c.json({ providerId: provider.id, products: catalog }));

  app.use("/data/:product", async (c, next) => {
    const productId = c.req.param("product");
    const error = validateRequest(catalog, productId, c.req.query());
    if (error) return c.json({ error: error.message }, error.status);
    await next();
  });

  app.use("*", paymentMiddleware(routes, x402Server));

  app.get("/data/:product", async (c) => {
    const productId = c.req.param("product");
    const params = c.req.query();
    const result = await provider.fetch(productId, params);
    return c.json({
      product: productId,
      params,
      data: result.data,
      asOf: result.asOf,
      providerId: result.providerId,
    });
  });

  return app;
};
