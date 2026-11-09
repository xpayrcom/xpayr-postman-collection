<div align="center">
  <a href="https://xpayr.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://xpayr.com/public/images/xpayr-logo-white.png" />
      <source media="(prefers-color-scheme: light)" srcset="https://xpayr.com/public/images/xpayr-logo-black.png" />
      <img src="https://xpayr.com/public/images/xpayr-logo-white.png" alt="XPayr Official Logo" width="220" />
    </picture>
  </a>
  <p>
    <a href="https://xpayr.com"><img src="https://xpayr.com/partner-badge.php?type=powered_by&theme=dark" alt="Powered by XPayr" height="28" /></a>
    <a href="https://mcp.xpayr.com"><img src="https://img.shields.io/badge/MCP_Portal-mcp.xpayr.com-029bfd?style=for-the-badge" alt="XPayr MCP Portal" height="28" /></a>
    <a href="https://docs.xpayr.com"><img src="https://img.shields.io/badge/Docs-docs.xpayr.com-10b981?style=for-the-badge" alt="XPayr Docs" height="28" /></a>
    <a href="https://www.npmjs.com/package/@xpayr/mcp-server"><img src="https://img.shields.io/npm/v/@xpayr/mcp-server?style=for-the-badge&color=cb3837&label=MCP%20NPM" alt="NPM @xpayr/mcp-server" height="28" /></a>
  </p>
  <p>
    <a href="https://xpayr.com"><b>Official Website</b></a> •
    <a href="https://mcp.xpayr.com"><b>AI &amp; MCP Portal (21 Tools)</b></a> •
    <a href="https://docs.xpayr.com"><b>Developer Docs</b></a> •
    <a href="https://xpayr.com/developers"><b>Developer Hub</b></a> •
    <a href="https://xpayr.com/tools/crypto-payment-fee-calculator"><b>0.5% Fee Calculator</b></a>
  </p>
</div>

---

# XPayr Postman Collection

[![CI](https://github.com/xpayrcom/xpayr-postman-collection/actions/workflows/ci.yml/badge.svg)](https://github.com/xpayrcom/xpayr-postman-collection/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f766e.svg)](LICENSE)

Official Postman collection and environments for exploring the XPayr Merchant API and testnet payment lifecycle.

> **Status:** Official API workspace assets

## Purpose

Give developers an importable, test-key-first workspace for the XPayr Merchant API.

## Included

- Merchant API v1 request collection
- Safe environment template with no credentials
- Automated structural and secret-placeholder validation

## Quick start

```bash
Import postman/xpayr_gateway_v1.postman_collection.json and postman/xpayr_gateway_v1.postman_environment.json into Postman.
```

## Import

1. Import both JSON files from [`postman/`](postman).
2. Duplicate the environment locally and set `bearer_token` to an XPayr test key.
3. Keep `base_url` set to `https://xpayr.com/api/v1`.
4. Run **Health**, then create a testnet payment session before trying stateful requests.

Published assets intentionally contain no credentials. Run `npm test` after every collection update to validate schema, host, placeholders, and secret hygiene.

`postman/xpayr_testnet_smoke.postman_collection.json` is the restricted CI collection. It runs only health, testnet catalog, session creation, and session retrieval. GitHub Actions supplies credentials through the protected `testnet-smoke` environment. CI uses the repository's dependency-free allowlist runner instead of executing arbitrary Postman scripts, then passes the exact `0.001000 USDC` Testnet session to a full-commit-pinned XPayr lifecycle action. That action completes the on-chain split and verifies reconciliation; Mainnet is hard-disabled, and uploaded evidence contains no credentials or resolved request headers.

Use an XPayr test key before live credentials. Never expose `sk_test_*`, `sk_live_*`, agent keys, webhook secrets, or wallet private keys in browser code or commits.

## Documentation

- [Developer Hub](https://xpayr.com/developers)
- [Merchant API documentation](https://xpayr.com/doc-api)
- [Testnet checkout guide](https://xpayr.com/developers/testnet-checkout-api)
- [Webhook signature guide](https://xpayr.com/developers/webhook-signature-guide)

## Security

Read [SECURITY.md](SECURITY.md) before reporting a vulnerability. Payment completion must be based on verified XPayr webhook/API state and canonical on-chain evidence, not browser callbacks alone.

## License

MIT. See [LICENSE](LICENSE).
