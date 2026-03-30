import fs from 'fs';
import path from 'path';

const dir = 'src';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  if (content.includes('http://localhost:5001')) {
    content = content.replace(/http:\/\/localhost:5001/g, '');
    fs.writeFileSync(path.join(dir, file), content);
    console.log(`Updated ${file}`);
  }
}
