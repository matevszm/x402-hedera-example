// x402 payment signer for delegated signing: an agent drives the HTTP flow and pipes
// the 402 challenge through this tool to get a payment header, never seeing the key.
//
// Usage:  printf '%s' "<payment-required header value>" | tsx x402-sign.ts
//   stdin  = value of the `payment-required` header from the 402 response
//   stdout = value of the `payment-signature` header to send on the retry
//   env    = HEDERA_CLIENT_ID, HEDERA_CLIENT_KEY (funded ECDSA testnet), HEDERA_NETWORK
//
// The private key is read from .env and never written to stdout, argv, or logs.

import "dotenv/config";
import {
    createClientHederaSigner,
    PrivateKey as HederaPrivateKey,
} from "@x402/hedera";
import { ExactHederaScheme } from "@x402/hedera/exact/client";
import { x402Client } from "@x402/core/client";
import {
    decodePaymentRequiredHeader,
    encodePaymentSignatureHeader,
} from "@x402/core/http";

const required = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
};

const readStdin = async (): Promise<string> => {
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
    return Buffer.concat(chunks).toString("utf8").trim();
};

const accountId = required("HEDERA_CLIENT_ID");
const privateKey = required("HEDERA_CLIENT_KEY");
const network = process.env.HEDERA_NETWORK ?? "hedera:testnet";

const paymentRequiredHeader = await readStdin();
if (!paymentRequiredHeader) {
    throw new Error("Empty stdin: expected the `payment-required` header value");
}

const signer = createClientHederaSigner(
    accountId,
    HederaPrivateKey.fromStringECDSA(privateKey),
    { network },
);

const client = new x402Client().register(
    "hedera:*",
    new ExactHederaScheme(signer),
);

const paymentRequired = decodePaymentRequiredHeader(paymentRequiredHeader);
const payload = await client.createPaymentPayload(paymentRequired);

process.stdout.write(encodePaymentSignatureHeader(payload));
