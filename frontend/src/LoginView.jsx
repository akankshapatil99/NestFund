import { useState, useEffect } from 'react';
import { requestAccess, getAddress, isConnected } from '@stellar/freighter-api';
import albedoLib from '@albedo-link/intent';

const albedo = albedoLib?.default || albedoLib;

export default function LoginView({ onLogin }) {
  const [step, setStep] = useState('form');   // 'form' | 'connecting' | 'done'
  const [name, setName] = useState(localStorage.getItem('nf_temp_name') || '');
  const [email, setEmail] = useState(localStorage.getItem('nf_temp_email') || '');
  const [freighterAddress, setFreighterAddress] = useState('');
  const [walletType, setWalletType] = useState('freighter'); // 'freighter' | 'albedo'
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Persistence: update localStorage whenever name/email changes
  useEffect(() => {
    localStorage.setItem('nf_temp_name', name);
    localStorage.setItem('nf_temp_email', email);
  }, [name, email]);

  // Restore state if we were in the middle of an Albedo flow
  useEffect(() => {
    const savedAddr = localStorage.getItem('nf_temp_addr');
    const savedType = localStorage.getItem('nf_temp_type');
    if (savedAddr && savedType) {
      setFreighterAddress(savedAddr);
      setWalletType(savedType);
    }
  }, []);

  // Auto-fetch Freighter address when user clicks the field area
  const handleConnectFreighter = async () => {
    setIsConnecting(true);
    setServerError('');
    try {
      const connected = await isConnected();
      if (!connected) throw new Error('Freighter not detected. If on mobile, please use Albedo below.');
      
      const access = await requestAccess();
      if (access.error) throw new Error(access.error);
      const result = await getAddress();
      const key = typeof result === 'string' ? result : result.address || result.publicKey;
      if (!key) throw new Error('Could not read wallet address.');
      
      setFreighterAddress(key);
      setWalletType('freighter');
      localStorage.setItem('nf_temp_addr', key);
      localStorage.setItem('nf_temp_type', 'freighter');
    } catch (err) {
      setServerError('Freighter error: ' + err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectAlbedo = async () => {
    // Albedo works best when called as directly as possible
    setServerError('');
    setIsConnecting(true);

    try {
      if (!albedo || typeof albedo.publicKey !== 'function') {
        throw new Error('Albedo library not loaded correctly. Please refresh.');
      }
      
      const res = await albedo.publicKey({
          token: Math.random().toString(36).substring(2)
      });

      if (res && (res.pubkey || res.publicKey)) {
        const addr = res.pubkey || res.publicKey;
        setFreighterAddress(addr);
        setWalletType('albedo');
        // Persist temp address in case of unexpected refresh after signing
        localStorage.setItem('nf_temp_addr', addr);
        localStorage.setItem('nf_temp_type', 'albedo');
      } else {
        throw new Error('No public key received from Albedo.');
      }
    } catch (err) {
      console.error('Albedo Error:', err);
      setServerError('Albedo error: ' + (err.message || 'Verification failed.'));
    } finally {
      setIsConnecting(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!freighterAddress) e.freighter = 'Please connect your Stellar wallet';
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep('connecting');
    setServerError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: freighterAddress, name: name.trim(), email: email.trim() })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Server Error ${res.status}`);
      }

      await res.json();

      // Clear temp storage on success
      localStorage.removeItem('nf_temp_name');
      localStorage.removeItem('nf_temp_email');
      localStorage.removeItem('nf_temp_addr');
      localStorage.removeItem('nf_temp_type');

      // Final session persistence
      localStorage.setItem('nestfund_session', freighterAddress);
      localStorage.setItem('nestfund_name', name.trim());
      localStorage.setItem('nestfund_email', email.trim());
      localStorage.setItem('nestfund_wallet_type', walletType);
      
      setStep('done');
      setTimeout(() => onLogin(freighterAddress), 1200);
    } catch (err) {
      let msg = err.message;
      setServerError(msg);
      setStep('form');
    }
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '14px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${errors[field] ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)',
      position: 'relative', overflow: 'hidden', padding: '20px'
    }}>
      {/* Ambient glow */}
      <div className="ambient">
        <div className="ambient-1"></div>
        <div className="ambient-2"></div>
        <div className="ambient-3"></div>
      </div>

      <div style={{
        width: '100%', maxWidth: '460px', zIndex: 10,
        background: 'rgba(14,21,32,0.85)', backdropFilter: 'blur(24px)',
        borderRadius: '28px', border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        padding: '48px 44px',
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--gold), var(--gold-light))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', boxShadow: '0 8px 16px rgba(200,169,110,0.2)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v8M8 12h8"></path>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: '24px', fontWeight: '800' }}>
            Nest<span style={{ color: 'var(--teal)' }}>Fund</span>
          </span>
        </div>

        {/* ── SUCCESS STATE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ width: '64px', height: '64px', background: 'var(--green)', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontSize: '32px' }}>✓</div>
            <div style={{ fontFamily: 'Syne', fontSize: '22px', color: 'var(--green)', marginBottom: '8px' }}>
              Welcome, {name}!
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>Accessing your secure vault...</p>
          </div>
        )}

        {/* ── CONNECTING STATE ── */}
        {step === 'connecting' && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div className="loading-dots" style={{ fontSize: '36px', color: 'var(--teal)', marginBottom: '20px' }}>
              <span>●</span><span>●</span><span>●</span>
            </div>
            <div style={{ fontFamily: 'Syne', fontSize: '16px', color: 'var(--text)' }}>Securing your session...</div>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>Registering on NestFund ledger</p>
          </div>
        )}

        {/* ── FORM STATE ── */}
        {step === 'form' && (
          <>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Syne', fontSize: '22px', marginBottom: '8px' }}>
                Create Your Account
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.6' }}>
                Join the NestFund Testnet Beta. Connect your Stellar wallet to get started.
              </p>
            </div>

            {serverError && (
              <div style={{ padding: '12px 16px', background: 'rgba(248,113,113,0.1)', border: '1px solid var(--red)', borderRadius: '10px', color: 'var(--red)', fontSize: '13px', marginBottom: '20px' }}>
                Error: {serverError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Name */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  placeholder="Akanksha Patil"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                  style={inputStyle('name')}
                />
                {errors.name && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>! {errors.name}</div>}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                  style={inputStyle('email')}
                />
                {errors.email && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>! {errors.email}</div>}
              </div>

              {/* Freighter Address */}
              <div>
                <label style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '600', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  CONNECT WALLET
                </label>
                {freighterAddress ? (
                  <div style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--teal)', fontFamily: 'JetBrains Mono' }}>
                        {freighterAddress.slice(0, 8)}...{freighterAddress.slice(-8)}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>✓ Wallet Connected</div>
                    </div>
                    <button
                      onClick={() => setFreighterAddress('')}
                      style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '18px' }}
                    >×</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleConnectFreighter}
                      disabled={isConnecting}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${errors.freighter ? 'var(--red)' : 'rgba(255,255,255,0.1)'}`,
                        color: isConnecting ? 'var(--muted)' : 'var(--text)',
                        fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'border-color 0.2s, background 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isConnecting ? '...' : 'Connect Freighter'}
                    </button>
                    <button
                      onClick={handleConnectAlbedo}
                      disabled={isConnecting}
                      style={{
                        flex: 1, padding: '14px 16px', borderRadius: '12px',
                        background: 'rgba(45,212,191,0.08)',
                        border: '1px solid rgba(45,212,191,0.3)',
                        color: 'var(--teal)',
                        fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'border-color 0.2s, background 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {isConnecting ? '...' : 'Albedo (Mobile)'}
                    </button>
                  </div>
                )}
                {errors.freighter && <div style={{ color: 'var(--red)', fontSize: '11px', marginTop: '4px' }}>! {errors.freighter}</div>}
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', lineHeight: '1.4' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>
                    <strong>Mobile Users:</strong> Because browser extensions aren't allowed on phones, use the "Albedo" button to securely log in directly via the web window.
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn-primary"
                style={{ width: '100%', height: '52px', fontSize: '15px', marginTop: '8px', fontWeight: '700', letterSpacing: '0.5px' }}
                onClick={handleSubmit}
              >
                Join NestFund Beta →
              </button>

              {/* Divider */}
              <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Already have an account?{' '}
                <button
                  onClick={handleConnectFreighter}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontSize: '12px', padding: 0 }}
                >
                  Sign in with Freighter
                </button>
              </div>
            </div>

            {/* Trust Badges */}
            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'center', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--gold)', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>STELLAR</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Testnet Live</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--teal)', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>SECURE</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Non-Custodial</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--green)', fontSize: '11px', fontWeight: '700', letterSpacing: '1px' }}>FREE</div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>Zero Fees Beta</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '24px', fontSize: '11px', color: 'rgba(255,255,255,0.15)', textAlign: 'center' }}>
        © 2026 NestFund · Stellar Network · All rights reserved
      </div>
    </div>
  );
}
