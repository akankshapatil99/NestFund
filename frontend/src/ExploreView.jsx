import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ExploreView({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('trending');
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [marketInsight, setMarketInsight] = useState('Generating ecosystem intelligence...');
  const [insightLoading, setInsightLoading] = useState(true);

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

      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    };

    fetchData();
    const poll = setInterval(fetchData, 5000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    if (listings.length === 0) return;
    const generateInsight = async () => {
      setInsightLoading(true);
      try {
        const sys = "You are the NestFund Alpha Engine. Review the current listings and return a SINGLE-SENTENCE professional market outlook (max 150 chars).";
        const body = `Listings: ${listings.map(l => l.name).join(', ')}. Volume: ₹${transactions.reduce((a, t) => Number(a) + Number(t.amount || 0), 0)}`;
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'system', content: sys }, { role: 'user', content: body }]
          })
        });
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          setMarketInsight(data.choices[0].message.content.replace(/^\"|\"$/g, ''));
        }
      } catch {
        setMarketInsight('Stellar Testnet: Liquidity stable across active sectors.');
      } finally {
        setInsightLoading(false);
      }
    };
    generateInsight();
  }, [listings.length]);

  const trends = listings.map((opp, idx) => ({
    name: opp.name,
    yield: opp.returnval,
    trend: '+' + (1.5 + idx * 0.3).toFixed(1) + '%',
    vol: opp.remaining || '₹10L',
    sector: opp.company?.split('·')[0].trim() || opp.type,
    funded: opp.funded || 0,
    risk: opp.risk,
    riskclass: opp.riskclass,
  })).reverse().slice(0, 5);

  const liveFeed = transactions.map(tx => {
    const timeDiff = Math.floor((new Date() - new Date(tx.time)) / 1000);
    const timeStr = timeDiff < 60 ? `${timeDiff}s ago` : `${Math.floor(timeDiff / 60)}m ago`;
    return {
      id: tx.txhash?.slice(0, 10) + '...',
      type: tx.type || 'Investment',
      amt: '₹' + Number(tx.amount || 0).toLocaleString('en-IN'),
      asset: tx.asset,
      time: timeStr,
      fullHash: tx.txhash
    };
  });

  const pillars = [
    {
      color: 'var(--teal)',
      bg: 'var(--teal-dim)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
      title: 'Smart Contract Layer',
      desc: 'Dedicated Soroban contracts break assets into fractional units. Funds flow directly to the contract — never a corporate wallet.',
    },
    {
      color: 'var(--gold)',
      bg: 'var(--gold-dim)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      title: 'AI Risk Analysis',
      desc: 'Business proposals travel through NeRA, our AI middleware, which assigns structured ratings based on live financial projections.',
    },
    {
      color: '#818cf8',
      bg: 'rgba(129,140,248,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>,
      title: 'Unified Governance',
      desc: 'Real-time sync between the Stellar ledger and risk models ensures a fully transparent, verifiable portfolio view.',
    },
    {
      color: '#f472b6',
      bg: 'rgba(244,114,182,0.08)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
      title: 'Transparent Audit Trail',
      desc: 'Every investment, transaction, and AI decision is logged on-chain. Anyone can inspect the ledger at any time.',
    },
  ];

  return (
    <div className="fade-in-section" style={{ paddingBottom: '100px' }}>

      {/* VIDEO MODAL */}
      {activeVideo && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={() => setActiveVideo(null)}
        >
          <div
            style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', background: '#0a0a0a', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 100px rgba(200,169,110,0.2)' }}
            onClick={e => e.stopPropagation()}
          >
            <video src="/assets/videos/nestfund_overview.mp4" autoPlay controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => setActiveVideo(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', zIndex: 20, fontSize: '16px' }}>✕</button>
          </div>
        </div>
      )}

      <div className="container-responsive">

        {/* ── HERO ── */}
        <div style={{ marginBottom: '72px', textAlign: 'center' }}>
          <div style={{ maxWidth: '860px', margin: '0 auto' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

              {/* AI Insight Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '100px', padding: '6px 16px', fontSize: '12px', color: 'var(--muted)', marginBottom: '24px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: insightLoading ? 'var(--muted)' : 'var(--teal)', boxShadow: insightLoading ? 'none' : '0 0 8px var(--teal)', flexShrink: 0 }} />
                <span style={{ color: 'var(--teal)', fontWeight: 600, fontFamily: 'JetBrains Mono', fontSize: '10px', letterSpacing: '0.05em' }}>AI BRIEF</span>
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{marketInsight}</span>
              </div>

              <h1 style={{ letterSpacing: '-2px', textShadow: '0 10px 40px rgba(0,0,0,0.4)', marginBottom: '20px', fontSize: 'clamp(36px, 6vw, 68px)' }}>
                Explore the <span className="teal">Ecosystem.</span>
              </h1>
              <p className="hero-sub" style={{ marginBottom: '32px', maxWidth: '680px', margin: '0 auto 32px', lineHeight: '1.8', fontSize: '16px' }}>
                NestFund is an AI-powered investment platform built on the Stellar blockchain that bridges the gap between everyday investors and real funding opportunities. Every deal is AI-audited, every return is on-chain.
              </p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setActiveVideo(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Explainer
                </button>
                <a href="https://github.com/akankshapatil99/NestFund/blob/main/ARCHITECTURE.md" target="_blank" rel="noreferrer" className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', padding: '0 24px', borderRadius: '14px', background: 'transparent', border: '1px solid var(--border)', color: 'white', textDecoration: 'none' }}>
                  Whitepaper
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── LIVE STATS STRIP ── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1px', background: 'var(--border)', borderRadius: '20px', overflow: 'hidden', marginBottom: '56px', border: '1px solid var(--border)' }}
        >
          {[
            { label: 'Total Investors',  value: stats.userCount    ?? '—' },
            { label: 'Live Listings',    value: stats.listingCount ?? '—' },
            { label: 'Transactions',     value: stats.txCount      ?? '—' },
            { label: 'Total Volume',     value: stats.totalVolume  ? `₹${Number(stats.totalVolume).toLocaleString('en-IN')}` : '—' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontFamily: 'Syne', fontWeight: '800', color: 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* ── SECTOR + LIVE LEDGER ── */}
        <div className="grid-2-1" style={{ marginBottom: '72px' }}>

          {/* Sector Performance */}
          <motion.div className="dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Sector Performance</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setActiveTab('trending')} className={`suggestion-chip ${activeTab === 'trending' ? 'active-chip' : ''}`} style={{ background: activeTab === 'trending' ? 'var(--gold-dim)' : 'transparent' }}>Trending</button>
                <button onClick={() => setActiveTab('history')} className={`suggestion-chip ${activeTab === 'history' ? 'active-chip' : ''}`} style={{ background: activeTab === 'history' ? 'var(--gold-dim)' : 'transparent' }}>History</button>
              </div>
            </div>

            {trends.length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px', fontSize: '14px' }}>No listings available yet.</div>
            ) : (
              <div style={{ borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Column headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 90px 70px 100px', padding: '10px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>PROJECT</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>YIELD</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em' }}>7D</div>
                  <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', letterSpacing: '0.06em', textAlign: 'right' }}>REMAINING</div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  {trends.map((t, i) => (
                    <div key={i}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 90px 70px 100px', minWidth: '420px', padding: '14px 20px', background: 'var(--surface)', alignItems: 'center', transition: 'background 0.2s', borderBottom: i < trends.length - 1 ? '1px solid var(--border)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--surface)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '34px', height: '34px', background: 'rgba(200,169,110,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{t.sector}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: '14px' }}>
                        {t.yield} <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 400 }}>APY</span>
                      </div>
                      <div style={{ color: 'var(--green)', fontSize: '13px', fontWeight: '600' }}>{t.trend}</div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', color: 'var(--text)' }}>{t.vol}</div>
                        <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Remaining</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => onNavigate('Invest')}
              style={{ marginTop: '20px', width: '100%', padding: '12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; }}
            >
              View All Investment Opportunities →
            </button>
          </motion.div>

          {/* Stellar Live Feed */}
          <motion.div className="dashboard-card" style={{ position: 'relative' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <div className="ai-pulse" style={{ width: '6px', height: '6px' }} />
              <h3 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Stellar Ledger Live</h3>
            </div>

            {liveFeed.length === 0 ? (
              <div style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px', fontSize: '13px' }}>Awaiting transactions...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {liveFeed.map((item, i) => (
                  <div key={i} style={{ paddingLeft: '18px', borderLeft: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-4px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 6px var(--gold)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <a href={`https://stellar.expert/explorer/testnet/tx/${item.fullHash}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                        onMouseOver={e => e.target.style.color = 'var(--gold)'}
                        onMouseOut={e => e.target.style.color = 'var(--muted)'}
                      >{item.id}</a>
                      <span style={{ fontSize: '11px', color: 'var(--gold)' }}>{item.time}</span>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>{item.type}: {item.amt}</div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Asset: {item.asset}</div>
                  </div>
                ))}
              </div>
            )}

            <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="suggestion-chip"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '20px', background: 'var(--surface2)', borderColor: 'var(--teal)', color: 'var(--teal)', fontWeight: '600', textDecoration: 'none' }}>
              Open Network Explorer
            </a>

            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--gold-dim)', borderRadius: '10px', border: '1px solid rgba(200,169,110,0.2)' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--gold)', marginBottom: '4px', fontFamily: 'JetBrains Mono' }}>SOROBAN STATUS</div>
              <div style={{ fontSize: '12px', lineHeight: '1.5', color: 'rgba(232,234,240,0.7)' }}>Auto-settlement contracts are live. All fractional returns processed on Stellar.</div>
            </div>
          </motion.div>
        </div>

        {/* ── INFRA PILLARS ── */}
        <div style={{ paddingTop: '56px', borderTop: '1px solid var(--border)', marginBottom: '72px' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="section-label" style={{ marginBottom: '12px' }}>UNDER THE HOOD</div>
            <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '700px', margin: '0 auto', lineHeight: '1.7' }}>
              Every transaction is settled on-chain and every risk is analysed by AI — complete transparency and intelligent investment decisions by design.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '16px' }}>
            {pillars.map((p, i) => (
              <motion.div key={i} className="dashboard-card glass" style={{ padding: '28px', borderColor: `${p.color}18` }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.07 }}
              >
                <div style={{ width: '40px', height: '40px', background: p.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', color: p.color }}>{p.icon}</div>
                <h4 style={{ fontFamily: 'Syne', fontSize: '15px', marginBottom: '10px', fontWeight: '700' }}>{p.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', margin: 0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── FOOTER CTA ── */}
        <motion.div className="dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ background: 'linear-gradient(135deg, var(--surface), var(--surface2))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}
        >
          <div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(20px, 3vw, 28px)', marginBottom: '10px' }}>Ready to take the next step?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>Move from viewing to investing with as little as ₹500.</p>
          </div>
          <button className="btn-primary btn-lg" onClick={() => onNavigate('Invest')}>Switch to Invest Mode</button>
        </motion.div>

      </div>
    </div>
  );
}
