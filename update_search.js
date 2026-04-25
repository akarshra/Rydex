const fs = require('fs');
const path = 'rydex/src/app/search/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  'const [loading,  setLoading]  = useState(false);',
  'const [loading,  setLoading]  = useState(false);\n  const [surgeFactor, setSurgeFactor] = useState(1.0);'
);

content = content.replace(
  'const res  = await fetch("/api/vehicles/nearby", {',
  `const surgeRes = await fetch(\`/api/surge/get-current?lat=\${lat}&lng=\${lng}&vehicleType=\${vehicle}\`);
      const surgeData = await surgeRes.json();
      setSurgeFactor(surgeData.surgeFactor || 1.0);

      const res  = await fetch("/api/vehicles/nearby", {`
);

content = content.replace(
  '<div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm px-4 py-2 rounded-full text-xs font-semibold text-zinc-700">\n            <Route size={12} className="text-zinc-400" />',
  `{surgeFactor > 1 && (
            <div className="flex items-center gap-1 bg-rose-100 border border-rose-200 shadow-sm px-3 py-2 rounded-full text-[11px] font-bold text-rose-700">
              <Zap size={11} className="text-rose-500 fill-rose-500" />
              {surgeFactor}x Surge
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-zinc-200 shadow-sm px-4 py-2 rounded-full text-xs font-semibold text-zinc-700">
            <Route size={12} className="text-zinc-400" />`
);

content = content.replace(
  'fare:       String(Math.round(v.baseFare + (km ?? 0) * v.pricePerKm)),',
  'fare:       String(Math.round((v.baseFare + (km ?? 0) * v.pricePerKm) * surgeFactor)),'
);

fs.writeFileSync(path, content);
console.log("Updated search page");
