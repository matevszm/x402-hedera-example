import "dotenv/config";
import { wrapFetchWithPayment } from "@x402/fetch";
import {
    createClientHederaSigner,
    PrivateKey as HederaPrivateKey,
} from "@x402/hedera";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { x402Client, x402HTTPClient } from "@x402/core/client";

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
};

const accountId = required("HEDERA_CLIENT_ID");
const privateKey = required("HEDERA_CLIENT_KEY");
const serverUrl = process.env.SERVER_URL ?? "http://localhost:4021";
const product = process.env.E2E_PRODUCT ?? "spot-price";
const symbol = process.env.E2E_SYMBOL ?? "AAPL";

// Note: fromStringECDSA matches Hedera Portal default accounts.
// If your account key is ED25519, switch to HederaPrivateKey.fromStringED25519.
const signer = createClientHederaSigner(
    accountId,
    HederaPrivateKey.fromStringECDSA(privateKey),
    { network: "hedera:testnet" },
);

const client = new x402Client().register(
    "hedera:*",
    new ExactHederaScheme(signer),
);
const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const httpClient = new x402HTTPClient(client);

const url = `${serverUrl}/data/${product}?symbol=${encodeURIComponent(symbol)}`;

console.log(`-> GET ${url}`);
const res = await fetchWithPayment(url);
console.log(`<- HTTP ${res.status}`);

const body = await res.json();
console.log("data:", JSON.stringify(body, null, 2));

const settlement = httpClient.getPaymentSettleResponse((name) =>
    res.headers.get(name),
);
if (settlement) {
    console.log("settlement:", {
        success: settlement.success,
        transaction: settlement.transaction,
        payer: settlement.payer,
    });
} else {
    console.log(
        "no X-PAYMENT-RESPONSE header (request was not a paid request)",
    );
}
