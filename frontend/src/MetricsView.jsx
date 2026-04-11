import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as Sentry from '@sentry/react';

const API = '';

// ── SVG Icons ──────────────────────────────────────────────────────────
const Icons = {
  users:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  calendar: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  zap:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  volume:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  trending: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  link:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  chart:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18"/><rect x="10" y="8" width="4" height="13"/><rect x="2" y="13" width="4" height="8"/></svg>,
};

// ── Mini Bar Chart ─────────────────────────────────────────────────────
function BarChart({ data, color = 'var(--teal)', label }) {
  const entries = Object.entries(data || {});
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginBottom: '4px', letterSpacing: '0.06em' }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px' }}>
        {entries.map(([day, val]) => (
          <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>{val || 0}</div>
            <div style={{
              width: '100%',
              height: `${Math.max(4, (val / max) * 64)}px`,
              background: color,
              borderRadius: '4px 4px 0 0',
              opacity: val === 0 ? 0.15 : 0.85,
              transition: 'height 0.8s ease',
            }} />
            <div style={{ fontSize: '8px', color: 'var(--muted)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '32px', textOverflow: 'ellipsis' }}>{day.split(' ')[0]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = 'var(--teal)', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${color}22`,
        borderRadius: '20px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      </div>
      <div style={{ fontSize: '36px', fontFamily: 'Syne', fontWeight: '800', color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{sub}</div>}
    </motion.div>
  );
}

// ── Retention Ring ─────────────────────────────────────────────────────
function RetentionRing({ rate }) {
  const r = 42, circ = 2 * Math.PI * r;
  const progress = (rate / 100) * circ;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke="var(--gold)" strokeWidth="10"
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 1.2s ease' }}
        />
        <text x="55" y="59" textAnchor="middle" fill="var(--gold)" fontSize="18" fontFamily="Syne" fontWeight="800">{rate}%</text>
      </svg>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>Retention Rate</div>
        <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Users who returned</div>
      </div>
    </div>
  );
}

// ── Main View ──────────────────────────────────────────────────────────
export default function MetricsView() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollRef = useRef(null);

  const fetchMetrics = () => {
    fetch(`${API}/api/metrics`)
      .then(r => r.json())
      .then(data => {
        setMetrics(data);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch(err => {
        Sentry.captureException(err, { extra: { context: 'fetchMetrics' } });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMetrics();
    pollRef.current = setInterval(fetchMetrics, 10000);
    return () => clearInterval(pollRef.current);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '20px' }}>
        <div className="loading-dots" style={{ fontSize: '32px', color: 'var(--teal)' }}><span>●</span><span>●</span><span>●</span></div>
        <div style={{ color: 'var(--muted)', fontSize: '14px', fontFamily: 'JetBrains Mono' }}>Loading live metrics...</div>
      </div>
    );
  }

  const m = metrics || {};

  return (
    <div className="fade-in-section container-responsive" style={{ paddingTop: '40px', paddingBottom: '60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="section-title">Live Metrics Dashboard</h2>
          <p className="section-subtitle">Real-time user analytics powered by Supabase · Auto-refreshes every 10s</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: '100px', padding: '6px 14px', fontSize: '11px', fontFamily: 'JetBrains Mono', color: 'var(--teal)' }}>
          <div style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', boxShadow: '0 0 6px var(--green)' }} />
          LIVE · {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN') : '—'}
        </div>
      </div>

      {/* ── Row 1: KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <StatCard icon={Icons.users}    label="DAU"          value={m.dau ?? '—'}                                                                                              sub="Unique logins today"   color="var(--teal)"  delay={0}    />
        <StatCard icon={Icons.calendar} label="WAU"          value={m.wau ?? '—'}                                                                                              sub="Active this week"      color="#818cf8"      delay={0.05} />
        <StatCard icon={Icons.user}     label="Total Users"  value={m.totalUsers ?? '—'}                                                                                       sub={`+${m.newUsersToday ?? 0} today`} color="var(--green)" delay={0.1} />
        <StatCard icon={Icons.zap}      label="Tx Today"     value={m.txCountToday ?? '—'}                                                                                     sub={`${m.txCountTotal ?? 0} all-time`} color="var(--gold)" delay={0.15} />
        <StatCard icon={Icons.volume}   label="Total Volume" value={`₹${Number(m.totalVolume || 0).toLocaleString('en-IN')}`} sub={`₹${Number(m.txByDay ? Object.values(m.txByDay).reduce((a,b)=>a+b,0) : 0).toLocaleString('en-IN')} this week`} color="#f472b6" delay={0.2} />
      </div>

      {/* ── Row 2: Charts + Retention ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '16px', marginBottom: '28px', alignItems: 'stretch' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,212,191,0.1)', borderRadius: '20px', padding: '24px' }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '20px', color: 'var(--text)' }}>User Growth <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '11px' }}>— Last 7 days</span></div>
          <BarChart data={m.growthByDay} color="var(--teal)" label="NEW SIGNUPS / DAY" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,191,0,0.1)', borderRadius: '20px', padding: '24px' }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '20px', color: 'var(--text)' }}>Transaction Volume <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '11px' }}>— Last 7 days (&#8377;)</span></div>
          <BarChart data={m.txByDay} color="var(--gold)" label="INR INVESTED / DAY" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,191,0,0.1)', borderRadius: '20px', padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '160px' }}
        >
          <RetentionRing rate={m.retentionRate ?? 0} />
        </motion.div>
      </div>

      {/* ── Row 3: Recent Transactions + Quick Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}
        >
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '20px', color: 'var(--text)' }}>Recent Transactions <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '11px' }}>— Live feed</span></div>
          {(!m.recentTxs || m.recentTxs.length === 0) ? (
            <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '30px' }}>No transactions yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {m.recentTxs.map((tx, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(45,212,191,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                      {Icons.zap}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>{tx.asset}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                        {tx.address?.slice(0, 6)}...{tx.address?.slice(-4)} · {tx.type}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--green)' }}>&#8377;{Number(tx.amount).toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{new Date(tx.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '200px' }}
        >
          {[
            { label: 'New Users Today',    value: m.newUsersToday ?? 0,  color: 'var(--green)', icon: Icons.user     },
            { label: 'New Users This Week',value: m.newUsersWeek ?? 0,   color: 'var(--teal)',  icon: Icons.trending },
            { label: 'Tx This Week',       value: m.txCountWeek ?? 0,    color: 'var(--gold)',  icon: Icons.link     },
            { label: 'All-Time Tx',        value: m.txCountTotal ?? 0,   color: '#818cf8',      icon: Icons.chart    },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.45 + i * 0.05 }}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${item.color}22`, borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ color: item.color, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '20px', fontFamily: 'Syne', fontWeight: '800', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
