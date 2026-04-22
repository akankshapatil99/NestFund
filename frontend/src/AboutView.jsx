import { motion } from 'framer-motion';

function AboutView() {
  return (
    <div className="view-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-section"
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '20px' }}>
          Democratizing <span className="gradient-text">Real Estate</span>
        </h1>
        <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '0 auto' }}>
          NestFund is a next-generation real estate investment platform powered by the Stellar blockchain. 
          We're on a mission to make property ownership accessible, liquid, and transparent for everyone.
        </p>
      </motion.div>

      <div className="grid-2" style={{ gap: '40px', marginBottom: '80px' }}>
        <div className="glass-card" style={{ padding: '40px' }}>
          <h2 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Our Vision</h2>
          <p style={{ lineHeight: '1.8', color: 'var(--text-dim)' }}>
            We believe that the traditional real estate market is broken. High entry barriers, complex legalities, 
            and lack of liquidity have kept property investment out of reach for most. NestFund changes this 
            by leveraging blockchain technology to fractionalize assets, allowing you to invest in premium 
            real estate with as little as ₹1,000.
          </p>
        </div>
        <div className="glass-card" style={{ padding: '40px' }}>
          <h2 style={{ color: 'var(--teal)', marginBottom: '20px' }}>Built on Stellar</h2>
          <p style={{ lineHeight: '1.8', color: 'var(--text-dim)' }}>
            By utilizing the Stellar network and Soroban smart contracts, we ensure that every transaction 
            is fast, secure, and fully auditable. Our platform eliminates unnecessary intermediaries, 
            drastically reducing costs and passing those savings directly to our investors.
          </p>
        </div>
      </div>

      <section style={{ marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Why NestFund?</h2>
        <div className="grid-3" style={{ gap: '20px' }}>
          {[
            { title: "Accessibility", desc: "Start small. Diversify your portfolio with fractional ownership." },
            { title: "Liquidity", desc: "Trade your real estate tokens anytime on our decentralized marketplace." },
            { title: "Transparency", desc: "All property documents and yields are tracked on-chain for total clarity." }
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', marginBottom: '15px' }}>{i === 0 ? '🔓' : i === 1 ? '💧' : '👁️'}</div>
              <h3 style={{ marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="glass-card" style={{ padding: '60px', textAlign: 'center', background: 'linear-gradient(135deg, rgba(20,21,26,0.8) 0%, rgba(30,41,59,0.4) 100%)' }}>
        <h2 style={{ marginBottom: '20px' }}>Ready to start your journey?</h2>
        <p style={{ marginBottom: '30px', color: 'var(--text-dim)' }}>Join thousands of investors already building their future with NestFund.</p>
        <button className="primary-btn" style={{ padding: '12px 40px' }}>Join the Waitlist</button>
      </div>
    </div>
  );
}

export default AboutView;
