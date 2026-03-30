import { useState, useEffect } from 'react';

export default function BetaView({ walletAddress }) {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ userCount: 0, txCount: 0, totalVolume: 0, listingCount: 0 });
  const [users, setUsers] = useState([]);
  const [recentTxs, setRecentTxs] = useState([]);

  const [userName, setUserName] = useState(localStorage.getItem('nestfund_name') || '');

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});

      fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data))
        .catch(() => {});

      fetch('/api/transactions')
        .then(res => res.json())
        .then(data => setRecentTxs(data))
        .catch(() => {});
    };

    fetchData();
    setUserName(localStorage.getItem('nestfund_name') || '');
    const poll = setInterval(fetchData, 5000);
    return () => clearInterval(poll);
  }, []);

  const firstName = userName ? userName.split(' ')[0] : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="fade-in-section" style={{ paddingTop: '120px', paddingBottom: '100px' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 48px' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '48px' }}>
          <div className="hero-badge" style={{ display: 'inline-flex', marginBottom: '16px' }}>
            <span className="badge-dot" style={{ background: 'var(--teal)' }}></span>
            Testnet Beta · Open Access
          </div>
          <h1 style={{ letterSpacing: '-2px', marginBottom: '12px' }}>
            Beta <span className="teal">Validators</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px', maxWidth: '600px' }}>
            Everyone who connects their Stellar wallet and invests helps validate the platform.
            All activity is recorded on the Stellar Testnet ledger.
          </p>
          <button className="btn-primary" style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleCopyLink}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            {copied ? 'Link Copied!' : 'Invite Someone to Beta'}
          </button>
        </div>

        {/* LIVE STATS STRIP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
          {[
            { label: 'Validators Joined', val: stats.userCount, color: 'var(--teal)' },
            { label: 'Transactions', val: stats.txCount, color: 'var(--gold)' },
            { label: 'Active Listings', val: stats.listingCount, color: 'var(--green)' },
            { label: 'Total Invested', val: `₹${Number(stats.totalVolume).toLocaleString('en-IN')}`, color: 'var(--teal)' },
          ].map((s, i) => (
            <div key={i} className="dashboard-card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne', fontSize: '24px', fontWeight: '800', color: s.color, marginBottom: '4px' }}>{s.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>

          {/* VALIDATOR WALL — all real users */}
          <div className="dashboard-card" style={{ padding: '32px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px', marginBottom: '8px' }}>Validator Wall</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
              Every wallet that has connected and validated on NestFund.
            </p>

            {users.length === 0 ? (
              <div style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                No community validators detected. Register to be the first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map((u, i) => {
                  const timeDiff = Math.floor((new Date() - new Date(u.lastlogin || u.lastLogin)) / 60000);
                  const timeStr = timeDiff < 1 ? 'just now' : timeDiff < 60 ? `${timeDiff}m ago` : timeDiff < 1440 ? `${Math.floor(timeDiff / 60)}h ago` : `${Math.floor(timeDiff / 1440)}d ago`;
                  const isMe = walletAddress && u.address === walletAddress;
                  return (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '14px 16px', borderRadius: '12px',
                      background: isMe ? 'rgba(45,212,191,0.07)' : 'var(--surface2)',
                      border: isMe ? '1px solid rgba(45,212,191,0.3)' : '1px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: 'linear-gradient(135deg, var(--teal-dim), var(--gold-dim))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '14px', fontFamily: 'Syne', fontWeight: '700',
                          color: 'var(--teal)', flexShrink: 0
                        }}>
                          {u.name ? u.name.charAt(0).toUpperCase() : u.address.slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: 'var(--text)', fontWeight: '600' }}>
                            {u.name || (u.address.slice(0, 6) + '...' + u.address.slice(-6))}
                            {isMe && <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--teal)', background: 'var(--teal-dim)', padding: '2px 6px', borderRadius: '4px' }}>YOU</span>}
                          </div>
                          {u.name && (
                             <div style={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--muted)' }}>
                               {u.address.slice(0, 6)}...{u.address.slice(-6)}
                             </div>
                          )}
                          <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>Last active: {timeStr}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }}></div>
                        <span style={{ fontSize: '11px', color: 'var(--green)' }}>Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FEEDBACK FORM */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="dashboard-card" style={{ padding: '32px', background: 'linear-gradient(135deg, var(--surface), var(--surface2))' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '20px', marginBottom: '8px' }}>Submit Feedback</h3>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Found a bug? Have a suggestion? Our engineers are listening.</p>

              <form onSubmit={handleSubmit}>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What can we improve? (e.g. 'The wallet connection was confusing...')"
                  style={{
                    width: '100%', height: '120px', background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)', borderRadius: '12px',
                    padding: '16px', color: 'var(--text)', fontFamily: 'DM Sans',
                    fontSize: '14px', resize: 'none', marginBottom: '16px', outline: 'none', boxSizing: 'border-box'
                  }}
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', opacity: submitted ? 0.6 : 1 }} disabled={submitted}>
                  {submitted ? 'Feedback Received' : 'Submit Feedback'}
                </button>
              </form>
            </div>

            {/* CHECKLIST */}
            <div className="dashboard-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'Syne', fontSize: '16px', marginBottom: '16px' }}>
                {firstName ? `${firstName}'s Progress` : 'Your Progress'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Connect Freighter Wallet', done: !!walletAddress },
                  { label: 'Make a Testnet Investment', done: recentTxs.some(tx => tx.address === walletAddress) },
                  { label: 'Submit Feedback', done: submitted },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                      background: item.done ? 'var(--green)' : 'transparent',
                      border: item.done ? 'none' : '1px solid var(--muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', color: '#000'
                    }}>
                      {item.done ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: '13px', color: item.done ? 'var(--text)' : 'var(--muted)', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* LIVE TRANSACTION FEED */}
        <div className="dashboard-card" style={{ marginTop: '32px', padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div className="ai-pulse" style={{ width: '6px', height: '6px' }}></div>
            <h3 style={{ fontFamily: 'Syne', fontSize: '18px' }}>Live Transaction Feed</h3>
            <span style={{ fontSize: '12px', color: 'var(--muted)', marginLeft: '4px' }}>· updates every 5s</span>
          </div>

          {recentTxs.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
              No recent activity. Active investments will appear here in real-time.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {recentTxs.slice(0, 6).map((tx, i) => {
                const timeDiff = Math.floor((new Date() - new Date(tx.time)) / 60000);
                const timeStr = timeDiff < 1 ? 'just now' : timeDiff < 60 ? `${timeDiff}m ago` : `${Math.floor(timeDiff / 60)}h ago`;
                return (
                  <div key={i} style={{ padding: '16px', borderLeft: '2px solid var(--teal)', background: 'rgba(45,212,191,0.03)', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', fontFamily: 'JetBrains Mono' }}>
                        {tx.address.slice(0, 4)}...{tx.address.slice(-4)}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{timeStr}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--teal)', fontWeight: '600' }}>Investment</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      ₹{Number(tx.amount).toLocaleString('en-IN')} → {tx.asset}
                    </div>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txhash || tx.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontFamily: 'JetBrains Mono', textDecoration: 'none' }}
                      onMouseOver={(e) => e.target.style.color = 'var(--gold)'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
                    >
                      {(tx.txhash || tx.txHash || "").slice(0, 16)}...
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
