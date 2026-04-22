import { motion } from 'framer-motion';

function PrivacyView() {
  return (
    <div className="view-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '60px' }}
      >
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Privacy <span className="gradient-text">Policy</span>
        </h1>
        <p className="hero-subtitle">
          Your privacy and security are our top priorities. Learn how we handle your data.
        </p>
      </motion.div>

      <div className="glass-card" style={{ padding: '40px', lineHeight: '1.6', color: 'var(--text-dim)' }}>
        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '15px' }}>1. Introduction</h2>
          <p>
            Welcome to NestFund. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our 
            website and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '15px' }}>2. Data We Collect</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li><strong>Identity Data:</strong> first name, last name, username.</li>
            <li><strong>Contact Data:</strong> email address and phone numbers.</li>
            <li><strong>Blockchain Data:</strong> public wallet addresses and transaction history.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and version.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '15px' }}>3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your 
            personal data to provide and improve our services, manage your account, and comply with 
            legal obligations.
          </p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--white)', marginBottom: '15px' }}>4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being 
            accidentally lost, used or accessed in an unauthorized way. Your blockchain private keys 
            are never stored on our servers.
          </p>
        </section>

        <section>
          <h2 style={{ color: 'var(--white)', marginBottom: '15px' }}>5. Contact Us</h2>
          <p>
            If you have any questions about this privacy policy or our privacy practices, please contact us 
            at: <span style={{ color: 'var(--gold)' }}>privacy@nestfund.io</span>
          </p>
        </section>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: 'var(--text-dim-extra)' }}>
        Last updated: April 22, 2026
      </p>
    </div>
  );
}

export default PrivacyView;
