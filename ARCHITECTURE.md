# 🏛️ NestFund — System Architecture

> NestFund is a full-stack decentralized application (dApp) built on the **Stellar/Soroban** blockchain, enabling fractional investing in real-world businesses powered by AI-driven risk intelligence.

---

## 📐 Table of Contents

1. [High-Level Overview](#1-high-level-overview)
2. [Technology Stack](#2-technology-stack)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Blockchain Layer](#5-blockchain-layer)
6. [AI Layer — NeRA](#6-ai-layer--nera)
7. [Database Schema](#7-database-schema)
8. [Data Flow Diagrams](#8-data-flow-diagrams)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Security Considerations](#10-security-considerations)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [Data Indexing Layer](#12-data-indexing-layer)
13. [Fee Sponsorship (Gasless)](#13-fee-sponsorship-gasless)

---

## 1. High-Level Overview

NestFund connects **Businesses** (seeking fractional investment) with **Investors** (looking for curated opportunities) through a secure, AI-augmented DApp. Every investment is enforced on-chain via Soroban smart contracts, while off-chain metadata and user profiles are stored in Supabase.

```
┌──────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│   ┌────────────────────────────────────────────────────┐    │
│   │         React + Vite Frontend (SPA)                │    │
│   │   ExploreView │ InvestView │ BusinessView │ LearnView│   │
│   │   Three.js 3D Scenes │ NeRA Chat Widget            │    │
│   └────────────┬──────────────────┬────────────────────┘    │
│                │                  │                          │
└────────────────┼──────────────────┼──────────────────────────┘
                 │                  │
       ┌─────────▼──────┐  ┌────────▼───────────┐
       │  Groq LLM API  │  │  Freighter Wallet   │
       │  (NeRA AI)     │  │  (Stellar Browser   │
       │                │  │   Extension)        │
       └────────────────┘  └────────┬────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │  Stellar Network     │
                         │  Testnet / Mainnet   │
                         │                      │
                         │  ┌────────────────┐  │
                         │  │ Soroban Smart  │  │
                         │  │ Contracts      │  │
                         │  │ (nestfund_     │  │
                         │  │  crowdfund)    │  │
                         │  └────────────────┘  │
                         └──────────────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │    NestFund Backend (Express)  │
                    │    Deployed as Vercel Function │
                    └───────────────┬───────────────┘
                                    │
                         ┌──────────▼──────────┐
                         │   Supabase (PgSQL)   │
                         │   users │ listings  │
                         │   transactions       │
                         └──────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Vite 8 | Single Page Application |
| **3D Rendering** | Three.js / React Three Fiber | Immersive 3D UI scenes |
| **Animations** | Framer Motion | Micro-animations & transitions |
| **Wallet** | `@stellar/freighter-api` v6 | Blockchain auth & signing |
| **Stellar SDK** | `stellar-sdk` v13 | XLM transaction building |
| **Backend** | Node.js + Express 5 | REST API & business logic |
| **Database** | Supabase (PostgreSQL) | Off-chain persistent storage |
| **Smart Contracts** | Rust + Soroban SDK 20 | On-chain escrow & crowdfunding |
| **AI Engine** | Groq (Llama 3.3 70B) | Risk auditing & advisor (NeRA) |
| **Deployment** | Vercel | Frontend + Serverless Functions |

---

## 3. Frontend Architecture

The frontend is a **React 19 SPA** bundled by **Vite 8**. It is divided into distinct mode-based views, each representing a user persona or workflow.

### 3.1 View Structure

```
frontend/src/
├── main.jsx              # React entry point
├── App.jsx               # Root router & global state
├── index.css             # Global design tokens & styles
│
├── LoginView.jsx         # Wallet auth + onboarding
├── ExploreView.jsx       # Market intelligence dashboard (default)
├── InvestView.jsx        # Browse & invest in listings
├── BusinessView.jsx      # List a business + AI risk audit
├── LearnView.jsx         # Educational modules
├── BetaView.jsx          # Beta features / admin panel
│
├── NeRAChat.jsx          # Floating NeRA AI chat widget
│
├── Scene3D.jsx           # Main 3D hero scene (Three.js)
├── Globe3D.jsx           # Animated network globe
├── ExplorerHero3D.jsx    # Explore view hero animation
├── KnowledgeOrb3D.jsx    # Learn view knowledge orb
└── TransactionStatus3D.jsx # Transaction confirmation 3D animation
```

### 3.2 Application State Flow

```
App.jsx (Root)
 ├── activeView state → controls which view renders
 ├── currentUser state → Stellar wallet address + Supabase profile
 ├── listings state → fetched from /api/listings
 └── transactions state → fetched from /api/transactions/:address
```

### 3.3 Wallet Authentication Flow

```
User clicks "Connect Wallet"
        │
        ▼
freighter.getPublicKey()
        │
   ┌────┴────────────────┐
   │ Wallet Connected?   │
   └─────┬───────────────┘
         │ YES
         ▼
POST /api/login { address, name, email }
         │
         ▼
Supabase upserts user row
         │
         ▼
currentUser state set → App unlocks all views
```

---

## 4. Backend Architecture

The backend is a **Node.js + Express 5** server deployed as a **Vercel Serverless Function**.

### 4.1 API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/stats` | Platform KPIs: volume, users, tx count, listing count |
| `GET` | `/api/users` | All registered users (ordered by last login) |
| `POST` | `/api/login` | Wallet-based auth — upsert user in Supabase |
| `GET` | `/api/transactions` | Latest 10 global transactions |
| `GET` | `/api/transactions/:address` | All transactions for a given wallet |
| `POST` | `/api/transactions` | Record a new transaction + update listing stats |
| `GET` | `/api/listings` | All active business listings |
| `POST` | `/api/listings` | Create a new business listing |

### 4.2 Core Business Logic

**Transaction recording** (`POST /api/transactions`) includes:
1. Insert transaction row with hash, amount, asset, and timestamp
2. Fetch associated listing by asset name
3. Recalculate `raisedAmount`, `funded %`, and `remaining` amount
4. Update the listing row atomically in Supabase

### 4.3 Environment Variables

```
SUPABASE_URL=<your supabase project URL>
SUPABASE_KEY=<your supabase anon/service-role key>
```

---

## 5. Blockchain Layer

### 5.1 Smart Contract: `nestfund_crowdfund`

Written in **Rust** using the **Soroban SDK v20**, deployed to the **Stellar Testnet**.

#### Contract State (Storage)

| Key | Storage Type | Description |
|---|---|---|
| `Deadline` | Instance | Campaign end timestamp (Unix) |
| `TargetAmount` | Instance | Fundraising target in stroops |
| `Token` | Instance | SAC token address (XLM or custom) |
| `Recipient` | Instance | Business owner address |
| `AmountRaised` | Instance | Running total raised |
| `Contributor(address)` | Persistent | Per-investor contribution balance |

#### Contract Functions

```
initialize(recipient, deadline, target_amount, token)
  → one-time setup, panics if already initialized

deposit(user, amount)
  → requires user authorization
  → panics if deadline has passed
  → increments per-user and global balance

withdraw()
  → requires recipient authorization
  → only callable after deadline AND if target met
  → transfers all funds to recipient

refund(user)
  → requires user authorization
  → only callable after deadline AND if target NOT met
  → returns user's contribution
```

#### Contract Lifecycle

```
Deploy → initialize() → [investors deposit()] → deadline reached
                                                     │
                              ┌──────────────────────┤
                              │                      │
                        Target MET?            Target NOT MET?
                              │                      │
                         withdraw()              refund(user)
                           (business)           (each investor)
```

### 5.2 Stellar Integration (Frontend)

- **Freighter API**: Used to obtain public key and sign XLM transactions
- **stellar-sdk**: Used to build `TransactionBuilder` operations and submit to Horizon testnet
- **Horizon Endpoint**: `https://horizon-testnet.stellar.org`

---

## 6. AI Layer — NeRA

**NeRA** (NestFund Real-time Advisor) is the platform's embedded AI engine, powered by **Groq's hosted Llama 3.3 70B** model.

### 6.1 NeRA Functions

| Feature | Location | Description |
|---|---|---|
| **Risk Auditor** | `BusinessView.jsx` | Auto-analyzes submitted business proposals for risk factors |
| **Market Intelligence** | `ExploreView.jsx` | Generates live ecosystem insights and sector analysis |
| **AI Chat Advisor** | `NeRAChat.jsx` | Conversational investment Q&A assistant |
| **Educational Tutor** | `LearnView.jsx` | Guides new investors through DeFi and blockchain concepts |

### 6.2 NeRA Integration Flow

```
User Input / Business Form Data
        │
        ▼
Groq API Call (Llama 3.3 70B)
POST https://api.groq.com/openai/v1/chat/completions
        │
        ▼
Streamed / JSON response
        │
        ▼
Rendered in UI (risk score, advice, chat reply)
```

---

## 7. Database Schema

Three core tables in Supabase (PostgreSQL):

### `users`
| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `address` | TEXT UNIQUE | Stellar wallet address |
| `name` | TEXT | Display name |
| `email` | TEXT | Contact email |
| `joinedat` | TIMESTAMPTZ | Registration timestamp |
| `lastlogin` | TIMESTAMPTZ | Most recent login |

### `listings`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL (PK) | Auto-increment |
| `name` | TEXT | Business name |
| `sector` | TEXT | Industry sector |
| `description` | TEXT | Proposal summary |
| `targetamount` | NUMERIC | Fundraising goal (₹) |
| `raisedamount` | NUMERIC | Amount raised so far |
| `funded` | INTEGER | % funded (0-100) |
| `remaining` | TEXT | Formatted remaining amount |
| `contractid` | TEXT | Deployed Soroban contract ID |
| `owneraddress` | TEXT | Business owner wallet |

### `transactions`
| Column | Type | Description |
|---|---|---|
| `id` | SERIAL (PK) | Auto-increment |
| `address` | TEXT | Investor wallet address |
| `type` | TEXT | `invest` / `refund` / `withdraw` |
| `amount` | NUMERIC | XLM amount |
| `asset` | TEXT | Listing name invested in |
| `txhash` | TEXT | Stellar transaction hash |
| `time` | TIMESTAMPTZ | Transaction timestamp |

---

## 8. Data Flow Diagrams

### 8.1 Investor Flow (Investing in a Listing)

```
Investor opens InvestView
        │
        ▼
GET /api/listings → display listing cards
        │
        ▼
Investor selects listing → enters XLM amount
        │
        ▼
Build Stellar Payment transaction (stellar-sdk)
        │
        ▼
freighter.signTransaction(xdr)
        │
        ▼
Submit to Horizon Testnet
        │
        ▼
On success → POST /api/transactions { address, amount, asset, txHash }
        │
        ▼
Backend updates listing.raisedAmount, listing.funded
        │
        ▼
UI refreshes → 3D TransactionStatus animation plays
```

### 8.2 Business Listing Flow

```
Business owner opens BusinessView
        │
        ▼
Fills in listing form (name, sector, target, description)
        │
        ▼
NeRA AI Risk Audit triggered → Groq API analyzes proposal
        │
        ▼
Risk report displayed (score, flags, recommendations)
        │
        ▼
Owner confirms → POST /api/listings
        │
        ▼
Supabase stores listing metadata
        │
        ▼
Soroban contract initialized on Stellar Testnet
        │
        ▼
Listing appears in InvestView for investors
```

---

## 9. Deployment Architecture

NestFund is deployed to **Vercel** as a monorepo with two build targets:

```
vercel.json
├── Build: frontend/package.json → @vercel/vite (Static SPA)
└── Build: backend/index.js     → @vercel/node (Serverless Function)

Rewrites:
├── /api/* → /backend/index.js (API requests)
└── /*     → /frontend/*       (SPA catch-all)
```

### Environment Variables (Vercel Dashboard)
```
SUPABASE_URL
SUPABASE_KEY
VITE_GROQ_API_KEY   (frontend env, prefixed with VITE_)
VITE_BACKEND_URL
```

---

## 10. Security Considerations

| Risk | Mitigation |
|---|---|
| **Private key exposure** | Freighter wallet — private keys never leave the browser extension |
| **API key leakage** | `.env` files excluded via `.gitignore`; keys stored in Vercel env vars |
| **Unauthorized contract calls** | Soroban `require_auth()` enforced on every state-changing function |
| **Double-initialization** | Contract panics if `initialize()` is called twice |
| **Premature withdrawal** | Contract enforces deadline and target checks before `withdraw()` |
| **SQL injection** | Supabase client uses parameterized queries via its SDK |
| **CORS** | Express CORS middleware restricts cross-origin API access |

---

## 11. Monitoring & Observability

NestFund uses a multi-layered approach to production visibility, ensuring platform stability and rapid incident response.

### 11.1 Error Monitoring (Sentry)
- **Backend**: Express error-tracking middleware captures unhandled exceptions and database query failures.
- **Stellar Flow**: Failed transaction signing and broadcasting are logged as exceptions with relevant XDR context and detailed Horizon error codes.
- **AI Diagnostics**: AI proxy timeouts and Groq API errors are captured with model parameters and prompt context.

### 11.2 Analytics & Retention (PostHog)
- **Identity**: Users are identified via `posthog.identify(address)` on login to track DAU and retention cohorts.
- **Conversion**: The `transaction_completed` event tracks successful on-chain investments.
- **Retention**: Tracks returning user percentage and feature engagement.

### 11.3 Request Logging (Morgan)
- **Backend Logging**: Morgan middleware provides Apache-style logs (`combined` format) in production for every API interaction.
- **Custom Logger**: Failures are logged with ISO timestamps and formatted stack traces for server-side debugging.

### 11.4 Performance Benchmarks
- **AI Inference Latency**: < 800ms (via Groq Llama 3.3 70B)
- **Database Query Latency**: < 15ms (via Indexed Supabase)
- **Stellar Transaction Finality**: 5-7 seconds (Network Average)

---

## 12. Data Indexing Layer

NestFund implements a **hybrid indexing strategy** to ensure that off-chain data in Supabase remains perfectly synced with the Stellar blockchain.

### 12.1 Transaction Indexer (`backend/indexer.js`)
- **Direct Event Reporting**: Frontend reports successful transactions immediately via `POST /api/transactions`.
- **Blockchain Sync**: A background indexer scans the Stellar Horizon API for transactions involving the NestFund Admin account.
- **De-duplication**: Transactions are matched by `txhash` to prevent duplicate entries in Supabase. This process uses a PostgreSQL `UNIQUE` constraint on the `txhash` column as the ultimate source of truth.
- **Consistency Check**: Manual triggers via `/api/index` allow for force-syncing if any events were missed.

### 12.2 Database Performance Indexing
The following PostgreSQL indexes are applied to Supabase to ensure low-latency queries for the dashboard:
- `idx_transactions_address`: Accelerates user portfolio fetches.
- `idx_transactions_time`: Optimizes time-series charts (Growth, Volume).
- `idx_users_address`: Speeds up login/authentication.
- `idx_listings_name`: Fast lookup for asset-to-listing mapping.

---

---

## 13. Fee Sponsorship (Gasless)

NestFund eliminates network complexity for new users by implementing **Gasless Transactions** via Stellar's Fee Bump (SEP-23) standard.

### 13.1 Sponsorship Engine
- **Inner Transaction**: The user builds and signs a standard payment transaction. The signature is applied to the inner hash.
- **Outer Transaction**: The NestFund backend receives the signed XDR, constructs a `FeeBumpTransaction`, adds the sponsor's signature, and returns a unified transaction envelope.
- **Submission**: The platform submits the final fee-bumped envelope. The network deducts fees from the sponsor's account balance.

### 13.2 Security
- **Sponsor Quotas**: Sponsorship is limited to valid project investment types to prevent bot-draining of the admin wallet.
- **Environment Isolation**: The `NESTFUND_ADMIN_SECRET` is never exposed to the frontend; it stays strictly within the serverless runtime.

---

## 14. Troubleshooting & FAQ

### 14.1 Common Issues
- **"Unexpected Token A"**: This usually indicates a backend crash or timeout. Check if `NESTFUND_ADMIN_SECRET` is correctly set in Vercel.
- **Transaction Rejected (400)**: Often due to `tx_bad_auth`. Ensure the wallet address in the frontend matches the one signed in Freighter.
- **Indexer Delay**: The ledger indexer polls every few minutes. Use `POST /api/index` for an immediate force-sync.

### 14.2 API Deep Dive: Sponsorship
**Endpoint**: `POST /api/sponsor`
**Request Body**:
```json
{
  "xdr": "AAAAAgAAA..." 
}
```
**Response**:
```json
{
  "success": true,
  "sponsoredXdr": "AAAAAwAAAA..."
}
```

---

*Last updated: April 2026 | NestFund v1.3.1 Full Documentation*
