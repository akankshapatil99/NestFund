<div align="center">

# NestFund

### *Fractional Investing. On-Chain. AI-Powered.*

**Live Platform:** [https://nestfund-phi.vercel.app](https://nestfund-phi.vercel.app)
**Live Demo Video:** [NestFund Live Demo (YouTube)](https://youtu.be/M52teeVEetU?si=5A2gpx4n351p6w57)
**Project Spreadsheet:** [NestFund Data & Tracking](https://docs.google.com/spreadsheets/d/14BVVjDBkzcaf6usZwAAibzn9z-AfrcMyW_Yz-LIUDTE/edit?usp=sharing)
**User Feedback:** [NestFund Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfmReM605364UPevWyErOFfoIYzkHOaIUtNz2uBYyEmGLkO5g/viewform?usp=publish-editor)

</div>

---

## What is NestFund?

**NestFund** is a decentralized crowdfunding platform that allows everyday investors to take **fractional ownership** in real-world businesses — all enforced by **Soroban smart contracts** on the **Stellar blockchain**. It's augmented with **NeRA**, an AI advisor powered by Groq's Llama 3.3 70B, providing real-time risk analysis, market intelligence, and educational guidance.

> **Think:** Kickstarter × Coinbase × ChatGPT — built for the next generation of decentralized finance.

**Production Ready:** Fee-Sponsorship, High-Speed Indexing, and 24/7 Monitoring.

---

## Key Features

| Feature | Description |
|---|---|
| **On-Chain Investments** | Every investment is a real Stellar XLM transaction signed via Freighter wallet |
| **NeRA AI Advisor** | Real-time risk auditing, market intelligence, and conversational investment Q&A |
| **3D Interactive UI** | Immersive Three.js visualizations including a live network globe and animated dashboards |
| **Business Listing Flow** | Businesses submit proposals, get AI risk-audited, and receive fractional funding |
| **Live Portfolio Tracking** | Investors track all on-chain activity and portfolio exposure in real-time |
| **Learn Mode** | Interactive educational modules teaching DeFi, blockchain, and investing fundamentals |
| **Explore Mode** | AI-generated market insights and trending business sectors |
| **Gasless Transactions** | Advanced Fee Sponsorship (SEP-23) allows users to invest without holding XLM for fees |

---

## Project Structure

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

## Architecture

NestFund is a 4-layer system:

```
[ React Frontend ] <-> [ Groq AI / NeRA ]
        |                      
[ Express Backend ] <-> [ Supabase (PostgreSQL) ]
        |
[ Stellar Network / Soroban Smart Contracts ]
```

**See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete architecture document**, including:
- Full system diagrams
- API endpoint reference
- Smart contract lifecycle
- Database schema
- Data flow diagrams
- Security considerations

---

## Getting Started

### Prerequisites

- Node.js v18+
- [Freighter Wallet](https://freighter.app) browser extension (connected to Testnet)
- Supabase project with `users`, `listings`, `transactions` tables
- Groq API key from [console.groq.com](https://console.groq.com)
- Sentry DSN from [sentry.io](https://sentry.io) for monitoring

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
VITE_SENTRY_DSN=your_sentry_dsn_here
VITE_POSTHOG_KEY=your_posthog_project_key  # Optional: For DAU, Analytics & Retention tracking
```

**`backend/.env`**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
NESTFUND_ADMIN_SECRET=your_admin_secret_for_fee_sponsorship
SENTRY_DSN=your_sentry_dsn_here
```

### 3. Run locally

```bash
# Terminal 1 — Frontend
cd frontend
npm install
npm run dev
# -> http://localhost:5173

# Terminal 2 — Backend
cd backend
npm install
npm run dev
# -> http://localhost:5001
```

---

## 📖 User Guide
### For Investors
1. **Connect Wallet**: Click "Connect Wallet" and authorize with Freighter.
2. **Explore**: Browse listings in the "Invest" tab. Look for high **NeRA Trust Scores**.
3. **Invest**: Click "Invest Now", Enter amount, and Sign. **Note: Fees are Sponsored (Gasless)!**
4. **Track**: Monitor your portfolio and transaction history in the "My Ledger" section.

### For Business Owners
1. **Prepare Proposal**: Navigate to the "Business" tab.
2. **AI Audit**: Enter your business details. NeRA AI will automatically audit your proposal for risks.
3. **List Project**: Once audited, your project will be initialized on the Stellar Testnet.
4. **Collect Funds**: Once the target is met, funds are held securely until the deadline.

---

## 🚀 Production Launch Checklist
- [x] Sentry DSN configured for Frontend/Backend
- [x] Supabase Indexes applied for performance
- [x] PostHog Analytics active for DAU tracking
- [x] NESTFUND_ADMIN_SECRET set for Gasless Transactions
- [x] NeRA AI diagnostic check passing (check browser console)

---

## Smart Contract

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

## NeRA — AI Advisor

NeRA (NestFund Real-time Advisor) is integrated directly into 4 core flows:

- **Risk Auditor** — Analyzes business proposals for risk factors before listing
- **Market Intelligence** — Generates live sector trends in the Explore view
- **Chat Advisor** — Answers investor questions conversationally
- **Educational Tutor** — Guides beginners through DeFi concepts in Learn mode
- **Security Auditor** — Performs automated checks on transaction XDRs and contract signatures

**Powered by:** Groq Llama 3.3 70B (world's fastest LLM inference)

---


## Tech Stack

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

## Project Data & Tracking

All project milestones, financial tracking, and development progress are documented in the live spreadsheet:
- [NestFund Master Tracking Sheet](https://docs.google.com/spreadsheets/d/14BVVjDBkzcaf6usZwAAibzn9z-AfrcMyW_Yz-LIUDTE/edit?usp=sharing)
- [NestFund User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfmReM605364UPevWyErOFfoIYzkHOaIUtNz2uBYyEmGLkO5g/viewform?usp=publish-editor)

### User Feedback Responses
Access the real-time feedback response sheet here:
- [NestFund Feedback Response Sheet](https://docs.google.com/spreadsheets/d/14BVVjDBkzcaf6usZwAAibzn9z-AfrcMyW_Yz-LIUDTE/edit?usp=sharing)

**Feedback Snapshot:**
![User Feedback Response Sheet](./NF%20videos/feedback.png)

---

### User Metrics & Analytics
NestFund integrates **PostHog** for real-time product analytics, tracking:

- **Verified Integrations**: All Core API flows (Stats, Metrics, Indexer, Sponsor) are verified on production.

| Metric | Description |
|---|---|
| **DAU (Daily Active Users)** | Unique wallets active each day via `posthog.identify()` on login |
| **Transactions** | Every on-chain investment fires a `transaction_completed` event with amount, asset & tx hash |
| **Retention** | Wallet-based cohort retention — tracks if users return day 1, day 7, day 30 |

### Live DAU & WAU Dashboard (PostHog)
![NestFund DAU & WAU Tracking — PostHog Dashboard](./NF%20videos/DAU.png)

### Growth Accounting & Retention (PostHog)
![NestFund Growth Accounting & Retention — PostHog Dashboard](./NF%20videos/growth.png)

### Live Activity Dashboard
![NestFund Live Activity Dashboard](./NF%20videos/live%20activity.png)

### Table 1: Registered Users (30 Users — Level 6)

| # | User Name | User Email | User Wallet Address |
|---|---|---|---|
| 1 | Purvai | purvait1246@gmail.com | `GBPUHHUNOTD3Y2HIYGNTZGT2AXDDTN5J2FLTJVBALX4KALPP6LP2L7VH` |
| 2 | Akanksha Patil | akankshapatil2099@gmail.com | `GCFMZELIN2CL2I4XA4L62TNJABUTQTXL3JXUGGDK3YJX65LEUR4QHQKG` |
| 3 | Lily Anthony | 3022411004@despu.edu.in | `GCGRCC2ZR7LLQULQY4CZGTAQGJCT6DBHXXPJI6FCXCQEKCD7M4OUGVUD` |
| 4 | Nishita Gopwani | gopwaninishita@gmail.com | `GAIY7YG73AGZ433BJSQLLQDVATE3F4LF35WIR6VTM2ROR7BSFBBOQAFN` |
| 5 | Soham Patil | sohampatil022@gmail.com | `GA277JKGKO2RVJ7XLS3SIZJSCYECWJSC5BOTUSPX6OM3DWIYAWR6XX27` |
| 6 | Meenakshi Patil | meenakshirpatil99@gmail.com | `GB2IGDGHRLX7JSGL3Q22YGOH7HG5EGWJ4OA2DPKLSEBACCQ73CU5CNOD` |
| 7 | Shrikant Aher | shrikantaher1919@gmail.com | `GBEWS3QTQ77BZ7BLHMX4FCWESQC4HJDMVA4EJE6WS5DHQRVTMURHPBKL` |
| 8 | Rakhi Sahni | rakhisahni890@gmail.com | `GCNZOF5V6TBCB5GDVTR4FBMZECKLAS3D6M6ZBXXDSUN57GBECL3US22O` |
| 9 | Mahee Patil | maheepatil06@gmail.com | `GCKXKIKQRGHZASVIGULH4D7474VWVXCKL2GGK2CKN47PT2OSTHKSQXCG` |
| 10 | Neeral Kothadia | neeralkothadia14@gmail.com | `GAAUOWQG2S4T7XFCZPALW5AWDTV6SW4TBWAWTL75DRZQ7JB3ZULXGY2M` |
| 11 | Aditya Chavan | adichavan555@gmail.com | `GAR4Z7NQQCZFQIBBCWDYWTH2YFQUVRS2WQOGBMKKHUNAYWLMZSLODNF7` |
| 12 | Tanishka Mahindrakar | tanishkamm05@gmail.com | `GA3JCK6ET6AOKUO2CYYDM4V6YZUDOPRVTKNKFKL3FQ5P2XEDYEOWU5CJ` |
| 13 | Mayur Agarwal | mayuragarwal30@gmail.com | `GCM24DMYJWCJN6E3PVBM6MM7RTBSAKSGW2KJPRHBRSHNUMLHMWB73X7U` |
| 14 | Shivani More | moreshivani22@gmail.com | `GBTFQ2GUYN2UXHE56ZM2TQTS34KKJVFJ66K4JRSDWGIVSH2TMRCXQDQI` |
| 15 | Saniya Shaikh | saniyashaikh66@gmail.com | `GBE7HSCTEU7GEMI65WQV6QX6L5K33YJNAD63QCKP2SOQEIWAVYEZ45TL` |
| 16 | Vaishnavi Tiwari | vaishnavitiwari0202@gmail.com | `GCLPEZBQX3P5UWMS6KJMVKICAOOO5FHOFWRTUXBUBE44W7E7FCL7PJT5` |
| 17 | Aadya Gange | gangeaadya99@gmail.com | `GD5Z2X4TJNLTVET73TNXITRGES6MZEZ42NKASJNGPWSMXE46DKPGCCJ5` |
| 18 | Ajinkya Garad | ajinkyarajegarad@gmail.com | `GALCZOBFF3IACQF6ULNGBE3TOXO46HIGFOOHQCKAV6KN3O2FLGKL2HOR` |
| 19 | Riya Mehta | riyamehta30@gmail.com | `GA5ZKUVLXSWIP45XFH2SVPRVRCAZC6E3X223CMROJIKIGQWNX7KILKLE` |
| 20 | Tanishka Manthalkar | manthalkartan110@gmail.com | `GASQUFERHAOLSRKYTSP3R4AGHCHPHPKRLVFVEKPNIUK46BWFFZ67UVL3` |
| 21 | Aastha Patil | aasthapatil1406@gmail.com | `GAWPCOYQMT7EAO7H7S767YBBIYT2N55TFR5I5USMRYB6A3ACJB7QSNT6` |
| 22 | Rajesh Patil | rapa99@gmail.com | `GCA5J2CSKOGWX2XW77USDZPRLWIXZ7DI2YC6NQHSWKXXM37H2JSPYXJ4` |
| 23 | Kashish Gurnani | kashishgurnani45@gmail.com | `GAXULYW65IJHAGXCSLPZH2CNDUIKJTQS3JECWUCXKEADGIWOFEMXBE7F` |
| 24 | Ruchita Telsang | ruchitatelsang22@gmail.com | `GAGGXMBT5HW5GA2PSJR3ZHFO7I2F4H3R7NUDHB4GSGIC4VF2WSRZVDZH` |
| 25 | Surekha Lakde | lakdesurekha7@gmail.com | `GD7SC62LBAOMSPF34ZQFLJWATJMWYEHUXQVQORBOO2FZJ23ZJH4TJ3MC` |
| 26 | Poorvaja Yadav | poorvajayadav4149@gmail.com | `GB3QHJW26AFAE7LTORZKPKSMSMNFDF3WPJGLWYOKJQR3K3L2SHRAQXA4` |
| 27 | Saukhya Tupe | saukhyatupe013@gmail.com | `GBKZH5RDL4BJVLTOETQULYWXLDYKF2OI5HCV5IY6WLQIBK2QNYMAUBCV` |
| 28 | Aanam Khan | aanamkhan552@gmail.com | `GAGNW6CAVAKRJEA3NJV5Y6KODZHDTJ2Z3I4EOUYNMSRPZNQAFIANQJOW` |
| 29 | Shlok Malpani | malpani16shlok@gmail.com | `GB7NKIIBCZZPO4YCE3GFSCDZ4P6ILTGPDSYUL3OFLRSFMZD44RTZ7ZGO` |
| 30 | Dhruv Patnekar | dhruvpatnekar@gmail.com | `GB5THPXYMOYIFQIMJDMSOLIYCXCLGRZY7RFBJGUK4PVCCYEI6FH65BKM` |

> **Total Registered Users: 30** — All wallets are verified on the [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)

---

### Table 2: User Feedback Implementation

> **User Feedback Response Sheet (Public):** [View Live Responses](https://docs.google.com/spreadsheets/d/14BVVjDBkzcaf6usZwAAibzn9z-AfrcMyW_Yz-LIUDTE/edit?usp=sharing)

| # | User Name | User Email | User Wallet Address | User Feedback | Commit ID |
|---|---|---|---|---|---|
| 1 | Purvai | purvait1246@gmail.com | `GBPUHH...L7VH` | Investment pools should have more description so users know what they are investing in | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 2 | Akanksha Patil | akankshapatil2099@gmail.com | `GCFMZE...QHQKG` | Improve Albedo wallet connection on phone | `3089683` — Enable transaction signing for mobile users via Albedo fallback |
| 3 | Lily Anthony | 3022411004@despu.edu.in | `GCGRCC...GVUD` | Improve alignments of the website | `c0a1101` — Fix ExploreView Sector table column alignment |
| 4 | Nishita Gopwani | gopwaninishita@gmail.com | `GAIY7Y...OQAFN` | More clarity on the mobile version | `d199758` — Full mobile responsiveness across all platform views |
| 5 | Soham Patil | sohampatil022@gmail.com | `GA277J...6XX27` | Enhance loading speed and simplify some sections | `d669b0f` — Refresh ExploreView: live stats strip, visual overhaul |
| 6 | Meenakshi Patil | meenakshirpatil99@gmail.com | `GB2IGD...5CNOD` | Improve UI and add more 3D elements | `4e40e5e` — Branding: Implement new NestFund logo design across platform |
| 7 | Shrikant Aher | shrikantaher1919@gmail.com | `GBEWS3...HPBKL` | Add goal tracking (users can set and track savings goals) | `568973f` — Add live Metrics dashboard with DAU, Retention, Tx charts |
| 8 | Rakhi Sahni | rakhisahni890@gmail.com | `GCNZOF...CL3US22O` | Improve the learn mode and add more videos | `e74cf22` — Add Quick Concepts documentation modal |
| 9 | Mahee Patil | maheepatil06@gmail.com | `GCKXKI...SQXCG` | Enhance and add more AI features | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 10 | Neeral Kothadia | neeralkothadia14@gmail.com | `GAAUOW...ULXGY2M` | Keep it in a light color | `e396d4b` — UI: Improve NeRA chat box readability and brand alignment |
| 11 | Aditya Chavan | adichavan555@gmail.com | `GAR4Z7...ODNF7` | Add more videos in the learn mode | `e74cf22` — Add Quick Concepts documentation modal |
| 12 | Tanishka Mahindrakar | tanishkamm05@gmail.com | `GA3JCK...OWU5CJ` | Add more AI features | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 13 | Mayur Agarwal | mayuragarwal30@gmail.com | `GCM24D...WB73X7U` | Add more security in the logging system | `010f2ae` — Implement root Error Boundary and comprehensive Sentry integration |
| 14 | Shivani More | moreshivani22@gmail.com | `GBTFQ2...CXQDQI` | Add more information about the business on the website | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 15 | Saniya Shaikh | saniyashaikh66@gmail.com | `GBE7HS...YAWLMZSLODNF7` | Add more businesses | `ea92d7e` — Fix non-functional buttons and links |
| 16 | Vaishnavi Tiwari | vaishnavitiwari0202@gmail.com | `GCLPEZ...FCL7PJT5` | Everything is good | ✅ No changes needed |
| 17 | Aadya Gange | gangeaadya99@gmail.com | `GD5Z2X...KPGCCJ5` | Add animations to the website | `d669b0f` — Refresh ExploreView: live stats strip, visual overhaul |
| 18 | Ajinkya Garad | ajinkyarajegarad@gmail.com | `GALCZO...GKPGCCJ5` | Add more features | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 19 | Riya Mehta | riyamehta30@gmail.com | `GA5ZKU...7KILKLE` | Improve the UI and make it more minimal | `4e40e5e` — Branding: Implement new NestFund logo design across platform |
| 20 | Tanishka Manthalkar | manthalkartan110@gmail.com | `GASQUF...67UVL3` | Add more videos in the learn mode | `e74cf22` — Add Quick Concepts documentation modal |
| 21 | Aastha Patil | aasthapatil1406@gmail.com | `GAWPCO...QSNT6` | Up to date | ✅ No changes needed |
| 22 | Rajesh Patil | rapa99@gmail.com | `GCA5J2...PYXJ4` | Everything is perfect | ✅ No changes needed |
| 23 | Kashish Gurnani | kashishgurnani45@gmail.com | `GAXULY...EMXBE7F` | Improve alignments on the website | `c0a1101` — Fix ExploreView Sector table column alignment |
| 24 | Ruchita Telsang | ruchitatelsang22@gmail.com | `GAGGXM...RZVDZH` | Improve the logistics | `87cc82d` — Final platform audit - all production features verified |
| 25 | Surekha Lakde | lakdesurekha7@gmail.com | `GD7SC6...H4TJ3MC` | Add more information about the website and create a dashboard | `568973f` — Add live Metrics dashboard with DAU, Retention, Tx charts |
| 26 | Poorvaja Yadav | poorvajayadav4149@gmail.com | `GB3QHJ...HRAQXA4` | Add an about us page | `0497d8a` — Add About Us, Privacy Policy, and FAQ pages |
| 27 | Saukhya Tupe | saukhyatupe013@gmail.com | `GBKZH5...MAUBCV` | Add more compliance | `53b8ace` — Complete security checklist in SECURITY.md |
| 28 | Aanam Khan | aanamkhan552@gmail.com | `GAGNW6...ANQJOW` | Improve the AI features | `2b60a6d` — Add AI Portfolio Insights, AI Risk Auditor, and AI Market Pulse features |
| 29 | Shlok Malpani | malpani16shlok@gmail.com | `GB7NKI...RTZ7ZGO` | Keep users' transaction history for security and transparency | `568973f` — Add live Metrics dashboard with DAU, Retention, Tx charts |
| 30 | Dhruv Patnekar | dhruvpatnekar@gmail.com | `GB5THP...6FH65BKM` | None — best app I've used | ✅ No changes needed |

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## License

MIT License © 2026 NestFund

---

<div align="center">
Built on Stellar | Powered by NeRA AI
</div>
