export const site = {
  apiBase: "http://localhost:4021",
  network: "hedera:testnet",
  asset: "0.0.0",
  payTo: "0.0.4515756",
  feePayer: "0.0.7162784",
  x402Version: 2,
  repoUrl: "https://github.com/matevszm/x402-hedera-example",
  x402DocsUrl: "https://docs.x402.org",
  faucetUrl: "https://portal.hedera.com",
  nav: [
    { label: "How it works", href: "#how" },
    { label: "Quickstart", href: "#quickstart" },
    { label: "For agents", href: "#agents" },
    { label: "Pricing", href: "#pricing" },
  ],
} as const;
