"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Tag, Wallet, ArrowUpRight } from "lucide-react";

export default function AdminFinance() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-emerald-400 font-semibold mb-1">
            Revenue Engine
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Finance & Pricing</h1>
          <p className="text-slate-400 mt-1 text-sm">Control surge multipliers, payouts, and marketing promos.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 w-fit">
          <ArrowUpRight size={16} /> Process Payouts
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[2rem] bg-slate-900/50 border border-emerald-500/20 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <DollarSign size={20} />
            </div>
            <p className="text-sm text-slate-400 font-medium mb-1">Total Revenue (30d)</p>
            <h2 className="text-4xl font-extrabold text-white">$124,500</h2>
          </div>
          <div className="mt-6 flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <TrendingUp size={16} /> +14.5% vs last month
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 rounded-[2rem] bg-slate-900/50 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4">
              <Wallet size={20} />
            </div>
            <p className="text-sm text-slate-400 font-medium mb-1">Pending Payouts</p>
            <h2 className="text-4xl font-extrabold text-white">$32,100</h2>
          </div>
          <div className="mt-6 text-slate-500 text-sm">
            Next settlement: Tomorrow, 9 AM
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 rounded-[2rem] bg-slate-900/50 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Tag size={18} className="text-purple-400" />
            <h3 className="font-bold text-white">Active Promos</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">WELCOME50</span>
                <p className="text-xs text-slate-400 mt-1">1,204 uses</p>
              </div>
              <span className="text-sm font-bold text-white">-50% off</span>
            </div>
            <button className="w-full py-2 rounded-xl border border-dashed border-white/20 text-xs font-semibold text-slate-400 hover:text-white hover:border-white/40 transition-colors">
              + Create Promo Code
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-[2rem] border border-white/10 bg-slate-900/40 p-6 md:p-8"
      >
        <h2 className="text-xl font-bold text-white mb-6">Dynamic Surge Engine</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Downtown Area Multiplier</span>
                <span className="text-sm font-bold text-sky-400">1.8x</span>
              </div>
              <input type="range" min="1" max="3" step="0.1" defaultValue="1.8" className="w-full accent-sky-500" />
              <p className="text-xs text-slate-500 mt-2">Currently high demand. Recommended: 1.5x - 2.2x</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">Airport Zone Multiplier</span>
                <span className="text-sm font-bold text-emerald-400">1.2x</span>
              </div>
              <input type="range" min="1" max="3" step="0.1" defaultValue="1.2" className="w-full accent-emerald-500" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/5 flex flex-col justify-center">
            <h3 className="font-semibold text-white mb-2">Algorithm Status</h3>
            <p className="text-sm text-slate-400 mb-4">Auto-surge is currently active. Manual overrides will expire after 2 hours.</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-xl text-sm font-semibold transition-colors">Disable Auto</button>
              <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors">Apply Override</button>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
}
