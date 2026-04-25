const fs = require('fs');

function processFile(file, rules) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [search, replace] of rules) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(file, content);
}

// 1. Vehicles
processFile('src/app/admin/vehicles/[id]/page.tsx', [
  ['bg-gray-50', 'bg-slate-950 text-white'],
  ['bg-white', 'bg-slate-900/60 border-white/10 text-white'],
  ['text-gray-500', 'text-slate-400'],
  ['text-gray-400', 'text-slate-400'],
  ['text-gray-300', 'text-slate-500'],
  ['text-black', 'text-white'],
  ['hover:bg-gray-100', 'hover:bg-slate-800'],
  ['bg-black', 'bg-sky-600 hover:bg-sky-500'],
  ['border', 'border-white/10 border'],
  ['border-white/10 border-white/10 border', 'border-white/10 border'],
  ['shadow-xl bg-slate-900/60 border-white/10 text-white', 'shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-slate-900/60 border-white/10 text-white'],
  ['bg-green-100 text-green-700', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'],
  ['bg-red-100 text-red-700', 'bg-rose-500/10 text-rose-400 border border-rose-500/20'],
  ['bg-yellow-100 text-yellow-700', 'bg-amber-500/10 text-amber-400 border border-amber-500/20'],
]);

// 2. Vendors
processFile('src/app/admin/vendors/[id]/page.tsx', [
  ['bg-gradient-to-br from-gray-100 to-gray-200', 'bg-slate-950 text-white'],
  ['bg-white/70 border-b', 'bg-slate-950/80 border-white/10'],
  ['bg-white', 'bg-slate-900/60 border-white/10 text-white'],
  ['text-gray-500', 'text-slate-400'],
  ['text-gray-400', 'text-slate-500'],
  ['from-black to-gray-800 text-white', 'from-sky-600 to-indigo-600 text-white hover:from-sky-500 hover:to-indigo-500'],
  ['bg-black', 'bg-sky-600 hover:bg-sky-500'],
  ['border', 'border-white/10 border'],
  ['border-white/10 border-white/10 border', 'border-white/10 border'],
  ['hover:bg-gray-100', 'hover:bg-slate-800'],
  ['bg-green-100 text-green-700', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'],
  ['bg-red-100 text-red-700', 'bg-rose-500/10 text-rose-400 border border-rose-500/20'],
  ['bg-yellow-100 text-yellow-700', 'bg-amber-500/10 text-amber-400 border border-amber-500/20'],
  ['bg-gray-50', 'bg-slate-900/40'],
]);

// 3. Dashboard Empty State / KPI Cards
processFile('src/app/admin/dashboard/page.tsx', [
  ['bg-white rounded-2xl py-16 text-center border border-dashed border-gray-200', 'bg-slate-900/40 rounded-2xl py-16 text-center border border-dashed border-white/10'],
  ['bg-green-50', 'bg-emerald-500/10'],
  ['text-green-500', 'text-emerald-400'],
  ['text-gray-800', 'text-slate-200'],
  ['text-gray-400', 'text-slate-400'],
  ['text-gray-900', 'text-slate-200'],
  ['bg-white text-black', 'bg-slate-200 text-slate-900'],
  ['bg-white border border-gray-100 rounded-2xl px-5 py-4', 'bg-slate-900/40 border border-white/10 rounded-2xl px-5 py-4'],
  ['bg-white rounded-2xl p-5 border border-gray-100', 'bg-slate-900/40 rounded-2xl p-5 border border-white/10'],
  ['hover:bg-gray-100 hover:text-gray-800', 'hover:bg-slate-800 hover:text-slate-200'],
  ['bg-purple-100 text-purple-800', 'bg-purple-500/20 text-purple-400'],
  ['bg-teal-100 text-teal-800', 'bg-teal-500/20 text-teal-400'],
  ['bg-blue-100 text-blue-800', 'bg-sky-500/20 text-sky-400'],
  ['bg-pink-100 text-pink-800', 'bg-pink-500/20 text-pink-400'],
  ['bg-gray-200 text-gray-400', 'bg-slate-800 text-slate-400'],
  ['text-gray-950', 'text-white'],
  ['border-gray-100', 'border-white/10'],
  ['bg-gray-100 text-gray-600', 'bg-slate-800/50 text-slate-400'],
  ['bg-purple-50', 'bg-purple-500/10'],
  ['text-purple-700', 'text-purple-400'],
  ['text-purple-800', 'text-purple-300'],
  ['bg-blue-50', 'bg-sky-500/10'],
  ['text-blue-800', 'text-sky-400'],
  ['text-blue-700', 'text-sky-400'],
  ['bg-amber-50', 'bg-amber-500/10'],
  ['text-amber-800', 'text-amber-400'],
  ['bg-red-50', 'bg-rose-500/10'],
  ['text-red-800', 'text-rose-400'],
  ['bg-green-50 text-green-800', 'bg-emerald-500/10 text-emerald-400'],
]);

console.log("Dark mode classes unified!");
