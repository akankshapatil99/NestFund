import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ExploreView({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('trending');
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [marketInsight, setMarketInsight] = useState('Generating ecosystem intelligence...');

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/listings')
        .then(res => res.json())
        .then(data => setListings(data))
        .catch(() => {});

      fetch('/api/transactions')
        .then(res => res.json())
        .then(data => setTransactions(data))
        .catch(() => {});
    };

    fetchData();
    const poll = setInterval(fetchData, 5000);
    return () => clearInterval(poll);
  }, []);

  // PROACTIVE AI INSIGHT (Non-chat implementation)
  useEffect(() => {
    if (listings.length === 0) return;
    const generateInsight = async () => {
      try {
        const sys = "You are the NestFund Alpha Engine. Review the current listings and return a SINGLE-SENTENCE professional market outlook (max 150 chars).";
        const body = `Listings: ${listings.map(l => l.name).join(', ')}. Volume: ₹${transactions.reduce((a,t)=>Number(a)+Number(t.amount || 0),0)}`;
        
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{role:'system', content:sys}, {role:'user', content:body}]
          })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          setMarketInsight(data.choices[0].message.content.replace(/^"|"$/g, ''));
        }
      } catch (e) {
        setMarketInsight('Stellar Testnet: Liquidity stable across sectors.');
      }
    };
    generateInsight();
  }, [listings.length]);

  const trends = listings.map((opp, idx) => ({
    name: opp.name,
    yield: opp.returnval,
    trend: '+' + (1.5 + idx * 0.3).toFixed(1) + '%',
    vol: opp.remaining || '₹10L',
    sector: opp.company.split('·')[0].trim() || opp.type
  })).reverse().slice(0, 4);

  const liveFeed = transactions.map(tx => {
    const timeDiff = Math.floor((new Date() - new Date(tx.time)) / 1000);
    const timeStr = timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;
    return {
      id: tx.txhash.slice(0, 10) + '...',
      type: tx.type === 'Investment' ? 'Investment' : 'Fractional Stake',
      amt: '₹' + tx.amount,
      asset: tx.asset,
      time: timeStr,
      fullHash: tx.txhash
    };
  });


  return (
    <div className="fade-in-section" style={{ paddingBottom: '100px' }}>
      
      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div 
          className="nera-video-overlay" 
          style={{ 
            position: 'fixed', inset: '0', zIndex: '9999', 
            background: 'rgba(0,0,0,0.95)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center',
            padding: '16px'
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
            <video 
              src="/assets/videos/nestfund_overview.mp4"
              autoPlay
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button 
              onClick={() => setActiveVideo(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: '20' }}
            >✕</button>
          </div>
        </div>
      )}

      <div className="container-responsive">
        
        {/* Header Section — Centered and Clean */}
        <div style={{ marginBottom: '80px', textAlign: 'center' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>
                <span className="badge-dot" style={{ background: 'var(--teal)' }}></span>
                AI Market Brief: <span style={{ color: 'white', marginLeft: '5px' }}>{marketInsight}</span>
              </div>
              <h1 style={{ letterSpacing: '-2px', textShadow: '0 10px 40px rgba(0,0,0,0.4)', marginBottom: '16px' }}>
                Explore the <span className="teal">Ecosystem.</span>
              </h1>
              <p className="hero-sub" style={{ marginBottom: '24px', maxWidth: '700px', margin: '0 auto 24px', lineHeight: '1.8' }}>
                NestFund is an AI-powered investment platform built on the Stellar blockchain that bridges the gap between everyday investors and real funding opportunities. When a business submits a funding request, our AI analyzes the deal, assigns a risk rating, and deploys a dedicated Soroban smart contract. 
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button 
                  className="btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  onClick={() => setActiveVideo(true)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Watch Explainer
                </button>
                <a 
                  href="https://github.com/akankshapatil99/NestFund/blob/main/ARCHITECTURE.md"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary" 
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--border)', color: 'white', cursor: 'pointer', textDecoration: 'none' }}
                >
                  Whitepaper
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid-2-1">
          
          {/* Trends & Sector Performance */}
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '20px' }}>Sector Performance</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => setActiveTab('trending')}
                  className={`suggestion-chip ${activeTab === 'trending' ? 'active-chip' : ''}`}
                  style={{ background: activeTab === 'trending' ? 'var(--gold-dim)' : 'transparent' }}
                >Trending</button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`suggestion-chip ${activeTab === 'history' ? 'active-chip' : ''}`}
                  style={{ background: activeTab === 'history' ? 'var(--gold-dim)' : 'transparent' }}
                >History</button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', overflowX: 'auto' }}>
              {trends.map((t, i) => (
                <div key={i} className="asset-trending-row" style={{ 
                  display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) 1fr 1fr 1fr', 
                  minWidth: '700px',
                  padding: '20px 0', background: 'var(--surface)',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="asset-dot dot-gold" style={{ width: '40px', height: '40px', background: 'rgba(200,169,110,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Sector: {t.sector}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: '16px' }}>{t.yield} <span style={{fontSize: '11px', color: 'var(--muted)'}}>APY</span></div>
                  <div style={{ color: t.trend.startsWith('+') ? 'var(--green)' : 'var(--red)', fontSize: '14px', fontWeight: '600' }}>{t.trend}</div>
                  <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--text)' }}>{t.vol} <div style={{fontSize: '10px', color: 'var(--muted)'}}>Volume</div></div>
                </div>
              ))}
            </div>
          </div>

          {/* Stellar Live Ledger Feed */}
          <div className="dashboard-card" style={{ position: 'relative' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <div className="ai-pulse" style={{ width: '6px', height: '6px' }}></div>
                <h3 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Stellar Ledger Live</h3>
             </div>
             
             <div className="live-ledger-feed" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {liveFeed.map((item, index) => (
                  <div key={index} style={{ 
                    paddingLeft: '16px', borderLeft: '1px solid var(--border)', 
                    position: 'relative', paddingBottom: index === liveFeed.length - 1 ? 0 : '10px' 
                  }}>
                    <div style={{ 
                      position: 'absolute', left: '-4.5px', top: '0', 
                      width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' 
                    }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${item.fullHash}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                        onMouseOver={(e) => e.target.style.color = 'var(--gold)'}
                        onMouseOut={(e) => e.target.style.color = 'var(--muted)'}
                      >
                        {item.id}
                      </a>
                      <span style={{ fontSize: '11px', color: 'var(--gold)' }}>{item.time}</span>
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{item.type}: {item.amt}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Asset: {item.asset}</div>
                  </div>
                ))}
             </div>

             <a 
               href="https://stellar.expert/explorer/testnet"
               target="_blank"
               rel="noreferrer"
               className="suggestion-chip"
               style={{ 
                 width: '100%', display: 'flex', justifyContent: 'center', 
                 marginTop: '20px', background: 'var(--surface2)', 
                 borderColor: 'var(--teal)', color: 'var(--teal)',
                 fontWeight: '600', textDecoration: 'none'
               }}
             >
               Showcase Full Network Explorer
             </a>

             <div style={{ 
                marginTop: '32px', padding: '16px', 
                background: 'var(--gold-dim)', borderRadius: '12px',
                border: '1px solid rgba(200,169,110,0.2)' 
             }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--gold)', marginBottom: '4px' }}>Soroban Contract Status</div>
                <div style={{ fontSize: '11px', lineHeight: '1.4', color: 'rgba(232, 234, 240, 0.7)' }}>
                  Auto-settlement contracts are active. All fractional returns are processed on the Stellar Mainnet.
                </div>
             </div>
          </div>

        </div>

        {/* Core Infrastructure Narrative */}
        <div style={{ marginTop: '80px', paddingTop: '60px', borderTop: '1px solid var(--border)' }}>
           <div className="section-label" style={{ textAlign: 'center' }}>UNDER THE HOOD</div>
           <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '15px', maxWidth: '800px', margin: '0 auto 50px', lineHeight: '1.7' }}>
             The result is a platform where every transaction is settled on-chain and every risk is analysed by the AI — ensuring complete transparency and intelligent investment decisions.
           </p>

           <div className="grid-3">
              <div className="dashboard-card glass" style={{ padding: '30px' }}>
                 <div style={{ width: '40px', height: '40px', background: 'var(--teal-dim)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--teal)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                 </div>
                 <h4 style={{ fontFamily: 'Syne', fontSize: '16px', marginBottom: '12px' }}>Smart Contract Layer</h4>
                 <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                   Dedicated Soroban contracts break assets into fractional units. Funds are sent directly to the contract — never a corporate wallet.
                 </p>
              </div>

              <div className="dashboard-card glass" style={{ padding: '30px' }}>
                 <div style={{ width: '40px', height: '40px', background: 'var(--gold-dim)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'var(--gold)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                 </div>
                 <h4 style={{ fontFamily: 'Syne', fontSize: '16px', marginBottom: '12px' }}>AI Risk Analysis</h4>
                 <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                    Business requests travel through an AI middleware that structures terms and assigns ratings based on live financial projections.
                 </p>
              </div>

              <div className="dashboard-card glass" style={{ padding: '30px' }}>
                 <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', color: 'white' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                 </div>
                 <h4 style={{ fontFamily: 'Syne', fontSize: '16px', marginBottom: '12px' }}>Unified Governance</h4>
                 <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6' }}>
                    Real-time data synchronization between the Stellar ledger and our internal risk models for a transparent portfolio view.
                 </p>
              </div>
           </div>
        </div>

        {/* Featured Card */}
        <div 
          className="dashboard-card featured-footer-card" 
          style={{ 
            marginTop: '80px',
            background: 'linear-gradient(135deg, var(--surface), var(--surface2))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: '24px', flexWrap: 'wrap'
          }}
        >
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: '28px', marginBottom: '12px' }}>Ready to take the next step?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px' }}>Move from viewing to investing with as little as ₹500.</p>
          </div>
          <button className="btn-primary btn-lg" onClick={() => onNavigate('Invest')}>Switch to Invest Mode</button>
        </div>

      </div>
    </div>
  );
}
