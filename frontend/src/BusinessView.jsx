import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';

function ContractPreviewModal({ formData, aiAnalysis, onClose, onDeployComplete }) {
  const [deployed, setDeploy] = useState(false);
  const [loading, setLoading] = useState(false);
  const txHash = `0x${Math.random().toString(16).substr(2,8).toUpperCase()}...${Math.random().toString(16).substr(2,4).toUpperCase()}`;

  const handleDeploy = async () => {
    setLoading(true);
    // simulate deployment to stellar
    await new Promise(r => setTimeout(r, 1500));
    
    // publish the listing globally
    const newListing = {
      type: formData.assetType === 'invoice_financing' ? 'INVOICE FINANCING' : 'REVENUE SHARING',
      risk: `${aiAnalysis?.rating || 'MED'} RISK`,
      riskclass: aiAnalysis?.rating === 'LOW' ? 'risk-low' : aiAnalysis?.rating === 'HIGH' ? 'risk-high' : 'risk-med',
      name: `${formData.company} - ${formData.assetType === 'invoice_financing' ? 'Invoice Pool' : 'Growth Fund'}`,
      company: formData.company,
      returnval: '14.5%',
      returnclass: 'val-green',
      label: 'Expected APY',
      duration: '60 days',
      funded: 0,
      raisedamount: 0,
      targetamount: Number(formData.amount) || 0,
      remaining: `₹${Number(formData.amount).toLocaleString('en-IN')}`,
      aiscore: aiAnalysis?.score || '?.?',
      mininvest: 500,
      xlmrate: 0.2
    };

    try {
      await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newListing)
      });
      setDeploy(true);
      if (onDeployComplete) onDeployComplete(newListing);
    } catch(err) {
      console.error('Failed to publish listing', err);
      Sentry.captureException(err, { extra: { context: 'handleDeploy', formData } });
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="opp-type" style={{marginBottom:'4px', color:'var(--red)'}}>SMART CONTRACT PREVIEW</div>
            <div className="dc-title">{formData.company || 'Your Company'} · Funding Proposal</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {!deployed ? (
          <>
            <div style={{background:'var(--surface2)', borderRadius:'12px', padding:'20px', margin:'20px 0', fontFamily:'JetBrains Mono, monospace', fontSize:'11px', lineHeight:'1.8', color:'var(--muted)', border:'1px solid var(--border)'}}>
              <div style={{color:'var(--teal)', marginBottom:'8px'}}>// NestFund Soroban Smart Contract v2.1</div>
              <div><span style={{color:'var(--gold)'}}>contract_type</span>: <span style={{color:'var(--green)'}}>"{formData.assetType || 'invoice_financing'}"</span></div>
              <div><span style={{color:'var(--gold)'}}>issuer</span>: <span style={{color:'white'}}>"{formData.company || 'Company Name'}"</span></div>
              <div><span style={{color:'var(--gold)'}}>funding_target</span>: <span style={{color:'var(--green)'}}>{formData.amount ? `₹${Number(formData.amount).toLocaleString()}` : '₹0'}</span></div>
              <div><span style={{color:'var(--gold)'}}>escrow_type</span>: <span style={{color:'var(--teal)'}}>MULTI_SIG_SOROBAN</span></div>
              <div><span style={{color:'var(--gold)'}}>auto_distribute</span>: <span style={{color:'var(--green)'}}>true</span></div>
              <div><span style={{color:'var(--gold)'}}>network</span>: <span style={{color:'var(--teal)'}}>STELLAR_MAINNET</span></div>
              <div style={{marginTop:'8px', color:'var(--teal)'}}>// AI Risk Assessment</div>
              <div><span style={{color:'var(--gold)'}}>ai_score</span>: <span style={{color:'var(--green)'}}>{aiAnalysis?.score || '?.?'} / 10 — {aiAnalysis?.rating || 'PENDING'} RISK</span></div>
              <div><span style={{color:'var(--gold)'}}>recommended_apy</span>: <span style={{color:'var(--green)'}}>14.5%</span></div>
            </div>

            <div className="ai-score" style={{marginBottom:'20px'}}>
              <div className="ai-score-label" style={{display:'flex', alignItems:'center', gap:'6px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                NEURAL ANALYSIS
              </div>
              <div style={{fontSize:'12px', color:'var(--muted)', marginTop:'4px'}}>{aiAnalysis?.summary || 'Aggregating financial signals...'}</div>
            </div>

            <button className={`btn-primary btn-lg ${loading ? 'disabled' : ''}`} style={{width:'100%', background:'linear-gradient(135deg,var(--red),#fca5a5)', color:'#000'}} onClick={handleDeploy} disabled={loading}>
              {loading ? 'Deploying to Stellar...' : 'Deploy to Stellar Mainnet →'}
            </button>
          </>
        ) : (
          <div style={{textAlign:'center', padding:'40px 20px'}}>
            <div style={{width:'80px', height:'80px', background:'var(--teal)', borderRadius:'50%', margin:'0 auto 24px', display:'flex', alignItems:'center', justifyContent: 'center', color: '#000', fontSize: '40px'}}>✓</div>
            <div className="section-title" style={{fontSize:'24px', marginBottom:'8px', color:'var(--teal)'}}>Contract Deployed</div>
            <div className="hero-sub" style={{maxWidth:'100%', textAlign:'center'}}>Your funding proposal is now live on Stellar. Investors can start contributing immediately.</div>
            <div className="dc-tag" style={{marginTop:'16px', display:'inline-block', padding:'6px 14px', fontSize:'12px'}}>TX: {txHash}</div>
            <div style={{marginTop:'8px', fontSize:'11px', color:'var(--muted)'}}>Listing goes live in ~3 seconds · AI score: 8.2</div>
            <button className="btn-outline" style={{marginTop:'24px', display:'block', width:'100%'}} onClick={onClose}>View Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}

const activeRaises = [
  { type: 'INVOICE FINANCING', status: 'FULLY FUNDED', color: 'var(--teal)', bg: 'rgba(45,212,191,0.1)', border: 'rgba(45,212,191,0.2)', name: 'Logistics Invoice Pool #1', target: '₹25,000', filled: 100, fillColor: 'linear-gradient(90deg,var(--teal),#6ee7b7)' },
  { type: 'REVENUE SHARING', status: 'ACTIVE', color: 'var(--gold)', bg: 'rgba(200,169,110,0.1)', border: 'rgba(200,169,110,0.2)', name: 'Q4 Expansion Fund', target: '₹50,000', raised: '₹35,000', filled: 70, fillColor: 'linear-gradient(90deg,var(--gold),var(--gold-light))' },
];

export default function BusinessView() {
  const [form, setForm] = useState({ company: '', assetType: '', amount: '', description: '' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [expandedRaise, setExpandedRaise] = useState(null);
  const [stats, setStats] = useState({ totalVolume: 0, userCount: 0, listingCount: 0 });
  const [userListings, setUserListings] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => {
          Sentry.captureException(err, { extra: { context: 'fetchStats' } });
        });

      fetch('/api/listings')
        .then(res => res.json())
        .then(data => setUserListings(data.slice(0, 6)))
        .catch(err => {
          Sentry.captureException(err, { extra: { context: 'fetchListings_BusinessView' } });
        });
    };

    fetchData();
    const poll = setInterval(fetchData, 5000);
    return () => clearInterval(poll);
  }, []);

  const handleSubmit = () => {
    const errs = {};
    if (!form.company.trim()) errs.company = 'Company name required';
    if (!form.assetType) errs.assetType = 'Select an asset type';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setShowPreview(true);
  };

  return (
    <div className="fade-in-section">
      {showPreview && <ContractPreviewModal formData={form} aiAnalysis={aiAnalysis} onClose={() => setShowPreview(false)} />}

      <section className="hero container-responsive" style={{ minHeight: '80vh' }}>
        <div className="hero-grid">
          <div className="hero-content">
            <div className="hero-badge" style={{color:'var(--red)', background:'rgba(248,113,113,0.1)', borderColor:'rgba(248,113,113,0.2)'}}>
              <span className="badge-dot" style={{background:'var(--red)'}}></span>
              Capital Access Portal
            </div>
            <h1>Unlock Capital for <span style={{color:'var(--red)'}}>Growth.</span></h1>
            <p className="hero-sub">List your verified business invoices or revenue share models. Let our AI structure your funding proposal and instantly connect you with fractional investors.</p>
            <div className="hero-actions">
              <button className="btn-primary btn-lg" style={{background:'linear-gradient(135deg,var(--red),#fca5a5)', color:'#000'}} onClick={() => document.getElementById('biz-form').scrollIntoView({behavior:'smooth'})}>
                Create Listing →
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-card" style={{borderColor:'rgba(248,113,113,0.3)'}}>
              <div className="dc-header">
                <div className="dc-title">Capital Raised</div>
                <div className="dc-tag" style={{background:'rgba(248,113,113,0.1)', color:'var(--red)', borderColor:'rgba(248,113,113,0.2)'}}>LIVE</div>
              </div>
              <div className="portfolio-total">
                <div className="pt-label">Total Funded (Testnet Beta)</div>
                <div className="pt-value" style={{fontSize:'36px'}}>₹{stats.totalVolume.toLocaleString()}</div>
                <div className="pt-change">▲ {stats.listingCount} active listings · {stats.userCount} real validators</div>
              </div>
              <div className="asset-list">
                {userListings.map(r => (
                  <div key={r.name} className="asset-item" style={{background:'var(--surface2)'}}>
                    <div className="asset-dot" style={{background:'rgba(248,113,113,0.1)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent: 'center' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="12" rx="2"></rect><path d="M6 10V6a6 6 0 0 1 12 0v4"></path></svg>
                    </div>
                    <div className="asset-info">
                      <div className="asset-name">{r.name}</div>
                      <div className="asset-sub">{r.funded}% funded · {r.remaining} Left</div>
                    </div>
                    <div style={{fontSize:'11px', fontWeight:'700', color:r.returnclass === 'val-green' ? 'var(--teal)' : 'var(--gold)'}}>LIVE</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* FORM */}
      <section id="biz-form" className="container-responsive" style={{padding:'80px 24px', maxWidth:'800px', margin:'0 auto'}}>
        <div className="section-label">NEW LISTING</div>
        <div className="section-title">Create a Funding Proposal</div>
        <div className="section-sub">Fill in the details below. Our AI will structure a smart contract and publish your listing to investors.</div>

        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div>
            <input
              type="text"
              placeholder="Company Name"
              value={form.company}
              onChange={e => setForm({...form, company: e.target.value})}
              className="biz-input"
              style={{padding:'14px 16px', background:'rgba(255,255,255,0.03)', border:`1px solid ${errors.company ? 'var(--red)' : 'var(--border)'}`, borderRadius:'10px', color:'white', outline:'none', fontFamily:'inherit', width:'100%', fontSize:'14px'}}
            />
            {errors.company && <div style={{color:'var(--red)', fontSize:'12px', marginTop:'4px'}}>! {errors.company}</div>}
          </div>

          <div>
            <select
              value={form.assetType}
              onChange={e => setForm({...form, assetType: e.target.value})}
              style={{padding:'14px 16px', background:'#0e1520', border:`1px solid ${errors.assetType ? 'var(--red)' : 'var(--border)'}`, borderRadius:'10px', color: form.assetType ? 'white' : 'var(--muted)', outline:'none', fontFamily:'inherit', width:'100%', fontSize:'14px'}}
            >
              <option value="">Select Asset Type</option>
              <option value="invoice_financing">Invoice Financing</option>
              <option value="revenue_share">Revenue Share</option>
            </select>
            {errors.assetType && <div style={{color:'var(--red)', fontSize:'12px', marginTop:'4px'}}>! {errors.assetType}</div>}
          </div>

          <div>
            <input
              type="number"
              placeholder="Funding Request Amount ($)"
              value={form.amount}
              onChange={e => setForm({...form, amount: e.target.value})}
              style={{padding:'14px 16px', background:'rgba(255,255,255,0.03)', border:`1px solid ${errors.amount ? 'var(--red)' : 'var(--border)'}`, borderRadius:'10px', color:'white', outline:'none', fontFamily:'inherit', width:'100%', fontSize:'14px'}}
            />
            {errors.amount && <div style={{color:'var(--red)', fontSize:'12px', marginTop:'4px'}}>! {errors.amount}</div>}
          </div>

          <textarea
            placeholder="Brief business description (optional)"
            rows={3}
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            style={{padding:'14px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)', borderRadius:'10px', color:'white', outline:'none', fontFamily:'inherit', width:'100%', fontSize:'14px', resize:'vertical'}}
          />

          {/* AI ANALYSIS SECTION */}
          <div style={{ marginTop: '12px', padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '700', letterSpacing: '1px' }}>AI RISK ANALYSIS</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Powered by Llama 3.3 70B Versatile [Groq]</div>
              </div>
              <button 
                onClick={async () => {
                  if (!form.company || !form.amount) {
                    alert('Please fill company name and funding amount first.');
                    return;
                  }
                  setIsAnalyzing(true);
                  try {
                    const sysPrompt = "You are the NestFund AI Risk Auditor. Analyze the funding request and return ONLY a valid JSON object with: 'score' (0-10), 'rating' (LOW, MEDIUM, HIGH), and 'summary' (max 120 chars).";
                    const userPrompt = `Company: ${form.company}, Type: ${form.assetType}, Amount: ₹${form.amount}, Business: ${form.description || 'Not provided'}`;
                    
                    const res = await fetch('/api/ai/chat', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                          { role: 'system', content: sysPrompt },
                          { role: 'user', content: userPrompt }
                        ],
                        response_format: { type: 'json_object' }
                      })
                    });
                    const data = await res.json();
                    
                    if (data.error) {
                       throw new Error(data.error.message || 'Groq Error');
                    }
                    
                    const content = data.choices?.[0]?.message?.content;
                    if (!content) throw new Error('Empty AI response');
                    
                    setAiAnalysis(JSON.parse(content));
                  } catch (e) {
                    console.error('AI Analysis failed', e);
                    Sentry.captureException(e, { extra: { context: 'AI Analysis', form } });
                    setAiAnalysis({ score: '?', rating: 'ERROR', summary: `Analysis failed: ${e.message}. Ensure your API key is correctly set in .env.` });
                  }
                  setIsAnalyzing(false);
                }}
                disabled={isAnalyzing}
                className="suggestion-chip" 
                style={{ background: 'var(--surface2)', color: 'var(--red)', borderColor: 'rgba(248,113,113,0.3)' }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze with NeRA AI'}
              </button>
            </div>

            {aiAnalysis ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', textAlign:'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', flexShrink:0 }}>
                  <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Syne', color: 'var(--red)' }}>{aiAnalysis.score}</div>
                  <div style={{ fontSize: '9px', fontWeight: '700' }}>{aiAnalysis.rating}</div>
                </div>
                <div style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--muted)' }}>
                  {aiAnalysis.summary}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0', fontSize: '12px', color: 'var(--muted)' }}>
                Analysis required before final deployment.
              </div>
            )}
          </div>

          <button
            className="btn-primary btn-lg"
            style={{ 
              background: aiAnalysis ? 'linear-gradient(135deg,var(--red),#fca5a5)' : 'var(--surface2)', 
              color: aiAnalysis ? '#000' : 'var(--muted)', 
              marginTop: '12px',
              opacity: aiAnalysis ? 1 : 0.6,
              cursor: aiAnalysis ? 'pointer' : 'not-allowed'
            }}
            onClick={aiAnalysis ? handleSubmit : null}
            disabled={!aiAnalysis}
          >
            Preview & Deploy Contract →
          </button>
        </div>
      </section>

      <div className="divider"></div>

      {/* ACTIVE RAISES */}
      <section className="invest-section" style={{background:'transparent', border:'none', paddingTop:'60px'}}>
        <div className="invest-inner">
          <div className="section-label" style={{color:'var(--red)'}}>PORTFOLIO</div>
          <div className="section-title" style={{marginBottom:'40px'}}>Your Active Raises</div>

          <div className="grid-1-1">
            {userListings.map(r => (
              <div key={r.name} className="opp-card">
                <div className="opp-top">
                  <div className="opp-type">{r.type}</div>
                  <div className="risk-badge" style={{background:'rgba(45,212,191,0.1)', color:'var(--teal)', borderColor:'rgba(45,212,191,0.2)'}}>ACTIVE</div>
                </div>
                <div className="opp-name">{r.name}</div>
                <div className="opp-company">{r.company}</div>
                <div className="progress-section" style={{marginTop:'20px'}}>
                  <div className="prog-top">
                    <span>Target: ₹{r.targetamount?.toLocaleString()}</span>
                    <span>{r.funded}% Filled</span>
                  </div>
                  <div className="prog-bar">
                    <div className="prog-fill" style={{width:`${r.funded}%`, background:'linear-gradient(90deg,var(--teal),#6ee7b7)'}}></div>
                  </div>
                </div>
                <button className="btn-outline" style={{marginTop:'16px', width:'100%'}} onClick={() => setExpandedRaise(r.name === expandedRaise ? null : r.name)}>
                  {expandedRaise === r.name ? 'Hide Details ▲' : 'View Details ▼'}
                </button>
                {expandedRaise === r.name && (
                  <div style={{marginTop:'12px', padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', fontSize:'12px', color:'var(--muted)', lineHeight:'1.8'}}>
                    <div>📅 Maturity: <strong style={{color:'var(--text)'}}>{r.duration}</strong></div>
                    <div>👥 Investors: <strong style={{color:'var(--text)'}}>{stats.userCount}</strong></div>
                    <div>💰 Avg. ticket: <strong style={{color:'var(--text)'}}>₹{(stats.totalVolume / Math.max(1, stats.txCount)).toFixed(0)}</strong></div>
                    <div>🤖 AI Score: <strong style={{color:'var(--green)'}}>{r.aiscore} / 10</strong></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
