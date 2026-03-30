<div align="center">

# 🪺 NestFund

### *Fractional Investing. On-Chain. AI-Powered.*

**🌐 Live Platform:** [https://nestfund-phi.vercel.app](https://nestfund-phi.vercel.app)

[![Stellar](https://img.shields.io/badge/Blockchain-Stellar%20%2F%20Soroban-7B2FBE?style=for-the-badge&logo=stellar&logoColor=white)](https://stellar.org)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama%203.3-F55036?style=for-the-badge)](https://groq.com)

</div>

---

## 🌟 What is NestFund?

**NestFund** is a decentralized crowdfunding platform that allows everyday investors to take **fractional ownership** in real-world businesses — all enforced by **Soroban smart contracts** on the **Stellar blockchain**. It's augmented with **NeRA**, an AI advisor powered by Groq's Llama 3.3 70B, providing real-time risk analysis, market intelligence, and educational guidance.

> **Think:** Kickstarter × Coinbase × ChatGPT — built for the next generation of decentralized finance.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔗 **On-Chain Investments** | Every investment is a real Stellar XLM transaction signed via Freighter wallet |
| 🤖 **NeRA AI Advisor** | Real-time risk auditing, market intelligence, and conversational investment Q&A |
| 📊 **3D Interactive UI** | Immersive Three.js visualizations including a live network globe and animated dashboards |
| 🏢 **Business Listing Flow** | Businesses submit proposals, get AI risk-audited, and receive fractional funding |
| 📈 **Live Portfolio Tracking** | Investors track all on-chain activity and portfolio exposure in real-time |
| 🎓 **Learn Mode** | Interactive educational modules teaching DeFi, blockchain, and investing fundamentals |
| 🌐 **Explore Mode** | AI-generated market insights and trending business sectors |

---

## 🗂️ Project Structure

```
nestfund/
├── frontend/               # React 19 + Vite 8 SPA
│   └── src/
│       ├── App.jsx          # Root router & global state
│       ├── LoginView.jsx    # Wallet auth + onboarding
│       ├── ExploreView.jsx  # Market intelligence (default view)
│       ├── InvestView.jsx   # Browse & invest in listings
│       ├── BusinessView.jsx # List a business + AI risk audit
│       ├── LearnView.jsx    # Educational modules
│       ├── NeRAChat.jsx     # Floating AI chat widget
│       └── Scene3D.jsx      # Three.js 3D scenes
│
├── backend/                # Node.js + Express 5 API
│   └── index.js            # REST API + Supabase integration
│
├── contracts/              # Soroban Smart Contracts (Rust)
│   └── crowdfund/
│       └── src/lib.rs      # Crowdfund contract logic
│
├── ARCHITECTURE.md         # Full system architecture document
├── vercel.json             # Vercel monorepo deployment config
└── README.md               # This file
```

---

## 🏛️ Architecture

NestFund is a 4-layer system:

```
[ React Frontend ] ←→ [ Groq AI / NeRA ]
        ↕                      
[ Express Backend ] ←→ [ Supabase (PostgreSQL) ]
        ↕
[ Stellar Network / Soroban Smart Contracts ]
```

📄 **See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete architecture document**, including:
- Full system diagrams
- API endpoint reference
- Smart contract lifecycle
- Database schema
- Data flow diagrams
- Security considerations

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- [Freighter Wallet](https://freighter.app) browser extension (connected to Testnet)
- Supabase project with `users`, `listings`, `transactions` tables
- Groq API key from [console.groq.com](https://console.groq.com)

### 1. Clone the repository

```bash
git clone https://github.com/akankshapatil99/NestFund.git
cd NestFund
```

### 2. Configure environment variables

**`frontend/.env`**
```env
VITE_BACKEND_URL=http://localhost:5001
VITE_GROQ_API_KEY=your_groq_api_key_here
```

**`backend/.env`**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
```

### 3. Run locally

```bash
# Terminal 1 — Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173

# Terminal 2 — Backend
cd backend
npm install
npm run dev
# → http://localhost:5001
```

---

## 🔗 Smart Contract

The `nestfund_crowdfund` Soroban contract (Rust) manages all on-chain escrow:

| Function | Description |
|---|---|
| `initialize()` | Deploy and configure a campaign (recipient, deadline, target) |
| `deposit()` | Investor deposits XLM into the escrow |
| `withdraw()` | Business claims funds if target is met after deadline |
| `refund()` | Investor reclaims funds if target is NOT met after deadline |

**Compile & deploy (requires Rust + Stellar CLI):**
```bash
cd contracts/crowdfund
cargo build --target wasm32-unknown-unknown --release
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/nestfund_crowdfund.wasm --network testnet
```

---

## 🤖 NeRA — AI Advisor

NeRA (NestFund Real-time Advisor) is integrated directly into 4 core flows:

- **Risk Auditor** — Analyzes business proposals for risk factors before listing
- **Market Intelligence** — Generates live sector trends in the Explore view
- **Chat Advisor** — Answers investor questions conversationally
- **Educational Tutor** — Guides beginners through DeFi concepts in Learn mode

**Powered by:** Groq Llama 3.3 70B (world's fastest LLM inference)

---

## 📜 MVP Requirements Status

| Requirement | Status |
|---|---|
| ✅ Fully Functional DApp | Backend connected to Supabase, 3D interactive UI |
| ✅ Blockchain Integration | On-chain fractional investments via Freighter / Soroban |
| ✅ AI Real-time Advisor | Risk auditing, market intelligence & tutoring via NeRA (Groq) |
| ✅ Technical Documentation | `ARCHITECTURE.md` (10 sections) + full `README.md` |
| ✅ Development History | 10+ meaningful commits in repository |
| ✅ Live Deployment | Deployed on Vercel |

---

## 🗓️ Development History

This repository reflects a full development lifecycle with 10+ meaningful commits covering infrastructure setup, feature development, AI integration, blockchain wiring, and documentation.

| # | Commit | Description |
|---|---|---|
| 1 | `Docs: Project setup` | Initial repository setup and project scaffolding |
| 2 | `Deploy: Vercel config` | Added `vercel.json` for monorepo deployment |
| 3 | `Chore: git ignores` | Configured `.gitignore` for frontend, backend, and contracts |
| 4 | `Docs: Architecture diagram` | Initial `ARCHITECTURE.md` with system overview |
| 5 | `Backend: Node init` | Express server bootstrap with CORS and env config |
| 6 | `Backend: API setup` | Full REST API — users, listings, transactions endpoints |
| 7 | `Frontend: Main App` | React SPA root with view routing and global state |
| 8 | `Business: Listing flow` | Business listing submission form with validation |
| 9 | `Invest: Dashboard` | Investor view with listing cards and XLM investment flow |
| 10 | `AI: NeRA Advisor` | Groq-powered risk auditor and market intelligence integration |
| 11 | `Final cleanup` | Code cleanup, env safety, and production readiness |

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Frontend | React 19, Vite 8, Framer Motion |
| 3D / Graphics | Three.js, React Three Fiber |
| Blockchain | Stellar SDK v13, Freighter API v6 |
| Smart Contracts | Rust, Soroban SDK v20 |
| Backend | Node.js, Express 5, Nodemon |
| Database | Supabase (PostgreSQL) |
| AI | Groq (Llama 3.3 70B) |
| Deployment | Vercel (Frontend SPA + Serverless Functions) |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License © 2026 NestFund

---

<div align="center">
Built with ❤️ on Stellar | Powered by NeRA AI
</div>
