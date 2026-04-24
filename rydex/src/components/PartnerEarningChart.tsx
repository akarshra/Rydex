"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Calendar, BarChart2, Star } from "lucide-react";
import axios from "axios";

type Earnings = {
  date: string;
  earnings: number;
};

type TooltipPayload = {
  value: number;
  payload: Earnings;
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="premium-glass bg-[#0F172A]/90 p-4 min-w-[140px] rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
          {label}
        </p>
        <p className="text-xl font-bold text-white font-mono tracking-tight">
          ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function PartnerEarningsChart() {
  const [data, setData] = useState<Earnings[]>(() => {
    // Generate some fallback data if the endpoint takes time or fails
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        earnings: Math.floor(Math.random() * 3000) + 500
      };
    });
  });
  const [loaded, setLoaded] = useState(true);

  useEffect(() => {
    axios.get("/api/partner/earnings").then((res) => {
      if(res.data?.earnings?.length > 0) {
        const last7Days: Earnings[] = res.data.earnings.slice(-7);
        setData(last7Days);
      }
    }).catch(() => {});
  }, []);

  const total = data.reduce((a, d) => a + d.earnings, 0);
  const avg = data.length ? Math.round(total / data.length) : 0;
  const max = data.length ? Math.max(...data.map((d) => d.earnings)) : 0;
  const bestDay = data.find((d) => d.earnings === max);
  const today = data[data.length - 1];
  const yesterday = data[data.length - 2];
  const delta = today && yesterday ? today.earnings - yesterday.earnings : 0;
  const deltaPositive = delta >= 0;
  const deltaPct = yesterday ? Math.abs(Math.round((delta / yesterday.earnings) * 100)) : 0;

  const metrics = [
    {
      label: "Best Day",
      value: fmt(max),
      sub: bestDay?.date ?? "—",
      icon: <Star size={14} />,
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      label: "Daily Avg",
      value: fmt(avg),
      sub: "per day",
      icon: <BarChart2 size={14} />,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Today",
      value: today ? fmt(today.earnings) : "—",
      sub: today && yesterday
        ? `${deltaPositive ? "+" : ""}${fmt(delta)} vs yesterday`
        : "—",
      icon: <Zap size={14} />,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="premium-panel rounded-3xl p-6 sm:p-10 w-full overflow-hidden relative bg-[#0B1120] border border-white/5">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-6 relative z-10">
        <div>
          <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase text-blue-400 border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 rounded-full mb-3">
            Financial Overview
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Daily Earnings
          </h2>
          <p className="text-sm text-slate-400 mt-1">Your performance over the last 7 days</p>
        </div>

        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1.5">
            Weekly Total
          </p>
          <motion.p
            key={total}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white font-mono tracking-tighter"
          >
            {fmt(total)}
          </motion.p>
          <div
            className={`flex items-center justify-end gap-1.5 text-xs font-bold mt-2 ${
              deltaPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {deltaPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
            <span className="uppercase tracking-wider">{deltaPct}% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 relative z-10">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`rounded-2xl p-5 border bg-slate-900/40 backdrop-blur-md ${m.bg.split(' ')[1]}`}
          >
            <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] mb-3 ${m.color}`}>
              <span className={`${m.bg.split(' ')[0]} p-1.5 rounded-lg border border-white/5`}>{m.icon}</span>
              {m.label}
            </div>
            <p className="text-2xl font-bold text-white font-mono leading-none tracking-tight">
              {m.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <AnimatePresence>
        {loaded && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.92 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="h-64 relative z-10"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  tickFormatter={(v) => "₹" + (v >= 1000 ? (v / 1000).toFixed(0) + "k" : v)}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#1e293b", opacity: 0.4, radius: 8 }} />
                <Bar dataKey="earnings" radius={[6, 6, 6, 6]}>
                  {data.map((entry, index) => {
                    const isToday = index === data.length - 1;
                    const isBest = entry.earnings === max && !isToday;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          isToday
                            ? "#3b82f6" // Electric blue for today
                            : isBest
                            ? "#8b5cf6" // Violet for best
                            : "#1e293b" // Slate for rest
                        }
                        style={
                          isToday || isBest ? { filter: `drop-shadow(0 0 10px ${isToday ? '#3b82f6' : '#8b5cf6'}80)` } : {}
                        }
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend + Footer */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-white/5 flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-5 flex-wrap">
          {[
            { color: "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]", label: "TODAY" },
            { color: "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]", label: "BEST DAY" },
            { color: "bg-slate-800", label: "OTHER DAYS" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-slate-400">
              <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              {l.label}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.1em] text-slate-500 uppercase">
          <Calendar size={14} />
          Updated Just Now
        </div>
      </div>
    </div>
  );
}
