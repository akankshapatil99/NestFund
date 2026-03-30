# Security Policy

## Supported Versions

| Version | Supported |
|---|---|
| 1.0.x (MVP) | ✅ |

## Reporting a Vulnerability

If you discover a security vulnerability in NestFund, **please do NOT open a public GitHub Issue**.

Instead, please report it privately by emailing the maintainer directly (contact via GitHub profile).

We will acknowledge your report within **48 hours** and aim to resolve critical issues within **7 days**.

## Security Best Practices for Contributors

- **Never commit API keys, wallet private keys, or `.env` files**
- All `.env` files are excluded via `.gitignore`
- Smart contract state-changing functions MUST use `require_auth()`
- Do not disable CORS in production
- Always use parameterized queries via the Supabase SDK (no raw SQL string interpolation)

## Known Security Measures in NestFund

| Layer | Measure |
|---|---|
| Wallet Auth | Private keys never leave the Freighter browser extension |
| Smart Contracts | `require_auth()` enforced on `deposit()`, `withdraw()`, `refund()` |
| API Keys | Stored in Vercel environment variables, never in source code |
| Database | Supabase SDK uses parameterized queries throughout |
| CORS | Express CORS middleware active on all API routes |
| Contract Init | `initialize()` panics on re-initialization (replay protection) |
