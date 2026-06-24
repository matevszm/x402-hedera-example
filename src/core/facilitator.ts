import { HTTPFacilitatorClient } from "@x402/core/server";

export const buildFacilitator = (url: string): HTTPFacilitatorClient =>
    new HTTPFacilitatorClient({ url });
