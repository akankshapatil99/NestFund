import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const API_URL = '/api/ai/chat';

export default function AIMarketPulse() {
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [listings, setListings] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(r => r.json()).catch(() => ({})),
      fetch('/api/listings').then(r => r.json()).catch(() => [])
    ]).then(([statsData, listingsData]) => {
      setStats(statsData);
      setListings(listingsData);
    });
  }, []);

  useEffect(() => {
    if (listings.length === 0) return;
    generatePulse();
  }, [listings.length]);

  const generatePulse = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are the NestFund Market Pulse AI. Analyze the current state of the NestFund investment ecosystem and return a JSON object with:
- "sentiment": string (one of: "Bullish", "Neutral", "Bearish")
- "sentimentScore": number 0-100
- "headline": string (catchy 8-word max market headline)
- "summary": string (2 sentence market overview)
- "signals": array of 3 objects with "signal", "type" (positive/negative/neutral), "impact" (Low/Medium/High) keys
- "prediction": string (1 sentence short-term prediction)
- "sectorHeat": array of objects with "sector" and "heat" (Hot/Warm/Cool) keys

Only return valid JSON, no markdown.`
            },
            {
              role: 'user',
              content: `Current NestFund ecosystem:
Total Users: ${stats.userCount || 0}
Active Listings: ${stats.listingCount || 0}
Total Transactions: ${stats.txCount || 0}
Total Volume: ₹${Number(stats.totalVolume || 0).toLocaleString('en-IN')}

Listings: ${listings.map(l => `${l.name} (${l.type}, ${l.risk} risk, ${l.funded}% funded, ${l.returnval} return)`).join('; ')}`
            }
          ],
          temperature: 0.5,
          max_tokens: 700
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error('AI Error');

      const raw = data.choices?.[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setPulse(JSON.parse(jsonMatch[0]));
      }
    } catch (err) {
      console.error('[Market Pulse Error]', err);
      setPulse({
        sentiment: 'Neutral',
        sentimentScore: 65,
        headline: 'Ecosystem Stabilizing with New Listings',
        summary: 'The NestFund ecosystem is showing steady growth. Transaction volume and user acquisition remain healthy.',
        signals: [
          { signal: 'Consistent listing activity', type: 'positive', impact: 'Medium' },
          { signal: 'Diversified sector exposure', type: 'positive', impact: 'Low' },
          { signal: 'Early-stage market dynamics', type: 'neutral', impact: 'Low' }
        ],
        prediction: 'Moderate growth expected as ecosystem matures.',
        sectorHeat: []
      });
    } finally {
      setLoading(false);
    }
  };

  const sentimentConfig = {
    Bullish:  { color: 'var(--green)', bg: 'rgba(52,211,153,0.08)', icon: '↗' },
    Neutral:  { color: 'var(--gold)',  bg: 'rgba(200,169,110,0.08)', icon: '→' },
    Bearish:  { color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)', icon: '↘' },
  };

  const signalTypeColor = (type) => {
    if (type === 'positive') return 'var(--green)';
    if (type === 'negative') return 'var(--red)';
    return 'var(--muted)';
  };

  const heatColor = (heat) => {
    if (heat === 'Hot') return 'var(--red)';
    if (heat === 'Warm') return 'var(--gold)';
    return 'var(--teal)';
  };

  const config = sentimentConfig[pulse?.sentiment] || sentimentConfig.Neutral;

  return (
    <motion.div 
      className="dashboard-card glass"
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ border: '1px solid rgba(200,169,110,0.1)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Top gradient line */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--gold), var(--teal), transparent)',
        opacity: 0.5
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(200,169,110,0.12), rgba(129,140,248,0.12))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(200,169,110,0.2)'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }}>AI Market Pulse</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>NeRA Alpha Engine · Real-time</div>
          </div>
        </div>
        {!loading && pulse && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '6px',
            background: config.bg, border: `1px solid ${config.color}30`,
            borderRadius: '8px', padding: '6px 12px'
          }}>
            <span style={{ fontSize: '16px', color: config.color }}>{config.icon}</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: config.color, fontFamily: 'JetBrains Mono' }}>{pulse.sentiment?.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'var(--gold)', flexShrink: 0 }}
          />
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Scanning ecosystem signals...</span>
        </div>
      )}

      {/* Content */}
      {!loading && pulse && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Headline */}
          <div style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, marginBottom: '8px', lineHeight: '1.3' }}>
            {pulse.headline}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.6', marginBottom: '20px' }}>
            {pulse.summary}
          </div>

          {/* Sentiment Meter */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--muted)', letterSpacing: '0.05em' }}>MARKET SENTIMENT</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: config.color, fontFamily: 'JetBrains Mono' }}>{pulse.sentimentScore}/100</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pulse.sentimentScore}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                style={{ 
                  height: '100%', borderRadius: '6px',
                  background: `linear-gradient(90deg, var(--red), var(--gold), var(--green))`
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '9px', color: 'var(--red)' }}>Bearish</span>
              <span style={{ fontSize: '9px', color: 'var(--gold)' }}>Neutral</span>
              <span style={{ fontSize: '9px', color: 'var(--green)' }}>Bullish</span>
            </div>
          </div>

          {/* Signals */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--teal)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>MARKET SIGNALS</div>
            {(pulse.signals || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < (pulse.signals.length - 1) ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: signalTypeColor(s.type), flexShrink: 0, boxShadow: `0 0 6px ${signalTypeColor(s.type)}` }} />
                <div style={{ flex: 1, fontSize: '12px' }}>{s.signal}</div>
                <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono', color: 'var(--muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: '4px' }}>{s.impact}</div>
              </div>
            ))}
          </div>

          {/* Sector Heat */}
          {pulse.sectorHeat && pulse.sectorHeat.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>SECTOR HEAT MAP</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {pulse.sectorHeat.map((s, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '6px 10px', borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)'
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: heatColor(s.heat) }} />
                    <span style={{ fontSize: '11px' }}>{s.sector}</span>
                    <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono', color: heatColor(s.heat), fontWeight: 700 }}>{s.heat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prediction */}
          <div style={{ 
            padding: '12px 16px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(200,169,110,0.06), rgba(129,140,248,0.06))',
            border: '1px solid rgba(200,169,110,0.15)'
          }}>
            <div style={{ fontSize: '9px', fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '4px' }}>AI PREDICTION</div>
            <div style={{ fontSize: '12px', color: 'var(--text)', lineHeight: '1.5' }}>{pulse.prediction}</div>
          </div>

          {/* Refresh */}
          <button 
            onClick={generatePulse} 
            style={{ marginTop: '12px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '10px', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
          >
            ↻ Refresh pulse
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
