import React from 'react';

const Logo = ({ size = 40, showTagline = false, variant = "full", style = {} }) => {
  const gold = "#c8a96e";
  const white = "#ffffff";
  const muted = "rgba(255, 255, 255, 0.5)";
  
  return (
    <div className="nestfund-logo" style={{ display: 'flex', alignItems: 'center', gap: '20px', ...style }}>
      {/* SECTION 1: NF ICON */}
      <div className="logo-icon-wrapper" style={{ position: 'relative', width: size, height: size }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Outer Diamond */}
          <rect 
            x="15" y="15" width="70" height="70" 
            transform="rotate(45 50 50)" 
            fill="none" 
            stroke={gold} 
            strokeWidth="2.5" 
          />
          {/* Inner Accent Diamonds */}
          <rect 
            x="22" y="22" width="56" height="56" 
            transform="rotate(45 50 50)" 
            fill="none" 
            stroke={gold} 
            strokeWidth="0.8" 
            opacity="0.6"
          />
          
          {/* NF Letters - Handcrafted SVG paths for interlocking look if needed, 
              but Cinzel font is very close. Using paths for precision. */}
          <g transform="translate(26, 32) scale(0.9)">
             {/* N */}
             <path d="M0 40 V0 L30 40 V0" stroke={gold} strokeWidth="6" fill="none" strokeLinejoin="bevel" />
             {/* F (partially overlapping) */}
             <path d="M28 40 V0 H55 M28 20 H48" stroke={gold} strokeWidth="6" fill="none" />
          </g>
        </svg>
      </div>

      {/* SECTION 2: VERTICAL LINE (only for full variant) */}
      {variant === "full" && (
        <div style={{ width: '1px', height: size * 1.2, background: gold, opacity: 0.3 }}></div>
      )}

      {/* SECTION 3: TEXT CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{ 
          fontFamily: "'Cinzel', serif", 
          fontSize: size * 0.8, 
          fontWeight: '700',
          letterSpacing: '2px',
          display: 'flex',
          lineHeight: '1'
        }}>
          <span style={{ color: gold }}>NEST</span>
          <span style={{ color: white }}>FUND</span>
        </div>
        
        {variant === "full" && (
          <div style={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontSize: size * 0.28, 
            letterSpacing: '5.5px',
            color: gold,
            fontWeight: '400',
            textTransform: 'uppercase',
            marginTop: '4px'
          }}>
            DECENTRALISED CAPITAL
          </div>
        )}

        {showTagline && (
          <div style={{ 
            height: '1px', 
            background: 'rgba(255,255,255,0.1)', 
            margin: '8px 0' 
          }}></div>
        )}

        {showTagline && (
          <div style={{ 
            fontFamily: "'Montserrat', sans-serif", 
            fontSize: size * 0.2, 
            letterSpacing: '2px',
            color: muted,
            fontWeight: '300',
            textTransform: 'uppercase'
          }}>
            BUILT ON BLOCKCHAIN • POWERED BY COMMUNITY
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
