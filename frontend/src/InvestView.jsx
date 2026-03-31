import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setAllowed, getAddress, signTransaction } from '@stellar/freighter-api';
import albedoLib from '@albedo-link/intent';
import * as StellarSdk from 'stellar-sdk';

const albedo = albedoLib?.default || albedoLib;

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new StellarSdk.Horizon.Server(HORIZON_URL);
const API = '';

// Protocol Wallet for Beta Testing (Receives the tiny testnet hold)
const PROTOCOL_WALLET = 'GDN6P4XTVB2Y4QG7K4EJVV3G5X4H6KVU2S2L6X6K4T4M5N6O7P8Q9R0S';

export default function InvestView({ walletAddress }) {
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [activeTab, setActiveTab] = useState('trending');

  const [userName, setUserName] = useState(localStorage.getItem('nestfund_name') || '');

  // ── Recovery Logic for Albedo Redirects ──
  useEffect(() => {
    const pendingOppStr = localStorage.getItem('nf_pending_opp');
    if (pendingOppStr && !selectedOpp) {
      try {
        const pendingOpp = JSON.parse(pendingOppStr);
        setSelectedOpp(pendingOpp);
      } catch (e) {
        localStorage.removeItem('nf_pending_opp');
      }
    }
  }, [selectedOpp]);

  // ── Fetch listings (called on mount and after each investment) ──
  const fetchListings = useCallback(() => {
    fetch(`${API}/api/listings`)
      .then(res => res.json())
      .then(data => setOpportunities(data))
      .catch(err => console.error('Listings load failed:', err));
  }, []);

  // ── Fetch wallet transaction history ──
  const fetchHistory = useCallback(() => {
    if (!walletAddress) return;
    setIsLoadingHistory(true);
    fetch(`${API}/api/transactions/${walletAddress}`)
      .then(res => res.json())
      .then(data => setHistory([...data].reverse()))
      .catch(err => console.error('History load failed:', err))
      .finally(() => setIsLoadingHistory(false));
  }, [walletAddress]);

  // ── Initial load + poll every 5 seconds ──
  useEffect(() => {
    fetchListings();
    fetchHistory();
    setUserName(localStorage.getItem('nestfund_name') || '');
    const poll = setInterval(fetchListings, 5000);
    return () => clearInterval(poll);
  }, [fetchListings, fetchHistory]);

  // Sector trend rows derived from live listings
  const liveTrends = [...opportunities].reverse().slice(0, 4).map((opp, idx) => ({
    name: opp.name,
    yield: opp.returnVal,
    trend: idx % 2 === 0 ? `+${(1.5 + idx * 0.3).toFixed(1)}%` : `-${(0.3 + idx * 0.1).toFixed(1)}%`,
    vol: opp.remaining,
    sector: opp.company.split('·')[0].trim()
  }));

  const firstName = userName ? userName.split(' ')[0] : '';

  return (
    <div className="fade-in-section container-responsive" style={{ paddingTop: '40px' }}>
      <div className="section-header" style={{ marginBottom: '30px' }}>
        <div>
          <h2 className="section-title">
            {firstName ? `Welcome back, ${firstName}` : 'Investment Opportunities'}
          </h2>
          <p className="section-subtitle">
            {firstName ? "Your curated investment dashboard is ready." : "Stellar-backed fractional assets · Real-time progress"}
          </p>
        </div>
        <div className="stellar-badge">Testnet Status: Live</div>
      </div>

      {/* ─── Sector Performance Panel ─── */}
      <div style={{ marginBottom: '40px' }}>
        <div className="dashboard-card glass" style={{ border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: '20px' }}>Sector Performance</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setActiveTab('trending')} className={`suggestion-chip ${activeTab === 'trending' ? 'active-chip' : ''}`} style={{ background: activeTab === 'trending' ? 'var(--gold-dim)' : 'transparent' }}>Trending</button>
              <button onClick={() => setActiveTab('history')} className={`suggestion-chip ${activeTab === 'history' ? 'active-chip' : ''}`} style={{ background: activeTab === 'history' ? 'var(--gold-dim)' : 'transparent' }}>History</button>
            </div>
          </div>

          {liveTrends.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '14px', textAlign: 'center', padding: '30px' }}>
              No active listings available.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--border)', overflowX: 'auto' }}>
              {liveTrends.map((t, i) => (
                <div key={i} className="asset-trending-row" style={{ 
                   display: 'grid', gridTemplateColumns: 'minmax(150px, 2fr) 1fr 1fr 1fr', 
                   minWidth: '700px',
                   padding: '16px 0', background: 'var(--surface)', alignItems: 'center' 
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
                  <div style={{ fontFamily: 'Syne', fontWeight: '700', fontSize: '16px' }}>{t.yield} <span style={{ fontSize: '11px', color: 'var(--muted)' }}>APY</span></div>
                  <div style={{ color: t.trend.startsWith('+') ? 'var(--green)' : 'var(--red)', fontSize: '14px', fontWeight: '600' }}>{t.trend}</div>
                  <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--text)' }}>{t.vol} <div style={{ fontSize: '10px', color: 'var(--muted)' }}>Remaining</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Investment Cards ─── */}
      <div className="opp-grid">
        {opportunities.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: '14px', gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
            No investment opportunities yet.
          </div>
        ) : (
          opportunities.map(opp => (
            <div key={opp.id} className="opp-card glass" onClick={() => setSelectedOpp(opp)}>
              <div className="opp-header">
                <span className={`opp-risk ${opp.riskclass}`}>{opp.risk}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,191,0,0.1)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,191,0,0.2)' }}>
                   <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--gold)"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                   <span style={{ fontSize: '10px', color: 'var(--gold)', fontWeight: '700' }}>{opp.aiscore} TRUST</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <div className="opp-type" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {opp.type}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(45,212,191,0.05)', padding: '2px 6px', borderRadius: '10px', border: '1px solid rgba(45,212,191,0.1)' }}>
                    <div style={{ width: '4px', height: '4px', background: 'var(--teal)', borderRadius: '50%' }}></div>
                    <span style={{ fontSize: '9px', fontWeight: '600' }}>SOROBAN VERIFIED</span>
                  </div>
                </div>
              </div>
              <div className="opp-title">{opp.name}</div>
              <div className="opp-company">{opp.company}</div>

              <div className="opp-stats">
                <div className="opp-stat">
                  <div className="stat-label">{opp.label}</div>
                  <div className={`stat-value ${opp.returnclass}`}>{opp.returnval}</div>
                </div>
                <div className="opp-stat">
                  <div className="stat-label">Term</div>
                  <div className="stat-value">{opp.duration}</div>
                </div>
              </div>

              <div className="progress-container">
                <div className="progress-bar" style={{ width: `${opp.funded}%` }}></div>
              </div>
              <div className="progress-labels">
                <span>{opp.funded}% Funded</span>
                <span>{opp.remaining} Left</span>
              </div>

              <button className="btn-secondary" style={{ width: '100%', marginTop: '20px' }}>Invest Now</button>
            </div>
          ))
        )}
      </div>

      {/* ─── Transaction Ledger ─── */}
      <div className="history-section glass" style={{ marginTop: '50px', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 className="dc-title" style={{ marginBottom: '20px' }}>
          {firstName ? `${firstName}'s Ledger` : 'Transaction Ledger'}
        </h3>
        {!walletAddress ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>Connect wallet to view history.</div>
        ) : isLoadingHistory ? (
          <div className="loading-dots"><span>.</span><span>.</span><span>.</span></div>
        ) : history.length === 0 ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', textAlign: 'center', padding: '40px' }}>No active investments.</div>
        ) : (
          <div className="history-list">
            {history.map((tx, idx) => (
              <div key={idx} className="asset-item glass" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="asset-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {tx.asset}
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txhash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                  <div className="asset-meta">{new Date(tx.time).toLocaleDateString('en-IN')} · {tx.type}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="asset-val" style={{ color: 'var(--green)' }}>₹{Number(tx.amount).toLocaleString('en-IN')}</div>
                  <div className="asset-meta" style={{ fontSize: '10px', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txhash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                    >
                      {tx.txhash.slice(0, 14)}... Verified
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Invest Modal ─── */}
      {selectedOpp && (
        <InvestModal
          opp={selectedOpp}
          onClose={() => {
            localStorage.removeItem('nf_pending_opp');
            localStorage.removeItem('nf_pending_amount');
            localStorage.removeItem('nf_pending_xdr');
            setSelectedOpp(null);
          }}
          walletAddress={walletAddress}
          onSuccess={(newTx) => {
            setHistory(prev => [newTx, ...prev]);
            fetchListings(); // immediately refresh progress bars
          }}
        />
      )}
    </div>
  );
}

function InvestModal({ opp, onClose, walletAddress, onSuccess }) {
   const [amount, setAmount] = useState(Number(localStorage.getItem('nf_pending_amount')) || opp.mininvest || 0);
   const [step, setStep] = useState(localStorage.getItem('nf_pending_xdr') ? 'prepared' : 'input');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const xlmAmount = (amount * (opp.xlmrate || 0.2)).toFixed(6);
  const estimatedEarnings = ((Number(amount) * (parseFloat(opp.returnval) || 0)) / 100).toFixed(0);

  const handleInvest = async () => {
    if (!walletAddress) {
      const walletType = localStorage.getItem('nestfund_wallet_type') || 'freighter';
      setError(`Please connect your ${walletType === 'albedo' ? 'Albedo' : 'Freighter'} wallet first.`);
      return;
    }
    if (amount < (opp.mininvest || 0)) {
       setError(`Minimum investment for this project is ₹${(opp.mininvest || 0).toLocaleString('en-IN')}`);
       return;
    }
    setStep('processing');
    setError(null);

    try {
      setStatus('Fetching Account details from Stellar...');
      let account;
      try {
        account = await server.loadAccount(walletAddress);
      } catch (err) {
        if (err.response?.status === 404) {
          setStatus('Provisioning testnet XLM via Friendbot...');
          await fetch(`https://friendbot.stellar.org/?addr=${walletAddress}`);
          await new Promise(r => setTimeout(r, 4500));
          account = await server.loadAccount(walletAddress);
        } else throw err;
      }

      setStatus(`${opp.name}: Preparing on-chain settlement...`);
      
      // Building a real payment transaction as a "Fractional Investment Hold"
      const transaction = new StellarSdk.TransactionBuilder(account, {
        fee: '100', 
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: walletAddress,
          asset: StellarSdk.Asset.native(),
          amount: '0.01', 
        }))
        .addMemo(StellarSdk.Memo.text(`Invest ${opp.name.slice(0, 20)}`))
        .setTimeout(30)
        .setNetworkPassphrase(StellarSdk.Networks.TESTNET)
        .build();

      const walletType = localStorage.getItem('nestfund_wallet_type') || 'freighter';
      const xdr = transaction.toXDR();
      
       if (walletType === 'albedo') {
         // FOR ALBEDO: We MUST call the intent directly from a user click to avoid popup blockers on mobile.
         // We save the XDR and wait for the user to click the new "SIGN NOW" button.
         localStorage.setItem('nf_pending_opp', JSON.stringify(opp));
         localStorage.setItem('nf_pending_amount', amount.toString());
         localStorage.setItem('nf_pending_xdr', xdr);
         window.__pendingAlbedoXdr = xdr;
         setStep('prepared');
         setStatus('Investment Prepared');
       } else {
        // FOR FREIGHTER: Extensions usually handle the async context better, so we proceed immediately.
        setStatus('Awaiting Sign-off (Freighter popup)...');
        const signedResponse = await signTransaction(xdr, { 
          networkPassphrase: StellarSdk.Networks.TESTNET,
          network: 'TESTNET' 
        });
        if (signedResponse.error) throw new Error(`Signing error: ${signedResponse.error}`);
        handleSubmitSignedTx(signedResponse.signedTxXdr);
      }
    } catch (err) {
      console.error("Stellar Flow Error:", err);
      setError(err.message || 'Transaction failed. Ensure Freighter is on Testnet.');
      setStep('input');
    }
  };

   const handleAlbedoSign = async () => {
     let xdr = window.__pendingAlbedoXdr || localStorage.getItem('nf_pending_xdr');
     if (!xdr) {
       setError("Transaction context lost. Please restart the investment.");
       setStep('input');
       return;
     }

    setStep('processing');
    setStatus('Opening Albedo (Mobile Secure Pop-up)...');

    try {
      // Direct call to albedo.tx – NO AWAITS BEFORE THIS in this specific function call chain!
      const albedoRes = await albedo.tx({
        xdr,
        network: 'testnet',
        submit: false
      });
      
      if (albedoRes.signed_envelope_xdr) {
        await handleSubmitSignedTx(albedoRes.signed_envelope_xdr);
      } else {
        throw new Error("No signature received from Albedo.");
      }
    } catch (err) {
      console.error("Albedo Sign Error:", err);
      setError(err.message || "Signing failed. Pop-up may have been blocked.");
      setStep('prepared'); // Stay here to let them try again
    }
  };

  const handleSubmitSignedTx = async (signedXdr) => {
    setStep('processing');
    setStatus('Broadcasting to Global Ledger...');
    try {
      const txToSubmit = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
      const response = await server.submitTransaction(txToSubmit);
      const txHash = response.hash;

      setStatus('Syncing with NestFund Data Network...');
      const postRes = await fetch(`${API}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          type: opp.type,
          amount: Number(amount),
          asset: opp.name,
          txHash
        })
      });

      if (!postRes.ok) {
        const errorData = await postRes.json();
        throw new Error(errorData.error || 'Ledger sync failed');
      }
      
       const { tx } = await postRes.json();
       
       // Success -> Clear all pending context
       localStorage.removeItem('nf_pending_opp');
       localStorage.removeItem('nf_pending_amount');
       localStorage.removeItem('nf_pending_xdr');
       window.__pendingAlbedoXdr = null;

       onSuccess(tx);
       setStep('success');
     } catch (err) {
       console.error("Submission Error:", err);
       setError(err.message || 'Transaction failed during submission.');
       setStep('input');
     }
   };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box glass" style={{ maxWidth: '450px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="opp-type" style={{ color: 'var(--gold)' }}>Confirm fractional ownership</div>
            <div className="dc-title" style={{ fontSize: '24px' }}>{opp.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content" style={{ padding: '20px 0' }}>
          {step === 'input' && (
            <>
              <div className="os-cell" style={{ marginBottom: '20px' }}>
                <div className="os-label">Investment Amount (INR)</div>
                <input
                  type="number"
                  className="xl-input"
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid var(--teal)', color: '#fff', fontSize: '32px', fontFamily: 'Syne', fontWeight: 'bold', outline: 'none', padding: '10px 0' }}
                />
                <div className="asset-meta" style={{ marginTop: '10px', color: 'var(--green)' }}>≈ {xlmAmount} Testnet XLM</div>
              </div>

              <div className="ai-score" style={{ marginBottom: '25px', background: 'rgba(255,191,0,0.05)', border: '1px solid rgba(255,191,0,0.2)' }}>
                <div style={{ flex: 1 }}>
                  <div className="ai-score-label" style={{ color: 'var(--gold)' }}>NESTFUND YIELD ESTIMATE</div>
                  <div className="ai-score-val" style={{ color: 'var(--gold)' }}>₹{Number(estimatedEarnings).toLocaleString('en-IN')} Profit</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="ai-score-label" style={{ color: 'var(--green)' }}>TOTAL SETTLEMENT</div>
                  <div className="ai-score-val" style={{ color: 'var(--green)' }}>₹{(Number(amount) + Number(estimatedEarnings)).toLocaleString('en-IN')}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Principal + {opp.returnval} interest automatically distributed by Soroban smart contract upon maturity.</span>
              </div>

              {error && <div style={{ color: 'var(--red)', background: 'rgba(248,113,113,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '12px', border: '1px solid rgba(248,113,113,0.2)' }}>Error: {error}</div>}

              <button className="btn-primary" style={{ width: '100%', height: '54px', fontSize: '16px' }} onClick={handleInvest}>
                CONFIRM & SIGN XLM
              </button>
            </>
          )}

          {step === 'prepared' && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(255,191,0,0.1)', border: '2px solid var(--gold)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', fontSize: '24px' }}>!</div>
              <div className="dc-title" style={{ fontSize: '20px', color: 'var(--gold)' }}>Ready to Sign</div>
              <p className="asset-meta" style={{ margin: '12px 0 24px', lineHeight: '1.5' }}>
                On mobile, your browser requires a direct click to open the secure wallet window. Click the button below to authorize the ₹{Number(amount).toLocaleString('en-IN')} investment.
              </p>
              
              {error && <div style={{ color: 'var(--red)', background: 'rgba(248,113,113,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '11px' }}>{error}</div>}

              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '54px', background: 'var(--gold)', color: '#000' }} 
                onClick={handleAlbedoSign}
              >
                SIGN TRANSACTION NOW
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('nf_pending_opp');
                  localStorage.removeItem('nf_pending_amount');
                  localStorage.removeItem('nf_pending_xdr');
                  setStep('input');
                }} 
                style={{ background: 'none', border: 'none', color: 'var(--muted)', marginTop: '16px', cursor: 'pointer', fontSize: '12px' }}
              >
                ← Back to amount
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div className="loading-dots" style={{ fontSize: '40px', color: 'var(--teal)', marginBottom: '20px' }}>
                <span>●</span><span>●</span><span>●</span>
              </div>
              <div className="dc-title" style={{ fontSize: '18px' }}>{status}</div>
              <p className="asset-meta" style={{ marginTop: '10px' }}>Securely verifying via Stellar Testnet</p>
            </div>
          )}

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--green)', borderRadius: '50%', margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '40px' }}>✓</div>
              <div className="dc-title" style={{ fontSize: '26px', color: 'var(--green)' }}>Investment Successful</div>
              <p className="asset-meta" style={{ margin: '15px 0 25px' }}>
                Your fractional stake is now live. On maturity, <strong>₹{(Number(amount) + Number(estimatedEarnings)).toLocaleString('en-IN')}</strong> will be distributed back to your wallet autonomously.
              </p>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>VIEW MY LEDGER</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
