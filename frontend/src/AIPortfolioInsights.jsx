import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = '/api/ai/chat';

export default function AIPortfolioInsights({ walletAddress }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    fetch(`/api/transactions/${walletAddress}`)
      .then(res => res.json())
      .then(data => setHistory(data || []))
      .catch(() => {});
  }, [walletAddress]);

  const generateInsights = async () => {
    if (history.length === 0) return;
    setLoading(true);
    setError(null);

    const portfolioSummary = history.map(tx => 
      `${tx.asset}: ₹${Number(tx.amount).toLocaleString('en-IN')} (${tx.type}) on ${new Date(tx.time).toLocaleDateString('en-IN')}`
    ).join('\n');

    const totalInvested = history.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const uniqueAssets = [...new Set(history.map(t => t.asset))];

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are NeRA Portfolio Intelligence, an AI engine that analyzes user portfolios on NestFund (a Stellar blockchain fractional investment platform). 
              
Return a JSON object with exactly these keys:
- "healthScore": number 0-100 (portfolio health rating)
- "diversificationGrade": string (A+, A, B+, B, C)
- "riskLevel": string (Low, Moderate, Elevated, High)
- "topInsight": string (1 sentence, most important finding)
- "recommendations": array of 3 strings (actionable advice)
- "projectedYield": string (estimated annual return percentage)
- "sectorBreakdown": array of objects with "sector" and "percentage" keys

Only return valid JSON, no markdown.`
            },
            {
              role: 'user',
              content: `Analyze this portfolio:
Total Invested: ₹${totalInvested.toLocaleString('en-IN')}
Unique Assets: ${uniqueAssets.length}
Transactions: ${history.length}

Details:
${portfolioSummary}`
            }
          ],
          temperature: 0.4,
          max_tokens: 800
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'AI Error');

      const raw = data.choices?.[0]?.message?.content || '';
      // Try to extract JSON from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setInsights(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (err) {
      console.error('[Portfolio AI Error]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress || history.length === 0) return null;

  const scoreColor = (score) => {
    if (score >= 80) return 'var(--green)';
    if (score >= 60) return 'var(--gold)';
    return 'var(--red)';
  };

  const gradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'var(--green)';
    if (grade?.startsWith('B')) return 'var(--gold)';
    return 'var(--red)';
  };

  return (
    <motion.div 
      className="dashboard-card glass" 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      style={{ marginTop: '40px', border: '1px solid rgba(45,212,191,0.15)', position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow effect */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: 'linear-gradient(90deg, transparent, var(--teal), var(--gold), transparent)',
        opacity: 0.6
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: insights ? '24px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(200,169,110,0.15))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(45,212,191,0.2)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '16px' }}>AI Portfolio Intelligence</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
              Powered by NeRA · {history.length} transaction{history.length !== 1 ? 's' : ''} analyzed
            </div>
          </div>
        </div>

        {!insights && !loading && (
          <button 
            onClick={generateInsights}
            style={{
              background: 'linear-gradient(135deg, var(--teal), #14b8a6)',
              border: 'none', borderRadius: '10px',
              padding: '10px 20px', color: '#000',
              fontFamily: 'Syne', fontWeight: 700, fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(45,212,191,0.3)'
            }}
            onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
          >
            Analyze My Portfolio
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ height: [12, 28, 12], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
                style={{ width: '4px', borderRadius: '4px', background: 'var(--teal)' }}
              />
            ))}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--teal)', fontWeight: 600 }}>
            NeRA is analyzing your portfolio...
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
            Evaluating risk, diversification, and projected yields
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', marginTop: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--red)' }}>Analysis failed: {error}</div>
          <button onClick={generateInsights} style={{ marginTop: '10px', background: 'none', border: '1px solid var(--red)', color: 'var(--red)', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {insights && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Score Cards Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {/* Health Score */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontFamily: 'Syne', fontWeight: 800, color: scoreColor(insights.healthScore), lineHeight: 1 }}>
                  {insights.healthScore}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '6px', letterSpacing: '0.05em' }}>HEALTH SCORE</div>
              </div>

              {/* Diversification */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontFamily: 'Syne', fontWeight: 800, color: gradeColor(insights.diversificationGrade), lineHeight: 1 }}>
                  {insights.diversificationGrade}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '6px', letterSpacing: '0.05em' }}>DIVERSIFICATION</div>
              </div>

              {/* Risk Level */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontFamily: 'Syne', fontWeight: 800, color: insights.riskLevel === 'Low' ? 'var(--green)' : insights.riskLevel === 'Moderate' ? 'var(--gold)' : 'var(--red)', lineHeight: 1, marginTop: '6px' }}>
                  {insights.riskLevel}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '10px', letterSpacing: '0.05em' }}>RISK LEVEL</div>
              </div>

              {/* Projected Yield */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontFamily: 'Syne', fontWeight: 800, color: 'var(--green)', lineHeight: 1, marginTop: '4px' }}>
                  {insights.projectedYield}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '8px', letterSpacing: '0.05em' }}>PROJECTED YIELD</div>
              </div>
            </div>

            {/* Top Insight */}
            <div style={{ 
              padding: '16px 20px', borderRadius: '12px', marginBottom: '16px',
              background: 'linear-gradient(135deg, rgba(45,212,191,0.06), rgba(200,169,110,0.06))',
              border: '1px solid rgba(45,212,191,0.15)'
            }}>
              <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--teal)', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.05em' }}>KEY INSIGHT</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>{insights.topInsight}</div>
            </div>

            {/* Expandable Section */}
            <button 
              onClick={() => setExpanded(!expanded)}
              style={{ 
                width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '12px', color: 'var(--muted)', cursor: 'pointer',
                fontSize: '12px', fontFamily: 'JetBrains Mono', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}
            >
              <span>{expanded ? 'Hide Details' : 'View Recommendations & Sector Breakdown'}</span>
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} style={{ color: 'var(--gold)' }}>↓</motion.span>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Recommendations */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.05em' }}>AI RECOMMENDATIONS</div>
                    {(insights.recommendations || []).map((rec, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'var(--gold-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--gold)', flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.5' }}>{rec}</div>
                      </div>
                    ))}
                  </div>

                  {/* Sector Breakdown */}
                  {insights.sectorBreakdown && insights.sectorBreakdown.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--teal)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.05em' }}>SECTOR ALLOCATION</div>
                      {insights.sectorBreakdown.map((s, i) => {
                        const colors = ['var(--gold)', 'var(--teal)', '#818cf8', 'var(--green)', '#f472b6'];
                        return (
                          <div key={i} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text)' }}>{s.sector}</span>
                              <span style={{ fontSize: '12px', color: colors[i % colors.length], fontWeight: 700 }}>{s.percentage}%</span>
                            </div>
                            <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${s.percentage}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                style={{ height: '100%', background: colors[i % colors.length], borderRadius: '4px' }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Regenerate */}
            <button 
              onClick={generateInsights} 
              style={{ marginTop: '16px', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}
            >
              ↻ Regenerate Analysis
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
