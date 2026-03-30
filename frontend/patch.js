const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.fade-in-section')) {
  css += '\n.fade-in-section { animation: fadeUp 0.6s ease forwards; opacity: 0; }\n';
  fs.writeFileSync('src/index.css', css);
}

let app = fs.readFileSync('src/App.jsx', 'utf8');

// Replace imports
app = app.replace("import './index.css';", "import './index.css';\nimport LearnView from './LearnView.jsx';\nimport InvestView from './InvestView.jsx';\nimport BusinessView from './BusinessView.jsx';");

// Find start of {/* HERO */} and start of {/* FOOTER */}
const startIdx = app.indexOf('{/* HERO */}');
const endIdx = app.indexOf('{/* FOOTER */}');

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `
  {activeMode === 'Learn' && <LearnView portfolioVal={portfolioVal} />}
  {activeMode === 'Invest' && <InvestView portfolioVal={portfolioVal} c1={c1} c2={c2} c3={c3} c4={c4} />}
  {activeMode === 'Business' && <BusinessView />}

  `;
  app = app.slice(0, startIdx) + replacement + app.slice(endIdx);
  fs.writeFileSync('src/App.jsx', app);
}
