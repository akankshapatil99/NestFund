const fs = require('fs');
const path = require('path');
const dir = 'src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes('http://localhost:5001')) {
    // Replace standalone string 'http://localhost:5001'
    content = content.replace(/'http:\/\/localhost:5001'/g, '(import.meta.env.VITE_API_URL || "http://localhost:5001")');
    // Replace inside a larger string 'http://localhost:5001/api/stats' with template literal
    content = content.replace(/'http:\/\/localhost:5001(.*?)'/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5001"}$1`');
    content = content.replace(/"http:\/\/localhost:5001(.*?)"/g, '`${import.meta.env.VITE_API_URL || "http://localhost:5001"}$1`');
    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Updated ${file}`);
  }
}
