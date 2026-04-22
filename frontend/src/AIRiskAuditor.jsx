import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = '/api/ai/chat';

export default function AIRiskAuditor({ listing, onClose }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are NeRA Risk Auditor, an AI engine that performs deep risk analysis on real estate investment opportunities listed on NestFund (a Stellar blockchain platform).

Return a JSON object with exactly these keys:
- "overallScore": number 0-100 (overall trust/safety score)
- "verdict": string (one of: "Strong Buy", "Buy", "Hold", "Caution", "Avoid")
- "verdictColor": string (green for buy, gold for hold, red for caution/avoid)
- "riskFactors": array of objects with "factor", "severity" (Low/Medium/High), "detail" keys (exactly 4 items)
- "strengths": array of 3 strings
- "concerns": array of 2 strings
- "marketComparison": string (1 sentence comparing to market average)
- "aiConfidence": number 0-100

Only return valid JSON, no markdown.`
            },
            {
              role: 'user',
              content: `Audit this investment:
Name: ${listing.name}
Type: ${listing.type}
Company: ${listing.company}
Risk Rating: ${listing.risk}
Return: ${listing.returnval}
Duration: ${listing.duration}
Target Amount: ₹${Number(listing.targetamount || 0).toLocaleString('en-IN')}
Raised: ₹${Number(listing.raisedamount || 0).toLocaleString('en-IN')}
Funded: ${listing.funded}%
AI Score: ${listing.aiscore}`
            }
          ],
          temperature: 0.3,
          max_tokens: 900
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'AI Error');

      const raw = data.choices?.[0]?.message?.content || '';
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setAudit(JSON.parse(jsonMatch[0]));
      } else {
        throw new Error('Invalid AI response');
      }
    } catch (err) {
      console.error('[Risk Auditor Error]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount
  useState(() => { runAudit(); });

  const severityColor = (s) => {
    if (s === 'Low') return 'var(--green)';
    if (s === 'Medium') return 'var(--gold)';
    return 'var(--red)';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal-box glass"
        style={{ maxWidth: '520px', maxHeight: '85vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.2)',
              borderRadius: '6px', padding: '4px 10px', marginBottom: '10px',
              fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--teal)', fontWeight: 700, letterSpacing: '0.05em'
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
              NeRA DEEP RISK AUDIT
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '20px', fontWeight: 700 }}>{listing.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{listing.company}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '8px', width: '32px', height: '32px', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 20px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ 
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  border: '3px solid transparent',
                  borderTopColor: 'var(--teal)', borderRightColor: 'var(--gold)'
                }}
              />
              <div style={{ position: 'absolute', inset: '12px', borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: 'var(--teal)' }}>AI</div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--teal)' }}>Running Deep Analysis...</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>Evaluating {listing.name} across 12 risk dimensions</div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ padding: '20px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ color: 'var(--red)', marginBottom: '10px' }}>Audit failed: {error}</div>
            <button onClick={runAudit} style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
          </div>
        )}

        {/* Results */}
        {audit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Score + Verdict Row */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              {/* Big Score Circle */}
              <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(${audit.overallScore >= 70 ? 'var(--green)' : audit.overallScore >= 50 ? 'var(--gold)' : 'var(--red)'} ${audit.overallScore * 3.6}deg, rgba(255,255,255,0.05) 0deg)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '6px'
              }}>
                <div style={{ 
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: 'var(--surface)', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '32px', fontFamily: 'Syne', fontWeight: 800, color: audit.overallScore >= 70 ? 'var(--green)' : audit.overallScore >= 50 ? 'var(--gold)' : 'var(--red)' }}>{audit.overallScore}</div>
                  <div style={{ fontSize: '8px', fontFamily: 'JetBrains Mono', color: 'var(--muted)', letterSpacing: '0.1em' }}>TRUST</div>
                </div>
              </div>

              {/* Verdict & Confidence */}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '22px', fontFamily: 'Syne', fontWeight: 800, marginBottom: '8px',
                  color: audit.verdict.includes('Buy') ? 'var(--green)' : audit.verdict === 'Hold' ? 'var(--gold)' : 'var(--red)'
                }}>
                  {audit.verdict}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5', marginBottom: '10px' }}>{audit.marketComparison}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${audit.aiConfidence}%`, height: '100%', background: 'var(--teal)', borderRadius: '4px' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--teal)', fontWeight: 700, fontFamily: 'JetBrains Mono' }}>{audit.aiConfidence}%</span>
                </div>
                <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: 'JetBrains Mono', marginTop: '2px' }}>AI CONFIDENCE</div>
              </div>
            </div>

            {/* Risk Factors */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--gold)', fontWeight: 700, marginBottom: '10px', letterSpacing: '0.05em' }}>RISK FACTORS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(audit.riskFactors || []).map((rf, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>{rf.factor}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: severityColor(rf.severity), fontFamily: 'JetBrains Mono' }}>{rf.severity}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', lineHeight: '1.4' }}>{rf.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Concerns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--green)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>STRENGTHS</div>
                {(audit.strengths || []).map((s, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>+</span>
                    <span style={{ lineHeight: '1.4' }}>{s}</span>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '10px', fontFamily: 'JetBrains Mono', color: 'var(--red)', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>CONCERNS</div>
                {(audit.concerns || []).map((c, i) => (
                  <div key={i} style={{ fontSize: '12px', color: 'var(--text)', marginBottom: '6px', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--red)', flexShrink: 0 }}>!</span>
                    <span style={{ lineHeight: '1.4' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '12px 16px', borderRadius: '10px',
              background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.1)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'JetBrains Mono' }}>
                NeRA v2.0 · Llama 3.3 70B
              </div>
              <button onClick={runAudit} style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '11px', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
                ↻ Re-audit
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
