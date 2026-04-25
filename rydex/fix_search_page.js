const fs = require('fs');
const { execSync } = require('child_process');

execSync('git checkout src/app/search/page.tsx');

const file = 'src/app/search/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'distanceKm={km ?? undefined}',
  'distanceKm={km ?? undefined}\n                  surgeFactor={surgeFactor}'
);

content = content.replace(
  'fare:       String(Math.round(v.baseFare + (km ?? 0) * v.pricePerKm)),',
  'fare:       String(Math.round((v.baseFare + (km ?? 0) * v.pricePerKm) * surgeFactor)),'
);

fs.writeFileSync(file, content);
console.log("Fixed search page!");
