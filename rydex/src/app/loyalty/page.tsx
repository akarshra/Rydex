"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowLeft, Star, TrendingUp, History, Gift, Navigation, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoyaltyPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/loyalty/get-balance")
      .then((res) => res.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!data || !data.loyalty) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <Star size={48} className="text-zinc-800 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">No Rewards Yet</h2>
        <p className="text-zinc-500 mb-6">Complete your first ride to start earning points!</p>
        <button onClick={() => router.push("/")} className="bg-white text-zinc-900 px-6 py-3 rounded-full font-bold">
          Book a Ride
        </button>
      </div>
    );
  }

  const { loyalty, tierBenefits, recentTransactions, nextTierPoints } = data;
  const progress = nextTierPoints ? Math.min((loyalty.totalPoints / nextTierPoints) * 100, 100) : 100;

  const tierColors: Record<string, string> = {
    bronze: "from-amber-700 to-amber-900 text-amber-500",
    silver: "from-slate-300 to-slate-500 text-slate-200",
    gold: "from-yellow-400 to-amber-500 text-yellow-300",
    platinum: "from-zinc-200 via-indigo-200 to-zinc-400 text-zinc-100",
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="pt-12 px-6 pb-6 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-20 border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-black tracking-tight">Rydex Rewards</h1>
        </div>
      </div>

      <div className="p-6 max-w-lg mx-auto space-y-6 pb-24">
        {/* Tier Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${tierColors[loyalty.tier]} p-6 shadow-2xl`}
        >
          <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 blur-3xl rounded-full" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Current Tier</p>
                <h2 className="text-3xl font-black text-white capitalize drop-shadow-md">{loyalty.tier} Member</h2>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Star size={24} className="text-white fill-white/50" />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Available Points</p>
              <p className="text-5xl font-black text-white drop-shadow-md">{loyalty.availablePoints}</p>
            </div>

            {nextTierPoints && (
              <div>
                <div className="flex justify-between text-xs font-bold text-white/80 mb-2">
                  <span>{loyalty.totalPoints} pts</span>
                  <span>{nextTierPoints} pts for upgrade</span>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Gift size={16} /> Tier Benefits
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4">
              <p className="text-2xl font-black text-white mb-1">{tierBenefits.cashbackPercentage}%</p>
              <p className="text-xs text-zinc-400 font-semibold leading-tight">Discount on future rides</p>
            </div>
            {tierBenefits.prioritySupport && (
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <CheckCircle2 size={24} className="text-emerald-400 mb-2" />
                <p className="text-xs text-white font-bold leading-tight">Priority Customer Support</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Transactions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <History size={16} /> Recent Activity
          </h3>
          
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-6">No recent transactions</p>
            ) : (
              recentTransactions.map((tx: any) => (
                <div key={tx._id} className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.transactionType === 'earned' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {tx.transactionType === 'earned' ? <TrendingUp size={18} /> : <Navigation size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{tx.description}</p>
                    <p className="text-xs text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={`font-black ${tx.transactionType === 'earned' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.transactionType === 'earned' ? '+' : '-'}{tx.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
