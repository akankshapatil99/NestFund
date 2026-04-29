import { useState } from 'react';
import NeRAChat from './NeRAChat.jsx';
import { motion } from 'framer-motion';

export default function LearnView({ portfolioVal }) {
  const [virtualBalance] = useState((10000 + portfolioVal * 0.05).toFixed(2));
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeConcept, setActiveConcept] = useState(null);

  const conceptDocs = {
    'Invoice Financing 101': {
      title: 'Invoice Financing 101',
      text: 'Invoice financing allows B2B companies to borrow against their unpaid invoices. Instead of waiting 30-90 days for client payments, they receive immediate liquidity. Investors fund these invoices and earn a fixed yield upon successful repayment, creating a low-risk, asset-backed investment cycle.'
    },
    'Soroban Contract Security': {
      title: 'Soroban Contract Security',
      text: 'Soroban is Stellar’s Turing-complete smart contract platform. It emphasizes security through deterministic execution, strict resource metered bounds, and a lack of unbounded loops. This architectural design inherently eliminates many common smart contract vulnerabilities like deep reentrancy attacks.'
    },
    'AI Risk Score Logic': {
      title: 'AI Risk Score Logic',
      text: 'The NeRA AI models evaluate incoming assets using over 50 distinct data points—including historical repayment rates, current market volatility, and on-chain liquidity checks. It outputs a real-time risk score (Low, Medium, High risk) to help you make informed fractional investments.'
    },
    'Asset Fractionalization': {
      title: 'Asset Fractionalization',
      text: 'By locking high-value assets securely via smart contracts, they can be programmatically divided into thousands of affordable $10 tokens. This democratizes access to institutional-grade investments, allowing retail investors to easily diversify their portfolios.'
    },
    'Stellar Network Efficiency': {
      title: 'Stellar Network Efficiency',
      text: 'Powered by the Stellar Consensus Protocol (SCP), transactions settle in an average of 3 to 5 seconds. Unlike other networks, Stellar operates with extremely low gas fees (fractions of a cent), making micro-investing and fractional payouts economically viable.'
    }
  };

  const modules = [
    {
      id: 1,
      title: "Fractional Investing 101",
      desc: "A visual guide to how the NestFund ecosystem splits assets into accessible $10 shares.",
      img: "/assets/module_1.png",
      video: "/assets/videos/fractional_investing.mp4",
      dur: "01:24",
      prompt: "Explain Fractional Investing 101",
      subtitle: "AI Analysis: Scanning asset metadata... splitting large nest egg into 1,000 fractional units... distribution locked via Soroban Smart Contract..."
    },
    {
      id: 2,
      title: "The Smart Contract Advantage",
      desc: "See how Soroban contracts solve the counterparty risk problem on the blockchain.",
      img: "/assets/module_2.png",
      video: "/assets/videos/smart_contracts.mp4",
      dur: "03:42",
      prompt: "How do smart contracts work?",
      subtitle: "Blockchain Sync: Verifying Stellar Ledger... Executing Soroban WASM... Proof of stake confirmed... Transaction settlement 8ms... No middleman required."
    },
    {
      id: 3,
      title: "Stellar Ledger Security",
      desc: "Understand the global scale and high-speed efficiency of the Stellar network.",
      img: "/assets/module_3.png",
      video: "/assets/videos/stellar_security.mp4",
      dur: "00:45",
      prompt: "Tell me about Stellar Security",
      subtitle: "Node Sync: Ping globally... Frankfurt Node [OK]... Singapore Node [OK]... Multi-sig consensus reached in 3 seconds... Encryption grade: AES-256."
    },
    {
      id: 4,
      title: "DeFi Yield Strategies",
      desc: "Learn how decentralized finance protocols generate sustainable yields through liquidity provision and staking.",
      img: "/assets/module_1.png",
      video: "/assets/videos/fractional_investing.mp4",
      dur: "02:15",
      prompt: "How do DeFi yield strategies work?",
      subtitle: "DeFi Scan: Analyzing liquidity pools... APY calculation engine active... Risk-adjusted return modeling... Compound interest simulation running..."
    },
    {
      id: 5,
      title: "Portfolio Diversification",
      desc: "Master the art of spreading investments across multiple asset classes to minimize risk and maximize long-term returns.",
      img: "/assets/module_2.png",
      video: "/assets/videos/smart_contracts.mp4",
      dur: "01:50",
      prompt: "How should I diversify my portfolio?",
      subtitle: "Portfolio Engine: Correlation matrix computed... Sector allocation optimized... Risk parity achieved... Rebalancing schedule configured..."
    },
  ];

  return (
    <div className="fade-in-section">

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div 
          className="nera-video-overlay" 
          style={{ 
            position: 'fixed', inset: '0', zIndex: '9999', 
            background: 'rgba(0,0,0,0.95)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveVideo(null)}
        >
          <div 
            className="nera-video-player" 
            style={{ 
              width: '100%', maxWidth: '1000px', aspectRatio: '16/9', 
              background: '#0a0a0a', borderRadius: '24px', position: 'relative',
              overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 100px rgba(200,169,110,0.2)'
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* The Visual - Video or Image? */}
            {activeVideo.video ? (
              <video 
                src={activeVideo.video}
                autoPlay
                controls
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <img 
                src={activeVideo.img} 
                alt="Video" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            )}
            
            {/* THE AI SCANNING LAYER (ANIMATED) - Hide for actual videos to avoid cluttering? */}
            {!activeVideo.video && (
              <div className="ai-video-fx" style={{ position: 'absolute', inset: '0', pointerEvents: 'none' }}>
                 <div className="ai-scanning-line" style={{ 
                   position: 'absolute', top: '0', left: '0', width: '100%', height: '2px', 
                   background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                   boxShadow: '0 0 15px var(--gold)',
                   animation: 'scanLine 3s linear infinite'
                 }}></div>
                 <div className="ai-noise" style={{ 
                   position: 'absolute', inset: '0', opacity: '0.05', 
                   backgroundImage: 'url("https://media.giphy.com/media/oEI9uWUic9VKM/giphy.gif")',
                   backgroundSize: 'cover'
                 }}></div>
              </div>
            )}

            {/* THE SUBTITLE TICKER */}
            <div style={{ 
              position: 'absolute', bottom: '0', left: '0', right: '0', 
              background: 'rgba(0,0,0,0.8)', padding: '20px', 
              borderTop: '1px solid var(--border)', display: 'flex', gap: '15px', 
              zIndex: '10' // Ensure it's above video controls if needed
            }}>
              <div className="ai-pulse" style={{ width: '12px', height: '12px', marginTop: '4px' }}></div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: 'var(--gold)' }}>
                {activeVideo.subtitle}
              </div>
            </div>

            <button 
              onClick={() => setActiveVideo(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: '20' }}
            >✕</button>
          </div>
        </div>
      )}

      {/* CONCEPT DOCS MODAL */}
      {activeConcept && (
        <div 
          className="nera-video-overlay" 
          style={{ 
            position: 'fixed', inset: '0', zIndex: '10000', 
            background: 'rgba(0,0,0,0.85)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            padding: '20px', backdropFilter: 'blur(10px)'
          }}
          onClick={() => setActiveConcept(null)}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="concept-modal-content" 
            style={{ 
              width: '100%', maxWidth: '600px', 
              background: '#111', borderRadius: '20px', position: 'relative',
              overflow: 'hidden', border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)', padding: '32px'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
               <div style={{ padding: '8px', background: 'rgba(200,169,110,0.1)', borderRadius: '8px', color: 'var(--gold)' }}>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
               </div>
               <h2 style={{ fontFamily: 'Syne', fontSize: '24px', margin: 0, color: 'var(--text)' }}>
                 {conceptDocs[activeConcept].title}
               </h2>
            </div>
            
            <p style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: '1.7', margin: 0 }}>
              {conceptDocs[activeConcept].text}
            </p>

            <button 
              onClick={() => setActiveConcept(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--muted)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', zIndex: '20', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >✕</button>
          </motion.div>
        </div>
      )}

      {/* HERO — AI IS THE STAR */}
      <section style={{ paddingBottom: '60px' }}>
        <div className="container-responsive">

          {/* Centered Hero Typography */}
          <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 60px' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>
                <span className="badge-dot" style={{ background: 'var(--teal)' }}></span>
                Virtual Learning Environment · Powered by Groq AI
              </div>
              <h1 style={{ letterSpacing: '-2px', textShadow: '0 10px 40px rgba(0,0,0,0.4)', marginBottom: '16px' }}>
                Your Personal <span className="accent">AI Tutor.</span><br />
                <span className="teal">Ask anything.</span>
              </h1>
              <p className="hero-sub" style={{ margin: '0 auto', textAlign: 'center', maxWidth: '750px', lineHeight: '1.8' }}>
                Learn Mode runs the same smart contract logic and AI risk models on Stellar's testnet using valueless tokens, allowing you to build accurate financial intuitions.
              </p>
            </motion.div>
          </div>

          {/* AI CHAT — MAIN FOCUS */}
          <NeRAChat embedded={true} />

          {/* Virtual Portfolio below the chat */}
          <div className="grid-3" style={{ marginTop: '48px' }}>
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <div className="pt-label">Virtual Profit Target</div>
              <div className="pt-value" style={{ fontSize: '28px' }}>+18.4% APY</div>
              <div className="pt-change">▲ Smart Settlement Enabled</div>
            </div>
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <div className="pt-label">Settlement Logic</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.5' }}>
                On-chain contracts hold capital. Upon maturity, the contract executes a <span style={{ color: 'var(--teal)' }}>repayment_distribute</span> function, returning principal + profit.
              </div>
            </div>
            <div className="dashboard-card" style={{ padding: '20px' }}>
              <div className="pt-label">AI Advisor Status</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <div style={{ width: '10px', height: '10px', background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 10px var(--green)' }}></div>
                <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: '700', color: 'var(--green)' }}>Online</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Llama 3.3 70B · Always ready</div>
            </div>
          </div>

          {/* LEARNING MODULES — PRE-CURATED */}
          <div style={{ marginTop: '60px' }}>
            <div className="section-label" style={{ marginBottom: '24px', textAlign: 'center' }}>VIRTUAL CLASSROOM · STREAMING NOW</div>
            <div className="grid-3" style={{ gap: '12px' }}>
              
              {modules.map(mod => (
                <div key={mod.id} className="dashboard-card module-video-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                  <div 
                    style={{ position: 'relative', height: '200px', width: '100%', cursor: 'pointer', flexShrink: 0 }} 
                    className="video-thumb"
                    onClick={() => setActiveVideo(mod)}
                  >
                    <img src={mod.img} alt={mod.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: '0.8' }} />
                    <div className="play-overlay" style={{ position: 'absolute', inset: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: mod.id === 2 ? 'var(--teal)' : mod.id === 3 ? '#fff' : 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(0,0,0,0.4)', color: mod.id === 3 ? '#000' : '#fff' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', color: '#fff' }}>{mod.dur}</div>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontFamily: 'Syne', fontSize: '18px', marginBottom: '8px', minHeight: '44px' }}>{mod.title}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '16px', flex: 1 }}>
                      {mod.desc}
                    </p>
                    <button 
                      className="suggestion-chip" 
                      style={{ width: '100%', justifyContent: 'center', background: 'var(--surface2)', fontWeight: '600', marginTop: 'auto' }}
                      onClick={() => setActiveVideo(mod)}
                    >Watch &amp; Learn</button>
                  </div>
                </div>
              ))}

            </div>
          </div>

          {/* Topic chips */}
          <div style={{ marginTop: '60px' }}>
            <div className="section-label" style={{ marginBottom: '16px' }}>QUICK CONCEPTS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {[
                'Invoice Financing 101',
                'Soroban Contract Security',
                'AI Risk Score Logic',
                'Asset Fractionalization',
                'Stellar Network Efficiency',
              ].map(topic => (
                <div 
                  key={topic} 
                  className="suggestion-chip" 
                  style={{ cursor: 'pointer', transition: 'all 0.2s', ':hover': { borderColor: 'var(--gold)', color: 'var(--gold)' } }}
                  onClick={() => setActiveConcept(topic)}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
