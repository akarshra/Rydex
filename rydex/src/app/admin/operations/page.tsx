"use client";

import { motion } from "framer-motion";
import { Activity, CarFront, Users, Navigation2, CheckCircle2, Map as MapIcon, XCircle, Zap, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export default function AdminOperations() {
  const [activeTab, setActiveTab] = useState("map");
  const [surges, setSurges] = useState<any[]>([]);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetch("/api/admin/surge/active").then(r => r.json()).then(d => {
      if (d.success) setSurges(d.surges);
    });
  }, []);

  const calculateSurge = async () => {
    setCalculating(true);
    await fetch("/api/admin/surge/calculate", { method: "POST" });
    const r = await fetch("/api/admin/surge/active");
    const d = await r.json();
    if (d.success) setSurges(d.surges);
    setCalculating(false);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400 font-semibold mb-1">
            Command Center
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Live Operations</h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time fleet tracking and active ride monitoring.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">System Live</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Trips", value: "24", icon: <Navigation2 size={18} />, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
          { label: "Idle Vehicles", value: "15", icon: <CarFront size={18} />, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Surge Zones", value: surges.length.toString(), icon: <Zap size={18} />, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Cancellations", value: "2", icon: <XCircle size={18} />, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-5 rounded-2xl border ${stat.bg} flex flex-col`}
          >
            <div className={`w-10 h-10 rounded-xl bg-slate-900/50 flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="text-3xl font-bold text-white mb-1">{stat.value}</span>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2rem] border border-white/10 bg-slate-900/50 overflow-hidden relative min-h-[500px] flex flex-col"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0" />
          
          <div className="p-6 border-b border-white/10 relative z-10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MapIcon size={18} className="text-sky-400" />
              Dispatch Map
            </h2>
            <div className="flex bg-slate-900 rounded-xl p-1 border border-white/10">
              {["map", "heat"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    activeTab === tab ? "bg-sky-500/20 text-sky-300" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative z-0 bg-slate-950/40 flex flex-col p-6">
            {activeTab === "heat" ? (
              <div className="h-full w-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-bold text-lg">Active Surge Zones</h3>
                  <button 
                    onClick={calculateSurge}
                    disabled={calculating}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={calculating ? "animate-spin" : ""} />
                    {calculating ? "Calculating..." : "Recalculate Surge"}
                  </button>
                </div>
                
                {surges.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <Zap size={48} className="mb-4 opacity-20" />
                    <p>No active surge zones right now.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {surges.map(s => (
                      <div key={s._id} className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wider text-rose-400 font-black px-2 py-0.5 rounded-md bg-rose-500/10">
                              {s.demandLevel} Demand
                            </span>
                            <span className="text-slate-400 text-xs font-semibold capitalize">{s.vehicleType}</span>
                          </div>
                          <p className="text-white font-bold text-lg">Lat: {s.location.coordinates[1]}, Lng: {s.location.coordinates[0]}</p>
                          <p className="text-slate-400 text-sm mt-1">{s.pendingRequests} Pending • {s.availableVehicles} Available</p>
                        </div>
                        <div className="bg-rose-500 text-white rounded-xl px-4 py-3 text-center">
                          <p className="text-xs uppercase font-bold tracking-widest mb-0.5 opacity-80">Multiplier</p>
                          <p className="text-2xl font-black">{s.surgeFactor}x</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                <div className="w-32 h-32 rounded-full bg-sky-500/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-sky-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <Navigation2 size={24} className="text-sky-400 rotate-45" />
                  </div>
                </div>
                <p className="text-slate-400 text-sm font-medium">Live Map Engine Connected</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Active Feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" />
            Live Feed
          </h2>
          <div className="space-y-3">
            {[
              { id: "TRP-9021", status: "en_route", driver: "Mike R.", rider: "Sarah K.", time: "Just now" },
              { id: "TRP-9020", status: "completed", driver: "John D.", rider: "Alex B.", time: "2 min ago" },
              { id: "TRP-9019", status: "en_route", driver: "Lisa T.", rider: "Tom H.", time: "5 min ago" },
              { id: "TRP-9018", status: "cancelled", driver: "Unassigned", rider: "Chris M.", time: "12 min ago" },
            ].map((trip, i) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 hover:bg-slate-900/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-slate-500">{trip.id}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{trip.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      trip.status === 'en_route' ? 'bg-sky-400' :
                      trip.status === 'completed' ? 'bg-emerald-400' : 'bg-red-400'
                    }`} />
                    <span className="text-sm font-semibold">{trip.driver}</span>
                    <span className="text-slate-600">→</span>
                    <span className="text-sm text-slate-300">{trip.rider}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
