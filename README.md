# x402 Financial Data Resource Server (v1)

Pay-per-call mock financial data over the x402 protocol, settled on Hedera testnet (HBAR).
Headline deliverable: a swappable `DataProvider` interface — `MockDataProvider` is the reference
implementation. The server holds no Hedera key; the **blocky402** facilitator is the fee-payer.

## Paying with an agent

An AI agent can buy a resource autonomously while the private key stays out of its
context. Two ways:

- **Inside this repo** — use `scripts/x402-sign.ts` directly; see
  [Paying as an agent (delegated signing)](#paying-as-an-agent-delegated-signing)
  for the manual `402 → sign → 200` flow.
- **From anywhere** — run the `x402-pay` skill (`skills/x402-pay/`). It scaffolds the
  delegated signer in a working dir and walks the agent through the full buy flow.

In both cases the key lives only in `.env`, read by the signer process — never the agent/LLM.

> Planned: move the byte-signing step to the Hiero CLI so signing runs fully securely,
> replacing the local key in `.env`.

## Architecture

- `src/core/provider.ts` — the `DataProvider` contract (the deliverable).
- `src/providers/mock/` — deterministic `MockDataProvider`.
- `src/server/` — Hono app: pre-validation → `paymentMiddleware` → handler.
- `scripts/e2e-pay.ts` — live client running the full `402 → pay → 200` flow.

Swap data source: one line in `src/providers/index.ts`.
Swap facilitator: change `FACILITATOR_URL`.

## Setup

1. `pnpm install` — root (API) deps.
2. Copy `.env.example` to `.env`; set `PAY_TO_ACCOUNT` (receiver, account id only — no key),
   `HEDERA_CLIENT_ID` / `HEDERA_CLIENT_KEY` (funded testnet payer account).

### API server
- `pnpm dev` — start the server with hot reload on `http://localhost:4021`.
- `pnpm start` — run once, no watch.
- `pnpm test` — offline contract/unit tests.
- `pnpm e2e` — real paid request through blocky402 on testnet.

### Web (landing + agent docs)
- `cd web && pnpm install` — web deps (separate Astro package).
- `pnpm dev` — landing page; also serves `llms.txt` for agents.
- `pnpm build && pnpm preview` — preview the production build.

## Catalog

| product | params | price |
|---|---|---|
| `spot-price` | `symbol` | 0.01 HBAR |
| `quote` | `symbol` | 0.02 HBAR |
| `ohlc` | `symbol`, `date` | 0.05 HBAR |

`GET /catalog` returns the live catalog. The payment outcome is read from the `payment-response` header (base64 JSON), and the Hedera transaction id is carried in its `transaction` field.

## Paying as an agent (delegated signing)

`scripts/x402-sign.ts` is a standalone signer so an AI agent can drive the payment over plain HTTP while the private key stays out of the agent/LLM context. The agent runs the HTTP flow; the script only signs.

- **stdin** ← value of the `payment-required` header from the 402 response
- **stdout** → value of the `payment-signature` header to retry with

The key never reaches the agent: it is read from `.env` inside the script, and only the signed payload (signature + public key) is written out. To move the key into external custody (HSM/KMS, or a Hiero CLI), swap the signer passed to `ExactHederaScheme` — the flow stays identical.

Requires a funded ECDSA testnet account in `.env` (`HEDERA_CLIENT_ID`, `HEDERA_CLIENT_KEY`).

```bash
URL="http://localhost:4021/data/spot-price?symbol=AAPL"

# 1. Trigger the 402 and capture the payment-required header
PR=$(curl -s -D - -o /dev/null "$URL" \
  | grep -i '^payment-required:' | sed 's/^[^:]*:[[:space:]]*//' | tr -d '\r')

# 2. Delegate signing (key stays in the script)
SIG=$(printf '%s' "$PR" | pnpm exec tsx scripts/x402-sign.ts)

# 3. Retry with the signature: 200 + data, settlement in the payment-response header
curl -s -i "$URL" -H "payment-signature: $SIG"
```

The signed payload expires after `maxTimeoutSeconds` (180s) — sign right before the retry. ED25519 accounts need `fromStringED25519` instead of `fromStringECDSA` in the script.

## Known v1 limitations

- `settle` runs after the handler returns 200: a verify-pass / settle-fail means data was
  delivered without payment landing. Accepted for v1 (testnet, zero-value mock).
- `freshnessWindowSec` is in the contract but not enforced (clean pay-per-call).
- No HCS attestation, no spend guardrail, no web UI (deferred).
