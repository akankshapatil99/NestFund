# 📋 NestFund — Changelog

All notable changes to this project are documented here.

---

## [1.0.0] — 2026-03-30 — MVP Release 🎉

### Added
- Full-stack DApp with React 19 + Vite 8 frontend
- Node.js + Express 5 backend deployed as Vercel serverless functions
- Supabase PostgreSQL integration (users, listings, transactions tables)
- Stellar / Soroban smart contract (`nestfund_crowdfund`) for on-chain escrow
- Freighter wallet authentication and transaction signing
- NeRA AI Advisor (Groq Llama 3.3 70B) — risk auditing, market intelligence, chat, and tutor
- 5 application views: Explore, Invest, Business, Learn, Beta
- Three.js 3D visualizations: Globe, Scene, KnowledgeOrb, ExplorerHero, TransactionStatus
- Framer Motion micro-animations throughout the UI
- Full REST API with 7 endpoints for users, listings, and transactions
- Vercel monorepo deployment configuration
- Comprehensive `ARCHITECTURE.md` (10 sections)
- Full `README.md` with badges, setup guide, and API reference
- `CONTRIBUTING.md` with commit conventions and contribution areas
- `SECURITY.md` with vulnerability reporting and security policies
- `CHANGELOG.md` documenting the full release history

### Smart Contract Features
- `initialize()` — one-time campaign setup with replay protection
- `deposit()` — investor contribution with deadline enforcement
- `withdraw()` — recipient fund claim with target + deadline gates
- `refund()` — investor refund if target not met after deadline

### AI Features (NeRA)
- Business proposal risk auditing with structured risk score output
- Market intelligence generation for Explore view
- Conversational Q&A investment advisor
- DeFi educational tutor for new investors

---

## [0.2.0] — 2026-03-25 — AI & Blockchain Integration

### Added
- NeRA AI chat widget integrated across all views
- Groq API connection replacing initial Gemini integration
- Soroban contract deployment wired into business listing flow
- Freighter wallet fix — persistent session across page reloads
- InvestView with XLM amount input and transaction submission

---

## [0.1.0] — 2026-03-20 — Initial Build

### Added
- Project scaffolded with React + Vite
- Express backend initialized with CORS and dotenv
- Supabase client connected to cloud database
- Basic login view with wallet connect button
- Vercel deployment configuration
- Initial `.gitignore` for node_modules and .env files
