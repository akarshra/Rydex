const fs = require('fs');
const file = 'src/app/search/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'surgeFactor={surgeFactor}\n                  surgeFactor={surgeFactor}',
  'surgeFactor={surgeFactor}'
);

fs.writeFileSync(file, content);
console.log("Fixed!");
