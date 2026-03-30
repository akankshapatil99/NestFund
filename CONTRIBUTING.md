# Contributing to NestFund

Thank you for your interest in contributing to NestFund! 🎉

## How to Contribute

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/NestFund.git`
3. **Create a branch**: `git checkout -b feature/your-feature-name`
4. **Make your changes** following the code style below
5. **Commit** with a meaningful message (see commit conventions)
6. **Push** your branch: `git push origin feature/your-feature-name`
7. **Open a Pull Request** against `main`

## Commit Conventions

Use the following prefixes for commits:

| Prefix | Description |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `chore:` | Tooling / config changes |
| `refactor:` | Code refactor without feature change |
| `style:` | CSS / visual changes |
| `test:` | Tests |

**Example:** `feat: add portfolio breakdown chart to InvestView`

## Code Style

- **Frontend**: ES Modules, React functional components, hooks only (no class components)
- **Backend**: ES Modules (`"type": "module"`), async/await
- **Contracts**: Follow Soroban SDK best practices, use `require_auth()` on all state-changing functions
- **CSS**: CSS custom properties (variables) only — no inline styles

## Setting Up Locally

See [README.md](./README.md#-getting-started) for full setup instructions.

## Areas Open for Contribution

- [ ] Mainnet deployment support
- [ ] Mobile-responsive layout improvements
- [ ] Additional Soroban contract features (dividend distribution)
- [ ] NeRA multi-language support
- [ ] Unit tests for backend API routes
- [ ] Soroban contract test suite expansion

## Questions?

Open a GitHub Issue or reach out via the Discussions tab.
