import { useEffect, useState, useRef } from 'react';
import './index.css';
import LearnView from './LearnView.jsx';
import InvestView from './InvestView.jsx';
import BusinessView from './BusinessView.jsx';
import ExploreView from './ExploreView.jsx';
import BetaView from './BetaView.jsx';
import LoginView from './LoginView.jsx';
import NeRAChat from './NeRAChat.jsx';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [activeMode, setActiveMode] = useState('Explore');
  const [neraOpen, setNeraOpen] = useState(false);
  const cursorRef = useRef(null);
  const cursorRingRef = useRef(null);
  const [portfolioVal, setPortfolioVal] = useState(24830);
  const [walletAddress, setWalletAddress] = useState(null);
  const [loggedInAddress, setLoggedInAddress] = useState(localStorage.getItem('nestfund_session'));
  const [userName, setUserName] = useState(localStorage.getItem('nestfund_name') || '');

  // If already logged in from a previous session, restore wallet
  useEffect(() => {
    if (loggedInAddress) {
      setWalletAddress(loggedInAddress);
      setUserName(localStorage.getItem('nestfund_name') || '');
    }
  }, [loggedInAddress]);

  // Called by LoginView on successful registration/login
  const handleLogin = (address) => {
    setLoggedInAddress(address);
    setWalletAddress(address);
    setUserName(localStorage.getItem('nestfund_name') || '');
  };

  const handleLogout = () => {
    localStorage.removeItem('nestfund_session');
    localStorage.removeItem('nestfund_name');
    localStorage.removeItem('nestfund_email');
    setLoggedInAddress(null);
    setWalletAddress(null);
    setUserName('');
  };

  // Live stats from backend (no hardcoding)
  const [c1, setC1] = useState(0); // listings
  const [c2, setC2] = useState(0); // users
  const [c3, setC3] = useState(0); // transactions
  const [c4, setC4] = useState(0); // total volume (INR)

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => {
          setC1(data.listingCount || 0);
          setC2(data.userCount || 0);
          setC3(data.txCount || 0);
          setC4(data.totalVolume || 0);
        })
        .catch(() => {});
    };
    fetchStats();
    const poll = setInterval(fetchStats, 5000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mouseX - 5 + 'px';
        cursorRef.current.style.top = mouseY - 5 + 'px';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    let animationFrameId;
    const animateCursor = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = ringX - 18 + 'px';
        cursorRingRef.current.style.top = ringY - 18 + 'px';
      }
      animationFrameId = requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const selectors = document.querySelectorAll('button, a, .mode-card, .opp-card, .asset-item, .suggestion-chip');
    const handleEnter = () => {
      if(cursorRef.current) cursorRef.current.style.transform = 'scale(2)';
      if(cursorRingRef.current) {
        cursorRingRef.current.style.transform = 'scale(1.5)';
        cursorRingRef.current.style.borderColor = 'var(--teal)';
      }
    };
    const handleLeave = () => {
      if(cursorRef.current) cursorRef.current.style.transform = 'scale(1)';
      if(cursorRingRef.current) {
        cursorRingRef.current.style.transform = 'scale(1)';
        cursorRingRef.current.style.borderColor = 'var(--gold)';
      }
    };
    
    selectors.forEach(el => {
      el.addEventListener('mouseenter', handleEnter);
      el.addEventListener('mouseleave', handleLeave);
    });

    // Portfolio Ticker
    const interval = setInterval(() => {
      setPortfolioVal(prev => prev + (Math.random() - 0.48) * 12);
    }, 2500);

    // Animators
    const animateCount = (setter, target, decimals = 0, duration = 2000) => {
      let start = 0;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setter((ease * target).toFixed(decimals));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    // Counters are now driven by the live /api/stats poll above

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      clearInterval(interval);
      selectors.forEach(el => {
        el.removeEventListener('mouseenter', handleEnter);
        el.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  // ── Gate: show login if no session or missing profile info ────────
  // This ensures everyone sees the new Name/Email form at least once.
  if (!loggedInAddress || !userName) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <>
      <div className="cursor" id="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" id="cursorRing" ref={cursorRingRef}></div>

      <div className="ambient">
        <div className="ambient-1"></div>
        <div className="ambient-2"></div>
        <div className="ambient-3"></div>
      </div>

      <div className="ticker-bar">
        <div className="ticker-content">
          <span className="ticker-item"><span className="badge-dot"></span> STELLAR TESTNET: <strong>ACTIVE</strong></span>
          <span className="ticker-item"><span className="badge-dot" style={{background:'var(--teal)'}}></span> SOROBAN CONTRACTS: <strong>{localStorage.getItem('nestfund_listing_count') || 3} LIVE</strong></span>
          <span className="ticker-item"><span className="badge-dot" style={{background:'var(--gold)'}}></span> TOTAL TVL: <strong>₹{(localStorage.getItem('nestfund_total_vol') || 225000).toLocaleString()}</strong></span>
          <span className="ticker-item">PROFIT RATE: <strong>18.4% AVG</strong></span>
          {/* Repeat for seamless loop if needed */}
          <span className="ticker-item"><span className="badge-dot"></span> STELLAR TESTNET: <strong>ACTIVE</strong></span>
          <span className="ticker-item"><span className="badge-dot" style={{background:'var(--teal)'}}></span> SOROBAN CONTRACTS: <strong>{localStorage.getItem('nestfund_listing_count') || 3} LIVE</strong></span>
        </div>
      </div>

      <div className="wrapper">

  {/* NAV */}
  <nav>
    <div className="logo">
      <div className="logo-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v8M8 12h8"></path>
        </svg>
      </div>
      Nest<span>Fund</span>
    </div>

    <div className="mode-pill">
      <button className={`mode-btn ${activeMode === "Explore" ? "active" : ""}`} onClick={() => setActiveMode("Explore")}>Explore</button>
      <button className={`mode-btn ${activeMode === "Learn" ? "active" : ""}`} onClick={() => setActiveMode("Learn")}>Learn</button>
      <button className={`mode-btn ${activeMode === "Invest" ? "active" : ""}`} onClick={() => setActiveMode("Invest")}>Invest</button>
      <button className={`mode-btn ${activeMode === "Business" ? "active" : ""}`} onClick={() => setActiveMode("Business")}>Business</button>
      <button className={`mode-btn ${activeMode === "Beta" ? "active" : ""}`} onClick={() => setActiveMode("Beta")} style={{ color: activeMode === 'Beta' ? '#000' : 'var(--teal)' }}>Beta</button>
    </div>

    <div className="nav-cta">
      <div
        onClick={handleLogout}
        title="Click to Logout"
        className="wallet-pill"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--teal-dim)', border: '1px solid var(--teal)', borderRadius: '100px', fontSize: '12px', fontFamily: 'JetBrains Mono', color: 'var(--teal)' }}
      >
        <div style={{ width: '8px', height: '8px', background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 8px var(--green)' }}></div>
        {userName ? userName.split(' ')[0] : loggedInAddress.slice(0, 4) + '...' + loggedInAddress.slice(-4)}
      </div>
    </div>
  </nav>


  <main style={{ minHeight: 'calc(100vh - 250px)', position: 'relative', paddingTop: '140px' }}>
    <AnimatePresence mode="wait">
      <motion.div
        key={activeMode}
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -15, scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {activeMode === 'Explore' && <ExploreView walletAddress={walletAddress} onNavigate={setActiveMode} />}
        {activeMode === 'Learn' && <LearnView portfolioVal={portfolioVal} />}
        {activeMode === 'Invest' && <InvestView portfolioVal={portfolioVal} c1={c1} c2={c2} c3={c3} c4={c4} walletAddress={walletAddress} />}
        {activeMode === 'Business' && <BusinessView walletAddress={walletAddress} />}
        {activeMode === 'Beta' && <BetaView walletAddress={walletAddress} />}
      </motion.div>
    </AnimatePresence>
  </main>

  {/* FOOTER */}
  <footer>
    <div>
      <div className="footer-brand">Nest<span>Fund</span></div>
      <div className="footer-tagline">AI-Powered Fractional Investing on the Stellar Network</div>
    </div>
    <div className="footer-right">
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '8px' }}>
        <a href="#" className="suggestion-chip" style={{ textDecoration: 'none', background: 'var(--teal-dim)', border: '1px solid var(--teal)', color: 'var(--teal)', fontSize: '10px' }}>Beta: Give Feedback</a>
        <div className="stellar-badge" style={{ margin: 0 }}>Powered by Stellar · Soroban</div>
      </div>
      <div>© 2026 NestFund · All rights reserved</div>
    </div>
  </footer>

</div>

  {/* FLOATING NERA BUTTON — visible on Invest & Business modes */}
  {activeMode !== 'Learn' && (
    <button className="nera-fab" onClick={() => setNeraOpen(o => !o)} title="Ask NeRA AI">
      <span className="nera-fab-icon" style={{ fontSize: '14px', fontWeight: '800' }}>{neraOpen ? '✕' : 'AI'}</span>
      <span className="nera-fab-label">{neraOpen ? 'Close' : 'Assistant'}</span>
      {!neraOpen && <div className="nera-fab-ping" />}
    </button>
  )}

  {/* FLOATING NERA CHAT OVERLAY */}
  {neraOpen && activeMode !== 'Learn' && (
    <div className="nera-float-overlay">
      <NeRAChat onClose={() => setNeraOpen(false)} />
    </div>
  )}

    </>
  );
}
export default App;
