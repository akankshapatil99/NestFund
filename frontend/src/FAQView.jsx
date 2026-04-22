import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What is NestFund?",
    answer: "NestFund is a blockchain-based real estate investment platform that allows users to invest in fractional shares of high-value properties using the Stellar network."
  },
  {
    question: "How do I start investing?",
    answer: "Simply connect your Stellar wallet, complete your profile, and browse available properties in the 'Invest' section. You can start with as little as ₹1,000."
  },
  {
    question: "Is it safe?",
    answer: "Yes. All investments are secured by smart contracts on the Stellar blockchain. Property ownership documents are digitized and accessible for verification, ensuring total transparency."
  },
  {
    question: "Can I sell my investment anytime?",
    answer: "Absolutely. Our platform features a decentralized secondary market where you can list your real estate tokens for sale to other investors at any time."
  },
  {
    question: "What are the fees?",
    answer: "NestFund charges a small 1% management fee on annual yields and a 0.5% transaction fee on the secondary market. There are no hidden costs."
  },
  {
    question: "How are yields paid out?",
    answer: "Rental income and dividends are automatically distributed to your connected wallet in real-time or monthly, depending on the specific property agreement."
  }
];

function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className="glass-card" style={{ marginBottom: '15px', overflow: 'hidden' }}>
      <button 
        onClick={onClick}
        style={{ 
          width: '100%', 
          padding: '25px', 
          textAlign: 'left', 
          background: 'none', 
          border: 'none', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--white)' }}>{question}</span>
        <motion.span 
          animate={{ rotate: isOpen ? 180 : 0 }}
          style={{ color: 'var(--gold)', fontSize: '20px' }}
        >
          ↓
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ padding: '0 25px 25px 25px', color: 'var(--text-dim)', lineHeight: '1.6' }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FAQView() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="view-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '60px' }}
      >
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '20px' }}>
          Frequently Asked <span className="gradient-text">Questions</span>
        </h1>
        <p className="hero-subtitle">
          Everything you need to know about NestFund and fractional real estate.
        </p>
      </motion.div>

      <div style={{ marginBottom: '80px' }}>
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index} 
            question={faq.question} 
            answer={faq.answer} 
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
          />
        ))}
      </div>

      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid var(--teal)' }}>
        <h3 style={{ marginBottom: '10px' }}>Still have questions?</h3>
        <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Our support team is here to help you 24/7.</p>
        <button className="primary-btn" style={{ background: 'var(--teal)', borderColor: 'var(--teal)' }}>Contact Support</button>
      </div>
    </div>
  );
}

export default FAQView;
